---
name: the-way-grilling
description: Grilling with the project's principles. Runs `mattpocock-skills:grilling` and changes only the form of the questions and how each answer hooks the principles in THE-WAY.md. Use when the user runs it, when a skill, a ticket or a map says "grilling" in a project that has THE-WAY.md, or anywhere when ~/.claude/THE-WAY.md exists, or when the user wants a plan, decision or idea stress-tested with the principles.
---

# The way: grilling

The questions are written for a human who reads fast, not for an AI.

## Steps

1. **Check the setup.** If the project has no `THE-WAY.md` and `~/.claude/THE-WAY.md` exists, skip the setup, with no question and no line saying so, and read the global file. Otherwise run `the-way-setup` (call the `Skill` tool with `alecsplus-skills:the-way-setup`): it checks that `THE-WAY.md`, `THE-WAY-USAGE.md` and the two import lines in `CLAUDE.md` are in place and written by the current plugin version; if something is missing or out of date, it says which and asks one yes; if all is in order, it says nothing. If it stopped without the yes, stop and say why: the work needs the project's principles in place. Then read `THE-WAY.md`, and `~/.claude/THE-WAY.md` too if it exists; if it is missing, there is nothing to say. If the same name is in both files, only the project's line counts: do not read the global one.
2. **Check Pocock's grilling.** Call the `Skill` tool with `mattpocock-skills:grilling`. If it is not installed, say so and stop, giving the two commands `claude plugin marketplace add mattpocock/mattpocock-skills` and `claude plugin install mattpocock-skills@mattpocock-skills`. This skill does not do the grilling on its own: "grilling" is Pocock's word, and whoever asks for it has his skill. Then follow his process as it is: decision tree, frontier, rounds, facts found by Claude, decisions by the person leading the project. Only two things change: the form of every question, and how the principles enter, as below.
3. **Before the first round**, compare the topic itself with the principles, both lists. If a principle says this topic is not one to decide here, the first message says so, names the principle and proposes not to discuss it; no question is written. Otherwise the round starts.
4. **Before writing a round**, compare every question on the frontier with the principles, both lists, twice. First the question itself: if a principle says it is not one to ask here, it is left out, and one line under the round says which question was left out and which principle left it out, so the leader can bring it back. Then its answers. Nothing is closed by a principle on its own, except a case that is really obvious: that one is written as a question with its answer already in it and the principle that gives it (the leader can still say no), and the work goes on. What the leader sees or does is never obvious: it is always a real question.

## The form of a question

Fixed. The example is invented.

```
❓ *Q2 – Error message when saving fails: how much does the user read?*

A) One plain line, the details go to the log.
   *USER_FIRST strong, NOTHING_LEAKS medium.*

**B) One plain line and a "Show details" button.**
   ➡️ *USER_FIRST strong, WITHIN_REACH medium.*

C) The full technical message, as it comes.
   *No principle wants it; it goes against USER_FIRST.*
```

- ❓ opens the question, in italics.
- The answers stand one under the other, plain.
- Under each answer, in italics, the principles that pull toward it, each with its weight on three steps (strong, medium, weak): a judgement written next to the answer.
- The recommended answer is in bold, with ➡️ before its principles. The recommendation comes from the weights, not from taste.
- A global principle is written `NAME_global` (underscore, the level in lowercase and in the language you write in: `LEGGIBILE_globale` in an Italian question): "*NAME_global strong*". Project principles stay bare. The level does not weigh: a project principle and a global one pulling opposite ways are weighed by their weights, as two project principles are.
- If two answers weigh the same: no bold, no arrow, and under the question the line "the principles do not decide between A and B".

An answer enters the list only if someone could really choose it, never to make up a number. A principle is written under an answer only if it really pulls toward it, never to dress a preference.

## Rules of a question

- It stands on its own, with the scene inside it: no reference to earlier rounds.
- Subject first, straight sentence; if it must be read twice, it is rewritten.
- One line, one case per question, never two scenes in one.
- No explanation under the question; at most one example of one line after it.
- An edge case is told as a scene seen by the leader: what they do, what they see.
- A text already approved that the question proposes to change is shown as it is, next to the new one.
- At the first "I don't understand" the question is rewritten shorter, never longer.
- Before sending a round, reread every question alone: if the subject or the thing decided is missing, rewrite it.

This skill writes no file itself. The answers are the leader's.
