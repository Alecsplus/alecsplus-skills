---
name: the-way-global-setup
description: Set up, or check, the principles that hold in all the user's projects. Puts THE-WAY.md and THE-WAY-USAGE.md in ~/.claude/ and the two import lines at the top of ~/.claude/CLAUDE.md. Use when the user wants principles that hold in every project, or wants to check that the global setup is still right.
---

# The way: global setup

Give every project of the user one file of principles, `THE-WAY.md` in `~/.claude/`, and one file with the instructions on how to use it, `THE-WAY-USAGE.md`, next to it. The user's `~/.claude/CLAUDE.md` imports both with two lines. Everything lives in `~/.claude/`, so it works in any session, with or without this plugin.

The fixed texts to write are at the end of this file, under "Fixed texts". They exist only in English: write them in the language of the user (see step 1).

## For every step

- **Ask before writing.** Say exactly which files you will create or change, then wait for a yes. Always, also when nothing exists yet. When another `the-way-` skill called you, do the same: it did not ask anything, it leaves the check and the yes to you. If everything is in order, say nothing and hand back.
- **Never invent principles.** The file you create has no principle in it. Finding them is `the-way-global-discover`.
- **Say what is wrong.** If something is missing or off, say it in plain words; never skip it silently. If Claude Code refuses a write in `~/.claude/` (for example in `dontAsk` mode), say which file was not written and stop.
- Do not commit. Do not touch anything but `~/.claude/THE-WAY.md`, `~/.claude/THE-WAY-USAGE.md` and `~/.claude/CLAUDE.md`. Do not look at the `THE-WAY.md` of the project you were launched in, and do not check it: it is not yours.
- `THE-WAY-USAGE.md` is always rewritten whole, never edited by hand. `CLAUDE.md` gets no markers: only the two import lines.

## 1. Look

In `~/.claude/` (the home has no variable: write `~`):

- Is there a `THE-WAY.md`? A `THE-WAY-USAGE.md`? What does its first line say?
- Does `~/.claude/CLAUDE.md` exist? Does it have the lines `@THE-WAY.md` and `@THE-WAY-USAGE.md`?
- Which language does the user use? Read `~/.claude/CLAUDE.md`. If it does not exist, use English. The fixed texts are in English: translate them faithfully into the user's language, English included as is.
- The version of this plugin is **1.3.1**. It is written here because reading the plugin's own files can be refused; it must always equal `version` in `.claude-plugin/plugin.json`, so both change together at every release.

## 2. Pick the case

**A. There are no global principles.** Ask permission to create `~/.claude/THE-WAY.md` (empty: opening line and the two sections, Result and Work, with their fixed lines and nothing under them), to create `~/.claude/THE-WAY-USAGE.md`, and to put the two import lines at the top of `~/.claude/CLAUDE.md` (creating the file if needed). Name the language you will use. After the yes, write all.

**C. The setup already exists.** Check, and report each point as ok or not ok:
1. `~/.claude/THE-WAY.md` exists and has the opening, the sections and the one-line form;
2. `~/.claude/CLAUDE.md` has the lines `@THE-WAY.md` and `@THE-WAY-USAGE.md`;
3. `~/.claude/THE-WAY-USAGE.md` exists and its first line carries the version of this plugin. Compare only that number: same version → ok; older version, or no version line → not ok, propose rewriting the whole file with the current text; do not compare the rest of the text. After that rewrite, the plugin has changed since the principles were written. Then pass every principle of `~/.claude/THE-WAY.md` to `the-way-global-new` (call the `Skill` tool with `alecsplus-skills:the-way-global-new`), one at a time, in the order of the file, to read it again against its criterion. A principle that passes is not mentioned; for one that fails a point, `the-way-global-new` proposes the fixed line and asks its yes. This happens by itself, no yes asked for it, also when another `the-way-` skill called you: it comes before the work that skill was asked.

If all is right, say so in one line ("in order", in the user's language); if another `the-way-` skill called you, say nothing and hand back. For whatever is not, say what differs and propose the fix; apply it only after a yes. Do not touch the principles themselves.

## 3. Close

Say in two lines what was written and where. Then, in every case, if `~/.claude/THE-WAY.md` has no principle yet, add one line suggesting the next step. If `~/.claude/CLAUDE.md` already has some substance (more than the import lines), suggest first `/alecsplus-skills:the-way-global-discover`, which finds the principles the user already follows, and as the alternative `/alecsplus-skills:the-way-global-new`, which writes one. If it has only the import lines or did not exist, suggest them the other way round: `the-way-global-new` first, `the-way-global-discover` as the alternative. Nothing more.

## Fixed texts

These texts are the only ones the skill writes into `~/.claude/`. They are written here once, in English. Write them in the language of the user: same meaning, same order, same shape (`**NAME** — sentence`, the import lines). Never add or remove a line when translating. Names of files, commands and the `NAME` of a principle stay as they are; the suffix `_global` is translated with the rest of the text (`LEGGIBILE_globale` in Italian).

### THE-WAY.md, empty

```markdown
# Principles

These apply to everything done in every project, including what is not yet named. When a principle guides a choice, cite it by name.

## Result

The principles in this list say the qualities the result will have. A Mandalorian who orders an armour asks for this: that it stops a blaster shot and weighs little. That is why they want it in beskar.

## Work

The principles in this list say how we work to get there. The Armorer works one piece at a time, and nothing leaves the forge that she has not hammered herself: it holds for a helmet and it holds for a ring. This is the forge.
```

### Lines for CLAUDE.md

At the top of `~/.claude/CLAUDE.md`, before any other content. Nothing else in the file is touched. If `~/.claude/CLAUDE.md` does not exist, the file is created with only these two lines. A line already there is not written twice.

```markdown
@THE-WAY.md
@THE-WAY-USAGE.md
```

### THE-WAY-USAGE.md

The whole file, always rewritten whole. The first line carries the plugin version (`<version>`, the version given in step 1) and is translated like the rest.

```markdown
*Written by `/alecsplus-skills:the-way-global-setup` <version>: rerun it to update.*

## Principles

These principles are in `~/.claude/THE-WAY.md`, imported in `~/.claude/CLAUDE.md`. They apply to everything done in every project, including how we work. A project with its own THE-WAY.md wins over them: a name written in both files is read only from the project's file.

How to use them:
- Before asking the person leading the project to choose, compare the choice with the principles. If one decides, do not ask: write "I do A (NAME)" and go on; a principle of this file is cited `NAME_global`. Never ask what the principles already answer.
- Try first: if you already know what the person would answer, a principle has decided. The answer that looks too obvious is the answer.
- Ask only when no principle decides or two pull in opposite directions. Then the question carries its comparison right under it, starting with the words "the principles do not decide:" and saying which two principles pull in opposite directions (X toward B, Y toward A).
- Never go against a principle in silence: if a choice goes against one, say which one and why before doing it.
- The same holds for a "to decide" coming back from a subagent's report: compare first, then ask only if needed.
- End every task you give to a subagent with this line: "In the report, next to each choice, write the principle that decided it." Do not copy any principle into the task.
- A rule said for all projects is a principle waiting to be named: find what the person wants behind it and propose that, not the rule. A new or changed global principle goes through the criterion of the `the-way-global-new` skill and the yes of the person.
- Grilling in every project goes through `/alecsplus-skills:the-way-grilling`: when a skill, a ticket or a map says "grilling", call that one.
```
