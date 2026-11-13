// Counts how the principles took part in the Claude Code transcripts and prints the Markdown report.
import { createReadStream, existsSync, readdirSync, readFileSync } from 'node:fs';
import { createInterface } from 'node:readline';
import { homedir } from 'node:os';
import { basename, join } from 'node:path';

const DAY_IN_MILLISECONDS = 24 * 60 * 60 * 1000;
const PLACEHOLDER_NAMES = new Set(['NAME', 'NOME']);
const PRINCIPLES_LINE = /^\s*\**Princip\w*\**\s*:\s*(.+)$/i;
const PRINCIPLE_DEFINITION = /^\*\*([A-Z][A-Z0-9_]*)\*\*/;
const NAME_PATTERN = '(?<![A-Za-z0-9_])([A-Z][A-Z0-9_]*[A-Z0-9])(?:_([a-z]+))?';
const NOT_IN_A_FILE = 'not in a file';
const MAXIMUM_PAIR_LENGTH = 200;
const MAXIMUM_LINE_LENGTH = 120;

function parseArguments(argumentList) {
  const options = {
    way: 'none', global: 'none', days: '30', tie: 'the principles do not decide',
    cwd: process.cwd(), projectsDirectory: join(homedir(), '.claude', 'projects'),
  };
  const keyByFlag = {
    '--way': 'way', '--global': 'global', '--days': 'days', '--tie': 'tie',
    '--cwd': 'cwd', '--projects-dir': 'projectsDirectory',
  };
  for (let index = 0; index < argumentList.length; index += 2) {
    const key = keyByFlag[argumentList[index]];
    if (key) {
      options[key] = argumentList[index + 1];
    }
  }
  return options;
}

function readPrincipleNames(filePath) {
  const isMissing = !filePath || filePath === 'none';
  const names = isMissing ? [] : readFileSync(filePath, 'utf8').split('\n')
    .map((line) => PRINCIPLE_DEFINITION.exec(line))
    .filter((match) => match)
    .map((match) => match[1]);
  return { isMissing, names };
}

function folderNameOf(directory) {
  return directory.replace(/[^A-Za-z0-9_]/g, '-');
}

function levelFor(name, suffix, files) {
  const isRightProject = !suffix && files.projectNames.has(name);
  const isRightGlobal = Boolean(suffix) && files.globalNames.has(name);
  return isRightProject ? 'project' : (isRightGlobal ? 'global' : NOT_IN_A_FILE);
}

function extractDecisions(lineRest, files) {
  const pattern = new RegExp(`(🔻\\s*)?${NAME_PATTERN}\\s*→`, 'gu');
  return [...lineRest.matchAll(pattern)]
    .filter((match) => !PLACEHOLDER_NAMES.has(match[2]))
    .map((match) => ({ name: match[2], level: levelFor(match[2], match[3], files), isAgainst: Boolean(match[1]) }));
}

function extractTieNames(line, files) {
  const pattern = new RegExp(NAME_PATTERN, 'gu');
  return [...line.matchAll(pattern)]
    .filter((match) => match[1].length >= 3 && !PLACEHOLDER_NAMES.has(match[1]))
    .filter((match) => match[2] || files.projectNames.has(match[1]) || files.globalNames.has(match[1]))
    .map((match) => ({ name: match[1], level: levelFor(match[1], match[2], files) }));
}

function textOfContent(content) {
  const blocks = Array.isArray(content) ? content : [{ type: 'text', text: content }];
  return blocks
    .filter((block) => block && block.type === 'text' && typeof block.text === 'string')
    .map((block) => block.text)
    .join('\n');
}

function createAggregate(acceptsLevel) {
  return {
    acceptsLevel, turns: [0, 0], turnsWithLine: [0, 0], decidedTotal: [0, 0], tieLines: [0, 0],
    rows: new Map(), pairs: new Map(),
  };
}

function rowOf(aggregate, level, name) {
  const key = `${level}:${name}`;
  if (!aggregate.rows.has(key)) {
    aggregate.rows.set(key, {
      name, level, decided: [0, 0], ties: [0, 0], against: [0, 0], last: '', projects: new Map(),
    });
  }
  return aggregate.rows.get(key);
}

