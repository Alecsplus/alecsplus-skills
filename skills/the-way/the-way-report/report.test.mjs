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
  assert.deepEqual(today.lineCites, { 'global/*': 1, 'global/result': 1, '*/result': 1, 'project/*': 1, 'project/result': 1, 'project/work': 1, '*/work': 1 });
  assert.deepEqual(days[oldTime.slice(0, 10)].lineCites, { 'project/*': 1, 'project/work': 1, '*/work': 1 });
  assert.deepEqual(today.decided, { CERTEZZA_globale: 1, SIMPLE: 1 });
  assert.deepEqual(today.against, { ONE_PLACE: 1 });
  assert.equal(today.questionsAsked, 3); // the one ending with "?" and the two that say the principles do not decide
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
  assert.ok(page.includes('id="ledger"') && page.includes('CERTEZZA') && page.includes('SIMPLE'));
  assert.ok(!page.includes('http'));
  const printed = JSON.parse(execFileSync('node', [reportPath, '--print-texts'], { encoding: 'utf8' }));
  const infoKeys = ['infoWhat', 'infoWhen', 'infoTileClosed', 'infoTileTaken', 'infoTileOpen', 'infoHabit', 'infoChart', 'infoTable', 'infoPairs', 'infoUnknown', 'infoWayInUse'];
  assert.ok(infoKeys.every((key) => typeof printed[key] === 'string' && printed[key].length > 0 && page.includes(`"${key}":`)));
  assert.equal(page.split('<script')[0].match(/<button type="button" class="info"/g).length, 7, 'one info button for each fixed heading');
  assert.ok(['day', 'week', 'month'].every((unit) => page.includes(`data-unit="${unit}"`)));
  assert.ok(['all', 'result', 'work'].every((kind) => page.includes(`data-kind="${kind}"`)));
  assert.ok(['light', 'dark'].every((scheme) => page.includes(`data-scheme="${scheme}"`)) && ['shares', 'numbers'].every((mode) => page.includes(`data-mode="${mode}"`)));
  assert.ok(page.includes('id="projectSearch"') && page.includes('id="projectAll"') && !page.includes('<select'));
});

// Runs the page script on a fake DOM: the buttons, the project field, the theme and the info boxes answer like in a browser.
function openPage(html, { isDark = false } = {}) {
  const ledgerText = /<script type="application\/json" id="ledger">(.*?)<\/script>/s.exec(html)[1];
  const script = [...html.matchAll(/<script>(.*?)<\/script>/gs)].pop()[1];
  const nodes = {};
  const makeNode = (attributes = {}) => ({ innerHTML: '', value: '', textContent: '', attributes, listeners: {}, className: '',
    addEventListener(name, handler) { this.listeners[name] = handler; }, getAttribute(name) { return this.attributes[name]; }, setAttribute() {},
    classList: { toggle() {}, remove() {} } });
  const choices = [...html.matchAll(/<button data-(mode|level|kind|unit|days|scheme)="([^"]+)"/g)].map((match) => makeNode({ [`data-${match[1]}`]: match[2] }));
  const documentListeners = {};
  const root = { attributes: {}, setAttribute(name, value) { this.attributes[name] = value; }, getAttribute(name) { return this.attributes[name]; } };
  const document = {
    documentElement: root,
    getElementById: (id) => (id === 'ledger' ? { textContent: ledgerText } : (nodes[id] ||= makeNode())),
    querySelectorAll: (selector) => choices.filter((button) => selector.includes(`[${Object.keys(button.attributes)[0]}]`)),
    addEventListener: (name, handler) => { documentListeners[name] = handler; },
  };
  const stored = {};
  const localStorage = { getItem: (key) => stored[key] ?? null, setItem: (key, value) => { stored[key] = value; } };
  const window = { matchMedia: () => ({ matches: isDark }) };
  vm.runInNewContext(script, { document, window, localStorage, Date, Math, JSON, Object, Array, Number, String });
  const clickOn = (name, value) => ({ target: { closest: () => ({ getAttribute: () => value }) } });
  return {
    nodes, root, stored,
    press: (name, value) => choices.find((button) => button.attributes[`data-${name}`] === value).listeners.click(),
    chooseProject: (folder) => nodes.projectMatches.listeners.click(clickOn('add', folder)),
    removeProject: (folder) => nodes.projectChips.listeners.click(clickOn('remove', folder)),
    typeProject: (query, key) => { nodes.projectSearch.value = query; nodes.projectSearch.listeners.input(); nodes.projectSearch.listeners.keydown({ key }); },
    clickAnywhere: () => documentListeners.click({ target: {} }),
  };
}

