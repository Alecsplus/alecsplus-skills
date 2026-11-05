---
name: the-way-self-answer
description: Answer a question you just asked the user by comparing the choice with the project's principles in THE-WAY.md. Use when the user runs it, or says to answer with the principles when you can.
---

# The way: self-answer

You asked a question, or a subagent's report left something "to decide". Before it reaches the person leading the project, compare each choice with the project's principles. Look only at the principles: do not search the code, the docs or past decisions for the answer.

## Steps

1. **Check the setup.** If the project has no `THE-WAY.md` and `~/.claude/THE-WAY.md` exists, skip the setup, with no question and no line saying so, and read the global file. Otherwise run `the-way-setup` (call the `Skill` tool with `alecsplus-skills:the-way-setup`): it checks that `THE-WAY.md`, `THE-WAY-USAGE.md` and the two import lines in `CLAUDE.md` are in place and written by the current plugin version; if something is missing or out of date, it says which and asks one yes; if all is in order, it says nothing. If it stopped without the yes, stop and say why: the work needs the project's principles in place. Then read `THE-WAY.md`, and `~/.claude/THE-WAY.md` too if it exists; if it is missing, there is nothing to say.
2. Take the question: the last one you asked, or the one the user names. If it has several choices or several numbered questions, do each one.
3. For each choice, read every principle of both files, both lists, in the order of each file (the order is importance, not precedence). If the same name is in both files, only the project's line counts: do not read the global one. A principle decides when it makes one option clearly better than the others. Try first: if you already know what the person would answer, a principle decided. The answer that looks too obvious is the answer.

## Outcomes

- **A principle decides.** Write "I do A (NAME)" (in the project's language), with a global principle written `NAME_global` (underscore, the level in lowercase and in the language you write in: `LEGGIBILE_globale` in an Italian answer); project principles stay bare. Add a short reason if it helps, and go on with the work. The decision is final: do not close with a question such as "shall I proceed?" or "tell me if I go on", and do not hand the choice back to the person. Close with the decision and the principle that made it.
- **No principle decides.** Write "the principles do not decide:" (project's language), then which two principles pull in opposite directions: X toward B, Y toward A (a global one as `Y_global`). The question stays with the person; ask it, with that comparison right under it. If one of the two is global and the choice outlasts the case at hand (judge it with the first step of `the-way-new`: a choice of the whole project, not of the work in hand), add "if you choose, I can write the choice in the project's THE-WAY.md, so next time I do not ask" (project's language). On the yes, run `the-way-new` (call the `Skill` tool with `alecsplus-skills:the-way-new`), also in a repo without `THE-WAY.md`: its setup creates the file with its own yes.

Result and Work do not clash: one says a quality of the result, the other how we work, they answer two different questions and cannot contradict each other.

Never present a choice as decided by a principle that does not really decide it. This skill writes no file itself: only `the-way-setup` does, after the yes.