function markSeen(row, period, date) {
  if (period === 0 && date > row.last) {
    row.last = date;
  }
}

function addCitation(row, projectName) {
  row.projects.set(projectName, (row.projects.get(projectName) || 0) + 1);
}

function recordEntry(aggregate, found) {
  const { period, date, projectName } = found;
  aggregate.turns[period] += found.isTurn ? 1 : 0;
  aggregate.turnsWithLine[period] += found.isTurn && found.hasDecisionLine ? 1 : 0;
  found.decisions.filter((decision) => aggregate.acceptsLevel(decision.level)).forEach((decision) => {
    const row = rowOf(aggregate, decision.level, decision.name);
    const counter = decision.isAgainst ? row.against : row.decided;
    counter[period] += 1;
    aggregate.decidedTotal[period] += decision.isAgainst || decision.level === NOT_IN_A_FILE ? 0 : 1;
    markSeen(row, period, date);
    addCitation(row, projectName);
  });
  found.tieLines.forEach((tieLine) => {
    const accepted = tieLine.names.filter((tie) => aggregate.acceptsLevel(tie.level));
    aggregate.tieLines[period] += accepted.some((tie) => tie.level !== NOT_IN_A_FILE) ? 1 : 0;
    accepted.forEach((tie) => {
      const row = rowOf(aggregate, tie.level, tie.name);
      row.ties[period] += 1;
      markSeen(row, period, date);
    });
    const distinctNames = [...new Set(tieLine.names.map((tie) => tie.name))];
    if (distinctNames.length >= 2 && accepted.length > 0) {
      const pairKey = distinctNames.slice(0, 2).sort().join(' × ');
      const counts = aggregate.pairs.get(pairKey) || [0, 0];
      counts[period] += 1;
      aggregate.pairs.set(pairKey, counts);
    }
  });
}

function periodIndexOf(timestamp, options) {
  const time = Date.parse(timestamp);
  const isNumber = !Number.isNaN(time);
  const isAll = options.days === 'all';
  const length = isAll ? 0 : Number(options.days) * DAY_IN_MILLISECONDS;
  const isCurrent = isNumber && (isAll || time >= options.now - length);
  const isPrevious = isNumber && !isAll && time >= options.now - 2 * length && !isCurrent;
  return isCurrent ? 0 : (isPrevious ? 1 : -1);
}

function foundInEntry(entry, period, context) {
  const blocks = Array.isArray(entry.message?.content) ? entry.message.content : [];
  const texts = blocks.filter((block) => block && block.type === 'text' && typeof block.text === 'string' && block.text.trim());
  const decisionLines = [];
  const decisions = [];
  const tieLines = [];
  texts.forEach((block) => {
    const lines = block.text.split('\n');
    const firstLine = lines.find((line) => line.trim());
    const match = firstLine === undefined ? null : PRINCIPLES_LINE.exec(firstLine);
    if (match) {
      decisionLines.push(firstLine.trim());
      decisions.push(...extractDecisions(match[1], context.files));
    }
    lines.filter((line) => context.tieWords.some((word) => line.toLowerCase().includes(word))).forEach((line) => {
      const names = extractTieNames(line, context.files);
      tieLines.push({ names });
    });
  });
  return {
    period,
    date: new Date(Date.parse(entry.timestamp)).toISOString().slice(0, 10),
    projectName: entry.cwd ? basename(entry.cwd) : context.folderName,
    isTurn: entry.message?.stop_reason === 'end_turn' && texts.length > 0,
    hasDecisionLine: decisionLines.length > 0,
    decisionLines,
    decisions,
    tieLines: tieLines.filter((tieLine) => tieLine.names.length > 0),
  };
}

