import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';
import { TEXTS, writeDashboard } from './dashboard.mjs';

const reportPath = fileURLToPath(new URL('./report.mjs', import.meta.url));
const DAY = 24 * 60 * 60 * 1000;

const assistant = (text, timestamp, stopReason = 'end_turn') => ({ type: 'assistant', timestamp, cwd: '/work/demo', message: { stop_reason: stopReason, content: [{ type: 'text', text }] } });
const person = (text, timestamp) => ({ type: 'user', timestamp, cwd: '/work/demo', message: { content: text } });

function setup() {
  const root = mkdtempSync(join(tmpdir(), 'report-'));
  const projectsDirectory = join(root, 'projects');
  const cwd = join(root, 'demo');
  const folder = join(projectsDirectory, cwd.replace(/[^A-Za-z0-9_]/g, '-'));
  mkdirSync(folder, { recursive: true });
  writeFileSync(join(root, 'way.md'), '# Principles\n\n## Result\n\n**SIMPLE** — a\n\n**ONE_PLACE** — b\n\n## Work\n\n**LIGHT** — c\n\n**SIMPLE** — a\n');
  writeFileSync(join(root, 'global.md'), '## Result\n\n**CERTEZZA** — d\n\n## Work\n');
  return { root, projectsDirectory, cwd, transcript: join(folder, 'a.jsonl') };
}

function run(fixture, extraArguments = []) {
  return execFileSync('node', [reportPath, '--way', join(fixture.root, 'way.md'), '--global', join(fixture.root, 'global.md'),
    '--tie', 'the principles do not decide', '--data-dir', join(fixture.root, 'data'), '--projects-dir', fixture.projectsDirectory,
    '--cwd', fixture.cwd, '--no-open', ...extraArguments], { encoding: 'utf8' });
}

