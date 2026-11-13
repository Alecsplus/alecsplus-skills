import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
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
  assistant(nowIso, 'Domanda.\ni principi non decidono: SIMPLE verso A, ONE_PLACE verso B'),
  assistant(nowIso, 'Solo testo, nessuna riga.'),
  assistant(oldIso, 'Principi: CERTEZZA_globale → vecchia'),
];
writeFileSync(join(transcriptDirectory, 'session.jsonl'), `${entries.map((entry) => JSON.stringify(entry)).join('\n')}\nnon json "assistant"\n`);
writeFileSync(join(root, 'way.md'), '**SIMPLE** — a\n\n**ONE_PLACE** — b\n\n**LIGHT** — c\n');
writeFileSync(join(root, 'global.md'), '**CERTEZZA** — d\n');

const saveDirectory = join(root, 'saved');
const projectSaveDirectory = join(saveDirectory, '-home-x-develop-fake_proj');

function runReport(extraArguments = [], directory = saveDirectory) {
  return execFileSync('node', [
    scriptPath, '--way', join(root, 'way.md'), '--global', join(root, 'global.md'),
    '--tie', 'i principi non decidono', '--cwd', fakeCwd, '--projects-dir', projectsDirectory,
    '--save-dir', directory, ...extraArguments,
  ], { encoding: 'utf8' });
}

test('counts decisions, ties, against and silent principles in the period', () => {
  const output = runReport();
  assert.match(output, new RegExp(`\\| CERTEZZA \\| global \\| 1 \\| 1 \\(0\\) \\| 0 \\(0\\) \\| 0 \\(0\\) \\| [▁-█]+ \\| ${today} \\|`));
  assert.match(output, new RegExp(`\\| ONE_PLACE \\| project \\| 2 \\| 0 \\(0\\) \\| 1 \\(0\\) \\| 1 \\(0\\) \\| [▁-█]+ \\| ${today} \\|`));
  assert.match(output, new RegExp(`\\| SIMPLE \\| project \\| 1 \\| 0 \\(0\\) \\| 1 \\(0\\) \\| 0 \\(0\\) \\| [▁-█]+ \\| ${today} \\|`));
  assert.match(output, /\| CITED \| not in a file \| — \| 1 \(0\) \|/);
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
  assert.match(globalPart, new RegExp(`\\| CERTEZZA \\| 1 \\| 1 \\(0\\) \\| 0 \\(0\\) \\| 0 \\(0\\) \\| [▁-█]+ \\| ${today} \\| fake_proj 1 \\|`));
  assert.doesNotMatch(globalPart, /ONE_PLACE \|/);
  assert.doesNotMatch(output, /Pairs to read/);
});

test('the weeks section has one line per week with a bar for the decisions', () => {
  const output = runReport();
  const projectPart = output.slice(0, output.indexOf('## All your projects'));
  assert.match(projectPart, /Weeks:\n(- 20\d\d-W\d\d \(\d+ [A-Z][a-z]{2}\): turns 0, with the line 0, decisions 0\n)*- 20\d\d-W\d\d \(\d+ [A-Z][a-z]{2}\): turns 3, with the line 1, decisions 2 █{20}\n/);
});

test('the table has the file position and the weekly sparkline', () => {
  const output = runReport();
  assert.match(output, /\| principle \| level \| file \| decided \| ties \| against \| weeks \| last \|/);
  assert.match(output, /\| SIMPLE \| project \| 1 \| 0 \(0\) \| 1 \(0\) \| 0 \(0\) \| [▁-█]+ \|/);
  assert.match(output, /\| ONE_PLACE \| project \| 2 \|/);
  assert.match(output, /\| LIGHT \| project \| 3 \| 0 \(0\) \| 0 \(0\) \| 0 \(0\) \| ▁+ \| — \|/);
  assert.match(output, /\| CITED \| not in a file \| — \|/);
  assert.match(output, /\| CERTEZZA \| global \| 1 \| 1 \(0\) \|[^\n]*\| [▁-█]*█ \|/);
});

test('together lists the pairs of names in the same decision line', () => {
  const output = runReport();
  const projectPart = output.slice(0, output.indexOf('## All your projects'));
  assert.match(projectPart, /Together: CERTEZZA \+ ONE_PLACE 1\n/);
  assert.match(output.slice(output.indexOf('## All your projects')), /Together: none/);
});

test('the report names the oldest transcript and saves the markdown and the json', () => {
  const directory = join(root, 'saved-once');
  const output = runReport([], directory);
  const savedDirectory = join(directory, '-home-x-develop-fake_proj');
  assert.match(output, new RegExp(`Transcripts on disk go back to ${today} \\(Claude Code keeps them about 30 days\\)`));
  assert.match(output, /Saved reports for this project: none yet\./);
  assert.match(output, new RegExp(`\\nSaved: ${savedDirectory}/${today}\\.md\\n$`));
  const markdown = readFileSync(join(savedDirectory, `${today}.md`), 'utf8');
  assert.ok(!markdown.includes('Saved:'));
  const saved = JSON.parse(readFileSync(join(savedDirectory, `${today}.json`), 'utf8'));
  assert.equal(saved.date, today);
  assert.equal(saved.days, 30);
  assert.deepEqual(saved.project.ONE_PLACE, { level: 'project', decided: 0, ties: 1, against: 1 });
  assert.deepEqual(saved.global.CERTEZZA, { decided: 1, ties: 0, against: 0 });
  assert.deepEqual(saved.turns, { project: { withText: 3, withLine: 1 }, global: { withText: 3, withLine: 1 } });
  assert.match(runReport([], directory), /Saved reports for this project: 1, first /);
});

test('--history prints the saved reports as a table with the trend', () => {
  const directory = join(root, 'saved-history');
  runReport([], directory);
  const output = runReport(['--history'], directory);
  assert.match(output, /^# The way: history — fake_proj, 1 report from \d{4}-\d\d-\d\d to \d{4}-\d\d-\d\d\n/);
  assert.match(output, new RegExp(`\\| principle \\| ${today} \\| trend \\|`));
  assert.match(output, /\| CERTEZZA \| 1 \| █ \|/);
  assert.match(output, /Turns with the line: 33%/);
  assert.match(output, /## All your projects \(global principles, decided per report\)/);
});

test('--history without saved reports says so and exits with 0', () => {
  const output = runReport(['--history'], join(root, 'saved-empty'));
  assert.equal(output, 'No saved report yet for this project: run the-way-report once.\n');
  assert.ok(!existsSync(join(root, 'saved-empty')));
});

test('with --days all the old line counts', () => {
  const output = runReport(['--days', 'all']);
  assert.match(output, /\| CERTEZZA \| global \| 1 \| 2 \(—\)/);
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