async function scanFile(filePath, context, aggregates, pairsToRead) {
  const lineReader = createInterface({ input: createReadStream(filePath), crlfDelay: Infinity });
  let pending = [];
  for await (const line of lineReader) {
    const isRelevant = line.includes('"assistant"') || line.includes('"user"');
    let entry = null;
    try {
      entry = isRelevant ? JSON.parse(line) : null;
    } catch {
      entry = null;
    }
    if (entry && !entry.isSidechain && entry.type === 'assistant') {
      const period = periodIndexOf(entry.timestamp, context.options);
      if (period >= 0) {
        const found = foundInEntry(entry, period, context);
        aggregates.forEach((aggregate) => recordEntry(aggregate, found));
        if (context.isProjectFolder && period === 0) {
          found.decisionLines.forEach((decisionLine) => pending.push({ date: found.date, decisionLine }));
        }
      }
    }
    if (entry && !entry.isSidechain && entry.type === 'user' && pending.length > 0) {
      const text = textOfContent(entry.message?.content).replace(/\s+/g, ' ').trim();
      const isFromSystem = text.startsWith('<') || text.startsWith('Another Claude session sent a message') || text.startsWith('Base directory for this skill');
      if (text && !isFromSystem) {
        pending.forEach((item) => pairsToRead.push({ ...item, reply: text.slice(0, MAXIMUM_PAIR_LENGTH) }));
        pending = [];
      }
    }
  }
}

function listTranscripts(directory) {
  return existsSync(directory)
    ? readdirSync(directory).filter((name) => name.endsWith('.jsonl')).map((name) => join(directory, name))
    : [];
}

function listProjectFolders(projectsDirectory) {
  return existsSync(projectsDirectory)
    ? readdirSync(projectsDirectory, { withFileTypes: true }).filter((item) => item.isDirectory()).map((item) => item.name)
    : [];
}

function percentage(part, whole) {
  return whole > 0 ? `${Math.round((100 * part) / whole)}%` : '—';
}

function withBefore(counts, isAll) {
  return `${counts[0]} (${isAll ? '—' : counts[1]})`;
}

function sortedRows(rows) {
  const lastRank = (row) => (row.level === NOT_IN_A_FILE ? 1 : 0);
  return [...rows].sort((left, right) => (lastRank(left) - lastRank(right)) || (right.decided[0] - left.decided[0]) || left.name.localeCompare(right.name));
}

function renderPart(heading, aggregate, filePrincipleNames, fileLevel, isAll, showsLevel) {
  filePrincipleNames.forEach((name) => rowOf(aggregate, fileLevel, name));
  const rows = sortedRows([...aggregate.rows.values()].filter((row) => (row.level === fileLevel && filePrincipleNames.includes(row.name))
    || row.decided[0] + row.decided[1] + row.ties[0] + row.ties[1] + row.against[0] + row.against[1] > 0)
    .filter((row) => aggregate.acceptsLevel(row.level)));
  const hasTurns = aggregate.turns[0] > 0;
  const closed = [percentage(aggregate.decidedTotal[0], aggregate.decidedTotal[0] + aggregate.tieLines[0]),
    percentage(aggregate.decidedTotal[1], aggregate.decidedTotal[1] + aggregate.tieLines[1])];
  const before = (value, hasBefore) => (isAll || !hasBefore ? '—' : value);
  const lines = [`## ${heading}`, ''];
  lines.push(hasTurns
    ? `Turns: ${aggregate.turns[0]} with text, ${aggregate.turnsWithLine[0]} with the Principles line (${percentage(aggregate.turnsWithLine[0], aggregate.turns[0])}, before ${before(percentage(aggregate.turnsWithLine[1], aggregate.turns[1]), aggregate.turns[1] > 0)})`
    : 'Turns: none in the period');
  if (hasTurns) {
    lines.push(`Choices: ${aggregate.decidedTotal[0]} decided by a principle, ${aggregate.tieLines[0]} came to you (${closed[0]} closed by the principles, before ${before(closed[1], aggregate.decidedTotal[1] + aggregate.tieLines[1] > 0)})`);
  }
  lines.push('');
  lines.push(showsLevel
    ? '| principle | level | decided | ties | against | last |\n|---|---|---|---|---|---|'
    : '| principle | decided | ties | against | last | projects |\n|---|---|---|---|---|---|');
  rows.forEach((row) => {
    const cells = [row.name];
    if (showsLevel) {
      cells.push(row.level);
    }
    cells.push(withBefore(row.decided, isAll), withBefore(row.ties, isAll), withBefore(row.against, isAll), row.last || '—');
    if (!showsLevel) {
      const projectList = [...row.projects].sort((left, right) => (right[1] - left[1]) || left[0].localeCompare(right[0]))
        .map(([projectName, count]) => `${projectName} ${count}`).join(', ');
      cells.push(projectList || '—');
    }
    lines.push(`| ${cells.join(' | ')} |`);
  });
  const silent = filePrincipleNames.filter((name) => {
    const row = rowOf(aggregate, fileLevel, name);
    return row.decided[0] === 0 && row.ties[0] === 0;
  });
  const pairs = [...aggregate.pairs].filter(([, counts]) => counts[0] > 0).sort((left, right) => (right[1][0] - left[1][0]) || left[0].localeCompare(right[0]));
  const againstRows = sortedRows(rows.filter((row) => row.against[0] > 0)).sort((left, right) => (right.against[0] - left.against[0]) || left.name.localeCompare(right.name));
  lines.push('');
  lines.push(`Silent in the period: ${silent.join(', ') || 'none'}`);
  lines.push(`Tie pairs: ${pairs.map(([pairKey, counts]) => `${pairKey} ${withBefore(counts, isAll)}`).join(', ') || 'none'}`);
  lines.push(`Against: ${againstRows.map((row) => `${row.name} ${withBefore(row.against, isAll)}`).join(', ') || 'none'}`);
  return lines.join('\n');
}

