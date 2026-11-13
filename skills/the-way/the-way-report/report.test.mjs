import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

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
  const explanationKeys = ['explainAnswers', 'explainWithLine', 'explainClosed', 'explainAsked', 'explainGrillingTile', 'explainShare', 'explainDecidedAsked', 'explainGrillingChart', 'explainWayInUse', 'explainRecommended', 'explainOther', 'explainLeftOpen', 'explainSelfAnswered', 'explainGrillingWith', 'explainGrillingWithout', 'explainSelfAnswer', 'explainColumns', 'explainTrend', 'explainPairs'];
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
