---
name: the-way-report
description: Measure how much the principles take part in the work, from the sessions themselves. Reads the Claude Code transcripts of this project (and of all your projects for the global level), counts for every principle in THE-WAY.md and ~/.claude/THE-WAY.md how many choices it decided, how often it tied with another, how often a choice went against it, how it spreads over the weeks and with which other principles it comes, and keeps every report in ~/.claude/the-way-reports/ so the trend survives the transcripts. Writes no principle; every change it proposes goes through the-way-new or the-way-global-new. Use when the user wants to know whether the principles are used, which ones are silent, how much the way helps, asks for a report, a check-up or the history of the principles, periodically or once.
---

# The way: report

The plugin asks for one thing at every turn: the line "Principles: NAME → why" at the top of the message. That line is also the measure. This skill counts it in the transcripts Claude Code keeps on disk and tells whoever leads the project, in plain words, which principles decide, how often, when, with whom, and which never do. It counts; it does not judge whether a choice turned out well, because nothing in a transcript says so. It never writes a principle.

Transcripts live for about 30 days (Claude Code's `cleanupPeriodDays`); the saved pages do not expire: run it once a month and the trend is there.

## Before anything

1. Find the two files of principles. The project's: `THE-WAY.md` in the repo root, or the file that `CLAUDE.md` imports with an `@…/THE-WAY.md` line (in this plugin's own repo it is `skills/the-way/THE-WAY.md`). The global one: `~/.claude/THE-WAY.md`. Either may be missing; with both missing, say so in one line and stop: there is nothing to measure.
2. Read the project's `THE-WAY-USAGE.md` (or the global one if the project has none) and take the words it fixes for a question the principles do not close, the ones in quotes after "starting with the words": in English "the principles do not decide", in Italian "i principi non decidono". The counter needs them.
3. The period is the last 30 days unless the person gave a number of days or "all". Every count is shown next to the same count in the period before.
4. If the person asked for the history ("history", "how did it go over time", "the past reports"), run the counter with `--history` and tell what it gives in the words of "Tell": nothing else is read.

## Count

Run the counter, from the root of the project:

```
node <this skill's folder>/count.mjs --way <project THE-WAY.md or none> --global <~/.claude/THE-WAY.md or none> --days <days or all> --tie "<the words from step 2>"
```

It reads `~/.claude/projects/<folder of the current directory>/*.jsonl` (every character of the directory path that is not a letter, a digit or `_` becomes `-`), and for the global part every folder under `~/.claude/projects/`. It looks only at the text Claude wrote in the main conversation (not subagents, not tool results), and takes:

- a **decision**: a line starting with `Princip…:` (any language) at the top of a message; every `NAME →` in it is one decision of NAME; a name with a lowercase suffix (`NAME_global`, `NAME_globale`) is global;
- an **against**: a `🔻 NAME →` in that same line, the form `THE-WAY-USAGE.md` asks for when a choice goes against a principle;
- a **tie**: a line with the words of step 2; every name in it is one tie, and the pair is remembered;
- a **level**: `project` for a bare name that is in the project's file, `global` for a suffixed name that is in the global file, `not in a file` for anything else (a name no file has, or the wrong suffix); those rows stand last in the table and do not count as choices closed by a principle;
- a **turn**: a message that ends Claude's turn with text; the share of turns that carry the line says whether the habit holds;
- the **week** of every decision and turn, for the spread over time;
- the **company**: the other names in the same decision line.

The counter prints Markdown with two parts, "This project" (from this project's transcripts: project principles and the global ones cited here) and "All your projects" (from every folder: global principles only, with the projects that cited them). Each part has: the turns and the turns with the line; the choices closed by a principle against the ones that came to the person; the weeks of the period, one line each, with turns, turns with the line and decisions as a bar; a table with one principle per line (position in the file, decided, ties, against, a sparkline of the decisions over the weeks, last date; each count with the period before in parentheses); the principles of the file never cited in the period; the pairs that tie; the against counts; the principles that come together most. A part with no file is left out. The oldest transcript on disk is named at the top, so the reader knows how far back the counts can see.

Then it saves the counts in `~/.claude/the-way-reports/<folder of the project>/<date>.counts.md` and `<date>.json`, and prints that folder on the last line. The counter's output is for you, not for the person: do not print it. The person reads the page of the next step.

With `--history` it reads only the saved `.json` files of this project and prints one table, principles down, report dates across, with the decided count in every cell and a sparkline at the end of the row; and the same for the global principles across all projects. That too is for you: tell it in the words of the page below, one line per principle that moved, and say which report dates it spans.

## Tell

Write the page for the person who leads the project, in the language of the project, in the words of someone who reads fast and has never seen the counter: no column names, no "ties", "against", "sparkline" or "turns with the line". Numbers stay, as plain facts. The page has these lines, in this order, each one sentence, left out when it has nothing to say:

1. How many times Claude answered in the period, and in how many of them it said at the top which principles decided; the same share in the period before, in words ("before: never", "before: one in ten").
2. How many choices the principles closed by themselves, and how many came to the person.
3. Who worked most, with the count, up to four names; and which pairs always come together, if any pair came three times or more.
4. Which weeks were loud and which were quiet, only when they differ a lot: "almost all of it in the last week".
5. Who never spoke, in this project; and, for the global ones, in no project at all.
6. Which choices went against a principle, if any, with the count.
7. Which names Claude cited that no file has, if any.
8. Where the reports are kept and how to read them again: the folder, and the word "history" to see all of them in one table.

Then "What to do" (next section), and save the page, exactly as printed, as `<date>.md` in the same folder, so it is what the person finds when they open the folder. The counter's own output stays in `<date>.counts.md` for whoever wants the full table.

## Say what to do

Close the page with "What to do", at most three lines, chosen by these readings, in this order; a principle that falls in two gets one line. Each line names the principle, the fact, and the next step. You propose, you do not write: the step is a call to `/alecsplus-skills:the-way-new` (or `the-way-global-new` for a global one), which passes the sentence through its criterion and asks its own yes.

- **Against two times or more**: real cases beat the sentence; it fails *Uncontradicted*. Next step: `the-way-new` reads it again with the cases from the against lines.
- **The same tie pair two times or more**: the two overlap at the border, or their order in the list does not say which weighs more. Next step: `the-way-new` on the two, to sharpen one sentence or move one line (the order is importance).
- **Position and use far apart**: a principle first in the file and last in use, or the other way round, says the written importance is not the lived one. Name it; moving a line is one yes with `the-way-new`.
- **Not in a file** (a row with that level): Claude cited a principle that no file has, or gave it the wrong level. Nothing to write: name it in one line as a habit to watch; if the name comes back report after report, it may be a principle waiting for `the-way-new` or `the-way-global-new`.
- **Silent** (in the file, never cited in the period, and the period had turns): either nothing of its kind came up, or it is not read when it should. Name them in one line and ask nothing: whoever leads decides whether to keep, rewrite or wait; a silent principle is removed only by hand.

When nothing falls in any reading, "What to do" is one line: the principles hold, nothing to touch. When the period has no turn with the line at all, say that the habit is not there yet and that the measure starts when it is: check that `THE-WAY-USAGE.md` is the current one with `the-way-setup`.

## What this skill does not do

It does not write principles and does not change one. It does not judge the quality of the work, nor whether a choice was the right one: a choice taken against a principle, said out loud, is the plugin doing its job, not a failure. It only says whether, how often and when the principles took part.
