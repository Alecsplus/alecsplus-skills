---
name: the-way-report
description: Measure how much the principles take part in the work, from the sessions themselves, and show it as a dashboard. Reads the Claude Code transcripts of this project and of all the user's projects, keeps a day-by-day ledger that outlives the transcripts, and opens one self-contained HTML page with date range and project selectors and charts of trend: answers that carry the Principles line, choices closed by the principles against questions that came to the person, every principle's use over time, grilling questions and how often the recommended answer was chosen, runs of each the-way skill. Writes no principle; every change it proposes goes through the-way-new or the-way-global-new. Use when the user wants to know whether the principles are used, which ones are silent, how much the way helps, how many questions it saved, or asks for a report, a dashboard, a check-up or the history of the principles.
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
- **ties**: a line with the words of step 2, the names in it and their pair;
- **questions asked**: answers whose last line ends with a question mark, so the person had to answer;
- **grilling**: every `❓` question; whether it has a recommended answer (a bold option), whether it says the principles do not decide, whether the answer was already in it; and, from the person's next message, whether they chose the recommended option or another one;
- **skills run**: every `Skill` call, by name.

It writes them into `~/.claude/the-way-reports/days.json` (one entry per project and day; days already there are kept, days seen again are rewritten), renders `~/.claude/the-way-reports/dashboard.html` from the whole ledger, opens it in the browser, and prints a short summary of the period for you, ending with the page's path. The dashboard is self-contained, works offline, and has, at the top: a bar of filters, each with its label (show Chat, Grilling or both; principles of the project, global or all; list Result, Work or all; unit of every chart, day, week or month; period, with presets), and a column of projects with a search box, where you tick one, many or all (each with its answers in the period). Then two parts. "Chat": tiles with the answers, the share with the line, the choices closed by the principles (the questions saved) and the questions asked; the share with the line and decided against asked over time; every principle with its decided, ties and against, its position in the file and its own trend, with a filter for the Result list, the Work list or both; the pairs of principles that pulled in opposite directions when the principles did not decide, and how many times. "Grilling and questions": the grilling questions and how they were answered; the grilling over time; "the way in use" over time, with three series (grilling with the principles, grilling without, questions closed with self-answer) and the runs of the-way-new. Nothing of this is estimated by you. Every tile, chart and table carries one line that says what it counts, for someone who never saw the counter.

## Tell

Say in chat, in the language of the project, at most five lines, for someone who reads fast and never saw the counter (no column names):

1. One line with the period's facts: answers, how many with the principles at the top (and the share before), choices the principles closed by themselves, questions that came to the person.
2. One line on grilling, only if there were grilling questions: how many, how many the person answered with the recommended option, how many the principles left open, and how many grillings went through the principles against how many did not.
3. "What to do", at most three lines (next section).
4. The dashboard: "open in the browser, or at <path>".

## Say what to do

Choose by these readings, in this order; a principle that falls in two gets one line. Each line names the principle, the fact, and the next step. You propose, you do not write: the step is a call to `/alecsplus-skills:the-way-new` (or `the-way-global-new` for a global one), which passes the sentence through its criterion and asks its own yes.

- **Against two times or more**: real cases beat the sentence; it fails *Uncontradicted*. Next step: `the-way-new` reads it again with the cases from the against lines.
- **The same tie pair two times or more**: the two overlap at the border, or their order in the list does not say which weighs more. Next step: `the-way-new` on the two, to sharpen one sentence or move one line (the order is importance).
- **Position and use far apart**: a principle first in the file and last in use, or the other way round, says the written importance is not the lived one. Name it; moving a line is one yes with `the-way-new`.
- **Grilling questions answered as recommended most of the time** (two thirds or more, on ten or more): the principles already decide them; say that `the-way-self-answer` would have taken those, and the grilling can keep the open ones.
- **Not in a file**: Claude cited a principle that no file has, or gave it the wrong level. Nothing to write: name it in one line as a habit to watch; if the name comes back run after run, it may be a principle waiting for `the-way-new` or `the-way-global-new`.
- **Silent** (in the file, never cited in the period, and the period had answers): either nothing of its kind came up, or it is not read when it should. Name them in one line and ask nothing: whoever leads decides whether to keep, rewrite or wait; a silent principle is removed only by hand.

When nothing falls in any reading, "What to do" is one line: the principles hold, nothing to touch. When the period has no answer with the line at all, say that the habit is not there yet and that the measure starts when it is: check that `THE-WAY-USAGE.md` is the current one with `the-way-setup`.

## What this skill does not do

It does not write principles and does not change one. It does not judge the quality of the work, nor whether a choice was the right one: a choice taken against a principle, said out loud, is the plugin doing its job, not a failure. It only says whether, how often and when the principles took part.
