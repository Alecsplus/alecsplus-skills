---
name: the-way-report
description: Measure how much the principles weigh in the work, from the sessions themselves, and show it as a dashboard. Reads the Claude Code transcripts of this project and of all the user's projects, keeps a day-by-day ledger that outlives the transcripts, and opens one self-contained HTML page that answers with three shares in one breath, each with its counts and its trend per day, week or month: decided alone (choices the principles closed without asking), advice taken (grilling questions where the recommended answer was chosen), not enough and said so (answers that say the principles do not decide). Under them, the habit of the Principles line, then where to act, principle by principle, and the plugin in use. Writes no principle; every change it proposes goes through the-way-new or the-way-global-new. Use when the user wants to know whether the principles are used, which ones are silent, how much the way helps, how many questions it saved, or asks for a report, a dashboard, a check-up or the history of the principles.
---

# The way: report

The plugin asks for one thing at every turn: the line "Principles: NAME → why" at the top of the message. That line is also the measure. This skill counts it in the transcripts Claude Code keeps on disk, together with the questions Claude asked, the grilling questions and the skills run, keeps the counts day by day, and shows them in one dashboard page. It counts; it does not judge whether a choice turned out well, because nothing in a transcript says so. It never writes a principle.

Transcripts live about 30 days (Claude Code's `cleanupPeriodDays`); the ledger does not expire: every run adds the days it can still see, so the dashboard shows the whole story from the first run on. Run it whenever you like.

## Before anything

1. Find the two files of principles. The project's: `THE-WAY.md` in the repo root, or the file that `CLAUDE.md` imports with an `@…/THE-WAY.md` line (in this plugin's own repo it is `skills/the-way/THE-WAY.md`). The global one: `~/.claude/THE-WAY.md`. Either may be missing; with both missing, say so in one line and stop: there is nothing to measure. In each file, the first `## ` section is the Result list and the second the Work list: the dashboard filters by them.
2. Read the project's `THE-WAY-USAGE.md` and the global one, `~/.claude/THE-WAY-USAGE.md`, and take from each the words it fixes for a question the principles do not close, the ones in quotes after "starting with the words": in English "the principles do not decide", in Italian "i principi non decidono". The counter needs all of them, because it reads every project and each may speak its own language: join them with `|`.
3. The period of the chat summary is the last 30 days unless the person gave a number of days or "all"; the dashboard always has everything and its own date selector.

## Language

The dashboard speaks the language of `~/.claude/CLAUDE.md` (English if the file is missing or is in English). In English there is nothing to do. Otherwise, if `~/.claude/the-way-reports/texts.json` is missing, or the summary of the last run says it is from another version ("translate again"): run `node <this skill's folder>/report.mjs --print-texts`, translate every value into that language (same meaning, same `{placeholders}`, file and skill names stay), write the JSON to `~/.claude/the-way-reports/texts.json` with the same `_version`, then run the report as usual. One translation per version; no yes is asked, because the file lives outside the repo and belongs to this skill.

## Count and show

Run, from the root of the project:

```
node <this skill's folder>/report.mjs --way <project THE-WAY.md or none> --global <~/.claude/THE-WAY.md or none> --days <days or all> --tie "<the words from step 2, joined with |>"
```

It reads `~/.claude/projects/*/*.jsonl` (the folder of a project is its directory path with every character that is not a letter, a digit or `_` turned into `-`), only the main conversation (not subagents, not tool results), and takes for every day and every project:

- **answers**: messages that end Claude's turn with text; those **with the line** (a line starting with `Princip…:`, any language, at the top of a text block); in that line every `NAME →` is a **decision** of NAME, `🔻 NAME →` an **against**, a lowercase suffix (`_global`, `_globale`) the global level; the **level** is `project` for a bare name in the project's file, `global` for a suffixed name in the global file, `not in a file` otherwise;
- **ties**: a line with the words of step 2, the names in it and their pair. An answer that says the principles do not decide is a question to the person, whatever its last line;
- **questions asked**: answers whose last line ends with a question mark, plus the ties above, so the person had to answer;
- **grilling**: every `❓` question; whether it has a recommended answer (a bold option), whether it says the principles do not decide, whether the answer was already in it; and, from the person's next message, whether they chose the recommended option or another one;
- **skills run**: every `Skill` call, by name.

