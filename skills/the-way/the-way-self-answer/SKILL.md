---
name: the-way-self-answer
description: Answer a question you just asked the user by comparing the choice with the project's principles in THE-WAY.md. Use when the user runs it, or says to answer with the principles when you can.
---

# The way: self-answer

You asked a question, or a subagent's report left something "to decide". Before it reaches the person leading the project, compare each choice with the project's principles. Look only at the principles: do not search the code, the docs or past decisions for the answer.

## Steps

1. Read `THE-WAY.md` in the repo root. If it does not exist, say so, explain that the project has no principles yet, ask permission to run `the-way-setup`, and continue after it. If `CLAUDE.md` does not import `@THE-WAY.md`, say so in one line and suggest `the-way-setup`.
2. Take the question: the last one you asked, or the one the user names. If it has several choices or several numbered questions, do each one.
3. For each choice, read every principle, primaries first. A primary wins over a secondary; when two primaries pull in opposite directions, none decides. A principle decides when it makes one option clearly better than the others. Try first: if you already know what the person would answer, a principle decided. The answer that looks too obvious is the answer.

## Outcomes

- **A principle decides.** Write "I do A (NAME)" (in the project's language, e.g. "faccio A (NAME)") with a short reason if it helps, and go on with the work. Do not ask again.
- **No principle decides.** Write "the principles do not decide:" (project's language), then which two principles pull in opposite directions: X toward B, Y toward A. The question stays with the person; ask it, with that comparison right under it.

Never present a choice as decided by a principle that does not really decide it. This skill writes no file, so it needs no permission to write.
