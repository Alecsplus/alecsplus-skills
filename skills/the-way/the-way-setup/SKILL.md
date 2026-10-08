---
name: the-way-setup
description: Set up, or check, a project's principles. Puts THE-WAY.md and THE-WAY-USAGE.md in the repo root and the two import lines at the top of CLAUDE.md. Use when the user wants principles in a project, wants to move an existing principles file to THE-WAY.md, or wants to check that the setup is still right.
---

# The way: setup

Give the project one file of principles, `THE-WAY.md` in the repo root, and one file with the instructions on how to use it, `THE-WAY-USAGE.md`, next to it. The project's `CLAUDE.md` imports both with two lines. Everything lives in the project, so it works for anyone who opens it, with or without this plugin.

The fixed texts to write are at the end of this file, under "Fixed texts". They exist only in English: write them in the language of the project (see step 1).

## Rules for every step

- **Ask before writing.** Say exactly which files you will create or change, then wait for a yes. Always, also on a new project.
- **Never invent principles.** The file you create has no principle in it. Finding them is `the-way-discover`.
- **Say what is wrong.** If something is missing or off, say it in plain words; never skip it silently.
- Do not commit. Do not touch anything but `THE-WAY.md`, `THE-WAY-USAGE.md`, `CLAUDE.md`, and the file you are renaming.
- `THE-WAY-USAGE.md` is always rewritten whole, never edited by hand. `CLAUDE.md` gets no markers: only the two import lines.

## 1. Look

In the repo root of the project you are in:

- Is there a `THE-WAY.md`? A `THE-WAY-USAGE.md`? What does its first line say?
- Is there a file that holds principles in another form or under another name (`PRINCIPI.md`, `PRINCIPLES.md`, a constitution file imported by `CLAUDE.md`)? If unsure which file it is, ask.
- Does `CLAUDE.md` exist? Does it have the lines `@THE-WAY.md` and `@THE-WAY-USAGE.md`? Does it have an old block between `<!-- the-way:start` and `<!-- the-way:end -->` (written by setup 0.1.1)?
- Which language does the project use? Read the existing `CLAUDE.md`, README and docs. The fixed texts are in English: translate them faithfully into the project's language, English included as is.
- Which version is this plugin? It is the `version` in the plugin's `.claude-plugin/plugin.json` (`${CLAUDE_PLUGIN_ROOT}/.claude-plugin/plugin.json`; if the variable is not set, three folders above this skill's folder). Read it; never guess it.

## 2. Pick the case

**A. The project has no principles.** Ask permission to create `THE-WAY.md` (empty: opening line and the primary section, nothing else), to create `THE-WAY-USAGE.md`, and to put the two import lines at the top of `CLAUDE.md` (creating the file if needed). Name the language you will use. After the yes, write all. Then tell the user: the file has no principles yet, and `/alecsplus-skills:the-way-discover` finds the ones the project already follows.

**B. The project has principles in another form or file.** Ask permission to: rename the file to `THE-WAY.md` (`git mv` if it is tracked); bring it to the single form; update every `@old-name` import in `CLAUDE.md` files; create `THE-WAY-USAGE.md` and add its import line. The single form:
- opening: the fixed title and line of the fixed texts below;
- `## Primary` always (fixed line), `## Secondary` only if the project has secondary principles (fixed line);
- each principle on one line: `**NAME** — sentence`, NAME in uppercase letters, with `_` for spaces; no number, no origin sentence or date;
- other free paragraphs may stay.

The words of a principle change only with the yes of whoever leads the project. Removing numbers and origin sentences is allowed; if bringing a principle to the form would change its words, show the change and ask. Then list, without editing them, the other places that still mention the old file name (grep the repo): the user decides.

**C. The setup already exists.** Check, and report each point as ok or not ok:
1. `THE-WAY.md` exists and has the opening, the sections and the one-line form;
2. `CLAUDE.md` has the lines `@THE-WAY.md` and `@THE-WAY-USAGE.md`;
3. `THE-WAY-USAGE.md` exists and its first line carries the version of this plugin. Compare only that number: same version → ok; older version, or no version line → not ok, propose rewriting the whole file with the current text; do not compare the rest of the text;
4. `CLAUDE.md` has no old block between `<!-- the-way:start` and `<!-- the-way:end -->`. If it has one (setup 0.1.1), say so and propose: take the whole block out, from the start marker to the end marker included, put in its place the two import lines (keep `@THE-WAY.md`, which was inside the block), and write `THE-WAY-USAGE.md`.

If all is right, say so in one line ("in order", in the project's language). For whatever is not, say what differs and propose the fix; apply it only after a yes. Do not touch the principles themselves.

## 3. Close

Say in two lines what was written and where. Nothing more.

## Fixed texts

These texts are the only ones the skill writes into a project. They are written here once, in English. Write them in the language of the project: same meaning, same order, same shape (`**NAME** — sentence`, the import lines). Never add or remove a rule when translating. Names of files, commands and the `NAME` of a principle stay as they are.

### THE-WAY.md, empty

```markdown
# Principles

These apply to everything done in this project, including what is not yet named. When a principle guides a choice, cite it by name.

## Primary

They are the point of the work. In a conflict they win.
```

### Secondary section

Added by `the-way-discover` only when a secondary principle exists, after the last primary.

```markdown
## Secondary

They give substance to the primary ones: read them in their light; they do not contradict them.
```

### Lines for CLAUDE.md

At the top of the project's `CLAUDE.md`, before any other content. Nothing else in the file is touched. If `CLAUDE.md` does not exist, the file is created with only these two lines. A line already there is not written twice.

```markdown
@THE-WAY.md
@THE-WAY-USAGE.md
```

### THE-WAY-USAGE.md

The whole file, always rewritten whole. The first line carries the plugin version (`<version>`, read in step 1) and is translated like the rest.

```markdown
*Written by `/alecsplus-skills:the-way-setup` <version>: rerun it to update.*

## Principles

The project's principles are in THE-WAY.md, imported in CLAUDE.md. They apply to everything done in this project, including how we work.

How to use them:
- Before asking the person leading the project to choose, compare the choice with the principles. If one decides, do not ask: write "I do A (NAME)" and go on. Never ask what the principles already answer.
- Try first: if you already know what the person would answer, a principle has decided. The answer that looks too obvious is the answer.
- Ask only when no principle decides or two pull in opposite directions. Then the question carries its comparison right under it, starting with the words "the principles do not decide:" and saying which two principles pull in opposite directions (X toward B, Y toward A).
- The same holds for a "to decide" coming back from a subagent's report: compare first, then ask only if needed.
- End every task you give to a subagent with this line: "In the report, next to each choice, write the project principle that decided it." Do not copy any principle into the task.
- A new or changed principle goes through the criterion of the `the-way-discover` skill and the yes of whoever leads the project.
```
