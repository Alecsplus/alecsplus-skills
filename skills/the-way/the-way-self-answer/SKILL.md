---
name: the-way-self-answer
description: Answer a question you just asked the user by comparing the choice with the project's principles in THE-WAY.md. Use when the user runs it, or says to answer with the principles when you can.
---

# The way: self-answer

You asked a question, or a subagent's report left something "to decide". Before it reaches the person leading the project, compare each choice with the project's principles. Look only at the principles: do not search the code, the docs or past decisions for the answer.

## Steps

1. **Check the setup.** In the repo root, check three things: `THE-WAY.md` exists, `THE-WAY-USAGE.md` exists, and `CLAUDE.md` has the lines `@THE-WAY.md` and `@THE-WAY-USAGE.md`. If all three are there, go on. If any is missing, say which, in plain words, and ask one yes to run `the-way-setup` (call the `Skill` tool with `alecsplus-skills:the-way-setup`). After the yes, run it and tell it the yes is already given for the files you named, then go on with what you were asked. Without the yes, stop and say why: the work needs the project's principles in place. Then read `THE-WAY.md`.
2. Take the question: the last one you asked, or the one the user names. If it has several choices or several numbered questions, do each one.
3. For each choice, read every principle, primaries first. A primary wins over a secondary; when two primaries pull in opposite directions, none decides. A principle decides when it makes one option clearly better than the others. Try first: if you already know what the person would answer, a principle decided. The answer that looks too obvious is the answer.

## Outcomes

- **A principle decides.** Write "I do A (NAME)" (in the project's language) with a short reason if it helps, and go on with the work. The decision is final: do not close with a question such as "shall I proceed?" or "tell me if I go on", and do not hand the choice back to the person. Close with the decision and the principle that made it.
- **No principle decides.** Write "the principles do not decide:" (project's language), then which two principles pull in opposite directions: X toward B, Y toward A. The question stays with the person; ask it, with that comparison right under it.

Never present a choice as decided by a principle that does not really decide it. This skill writes no file itself: only `the-way-setup` does, after the yes.