test('counts per day, keeps old days, writes the dashboard and the summary', () => {
  const fixture = setup();
  const now = Date.now();
  const at = (seconds) => new Date(now - 60000 + seconds * 1000).toISOString();
  const oldTime = new Date(now - 100 * DAY).toISOString();
  const oldEntry = assistant('Principi: LIGHT → ok.', oldTime);
  const todayEntries = [
    assistant('Principi: CERTEZZA_globale → x; 🔻 ONE_PLACE → y; SIMPLE → z\n\nDone.', at(1)),
    person('ok', at(2)),
    assistant('Fatto. Vuoi A o B?', at(3)),
    assistant('❓ *Q1 – Which one?*\nA) one\n**B) two**', at(4)),
    person('q1 b', at(5)),
    assistant('❓ *Q2 – Another?*\nA) one\nB) two\nthe principles do not decide between A and B', at(6)),
    person('a', at(7)),
    { type: 'assistant', timestamp: at(8), cwd: '/work/demo', message: { stop_reason: 'tool_use', content: [{ type: 'tool_use', name: 'Skill', input: { skill: 'alecsplus-skills:the-way-grilling' } }] } },
    assistant('SIMPLE and LIGHT: the principles do not decide between them.', at(9)),
  ];
  const write = (entries) => writeFileSync(fixture.transcript, `${entries.map((entry) => JSON.stringify(entry)).join('\n')}\n`);
  write([oldEntry, ...todayEntries]);
  const output = run(fixture);
  const ledgerPath = join(fixture.root, 'data', 'days.json');
  const ledger = JSON.parse(readFileSync(ledgerPath, 'utf8'));
  const [folder] = Object.keys(ledger.projects);
  const days = ledger.projects[folder].days;
  const today = days[new Date(now - 60000 + 1000).toISOString().slice(0, 10)];
  assert.equal(Object.keys(days).length, 2);
  assert.equal(today.answers, 5);
  assert.equal(today.withLine, 1);
  assert.deepEqual(today.decided, { CERTEZZA_globale: 1, SIMPLE: 1 });
  assert.deepEqual(today.against, { ONE_PLACE: 1 });
  assert.equal(today.questionsAsked, 1);
  assert.equal(today.grilling.questions, 2);
  assert.equal(today.grilling.chosenRecommended, 1);
  assert.equal(today.grilling.chosenOther, 1);
  assert.equal(today.grilling.notDecided, 1);
  assert.deepEqual(today.skills, { 'alecsplus-skills:the-way-grilling': 1 });
  assert.deepEqual(today.tiePairs, { 'LIGHT × SIMPLE': 1 });
  assert.equal(today.together, undefined);
  assert.deepEqual(ledger.files[folder], {
    project: ['SIMPLE', 'ONE_PLACE', 'LIGHT'], global: ['CERTEZZA'],
    projectLists: { result: ['SIMPLE', 'ONE_PLACE'], work: ['LIGHT', 'SIMPLE'] },
    globalLists: { result: ['CERTEZZA'], work: [] },
  });
  assert.deepEqual(ledger.files['*'].globalLists, { result: ['CERTEZZA'], work: [] });
  assert.match(output, /Answers: 5/);
  assert.match(output, /Grilling: 2 questions, 1 answered as recommended, 1 other, 1 left open/);
  assert.match(output, /CERTEZZA 1 \(global, #1\)/);
  assert.match(output, /The way in use: grilling with the principles 1, without 0, self-answer 0, the-way-new runs 0/);
  assert.match(output, /Dashboard:/);

  write(todayEntries);
  run(fixture);
  const second = JSON.parse(readFileSync(ledgerPath, 'utf8'));
  assert.equal(Object.keys(second.projects[folder].days).length, 2);
  const page = readFileSync(join(fixture.root, 'data', 'dashboard.html'), 'utf8');
  assert.ok(page.includes('id="ledger"'));
  assert.ok(page.includes('CERTEZZA'));
  assert.ok(page.includes('SIMPLE'));
  assert.ok(!page.includes('http'));
  assert.equal(page.match(/<span class="groupLabel">(Show|Principles|List|Unit|Period)<\/span>/g).length, 5);
  const explanationKeys = ['explainAnswers', 'explainWithLine', 'explainClosed', 'explainAsked', 'explainGrillingTile', 'explainShare', 'explainDecidedAsked', 'explainGrillingChart', 'explainWayInUse', 'explainRecommended', 'explainOther', 'explainNoAnswer', 'explainGrillingWith', 'explainGrillingWithout', 'explainSelfAnswer', 'explainColumns', 'explainTrend', 'explainPairs'];
  const printed = JSON.parse(execFileSync('node', [reportPath, '--print-texts'], { encoding: 'utf8' }));
  assert.ok(explanationKeys.every((key) => typeof printed[key] === 'string' && printed[key].length > 0));
  assert.ok(page.includes(printed.explainAnswers));
  assert.ok(page.includes('class="tile-trend"') && printed.tileTrend.includes('{unit}'));
  assert.ok(page.includes('type="checkbox" data-folder=') && page.includes('id="projectHeading"') && page.includes('id="projectsMultiple"'));
  assert.ok(page.includes('id="projectSearch"') && !page.includes('<select'));
  assert.ok(['day', 'week', 'month'].every((unit) => page.includes(`data-unit="${unit}"`)));
  assert.ok(['all', 'result', 'work'].every((kind) => page.includes(`data-kind="${kind}"`)));
  assert.equal(page.match(/<h2 class="part">/g).length, 2);
  assert.ok(page.includes('<h2 class="part">Chat</h2>') && page.includes('<h2 class="part">Grilling and questions</h2>'));
});

// Runs the page script on a fake DOM: the buttons, the project column and the dates answer like in a browser.
function openPage(html) {
  const ledgerText = /<script type="application\/json" id="ledger">(.*?)<\/script>/s.exec(html)[1];
  const script = [...html.matchAll(/<script>(.*?)<\/script>/gs)].pop()[1];
  const nodes = {};
  const makeNode = (attributes = {}) => ({ innerHTML: '', value: '', textContent: '', hidden: false, attributes, listeners: {}, className: '',
    addEventListener(name, handler) { this.listeners[name] = handler; }, getAttribute(name) { return this.attributes[name]; }, setAttribute() {},
    classList: { toggle() {}, remove() {} } });
  const choices = [...html.matchAll(/<button data-(scope|level|kind|unit|days)="([^"]+)"/g)].map((match) => makeNode({ [`data-${match[1]}`]: match[2] }));
  const document = {
    getElementById: (id) => (id === 'ledger' ? { textContent: ledgerText } : (nodes[id] ||= makeNode())),
    querySelectorAll: (selector) => choices.filter((button) => selector.includes(`[${Object.keys(button.attributes)[0]}]`)),
  };
  vm.runInNewContext(script, { document, Date, Math, JSON, Object, Array, Number, String });
  return {
    nodes,
    press: (name, value) => choices.find((button) => button.attributes[`data-${name}`] === value).listeners.click(),
    chooseProject: (folder) => nodes.projectList.listeners.click({ target: { closest: () => ({ getAttribute: () => folder }) } }),
    setMultiple: (isOn) => nodes.projectsMultiple.listeners.change({ target: { checked: isOn } }),
    tick: (folder, isOn) => nodes.projectList.listeners.change({ target: { checked: isOn, getAttribute: () => folder } }),
  };
}

const titlesOf = (svg) => [...svg.matchAll(/<title>([^<]*)<\/title>/g)].map((match) => match[1]);
const sumOfTitles = (titles) => titles.reduce((sum, title) => sum + Number(/: (\d+)$/.exec(title)?.[1] || 0), 0);
const sumOfTrend = (svg) => sumOfTitles((titlesOf(svg)[0] || '').split(' — ')[1]?.split(', ') || []);

// Every tile, chart and row of the page must agree with the others: the failures, one line each.
function incoherences(page, situation) {
  const failures = [];
  const expect = (isTrue, what) => isTrue || failures.push(`${situation}: ${what}`);
  const { nodes } = page;
  const tiles = [...(nodes.tiles.innerHTML + nodes.tilesGrilling.innerHTML).matchAll(/<div class="tile"><div class="label">([^<]*)<\/div><div class="value">(\d+)<\/div>(.*?)<\/svg><\/div>/gs)]
    .map((match) => ({ label: match[1], value: Number(match[2]), rest: match[3], trendSum: sumOfTrend(/<svg class="tile-trend".*$/s.exec(match[3])[0]) }));
  const tile = (label) => tiles.find((entry) => entry.label === label) || { value: Number.NaN, rest: '' };
  const [answers, withLine, closed, asked, grilling] = [TEXTS.tileAnswers, TEXTS.tileWithLine, TEXTS.tileClosed, TEXTS.tileAsked, TEXTS.tileGrilling].map(tile);
  const barSums = (html) => {
    const sums = {};
    [...html.matchAll(/<rect [^>]*><title>[^<]* · ([^<]*): (\d+)<\/title><\/rect>/g)].forEach((match) => { sums[match[1]] = (sums[match[1]] || 0) + Number(match[2]); });
    return sums;
  };
  expect(tiles.length === 5, `five tiles, found ${tiles.length}`);
  expect(withLine.value <= answers.value, `with the line ${withLine.value} > answers ${answers.value}`);
  expect(withLine.rest.startsWith(`<div class="sub">${answers.value > 0 ? `${Math.round((100 * withLine.value) / answers.value)}%` : '—'}</div>`), 'the share of the tile is not with the line / answers');
  tiles.forEach((entry) => expect(entry.trendSum === entry.value, `tile ${entry.label} ${entry.value}, its trend sums ${entry.trendSum}`));
  const decidedAsked = barSums(nodes.decidedAsked.innerHTML);
  expect((decidedAsked[TEXTS.legendDecided] || 0) === closed.value, `closed ${closed.value}, the chart sums ${decidedAsked[TEXTS.legendDecided]}`);
  expect((decidedAsked[TEXTS.legendAsked] || 0) === asked.value, `asked ${asked.value}, the chart sums ${decidedAsked[TEXTS.legendAsked]}`);
  const stacked = Object.values(barSums(nodes.grilling.innerHTML)).reduce((sum, value) => sum + value, 0);
  expect(stacked === grilling.value, `grilling ${grilling.value}, the stacked bars sum ${stacked}`);
  const detail = [...grilling.rest.split('<br>')[0].matchAll(/(\d+)/g)].reduce((sum, match) => sum + Number(match[1]), 0);
  expect(detail <= grilling.value, `the grilling detail sums ${detail} > ${grilling.value}`);
  const groups = nodes.principles.innerHTML.split('<h3>').slice(1).map((part) => ({
    title: part.slice(0, part.indexOf('</h3>')),
    rows: part.split('<div class="principle">').slice(1).map((row) => {
      const bars = [...row.matchAll(/<\/span>\S+ (\d+)<\/div>/g)].map((match) => Number(match[1]));
      return { name: /^<div class="name">([^ <]*)/.exec(row)[1], decided: bars[0], ties: bars[1], trendSum: sumOfTrend(/<svg viewBox="0 0 100 24".*?<\/svg>/s.exec(row)[0]) };
    }),
  }));
  const rows = groups.flatMap((group) => group.rows);
  const inFile = groups.filter((group) => group.title !== TEXTS.notInAFileGroup).flatMap((group) => group.rows);
  expect(inFile.reduce((sum, row) => sum + row.decided, 0) === closed.value, `closed ${closed.value}, the rows decide ${inFile.reduce((sum, row) => sum + row.decided, 0)}`);
  rows.forEach((row) => expect(row.trendSum === row.decided, `row ${row.name} decided ${row.decided}, its line sums ${row.trendSum}`));
  expect(new Set(groups.map((group) => group.title)).size === groups.length, 'two groups of principles with the same title');
  const pairs = [...nodes.pairs.innerHTML.matchAll(/<b>(\d+)<\/b>/g)].reduce((sum, match) => sum + Number(match[1]), 0);
  expect(2 * pairs <= rows.reduce((sum, row) => sum + row.ties, 0), `pairs ${pairs} without as many ties`);
  const counts = [...nodes.projectList.innerHTML.matchAll(/<span class="count">(\d+)/g)].map((match) => Number(match[1]));
  expect(counts[0] === counts.slice(1).reduce((sum, value) => sum + value, 0), 'all projects is not the sum of the column');
  return failures;
}

test('the dashboard agrees with itself under every filter', () => {
  const root = mkdtempSync(join(tmpdir(), 'dashboard-'));
  const daysAgo = (count) => new Date(Date.now() - count * DAY).toISOString().slice(0, 10);
  const grilling = { questions: 3, withRecommendation: 2, notDecided: 2, selfAnswered: 1, chosenRecommended: 1, chosenOther: 1 };
  const alphaDay = { answers: 10, withLine: 6, questionsAsked: 2, decided: { SIMPLE: 2, LIGHT: 1, CERTEZZA_globale: 1, FOO: 1 }, against: { LIGHT: 1 },
    ties: { SIMPLE: 1, LIGHT: 1 }, tiePairs: { 'LIGHT × SIMPLE': 1 }, grilling, skills: { 'alecsplus-skills:the-way-grilling': 1, grilling: 1 } };
  const betaDay = { answers: 4, withLine: 1, questionsAsked: 1, decided: { OWN: 3, UNICO_globale: 2 }, against: {},
    ties: { OWN: 1, UNICO_globale: 1 }, tiePairs: { 'OWN × UNICO_globale': 1 }, grilling: { ...grilling, questions: 2 }, skills: {} };
  const globalFile = { global: ['CERTEZZA', 'UNICO'], globalLists: { result: ['CERTEZZA'], work: ['UNICO'] } };
  const ledger = {
    projects: {
      '-work-alpha': { name: 'alpha', days: { [daysAgo(0)]: alphaDay, [daysAgo(3)]: alphaDay, [daysAgo(12)]: alphaDay, [daysAgo(45)]: alphaDay } },
      '-work-beta': { name: 'beta', days: { [daysAgo(1)]: betaDay, [daysAgo(20)]: betaDay } },
    },
    files: { '-work-alpha': { project: ['SIMPLE', 'LIGHT'], projectLists: { result: ['SIMPLE'], work: ['LIGHT'] }, ...globalFile }, '*': { project: [], ...globalFile } },
    updatedAt: 'now',
  };
  const filePath = join(root, 'dashboard.html');
  writeDashboard({ ledger, ledgerPath: join(root, 'days.json'), filePath });
  const html = readFileSync(filePath, 'utf8');
  const situations = [['default', () => {}]];
  ['day', 'week', 'month'].forEach((unit) => ['7', '30', 'all'].forEach((days) => situations.push([`${unit} ${days}`, (page) => { page.press('unit', unit); page.press('days', days); }])));
  ['all', 'project', 'global'].forEach((level) => ['all', 'result', 'work'].forEach((kind) => situations.push([`${level} ${kind}`, (page) => { page.press('level', level); page.press('kind', kind); }])));
  ['-work-alpha', '-work-beta'].forEach((folder) => situations.push([`only ${folder}`, (page) => page.chooseProject(folder)]));
  situations.push(['grilling, of the project, day, alpha', (page) => { page.press('scope', 'grilling'); page.press('level', 'project'); page.press('unit', 'day'); page.chooseProject('-work-alpha'); }]);
  situations.push(['more projects, beta only, work', (page) => { page.setMultiple(true); page.tick('-work-alpha', false); page.press('kind', 'work'); page.press('days', 'all'); }]);
  assert.deepEqual(situations.flatMap(([situation, steps]) => { const page = openPage(html); steps(page); return incoherences(page, situation); }), []);
  const page = openPage(html);
  const everything = () => ['tiles', 'tilesGrilling', 'overtime', 'decidedAsked', 'principles', 'pairs', 'grilling', 'wayinuse'].map((id) => page.nodes[id].innerHTML);
  const allProjects = everything();
  const column = page.nodes.projectList.innerHTML;
  page.chooseProject('-work-beta');
  const changed = everything().map((html, index) => html !== allProjects[index]);
  assert.deepEqual(changed, changed.map(() => true), 'one project changes every part');
  page.press('days', '7');
  assert.notEqual(page.nodes.projectList.innerHTML, column, 'the column follows the period');
  page.press('unit', 'day');
  const words = everything().join(' ');
  assert.ok(words.includes('per day') && !words.includes('per week') && !words.includes('per month'), 'every "per unit" says day');
  page.press('scope', 'chat');
  assert.ok(page.nodes.partGrilling.hidden && !page.nodes.partChat.hidden, 'chat hides the grilling part');
});

test('--print-texts prints the texts as JSON with title and version', () => {
  const texts = JSON.parse(execFileSync('node', [reportPath, '--print-texts'], { encoding: 'utf8' }));
  assert.equal(texts.title, 'The way: report');
  assert.ok(texts._version);
});

test('--texts translates the dashboard when the version matches, stays english when it does not', () => {
  const fixture = setup();
  const current = JSON.parse(execFileSync('node', [reportPath, '--print-texts'], { encoding: 'utf8' }));
  const textsPath = join(fixture.root, 'texts.json');
  const pagePath = join(fixture.root, 'data', 'dashboard.html');
  writeFileSync(fixture.transcript, `${JSON.stringify(assistant('Principi: SIMPLE → z', new Date().toISOString()))}\n`);
  writeFileSync(textsPath, JSON.stringify({ _version: current._version, title: 'Prova' }));
  const translated = run(fixture, ['--texts', textsPath]);
  assert.match(translated, new RegExp(`Texts: ${textsPath}`));
  assert.ok(readFileSync(pagePath, 'utf8').includes('<h1>Prova</h1>'));
  assert.ok(readFileSync(pagePath, 'utf8').includes('"searchProjects":"Search projects"'));
  writeFileSync(textsPath, JSON.stringify({ _version: 'old', title: 'Prova' }));
  const stale = run(fixture, ['--texts', textsPath]);
  assert.match(stale, /is from old, current .*: translate again/);
  assert.ok(readFileSync(pagePath, 'utf8').includes('<h1>The way: report</h1>'));
  assert.match(run(fixture), /Texts: english/);
});

test('nothing to measure without any principles file', () => {
  const fixture = setup();
  assert.throws(() => execFileSync('node', [reportPath, '--way', 'none', '--global', 'none', '--no-open', '--data-dir', join(fixture.root, 'data'), '--projects-dir', fixture.projectsDirectory], { encoding: 'utf8', stdio: 'pipe' }), /status 1|Command failed/);
});
