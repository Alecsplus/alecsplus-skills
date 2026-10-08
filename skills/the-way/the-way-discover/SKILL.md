---
name: the-way-discover
description: Find the principles a project follows without having written them (a principle is a rule that decides many choices of the project), and hand each one to the-way-new, which writes it into THE-WAY.md with the yes of whoever leads the project. Use when the user wants to find the project's unwritten principles.
---

# The way: discover

Principles live in `THE-WAY.md` in the repo root. This skill finds the ones that are missing and hands each to `the-way-new`, which holds the criterion and writes it.

## Before anything

**Check the setup.** In the repo root, check three things: `THE-WAY.md` exists, `THE-WAY-USAGE.md` exists, and `CLAUDE.md` has the lines `@THE-WAY.md` and `@THE-WAY-USAGE.md`. If all three are there, go on. If any is missing, say which, in plain words, and ask one yes to run `the-way-setup` (call the `Skill` tool with `alecsplus-skills:the-way-setup`). After the yes, run it and tell it the yes is already given for the files you named, then go on with what you were asked. Without the yes, stop and say why: the work needs the project's principles in place. Then read `THE-WAY.md`. **Ask permission before writing to any file**, every time; a yes to one principle is not a yes to the next.

## Finding principles

Look for principles the project follows without having written them, in: the conversation, `CLAUDE.md`, the docs, the recorded decisions, the README. A principle is a thing that decides many choices, not one choice.

- If a principle is already written in another file, it is a candidate to move into `THE-WAY.md` (removal from the old place only after a yes).
- Take **one principle at a time**. Call the `Skill` tool with `alecsplus-skills:the-way-new` and hand it the candidate: the name, the sentence, where you found it, which choices it would decide, and the old file if it is to be moved. `the-way-new` checks it, proposes it and asks the yes of whoever leads the project; you ask nothing yourself. Do not hand over the next before the answer.
- Words come from the person leading the project or from their yes to the proposal. Never put in a principle on your own.
