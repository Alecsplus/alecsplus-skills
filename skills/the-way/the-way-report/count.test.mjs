import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptPath = join(dirname(fileURLToPath(import.meta.url)), 'count.mjs');
const DAY = 24 * 60 * 60 * 1000;
const root = mkdtempSync(join(tmpdir(), 'the-way-report-'));
const fakeCwd = '/home/x/develop/fake_proj';
const projectsDirectory = join(root, 'projects');
const transcriptDirectory = join(projectsDirectory, '-home-x-develop-fake_proj');
mkdirSync(transcriptDirectory, { recursive: true });

const today = new Date().toISOString().slice(0, 10);
const nowIso = new Date().toISOString();
const oldIso = new Date(Date.now() - 100 * DAY).toISOString();

function assistant(timestamp, text, stopReason = 'end_turn') {
  return { type: 'assistant', cwd: fakeCwd, timestamp, message: { stop_reason: stopReason, content: [{ type: 'text', text }] } };
}

const entries = [
  assistant(nowIso, 'Principi: CERTEZZA_globale → ho controllato; 🔻 ONE_PLACE → la riga vive in due posti; CITED_globale → suffisso sbagliato\nTesto.'),
  { type: 'user', cwd: fakeCwd, timestamp: nowIso, message: { content: '  <task-notification>fatto</task-notification>' } },
  { type: 'user', cwd: fakeCwd, timestamp: nowIso, message: { content: 'no, non così' } },
  assistant(nowIso, 'Domanda.\ni principi non decidono: SIMPLE verso A, ONE_PLACE verso B'),
  assistant(nowIso, 'Solo testo, nessuna riga.'),
  assistant(oldIso, 'Principi: CERTEZZA_globale → vecchia'),
];
writeFileSync(join(transcriptDirectory, 'session.jsonl'), `${entries.map((entry) => JSON.stringify(entry)).join('\n')}\nnon json "assistant"\n`);
writeFileSync(join(root, 'way.md'), '**SIMPLE** — a\n\n**ONE_PLACE** — b\n\n**LIGHT** — c\n');
writeFileSync(join(root, 'global.md'), '**CERTEZZA** — d\n');

function runReport(extraArguments = []) {
  return execFileSync('node', [
    scriptPath, '--way', join(root, 'way.md'), '--global', join(root, 'global.md'),
    '--tie', 'i principi non decidono', '--cwd', fakeCwd, '--projects-dir', projectsDirectory, ...extraArguments,
  ], { encoding: 'utf8' });
}

test('counts decisions, ties, against and silent principles in the period', () => {
  const output = runReport();
  assert.match(output, new RegExp(`\\| CERTEZZA \\| global \\| 1 \\(0\\) \\| 0 \\(0\\) \\| 0 \\(0\\) \\| ${today} \\|`));
  assert.match(output, new RegExp(`\\| ONE_PLACE \\| project \\| 0 \\(0\\) \\| 1 \\(0\\) \\| 1 \\(0\\) \\| ${today} \\|`));
  assert.match(output, new RegExp(`\\| SIMPLE \\| project \\| 0 \\(0\\) \\| 1 \\(0\\) \\| 0 \\(0\\) \\| ${today} \\|`));
  assert.match(output, /\| CITED \| not in a file \| 1 \(0\) \|/);
  assert.ok(output.indexOf('| CITED |') > output.indexOf('| SIMPLE |'));
  assert.match(output, /Silent in the period: LIGHT\n/);
  assert.match(output, /Tie pairs: ONE_PLACE × SIMPLE 1 \(0\)/);
  assert.match(output, /Against: ONE_PLACE 1 \(0\)/);
});

test('counts turns and the share with the Principles line', () => {
  const output = runReport();
  assert.match(output, /Turns: 3 with text, 1 with the Principles line \(33%, before —\)/);
  assert.match(output, /Choices: 1 decided by a principle, 1 came to you \(50% closed by the principles/);
});

test('the global part counts only global principles with their projects', () => {
  const output = runReport();
  const globalPart = output.slice(output.indexOf('## All your projects'));
  assert.match(globalPart, new RegExp(`\\| CERTEZZA \\| 1 \\(0\\) \\| 0 \\(0\\) \\| 0 \\(0\\) \\| ${today} \\| fake_proj 1 \\|`));
  assert.doesNotMatch(globalPart.slice(0, globalPart.indexOf('## Pairs')), /ONE_PLACE \|/);
});

test('the pair to read carries the next user message and comes last', () => {
  const output = runReport();
  assert.ok(output.indexOf('## Pairs to read') > output.indexOf('## All your projects'));
  const pairsPart = output.slice(output.indexOf('## Pairs to read'));
  assert.match(pairsPart, /«no, non così»/);
  assert.doesNotMatch(pairsPart, /task-notification/);
});

test('with --days all the old line counts', () => {
  const output = runReport(['--days', 'all']);
  assert.match(output, /\| CERTEZZA \| global \| 2 \(—\)/);
  assert.match(output, /Turns: 4 with text, 2 with the Principles line \(50%, before —\)/);
});

test('with no file at all it says so and exits with 1', () => {
  let status = 0;
  try {
    execFileSync('node', [scriptPath, '--way', 'none', '--global', 'none'], { encoding: 'utf8' });
  } catch (error) {
    status = error.status;
  }
  assert.equal(status, 1);
});