const titlesOf = (html) => [...html.matchAll(/<title>([^<]*)<\/title>/g)].map((match) => /: (\d+)(?: \S+ (\d+))?$/.exec(match[1]));
const sumOf = (html) => titlesOf(html).reduce((sums, found) => [sums[0] + Number(found[1]), sums[1] + Number(found[2] || 0)], [0, 0]);
const shareOf = (part, whole) => (whole > 0 ? `${Math.round((100 * part) / whole)}%` : '—');
const KIND_LISTS = { result: ['SIMPLE', 'CERTEZZA'], work: ['LIGHT', 'UNICO'] };

// Every tile, chart and row of the page must agree with the others: the failures, one line each.
function incoherences(page, situation, { level, kind, mode }) {
  const failures = [];
  const expect = (isTrue, what) => isTrue || failures.push(`${situation}: ${what}`);
  const { nodes } = page;
  const tiles = nodes.tiles.innerHTML.split('<article class="card tile">').slice(1).map((tile) => {
    const [part, whole] = sumOf(/<svg.*<\/svg>/s.exec(tile)[0]);
    return { big: /<b>([^<]*)<\/b>/.exec(tile)[1], small: /<\/b><span>([^<]*)<\/span>/.exec(tile)[1], part, whole, html: tile };
  });
  expect(tiles.length === 3, `three tiles, found ${tiles.length}`);
  tiles.forEach((tile, index) => {
    const isShare = mode === 'shares';
    expect(tile.big === (isShare ? shareOf(tile.part, tile.whole) : String(tile.part)), `tile ${index}: big number ${tile.big}, its points say ${tile.part} of ${tile.whole}`);
    if (isShare) {
      const [, smallPart, smallWhole] = /^(\d+) .* (\d+)$/.exec(tile.small) || [];
      expect(Number(smallPart) === tile.part && Number(smallWhole) === tile.whole, `tile ${index}: the small text "${tile.small}" is not ${tile.part} of ${tile.whole}`);
    }
    expect(/class="info"/.test(tile.html), `tile ${index}: no info button`);
  });
  const chart = nodes.chart.innerHTML;
  const chartSum = (selector) => sumOf([...chart.matchAll(selector)].map((match) => match[0]).join(''));
  ['c0', 'c1', 'c2'].forEach((cls, index) => {
    const found = chartSum(mode === 'shares' ? new RegExp(`<circle class="dot ${cls}".*?</circle>`, 'g') : new RegExp(`<rect class="bar ${cls}".*?</rect>`, 'g'));
    expect(found[0] === tiles[index].part, `chart ${cls}: sums ${found[0]}, the tile ${tiles[index].part}`);
    expect(mode === 'numbers' || found[1] <= tiles[index].whole, `chart ${cls}: the points count ${found[1]} of ${tiles[index].whole}`);
  });
  if (mode === 'numbers') {
    expect(chartSum(/<rect class="outline".*?<\/rect>/g)[0] === tiles[0].whole - tiles[0].part, 'the grey outline is not the questions asked to you');
  }
  const habit = /<b>([^<]*)<\/b>, (\d+) \S+ (\d+);/.exec(nodes.habit.innerHTML);
  expect(habit && habit[1] === shareOf(Number(habit[2]), Number(habit[3])), `habit line ${habit && habit[0]}`);
  const rows = nodes.principles.innerHTML.split('<tr').slice(2).map((row) => ({
    names: [...row.matchAll(/<b class="name" data-level="([^"]*)">([^<]*)<\/b>/g)].map((match) => ({ level: match[1], name: match[2] })),
    cells: [...row.matchAll(/<td class="n[^"]*">(\d+)<\/td>/g)].map((match) => Number(match[1])),
    line: sumOf(row)[0],
    marks: (row.match(/class="globeMark"/g) || []).length,
  }));
  rows.forEach((row) => {
    expect(row.marks === row.names.filter((name) => name.level === 'global').length, `row ${row.names[0]?.name}: the globe is not on exactly the global names`);
    expect(row.names.length !== 1 || row.line === row.cells[0], `row ${row.names[0]?.name}: decided ${row.cells[0]}, its line sums ${row.line}`);
  });
  const decidedSum = rows.reduce((sum, row) => sum + row.cells[0], 0);
  expect(decidedSum === tiles[0].part, `the rows decide ${decidedSum}, the tile ${tiles[0].part}`);
  const pairItems = nodes.pairs.innerHTML.split('<li>').slice(1);
  pairItems.forEach((item) => {
    const names = [...item.matchAll(/<b class="name" data-level="([^"]*)">([^<]*)<\/b>/g)].map((match) => ({ level: match[1], name: match[2] }));
    expect(names.length === 2, `a pair with ${names.length} names`);
    expect(names.every((entry) => level === 'all' || entry.level === level), `a pair shows ${JSON.stringify(names)} under level ${level}`);
    expect(names.every((entry) => kind === 'all' || (entry.level !== 'none' && KIND_LISTS[kind].includes(entry.name))), `a pair shows ${JSON.stringify(names)} under list ${kind}`);
    expect((item.match(/class="globeMark"/g) || []).length === names.filter((entry) => entry.level === 'global').length, 'a pair without the globe on its global names');
  });
  return failures;
}

test('the dashboard agrees with itself under every filter', () => {
  const root = mkdtempSync(join(tmpdir(), 'dashboard-'));
  const daysAgo = (count) => new Date(Date.now() - count * DAY).toISOString().slice(0, 10);
  const grilling = { questions: 3, withRecommendation: 2, notDecided: 2, selfAnswered: 1, chosenRecommended: 1, chosenOther: 1 };
  const advice = { questions: 3, chosenRecommended: 1, chosenOther: 1 };
  const alphaDay = { answers: 10, withLine: 6, questionsAsked: 2,
    lineCites: { 'project/*': 4, 'project/result': 3, 'project/work': 2, 'global/*': 1, 'global/result': 1, '*/result': 3, '*/work': 2 },
    openCites: { '*/*': 1, 'project/*': 1, 'project/result': 1, '*/result': 1 }, grillingCites: { '*/*': advice, 'project/*': advice, 'project/result': advice, '*/result': advice },
    decided: { SIMPLE: 2, LIGHT: 1, CERTEZZA_globale: 1, FOO: 1 }, against: { LIGHT: 1 },
    ties: { SIMPLE: 1, LIGHT: 1 }, tiePairs: { 'LIGHT × SIMPLE': 1, 'FOO × SIMPLE': 1 }, grilling, skills: { 'alecsplus-skills:the-way-grilling': 1, grilling: 1 } };
  const savedBeforeCites = { ...alphaDay, lineCites: undefined, openCites: undefined, grillingCites: undefined };
  const betaDay = { answers: 4, withLine: 1, questionsAsked: 1, lineCites: { 'global/*': 1, 'global/work': 1, '*/work': 1 }, openCites: { '*/*': 1, 'global/*': 1, 'global/work': 1, '*/work': 1 },
    grillingCites: { '*/*': advice, 'global/*': advice, 'global/work': advice, '*/work': advice }, decided: { OWN: 3, UNICO_globale: 2 }, against: {},
    ties: { OWN: 1, UNICO_globale: 1 }, tiePairs: { 'OWN × UNICO_globale': 1 }, grilling: { ...grilling, questions: 2 }, skills: {} };
  const globalFile = { global: ['CERTEZZA', 'UNICO'], globalLists: { result: ['CERTEZZA'], work: ['UNICO'] } };
  const ledger = {
    projects: {
      '-work-alpha': { name: 'alpha', days: { [daysAgo(0)]: alphaDay, [daysAgo(3)]: alphaDay, [daysAgo(12)]: alphaDay, [daysAgo(45)]: savedBeforeCites } },
      '-work-beta': { name: 'beta', days: { [daysAgo(1)]: betaDay, [daysAgo(20)]: betaDay } },
    },
    files: { '-work-alpha': { project: ['SIMPLE', 'LIGHT'], projectLists: { result: ['SIMPLE'], work: ['LIGHT'] }, ...globalFile }, '*': { project: [], ...globalFile } },
    updatedAt: '2026-11-13T10:00:00.000Z',
  };
  const filePath = join(root, 'dashboard.html');
  writeDashboard({ ledger, ledgerPath: join(root, 'days.json'), filePath });
  const html = readFileSync(filePath, 'utf8');
  const situations = [];
  ['shares', 'numbers'].forEach((mode) => ['all', 'project', 'global'].forEach((level) => ['all', 'result', 'work'].forEach((kind) => ['7', '30', 'all'].forEach((days) => {
    situations.push([`${mode} ${level} ${kind} ${days}`, { level, kind, mode }, (page) => { page.press('mode', mode); page.press('level', level); page.press('kind', kind); page.press('days', days); }]);
  }))));
  ['day', 'week', 'month'].forEach((unit) => situations.push([`unit ${unit}`, { level: 'all', kind: 'all', mode: 'shares' }, (page) => { page.press('unit', unit); page.press('days', 'all'); }]));
  ['-work-alpha', '-work-beta'].forEach((folder) => situations.push([`only ${folder}`, { level: 'all', kind: 'all', mode: 'shares' }, (page) => { page.chooseProject(folder); page.press('days', 'all'); }]));
  assert.deepEqual(situations.flatMap(([situation, filters, steps]) => { const page = openPage(html); steps(page); return incoherences(page, situation, filters); }), []);
  const page = openPage(html);
  page.press('days', 'all');
  const tileSums = () => page.nodes.tiles.innerHTML.split('<article class="card tile">').slice(1).map((tile) => sumOf(/<svg.*<\/svg>/s.exec(tile)[0]));
  assert.deepEqual(tileSums()[0], [20, 30], 'closed 20 (16 of alpha, 4 of beta), asked 10');
  assert.ok(page.nodes.tiles.innerHTML.includes(TEXTS.countedSince.replace(' {date}', '')), 'the old day without the counts says from when, in the open question tile');
  const habitOf = () => /<b>([^<]*)<\/b>, (\d+) \S+ (\d+);/.exec(page.nodes.habit.innerHTML).slice(1).join(' ');
  assert.equal(habitOf(), `${shareOf(26, 48)} 26 48`, 'the habit counts every answer of every day');
  const wayBefore = page.nodes.wayTiles.innerHTML;
  const habitBefore = habitOf();
  page.press('level', 'global');
  page.press('kind', 'work');
  assert.equal(page.nodes.wayTiles.innerHTML, wayBefore, 'the plugin tiles do not follow Principles and List');
  assert.equal(habitOf(), habitBefore, 'the habit line does not follow Principles and List');
  assert.ok(page.nodes.tiles.innerHTML.includes(TEXTS.countedSince.replace(' {date}', '')), 'under a filter the old day is not counted and the tile says since when');
  page.press('level', 'all');
  page.press('kind', 'all');
  const before = ['habit', 'principles', 'pairs', 'unknown', 'wayTiles'].map((id) => page.nodes[id].innerHTML);
  const quantities = [page.nodes.tiles.innerHTML, page.nodes.chart.innerHTML];
  page.press('mode', 'numbers');
  assert.deepEqual(['habit', 'principles', 'pairs', 'unknown', 'wayTiles'].map((id) => page.nodes[id].innerHTML), before, 'Shares and Numbers re-render the tiles and the chart only');
  assert.ok(page.nodes.tiles.innerHTML !== quantities[0] && page.nodes.chart.innerHTML !== quantities[1], 'the tiles and the chart change with the mode');
  assert.ok(page.nodes.chart.innerHTML.includes('class="outline"') && !page.nodes.chart.innerHTML.includes('class="line '), 'Numbers draw bars inside the grey outline, no lines');
  assert.ok(page.nodes.chartTitle.textContent === TEXTS.chartNumbersTitle.replace('{unit}', 'week'));
  const everythingBelow = () => ['habit', 'principles', 'pairs', 'unknown', 'wayTiles', 'tiles', 'chart'].map((id) => page.nodes[id].innerHTML);
  const allProjects = everythingBelow();
  assert.ok(page.nodes.projectChips.innerHTML.includes(TEXTS.allProjectsChip.replace('{n}', '2')) && page.nodes.projectAll.textContent === TEXTS.allProjectsButton.replace('{n}', '2'));
  page.typeProject('bet', 'Enter');
  assert.ok(page.nodes.projectChips.innerHTML.includes('data-remove="-work-beta"') && !page.nodes.projectChips.innerHTML.includes('alpha'), 'Enter adds the first match, and with all selected it replaces them');
  assert.deepEqual(everythingBelow().map((part, index) => part !== allProjects[index]), everythingBelow().map(() => true), 'one project changes everything under the filters');
  page.chooseProject('-work-alpha');
  assert.ok(page.nodes.principles.innerHTML.includes('class="faint">alpha') || page.nodes.principles.innerHTML.includes('>alpha<'), 'with two projects the rows say the project');
  page.removeProject('-work-alpha');
  page.removeProject('-work-beta');
  assert.deepEqual(everythingBelow(), allProjects, 'with no project left the page goes back to all');
  const unitWords = (unit) => { page.press('unit', unit); return page.nodes.chartTitle.textContent; };
  assert.ok(unitWords('day').includes('per day,') && unitWords('month').includes('per month,'));
  page.press('scheme', 'dark');
  assert.equal(page.root.getAttribute('data-theme'), 'dark');
  assert.equal(page.stored['the-way-theme'], 'dark', 'the choice is remembered');
  page.press('scheme', 'light');
  assert.equal(page.root.getAttribute('data-theme'), 'light');
  assert.equal(openPage(html, { isDark: true }).root.getAttribute('data-theme'), 'dark', 'without a choice the theme follows the system');
  page.clickAnywhere();
});

test('--print-texts prints the texts as JSON with title and version', () => {
  const texts = JSON.parse(execFileSync('node', [reportPath, '--print-texts'], { encoding: 'utf8' }));
  assert.equal(texts.title, 'How much the principles weigh');
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
  assert.ok(readFileSync(pagePath, 'utf8').includes('"searchProjects":"add a project…"'));
  writeFileSync(textsPath, JSON.stringify({ _version: 'old', title: 'Prova' }));
  const stale = run(fixture, ['--texts', textsPath]);
  assert.match(stale, /is from old, current .*: translate again/);
  assert.ok(readFileSync(pagePath, 'utf8').includes('<h1>How much the principles weigh</h1>'));
  assert.match(run(fixture), /Texts: english/);
});

test('nothing to measure without any principles file', () => {
  const fixture = setup();
  assert.throws(() => execFileSync('node', [reportPath, '--way', 'none', '--global', 'none', '--no-open', '--data-dir', join(fixture.root, 'data'), '--projects-dir', fixture.projectsDirectory], { encoding: 'utf8', stdio: 'pipe' }), /status 1|Command failed/);
});

test('counts the open answers and the grilling questions by the principles their tie line names', () => {
  const fixture = setup();
  const now = Date.now();
  const at = (seconds) => new Date(now - 60000 + seconds * 1000).toISOString();
  const entries = [
    assistant('SIMPLE and CERTEZZA_globale: the principles do not decide between them.', at(1)),
    assistant('Nothing named: the principles do not decide.', at(2)),
    assistant('❓ *Q1 – Which one?*\n**A) one**\nB) two\nCERTEZZA_globale: the principles do not decide between A and B', at(3)),
    person('q1 a', at(4)),
    assistant('❓ *Q2 – Another?*\n**A) one**\nB) two', at(5)),
    person('q2 b', at(6)),
  ];
  writeFileSync(fixture.transcript, `${entries.map((entry) => JSON.stringify(entry)).join('\n')}\n`);
  run(fixture);
  const ledger = JSON.parse(readFileSync(join(fixture.root, 'data', 'days.json'), 'utf8'));
  const [folder] = Object.keys(ledger.projects);
  const [today] = Object.values(ledger.projects[folder].days);
  assert.deepEqual(today.openCites, { '*/*': 3, 'project/*': 1, 'project/result': 1, 'project/work': 1, '*/result': 2, '*/work': 1, 'global/*': 2, 'global/result': 2 });
  assert.deepEqual(today.grillingCites, { '*/*': { questions: 2, chosenRecommended: 1, chosenOther: 1 }, 'global/*': { questions: 1, chosenRecommended: 1, chosenOther: 0 }, 'global/result': { questions: 1, chosenRecommended: 1, chosenOther: 0 }, '*/result': { questions: 1, chosenRecommended: 1, chosenOther: 0 } });
});
