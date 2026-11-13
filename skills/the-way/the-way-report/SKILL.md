---
name: the-way-report
description: Measure how much the principles help, from the sessions themselves. Reads the Claude Code transcripts of this project (and of all your projects for the global level), counts for every principle in THE-WAY.md and ~/.claude/THE-WAY.md how many choices it decided, how often it tied with another, how often a choice went against it and how often you pushed back after it was cited, and says which principles are silent and which deserve a rewrite. Writes nothing; every change it proposes goes through the-way-new or the-way-global-new. Use when the user wants to know whether the principles work, which ones are dead, how much the way helps, or asks for a report, a review or a check-up of the principles, periodically or once.
---

# The way: report

The plugin asks for one thing at every turn: the line "Principles: NAME → why" at the top of the message. That line is also the measure. This skill counts it, in the transcripts Claude Code keeps on disk, and tells whoever leads the project which principles decide, which never do, which lose, and which are misread. It reads; it never writes a principle.

## Before anything

1. Find the two files of principles. The project's: `THE-WAY.md` in the repo root, or the file that `CLAUDE.md` imports with an `@…/THE-WAY.md` line (in this plugin's own repo it is `skills/the-way/THE-WAY.md`). The global one: `~/.claude/THE-WAY.md`. Either may be missing; with both missing, say so in one line and stop: there is nothing to measure.
2. Read the project's `THE-WAY-USAGE.md` (or the global one if the project has none) and take the words it fixes for a question the principles do not close, the ones in quotes after "starting with the words": in English "the principles do not decide", in Italian "i principi non decidono". The counter needs them.
3. The period is the last 30 days unless the person gave a number of days or "all". Counts are shown next to the same count in the period before, so the trend is visible without any file of history (SIMPLE).

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
- a **pair to read**: every decision line with the first 200 characters of what the person wrote next, for step "Read" below. The counter prints them last, under a heading that says they are not for the report.

The counter prints Markdown: two parts, "This project" (from this project's transcripts: project principles and the global ones cited here) and "All your projects" (from every folder: global principles only, with the projects that cited them), each with the turns, the choices closed by a principle against the ones that came to the person, a table with one principle per line (decided, ties, against, last date; each count with the previous period in parentheses), the principles of the file never cited in the period, the tie pairs and the against counts. A part with no file is left out. Nothing of this is estimated by you: print the counter's output as it is, up to the heading of the pairs.

## Read

Then do the one thing the counter cannot: read the pairs and judge. For each decision line, did the person's next message push back on that very choice (a "no", a correction, "not like that", the same question asked again)? Count those per principle and print one line, "Pushed back after citing: NAME n, NAME n", or "Pushed back after citing: none". A push-back on the work, not on the choice the line names, does not count. Say in one line that this count is your reading of the messages, not a measure.

## Say what to do

Close with "What to do", at most three lines, chosen by these readings, in this order of weight; a principle that falls in two gets one line. Each line names the principle, the fact, and the next step. You propose, you do not write: the step is a call to `/alecsplus-skills:the-way-new` (or `the-way-global-new` for a global one), which passes the sentence through its criterion and asks its own yes.

- **Against two times or more**: real cases beat the sentence; it fails *Uncontradicted*. Next step: `the-way-new` reads it again with the cases from the against lines.
- **Pushed back two times or more**: it is read one way by Claude and another by the person; it fails *One_reading*. Next step: `the-way-new` reads it again with the two readings.
- **The same tie pair two times or more**: the two overlap at the border, or their order in the list does not say which weighs more. Next step: `the-way-new` on the two, to sharpen one sentence or move one line (the order is importance).
- **Not in a file** (a row with that level): Claude cited a principle that no file has, or gave it the wrong level. Nothing to write: name it in one line as a habit to watch; if the name comes back run after run, it may be a principle waiting for `the-way-new` or `the-way-global-new`.
- **Silent** (in the file, never cited in the period, and the period had turns): either nothing of its kind came up, or it is not read when it should. Name them in one line and ask nothing: whoever leads decides whether to keep, rewrite or wait; a silent principle is removed only by hand.

When nothing falls in any reading, "What to do" is one line: the principles hold, nothing to touch. When the period has no turn with the line at all, say that the habit is not there yet and that the measure starts when it is: check that `THE-WAY-USAGE.md` is the current one with `the-way-setup`.

## What this skill does not do

It does not write files, does not change a principle, does not keep a history file: every run reads the transcripts again, and the period before is the comparison. It does not judge the quality of the work, only whether the principles took part in it.
