// Counts how the principles took part in the Claude Code transcripts and prints the Markdown report.
import { createReadStream, existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { createInterface } from 'node:readline';
import { homedir } from 'node:os';
import { basename, join } from 'node:path';

const DAY_IN_MILLISECONDS = 24 * 60 * 60 * 1000;
const PLACEHOLDER_NAMES = new Set(['NAME', 'NOME']);
const PRINCIPLES_LINE = /^\s*\**Princip\w*\**\s*:\s*(.+)$/i;
const PRINCIPLE_DEFINITION = /^\*\*([A-Z][A-Z0-9_]*)\*\*/;
const NAME_PATTERN = '(?<![A-Za-z0-9_])([A-Z][A-Z0-9_]*[A-Z0-9])(?:_([a-z]+))?';
const NOT_IN_A_FILE = 'not in a file';
const SPARK_CHARACTERS = '▁▂▃▄▅▆▇█';
const MAXIMUM_BAR_LENGTH = 20;
const MAXIMUM_TOGETHER = 5;
const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function parseArguments(argumentList) {
  const options = {
    way: 'none', global: 'none', days: '30', tie: 'the principles do not decide',
    cwd: process.cwd(), projectsDirectory: join(homedir(), '.claude', 'projects'),
    saveDirectory: join(homedir(), '.claude', 'the-way-reports'), isHistory: false,
  };
  const keyByFlag = {
    '--way': 'way', '--global': 'global', '--days': 'days', '--tie': 'tie',
    '--cwd': 'cwd', '--projects-dir': 'projectsDirectory', '--save-dir': 'saveDirectory',
  };
  for (let index = 0; index < argumentList.length; index += 1) {
    const key = keyByFlag[argumentList[index]];
    options.isHistory = options.isHistory || argumentList[index] === '--history';
    if (key) {
      options[key] = argumentList[index + 1];
      index += 1;
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
  return { isMissing, names: [...new Set(names)] };
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

function createAggregate(acceptsLevel) {
  return {
    acceptsLevel, turns: [0, 0], turnsWithLine: [0, 0], decidedTotal: [0, 0], tieLines: [0, 0],
    rows: new Map(), pairs: new Map(), together: new Map(), weekly: new Map(),
  };
}

function rowOf(aggregate, level, name) {
  const key = `${level}:${name}`;
  if (!aggregate.rows.has(key)) {
    aggregate.rows.set(key, {
      name, level, decided: [0, 0], ties: [0, 0], against: [0, 0], last: '', projects: new Map(), weeks: new Map(),
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

function mondayOf(time) {
  const date = new Date(time);
  const daysSinceMonday = (date.getUTCDay() + 6) % 7;
  return Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate() - daysSinceMonday);
}

function weekRange(firstMonday, lastMonday) {
  const mondays = [];
  for (let monday = firstMonday; monday <= lastMonday; monday += 7 * DAY_IN_MILLISECONDS) {
    mondays.push(monday);
  }
  return mondays;
}

function weekLabel(monday) {
  const thursday = monday + 3 * DAY_IN_MILLISECONDS;
  const year = new Date(thursday).getUTCFullYear();
  const week = Math.floor((thursday - Date.UTC(year, 0, 1)) / DAY_IN_MILLISECONDS / 7) + 1;
  const date = new Date(monday);
  return `${year}-W${String(week).padStart(2, '0')} (${date.getUTCDate()} ${MONTH_NAMES[date.getUTCMonth()]})`;
}

function sparkline(values) {
  const maximum = Math.max(0, ...values);
  return values.map((value) => SPARK_CHARACTERS[value === 0 ? 0 : Math.round(((SPARK_CHARACTERS.length - 1) * value) / maximum)]).join('');
}

function bar(value, maximum) {
  const halves = maximum > 0 ? Math.round((2 * MAXIMUM_BAR_LENGTH * value) / maximum) : 0;
  return `${'█'.repeat(Math.floor(halves / 2))}${halves % 2 === 1 ? '▌' : ''}`;
}

function weekEntryOf(aggregate, monday) {
  if (!aggregate.weekly.has(monday)) {
    aggregate.weekly.set(monday, { turns: 0, withLine: 0, decisions: 0 });
  }
  return aggregate.weekly.get(monday);
}

function recordWeek(aggregate, found) {
  const week = weekEntryOf(aggregate, found.monday);
  week.turns += found.isTurn ? 1 : 0;
  week.withLine += found.isTurn && found.hasDecisionLine ? 1 : 0;
  week.decisions += found.decisions.filter((decision) => aggregate.acceptsLevel(decision.level) && !decision.isAgainst).length;
  found.decisionGroups.forEach((group) => {
    const names = [...new Set(group.filter((decision) => decision.level !== NOT_IN_A_FILE && aggregate.acceptsLevel(decision.level)).map((decision) => decision.name))].sort();
    names.forEach((first, firstIndex) => names.slice(firstIndex + 1).forEach((second) => {
      const pairKey = `${first} + ${second}`;
      aggregate.together.set(pairKey, (aggregate.together.get(pairKey) || 0) + 1);
    }));
  });
}

function recordEntry(aggregate, found) {
  const { period, date, projectName } = found;
  if (period === 0) {
    recordWeek(aggregate, found);
  }
  aggregate.turns[period] += found.isTurn ? 1 : 0;
  aggregate.turnsWithLine[period] += found.isTurn && found.hasDecisionLine ? 1 : 0;
  found.decisions.filter((decision) => aggregate.acceptsLevel(decision.level)).forEach((decision) => {
    const row = rowOf(aggregate, decision.level, decision.name);
    const counter = decision.isAgainst ? row.against : row.decided;
    counter[period] += 1;
    aggregate.decidedTotal[period] += decision.isAgainst || decision.level === NOT_IN_A_FILE ? 0 : 1;
    markSeen(row, period, date);
    addCitation(row, projectName);
    row.weeks.set(found.monday, (row.weeks.get(found.monday) || 0) + (period === 0 && !decision.isAgainst ? 1 : 0));
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
  const decisionGroups = [];
  const decisions = [];
  const tieLines = [];
  texts.forEach((block) => {
    const lines = block.text.split('\n');
    const firstLine = lines.find((line) => line.trim());
    const match = firstLine === undefined ? null : PRINCIPLES_LINE.exec(firstLine);
    if (match) {
      decisionLines.push(firstLine.trim());
      const lineDecisions = extractDecisions(match[1], context.files);
      decisionGroups.push(lineDecisions);
      decisions.push(...lineDecisions);
    }
    lines.filter((line) => context.tieWords.some((word) => line.toLowerCase().includes(word))).forEach((line) => {
      const names = extractTieNames(line, context.files);
      tieLines.push({ names });
    });
  });
  return {
    period,
    monday: mondayOf(Date.parse(entry.timestamp)),
    date: new Date(Date.parse(entry.timestamp)).toISOString().slice(0, 10),
    projectName: entry.cwd ? basename(entry.cwd) : context.folderName,
    isTurn: entry.message?.stop_reason === 'end_turn' && texts.length > 0,
    hasDecisionLine: decisionLines.length > 0,
    decisionLines,
    decisionGroups,
    decisions,
    tieLines: tieLines.filter((tieLine) => tieLine.names.length > 0),
  };
}

async function scanFile(filePath, context, aggregates) {
  const lineReader = createInterface({ input: createReadStream(filePath), crlfDelay: Infinity });
  for await (const line of lineReader) {
    const isRelevant = line.includes('"assistant"');
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

function collectRows(aggregate, filePrincipleNames, fileLevel) {
  filePrincipleNames.forEach((name) => rowOf(aggregate, fileLevel, name));
  return sortedRows([...aggregate.rows.values()].filter((row) => (row.level === fileLevel && filePrincipleNames.includes(row.name))
    || row.decided[0] + row.decided[1] + row.ties[0] + row.ties[1] + row.against[0] + row.against[1] > 0)
    .filter((row) => aggregate.acceptsLevel(row.level)));
}

function mondaysOf(aggregate, options, onlyDecisions) {
  const mondays = [...aggregate.weekly].filter(([, week]) => !onlyDecisions || week.decisions > 0).map(([monday]) => monday);
  const isAll = options.days === 'all';
  const first = isAll ? Math.min(...mondays) : mondayOf(options.now - Number(options.days) * DAY_IN_MILLISECONDS);
  const last = isAll ? Math.max(...mondays) : mondayOf(options.now);
  return isAll && mondays.length === 0 ? [] : weekRange(first, last);
}

function weeksLines(aggregate, options) {
  const mondays = mondaysOf(aggregate, options, false);
  const maximum = Math.max(0, ...mondays.map((monday) => aggregate.weekly.get(monday)?.decisions || 0));
  const lines = ['Weeks:'];
  mondays.forEach((monday) => {
    const week = aggregate.weekly.get(monday) || { turns: 0, withLine: 0, decisions: 0 };
    lines.push(`- ${weekLabel(monday)}: turns ${week.turns}, with the line ${week.withLine}, decisions ${week.decisions} ${bar(week.decisions, maximum)}`.trimEnd());
  });
  return lines;
}

function renderPart(heading, aggregate, fileNames, fileLevel, options, showsLevel, namesByLevel) {
  const isAll = options.days === 'all';
  const rows = collectRows(aggregate, fileNames, fileLevel);
  const positionOf = (row) => (row.level === NOT_IN_A_FILE ? '—' : String(namesByLevel[row.level].indexOf(row.name) + 1));
  const sparkMondays = mondaysOf(aggregate, options, isAll);
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
    lines.push(...weeksLines(aggregate, options));
  }
  lines.push('');
  lines.push(showsLevel
    ? '| principle | level | file | decided | ties | against | weeks | last |\n|---|---|---|---|---|---|---|---|'
    : '| principle | file | decided | ties | against | weeks | last | projects |\n|---|---|---|---|---|---|---|---|');
  rows.forEach((row) => {
    const cells = [row.name];
    if (showsLevel) {
      cells.push(row.level);
    }
    cells.push(positionOf(row), withBefore(row.decided, isAll), withBefore(row.ties, isAll), withBefore(row.against, isAll),
      sparkMondays.length > 0 ? sparkline(sparkMondays.map((monday) => row.weeks.get(monday) || 0)) : '—', row.last || '—');
    if (!showsLevel) {
      const projectList = [...row.projects].sort((left, right) => (right[1] - left[1]) || left[0].localeCompare(right[0]))
        .map(([projectName, count]) => `${projectName} ${count}`).join(', ');
      cells.push(projectList || '—');
    }
    lines.push(`| ${cells.join(' | ')} |`);
  });
  const silent = fileNames.filter((name) => {
    const row = rowOf(aggregate, fileLevel, name);
    return row.decided[0] === 0 && row.ties[0] === 0;
  });
  const pairs = [...aggregate.pairs].filter(([, counts]) => counts[0] > 0).sort((left, right) => (right[1][0] - left[1][0]) || left[0].localeCompare(right[0]));
  const againstRows = sortedRows(rows.filter((row) => row.against[0] > 0)).sort((left, right) => (right.against[0] - left.against[0]) || left.name.localeCompare(right.name));
  const together = [...aggregate.together].sort((left, right) => (right[1] - left[1]) || left[0].localeCompare(right[0])).slice(0, MAXIMUM_TOGETHER);
  lines.push('');
  lines.push(`Silent in the period: ${silent.join(', ') || 'none'}`);
  lines.push(`Tie pairs: ${pairs.map(([pairKey, counts]) => `${pairKey} ${withBefore(counts, isAll)}`).join(', ') || 'none'}`);
  lines.push(`Against: ${againstRows.map((row) => `${row.name} ${withBefore(row.against, isAll)}`).join(', ') || 'none'}`);
  lines.push(`Together: ${together.map(([pairKey, count]) => `${pairKey} ${count}`).join(', ') || 'none'}`);
  return { text: lines.join('\n'), rows };
}

function isoDate(time) {
  return new Date(time).toISOString().slice(0, 10);
}

function savedReportFiles(directory) {
  return existsSync(directory) ? readdirSync(directory).filter((name) => /^\d{4}-\d{2}-\d{2}\.json$/.test(name)).sort() : [];
}

function countsByName(rows, includesLevel) {
  return Object.fromEntries(rows.map((row) => [row.name, {
    ...(includesLevel ? { level: row.level } : {}), decided: row.decided[0], ties: row.ties[0], against: row.against[0],
  }]));
}

function saveReport(options, markdown, projectRows, globalRows, aggregates, projectDirectory) {
  const date = isoDate(options.now);
  const turnsOf = (aggregate) => ({ withText: aggregate.turns[0], withLine: aggregate.turnsWithLine[0] });
  const summary = {
    date, days: options.days === 'all' ? 'all' : Number(options.days),
    project: countsByName(projectRows, true), global: countsByName(globalRows, false),
    turns: { project: turnsOf(aggregates.project), global: turnsOf(aggregates.global) },
  };
  mkdirSync(projectDirectory, { recursive: true });
  writeFileSync(join(projectDirectory, `${date}.counts.md`), `${markdown}\n`);
  writeFileSync(join(projectDirectory, `${date}.json`), `${JSON.stringify(summary, null, 2)}\n`);
}

function renderHistoryTable(reports, partName, includesZeroRows) {
  const names = [...new Set(reports.flatMap((report) => Object.keys(report[partName] || {})))];
  const total = (name) => reports.reduce((sum, report) => sum + (report[partName]?.[name]?.decided || 0), 0);
  const sortedNames = names.filter((name) => includesZeroRows || total(name) > 0)
    .sort((left, right) => (total(right) - total(left)) || left.localeCompare(right));
  const lines = [`| principle | ${reports.map((report) => report.date).join(' | ')} | trend |`, `|---|${reports.map(() => '---|').join('')}---|`];
  sortedNames.forEach((name) => {
    const values = reports.map((report) => report[partName]?.[name]?.decided || 0);
    lines.push(`| ${name} | ${values.join(' | ')} | ${sparkline(values)} |`);
  });
  const turnShares = reports.map((report) => percentage(report.turns[partName].withLine, report.turns[partName].withText));
  lines.push(`Turns with the line: ${turnShares.join(', ')}`);
  return lines.join('\n');
}

function renderHistory(options, projectDirectory) {
  const files = savedReportFiles(projectDirectory);
  const reports = files.map((name) => JSON.parse(readFileSync(join(projectDirectory, name), 'utf8')));
  const count = reports.length;
  return count === 0
    ? 'No saved report yet for this project: run the-way-report once.'
    : [`# The way: history — ${basename(options.cwd)}, ${count} report${count === 1 ? '' : 's'} from ${reports[0].date} to ${reports[count - 1].date}`,
      `## This project (decided per report)\n\n${renderHistoryTable(reports, 'project', true)}`,
      `## All your projects (global principles, decided per report)\n\n${renderHistoryTable(reports, 'global', true)}`].join('\n\n');
}

async function main() {
  const options = { ...parseArguments(process.argv.slice(2)), now: Date.now() };
  const way = readPrincipleNames(options.way);
  const globalFile = readPrincipleNames(options.global);
  const currentFolder = folderNameOf(options.cwd);
  const projectDirectory = join(options.saveDirectory, currentFolder);
  const parts = [];
  let exitCode = 0;
  let lastLine = '';
  if (options.isHistory) {
    parts.push(renderHistory(options, projectDirectory));
  } else if (way.isMissing && globalFile.isMissing) {
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
    const savedBefore = savedReportFiles(projectDirectory);
    let oldestTime = Infinity;
    for (const folderName of listProjectFolders(options.projectsDirectory)) {
      context.folderName = folderName;
      context.isProjectFolder = folderName === currentFolder;
      const aggregates = context.isProjectFolder ? [projectAggregate, globalAggregate] : [globalAggregate];
      for (const filePath of listTranscripts(join(options.projectsDirectory, folderName))) {
        oldestTime = Math.min(oldestTime, statSync(filePath).mtimeMs);
        await scanFile(filePath, context, aggregates);
      }
    }
    const isAll = options.days === 'all';
    const periodText = isAll ? 'all time' : `last ${options.days} days (in parentheses: the ${options.days} days before)`;
    const oldestText = Number.isFinite(oldestTime)
      ? `Transcripts on disk go back to ${isoDate(oldestTime)} (Claude Code keeps them about 30 days): what is older lives only in the saved reports below.`
      : 'No transcript on disk.';
    const savedText = savedBefore.length > 0
      ? `Saved reports for this project: ${savedBefore.length}, first ${savedBefore[0].replace('.json', '')}.`
      : 'Saved reports for this project: none yet.';
    const namesByLevel = { project: way.names, global: globalFile.names };
    const project = renderPart('This project', projectAggregate, way.names, 'project', options, true, namesByLevel);
    const globalPart = globalFile.isMissing ? null : renderPart('All your projects (global principles)', globalAggregate, globalFile.names, 'global', options, false, namesByLevel);
    parts.push(`# The way: report — ${basename(options.cwd)}, ${periodText}\n\n${oldestText}\n${savedText}`);
    parts.push(project.text);
    if (globalPart) {
      parts.push(globalPart.text);
    }
    saveReport(options, parts.join('\n\n'), project.rows, globalPart ? globalPart.rows : [],
      { project: projectAggregate, global: globalAggregate }, projectDirectory);
    lastLine = `\n\nSaved in: ${projectDirectory}`;
  }
  process.stdout.write(`${parts.join('\n\n')}${lastLine}\n`);
  process.exitCode = exitCode;
}

await main();