Every number of the page is counted by principle names. So, per day and per level and list (Result, Work), the counter keeps three things: the answers whose line cites the names, the answers whose "do not decide" line names them, and the grilling questions whose text names them. This is how the Principles and List filters can narrow every number.

It writes them into `~/.claude/the-way-reports/days.json` (one entry per project and day; days already there are kept, days seen again are rewritten), renders `~/.claude/the-way-reports/dashboard.html` from the whole ledger, opens it in the browser, and prints a short summary of the period for you, ending with the page's path. The dashboard is self-contained and works offline. Nothing of it is estimated by you.

**The question.** "How much do the principles weigh", answered in three shares, each with its counts beside it and its trend per day, week or month on a fixed 0–100 scale:

- **Decided alone**: choices the principles closed without asking, over those plus the questions that came to the person.
- **Advice taken**: grilling questions where the person took the recommended answer, over those answered either way.
- **Not enough and said so**: answers that say "the principles do not decide", over the questions that came to the person.

Under them, one line, the habit: answers with the Principles line over all answers. A switch "Shares % / Numbers" shows the same things as counts (bars, with the questions to the person as a grey outline). A light/dark switch is remembered.

**Filters**, in two cards. "What the numbers speak of": projects as chips with a search box and "all N"; principles of the project, global or all; list Result, Work or all. "When": period presets and dates; step day, week or month. Principles and List choose which names count in every number of the page.

**Where to act.** One row per principle: decided, not enough (named where the principles did not decide), against (chosen against it out loud), and its trend. Global principles carry a small globe, with its legend right there; when more than one project is chosen, the project's name sits beside a project principle. Silent ones share one grey row, and the rest hide behind "show all". Then the pairs that pulled in opposite directions, and the names no file has (these do not count in the shares).

**At the bottom**, outside the Principles and List filters: the plugin in use, with the runs, per step, of the-way-grilling, the-way-self-answer, the-way-new, the-way-global-new, and Pocock's grilling without the principles.

Every tile, chart and card has an "i" with one sentence that says what it counts, for someone who never saw the counter.

## Tell

Say in chat, in the language of the project, for someone who reads fast and never saw the counter (no column names), in this order:

1. The habit: answers, how many with the line, the share and the share before.
2. Decided alone.
3. Advice taken.
4. Left open.
5. The grilling line, only if there were grilling questions.
6. "What to do", at most three lines (next section).
7. The dashboard: "open in the browser, or at <path>".

## Say what to do

Choose by these readings, in this order; a principle that falls in two gets one line. Each line names the principle, the fact, and the next step. You propose, you do not write: the step is a call to `/alecsplus-skills:the-way-new` (or `the-way-global-new` for a global one), which passes the sentence through its criterion and asks its own yes.

- **Against two times or more**: real cases beat the sentence; it fails *Uncontradicted*. Next step: `the-way-new` reads it again with the cases from the against lines.
- **The same tie pair two times or more**: the two overlap at the border, or their order in the list does not say which weighs more. Next step: `the-way-new` on the two, to sharpen one sentence or move one line (the order is importance). When the "not enough" share is high too, say it in the same line with the pairs.
- **Position and use far apart**: a principle first in the file and last in use, or the other way round, says the written importance is not the lived one. Name it; moving a line is one yes with `the-way-new`.
- **Grilling questions answered as recommended most of the time** (two thirds or more, on ten or more): the principles already decide them; say that `the-way-self-answer` would have taken those, and the grilling can keep the open ones.
- **Not in a file**: Claude cited a principle that no file has, or gave it the wrong level. Nothing to write: name it in one line as a habit to watch; if the name comes back run after run, it may be a principle waiting for `the-way-new` or `the-way-global-new`.
- **Silent** (in the file, never cited in the period, and the period had answers): either nothing of its kind came up, or it is not read when it should. Name them in one line and ask nothing: whoever leads decides whether to keep, rewrite or wait; a silent principle is removed only by hand.

When nothing falls in any reading, "What to do" is one line: the principles hold, nothing to touch. When the period has no answer with the line at all, say that the habit is not there yet and that the measure starts when it is: check that `THE-WAY-USAGE.md` is the current one with `the-way-setup`.

## What this skill does not do

It does not write principles and does not change one. It does not judge the quality of the work, nor whether a choice was the right one: a choice taken against a principle, said out loud, is the plugin doing its job, not a failure. It only says whether, how often and when the principles took part.