function renderPairsToRead(pairsToRead) {
  const items = pairsToRead.map((item) => {
    const shownLine = item.decisionLine.replace(/`/g, "'").slice(0, MAXIMUM_LINE_LENGTH);
    return `- ${item.date} · \`${shownLine}\` → «${item.reply}»`;
  });
  return ['## Pairs to read (not for the report)', '', ...(items.length > 0 ? items : ['none'])].join('\n');
}

async function main() {
  const options = { ...parseArguments(process.argv.slice(2)), now: Date.now() };
  const way = readPrincipleNames(options.way);
  const globalFile = readPrincipleNames(options.global);
  const parts = [];
  let exitCode = 0;
  if (way.isMissing && globalFile.isMissing) {
    parts.push('Nothing to measure: there is no THE-WAY.md, neither of the project nor global.');
    exitCode = 1;
  } else {
    const context = {
      options,
      tieWords: options.tie.toLowerCase().split(/\s*\|\s*/).filter(Boolean),
      files: { projectNames: new Set(way.names), globalNames: new Set(globalFile.names) },
      folderName: '',
      isProjectFolder: false,
    };
    const projectAggregate = createAggregate(() => true);
    const globalAggregate = createAggregate((level) => level === 'global');
    const pairsToRead = [];
    const currentFolder = folderNameOf(options.cwd);
    for (const folderName of listProjectFolders(options.projectsDirectory)) {
      context.folderName = folderName;
      context.isProjectFolder = folderName === currentFolder;
      const aggregates = context.isProjectFolder ? [projectAggregate, globalAggregate] : [globalAggregate];
      for (const filePath of listTranscripts(join(options.projectsDirectory, folderName))) {
        await scanFile(filePath, context, aggregates, pairsToRead);
      }
    }
    const isAll = options.days === 'all';
    const periodText = isAll ? 'all time' : `last ${options.days} days (in parentheses: the ${options.days} days before)`;
    parts.push(`# The way: report — ${basename(options.cwd)}, ${periodText}`);
    parts.push(renderPart('This project', projectAggregate, way.names, 'project', isAll, true));
    if (!globalFile.isMissing) {
      parts.push(renderPart('All your projects (global principles)', globalAggregate, globalFile.names, 'global', isAll, false));
    }
    parts.push(renderPairsToRead(pairsToRead));
  }
  process.stdout.write(`${parts.join('\n\n')}\n`);
  process.exitCode = exitCode;
}

await main();
