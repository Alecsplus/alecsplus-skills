---
name: the-way-setup
description: Set up, or check, a project's principles. Puts THE-WAY.md in the repo root and the instructions for comparing choices against it at the top of CLAUDE.md. Use when the user wants principles in a project, wants to move an existing principles file to THE-WAY.md, or wants to check that the setup is still right.
---

# The way: setup

Give the project one file of principles, `THE-WAY.md` in the repo root, and make the project's `CLAUDE.md` carry it and the instructions on how to use it. Everything lives in the project, so it works for anyone who opens it, with or without this plugin.

The fixed texts to write are in [TEXTS.md](TEXTS.md). Read it before writing anything.

## Rules for every step

- **Ask before writing.** Say exactly which files you will create or change, then wait for a yes. Always, also on a new project.
- **Never invent principles.** The file you create has no principle in it. Finding them is `the-way-discover`.
- **Say what is wrong.** If something is missing or off, say it in plain words; never skip it silently.
- Do not commit. Do not touch anything but `THE-WAY.md`, `CLAUDE.md`, and the file you are renaming.

## 1. Look

In the repo root of the project you are in:

- Is there a `THE-WAY.md`?
- Is there a file that holds principles in another form or under another name (`PRINCIPI.md`, `PRINCIPLES.md`, a constitution file imported by `CLAUDE.md`)? If unsure which file it is, ask.
- Does `CLAUDE.md` exist? Does it have the block between `<!-- the-way:start` and `<!-- the-way:end -->`? Does it import `@THE-WAY.md`?
- Which language does the project use? Read the existing `CLAUDE.md`, README and docs. Italian and English texts are fixed in TEXTS.md; for another language, translate them faithfully.

## 2. Pick the case

**A. The project has no principles.** Ask permission to create `THE-WAY.md` (empty: opening line and the primary section, nothing else) and to put the block at the top of `CLAUDE.md` (creating the file if needed). Name the language you will use. After the yes, write both. Then tell the user: the file has no principles yet, and `/alecsplus-skills:the-way-discover` finds the ones the project already follows.

**B. The project has principles in another form or file.** Ask permission to: rename the file to `THE-WAY.md` (`git mv` if it is tracked); bring it to the single form; update every `@old-name` import in `CLAUDE.md` files; add the block. The single form:
- opening: the fixed title and line of TEXTS.md;
- `## Primary` always (fixed line), `## Secondary` only if the project has secondary principles (fixed line);
- each principle on one line: `**NAME** — sentence`, NAME in uppercase letters, with `_` for spaces; no number, no origin sentence or date;
- other free paragraphs may stay.

The words of a principle change only with the yes of whoever leads the project. Removing numbers and origin sentences is allowed; if bringing a principle to the form would change its words, show the change and ask. Then list, without editing them, the other places that still mention the old file name (grep the repo): the user decides.

**C. The setup already exists.** Check, and report each point as ok or not ok:
1. `THE-WAY.md` exists and has the opening, the sections and the one-line form;
2. `CLAUDE.md` imports `@THE-WAY.md`;
3. the block in `CLAUDE.md` is the same as the current text in TEXTS.md (compare in the project's language).

If all is right, say so in one line. For whatever is not, say what differs and propose the fix; apply it only after a yes. Do not touch the principles themselves.

## 3. Close

Say in two lines what was written and where. Nothing more.
