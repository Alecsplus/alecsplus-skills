// Counts how the principles took part in the transcripts, keeps the ledger, writes the dashboard, prints the summary.
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { spawn } from 'node:child_process';
import { homedir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { emptyDay, readFacts, sumDays } from './count.mjs';
import { TEXTS, writeDashboard } from './dashboard.mjs';

const DAY_IN_MILLISECONDS = 24 * 60 * 60 * 1000;
const PRINCIPLE_DEFINITION = /^\*\*([A-Z][A-Z0-9_]*)\*\*/;
const NOT_IN_A_FILE = 'not in a file';
const MAXIMUM_TOP = 6;
const MAXIMUM_GLOBAL_TOP = 5;
const POSITION_GAP = 3;

function parseArguments(argumentList) {
  const options = {
    way: 'none', global: 'none', days: '30', tie: 'the principles do not decide',
    dataDirectory: join(homedir(), '.claude', 'the-way-reports'), projectsDirectory: join(homedir(), '.claude', 'projects'),
    cwd: process.cwd(), isOpening: true, isPrintingTexts: false, textsPath: '',
  };
  const keyByFlag = {
    '--way': 'way', '--global': 'global', '--tie': 'tie', '--days': 'days',
    '--data-dir': 'dataDirectory', '--projects-dir': 'projectsDirectory', '--cwd': 'cwd', '--texts': 'textsPath',
  };
  for (let index = 0; index < argumentList.length; index += 1) {
    const key = keyByFlag[argumentList[index]];
    options.isOpening = options.isOpening && argumentList[index] !== '--no-open';
    options.isPrintingTexts = options.isPrintingTexts || argumentList[index] === '--print-texts';
    if (key) {
      options[key] = argumentList[index + 1];
      index += 1;
    }
  }
  return options;
}

function readPrincipleNames(filePath) {
  const isMissing = !filePath || filePath === 'none';
  const lines = isMissing ? [] : readFileSync(filePath, 'utf8').split('\n');
  const lists = { result: [], work: [] };
  const listNames = ['result', 'work'];
  let sectionCount = 0;
  const names = [];
  lines.forEach((line) => {
    sectionCount += line.startsWith('## ') ? 1 : 0;
    const match = PRINCIPLE_DEFINITION.exec(line);
    const listName = listNames[sectionCount - 1];
    match && names.push(match[1]);
    match && listName && !lists[listName].includes(match[1]) && lists[listName].push(match[1]);
  });
  return { isMissing, names: [...new Set(names)], lists };
}

function loadTexts(filePath) {
  const isPresent = existsSync(filePath);
  const translated = isPresent ? JSON.parse(readFileSync(filePath, 'utf8')) : {};
  const isCurrent = translated._version === TEXTS._version;
  const texts = isPresent && isCurrent ? { ...TEXTS, ...translated } : TEXTS;
  const staleLine = `Texts: ${filePath} is from ${translated._version}, current ${TEXTS._version}: translate again`;
  const line = isPresent && isCurrent ? `Texts: ${filePath}` : (isPresent ? staleLine : 'Texts: english');
  return { texts, line };
}

function folderNameOf(directory) {
  return directory.replace(/[^A-Za-z0-9_]/g, '-');
}

function isoDate(time) {
  return new Date(time).toISOString().slice(0, 10);
}

function loadLedger(ledgerPath) {
  const empty = { version: 1, projects: {}, files: {}, updatedAt: '' };
  return existsSync(ledgerPath) ? { ...empty, ...JSON.parse(readFileSync(ledgerPath, 'utf8')) } : empty;
}

function updateLedger(ledger, facts, currentFolder, way, globalFile) {
  Object.entries(facts).forEach(([folder, project]) => {
    ledger.projects[folder] = ledger.projects[folder] || { name: project.name, days: {} };
    ledger.projects[folder].name = project.name;
    Object.assign(ledger.projects[folder].days, project.days);
  });
  const noLists = { result: [], work: [] };
  const current = ledger.files[currentFolder] || { project: [], global: [] };
  const previousGlobal = ledger.files['*'] || {};
  ledger.files[currentFolder] = {
    project: way.isMissing ? current.project : way.names,
    global: globalFile.isMissing ? current.global : globalFile.names,
    projectLists: way.isMissing ? (current.projectLists || noLists) : way.lists,
    globalLists: globalFile.isMissing ? (current.globalLists || noLists) : globalFile.lists,
  };
  ledger.files['*'] = {
    project: [],
    global: globalFile.isMissing ? (previousGlobal.global || []) : globalFile.names,
    globalLists: globalFile.isMissing ? (previousGlobal.globalLists || noLists) : globalFile.lists,
  };
  ledger.updatedAt = new Date().toISOString();
}

function classify(key, files) {
  const match = /^(.*?)_([a-z]+)$/.exec(key);
  const isGlobal = Boolean(match) && files.global.includes(match[1]);
  const isProject = !match && files.project.includes(key);
  return { name: match ? match[1] : key, level: isGlobal ? 'global' : (isProject ? 'project' : NOT_IN_A_FILE) };
}

function rowsOf(totals, files) {
  const rows = new Map();
  const rowFor = (level, name) => {
    const id = `${level}:${name}`;
    rows.set(id, rows.get(id) || { name, level, decided: 0, ties: 0, against: 0 });
    return rows.get(id);
  };
  files.project.forEach((name) => rowFor('project', name));
  files.global.forEach((name) => rowFor('global', name));
  ['decided', 'ties', 'against'].forEach((field) => Object.entries(totals[field]).forEach(([key, amount]) => {
    const found = classify(key, files);
    rowFor(found.level, found.name)[field] += amount;
  }));
  return [...rows.values()];
}

function percentage(part, whole) {
  return whole > 0 ? `${Math.round((100 * part) / whole)}%` : '0%';
}

function ordinal(number) {
  const suffix = { 1: 'st', 2: 'nd', 3: 'rd' }[number] || 'th';
  return `${number}${suffix}`;
}

function byDecisions(files) {
  return (left, right) => (right.decided - left.decided)
    || (files[left.level].indexOf(left.name) - files[right.level].indexOf(right.name)) || left.name.localeCompare(right.name);
}

function globalLine(ledger, files, bounds) {
  const byName = new Map();
  Object.values(ledger.projects).forEach((project) => {
    const totals = sumDays(project.days, bounds.from, bounds.to);
    Object.entries(totals.decided).forEach(([key, amount]) => {
      const found = classify(key, { project: [], global: files.global });
      if (found.level === 'global') {
        const entry = byName.get(found.name) || { total: 0, projects: {} };
        entry.total += amount;
        entry.projects[project.name] = (entry.projects[project.name] || 0) + amount;
        byName.set(found.name, entry);
      }
    });
  });
  const ranked = [...byName].sort((left, right) => (right[1].total - left[1].total) || left[0].localeCompare(right[0]));
  const total = ranked.reduce((sum, [, entry]) => sum + entry.total, 0);
  const top = ranked.slice(0, MAXIMUM_GLOBAL_TOP).map(([name, entry]) => {
    const projects = Object.entries(entry.projects).sort((left, right) => right[1] - left[1]).map(([projectName, amount]) => `${projectName} ${amount}`);
    return `${name} ${entry.total} (${projects.join(', ')})`;
  });
  return `All projects: ${total} decided by global principles${top.length ? `; top: ${top.join('; ')}` : ''}`;
}

function summarize(ledger, currentFolder, options, now) {
  const isAll = options.days === 'all';
  const length = isAll ? 0 : Number(options.days);
  const bounds = { from: isAll ? '0000-00-00' : isoDate(now - (length - 1) * DAY_IN_MILLISECONDS), to: isoDate(now) };
  const files = ledger.files[currentFolder];
  const days = ledger.projects[currentFolder]?.days || {};
  const totals = sumDays(days, bounds.from, bounds.to);
  const before = isAll ? null : sumDays(days, isoDate(now - (2 * length - 1) * DAY_IN_MILLISECONDS), isoDate(now - length * DAY_IN_MILLISECONDS));
  const rows = rowsOf(totals, files);
  const inFile = rows.filter((row) => row.level !== NOT_IN_A_FILE);
  const closed = inFile.reduce((sum, row) => sum + row.decided, 0);
  const sorted = [...inFile].sort(byDecisions(files));
  const label = (row) => `${row.name} ${row.decided} (${row.level}, #${files[row.level].indexOf(row.name) + 1})`;
  const beforeText = before ? `, before ${percentage(before.withLine, before.answers)}` : '';
  const grilling = totals.grilling;
  const lines = [
    `Answers: ${totals.answers}, with the line ${totals.withLine} (${percentage(totals.withLine, totals.answers)}${beforeText})`,
    `Choices: ${closed} closed by the principles, questions asked to you ${totals.questionsAsked}`,
  ];
  const addLine = (title, items) => items.length > 0 && lines.push(`${title}: ${items.join(', ')}`);
  if (grilling.questions > 0) {
    lines.push(`Grilling: ${grilling.questions} questions, ${grilling.chosenRecommended} answered as recommended, ${grilling.chosenOther} other, ${grilling.notDecided} left open, ${grilling.selfAnswered} answered by themselves`);
  }
  addLine('Top', sorted.filter((row) => row.decided > 0).slice(0, MAXIMUM_TOP).map(label));
  addLine('Silent', inFile.filter((row) => row.decided === 0 && row.ties === 0).map((row) => `${row.name} (${row.level})`));
  addLine('Against ≥2', rows.filter((row) => row.against >= 2).map((row) => `${row.name} ${row.against} (${row.level})`));
  addLine('Tie pairs ≥2', Object.entries(totals.tiePairs).filter(([, amount]) => amount >= 2).map(([pair, amount]) => `${pair} ${amount}`));
  addLine('Not in a file', rows.filter((row) => row.level === NOT_IN_A_FILE && row.decided + row.against > 0).map((row) => `${row.name} ${row.decided + row.against}`));
  const gaps = ['project', 'global'].flatMap((level) => {
    const inUse = sorted.filter((row) => row.level === level && row.decided > 0);
    return inUse.map((row, index) => ({ row, rank: index + 1, position: files[level].indexOf(row.name) + 1 }))
      .filter((item) => Math.abs(item.rank - item.position) >= POSITION_GAP)
      .map((item) => `${item.row.name} #${item.position} in the file, ${ordinal(item.rank)} in use (${level})`);
  });
  addLine('Position vs use', gaps);
  const skillCount = (name) => totals.skills[`alecsplus-skills:${name}`] || 0;
  lines.push(`The way in use: grilling with the principles ${skillCount('the-way-grilling')}, without ${totals.skills['mattpocock-skills:grilling'] || 0}, self-answer ${skillCount('the-way-self-answer')}, the-way-new runs ${skillCount('the-way-new') + skillCount('the-way-global-new')}`);
  lines.push(globalLine(ledger, files, bounds));
  return lines;
}

function openInBrowser(filePath) {
  const command = { linux: 'xdg-open', darwin: 'open', win32: 'start' }[process.platform] || 'xdg-open';
  const child = spawn(command, [filePath], { detached: true, stdio: 'ignore', shell: process.platform === 'win32' });
  child.on('error', () => {});
  child.unref();
}

async function main() {
  const options = parseArguments(process.argv.slice(2));
  if (options.isPrintingTexts) {
    process.stdout.write(`${JSON.stringify(TEXTS, null, 2)}\n`);
    return;
  }
  const way = readPrincipleNames(options.way);
  const globalFile = readPrincipleNames(options.global);
  const isNothing = way.isMissing && globalFile.isMissing;
  const dataDirectory = resolve(options.dataDirectory);
  const ledgerPath = join(dataDirectory, 'days.json');
  const dashboardPath = join(dataDirectory, 'dashboard.html');
  let output = 'Nothing to measure: there is no THE-WAY.md, neither of the project nor global.';
  if (!isNothing) {
    const currentFolder = folderNameOf(options.cwd);
    const facts = await readFacts({
      projectsDirectory: options.projectsDirectory,
      tieWords: options.tie.toLowerCase().split(/\s*\|\s*/).filter(Boolean),
      knownNames: new Set([...way.names, ...globalFile.names]),
    });
    const ledger = loadLedger(ledgerPath);
    updateLedger(ledger, facts, currentFolder, way, globalFile);
    mkdirSync(dirname(ledgerPath), { recursive: true });
    writeFileSync(ledgerPath, `${JSON.stringify(ledger, null, 2)}\n`);
    const loaded = loadTexts(options.textsPath ? resolve(options.textsPath) : join(dataDirectory, 'texts.json'));
    writeDashboard({ ledger, ledgerPath, filePath: dashboardPath, texts: loaded.texts });
    output = [...summarize(ledger, currentFolder, options, Date.now()), loaded.line, `Dashboard: ${dashboardPath}`].join('\n');
    if (options.isOpening) {
      openInBrowser(dashboardPath);
    }
  }
  process.stdout.write(`${output}\n`);
  process.exitCode = isNothing ? 1 : 0;
}

await main();
