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
  writeFileSync(join(root, 'way.md'), '**SIMPLE** — a\n\n**ONE_PLACE** — b\n\n**LIGHT** — c\n');
  writeFileSync(join(root, 'global.md'), '**CERTEZZA** — d\n');
  return { root, projectsDirectory, cwd, transcript: join(folder, 'a.jsonl') };
}

function run(fixture) {
  return execFileSync('node', [reportPath, '--way', join(fixture.root, 'way.md'), '--global', join(fixture.root, 'global.md'),
    '--tie', 'the principles do not decide', '--data-dir', join(fixture.root, 'data'), '--projects-dir', fixture.projectsDirectory,
    '--cwd', fixture.cwd, '--no-open'], { encoding: 'utf8' });
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
  assert.deepEqual(ledger.files[folder], { project: ['SIMPLE', 'ONE_PLACE', 'LIGHT'], global: ['CERTEZZA'] });
  assert.match(output, /Answers: 5/);
  assert.match(output, /Grilling: 2 questions, 1 answered as recommended, 1 other, 1 left open/);
  assert.match(output, /CERTEZZA 1 \(global, #1\)/);
  assert.match(output, /The way in use: grilling with the principles 1, without 0, self-answer 0, principles written 0/);
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
});

test('nothing to measure without any principles file', () => {
  const fixture = setup();
  assert.throws(() => execFileSync('node', [reportPath, '--way', 'none', '--global', 'none', '--no-open', '--data-dir', join(fixture.root, 'data'), '--projects-dir', fixture.projectsDirectory], { encoding: 'utf8', stdio: 'pipe' }), /status 1|Command failed/);
});
