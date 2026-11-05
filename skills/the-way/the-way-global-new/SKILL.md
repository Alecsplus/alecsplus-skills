---
name: the-way-global-new
description: Write a new principle into ~/.claude/THE-WAY.md, the file where the user keeps the principles that hold in all their projects (a principle is what the person cares about, said in one sentence with a name, that decides many of their choices, not one choice; it is not a rule: a rule says what not to do, a principle says what they want). Checks it against a written criterion, proposes a name and a sentence, and writes only after a yes. Use when the user runs it; and by yourself, in any language, when someone states a rule for all their projects ("in all my projects we never do X", "in every project of mine we always do Y"), which this skill raises to the principle behind it, or when a principle in ~/.claude/THE-WAY.md is about to be added or changed; also when the person answers a proposal for one project with "it is global". Do not use for "in this project" (that is the-way-new) nor for a choice that holds only for the task at hand.
---

# The way: global new

The principles of all the user's projects live in `~/.claude/THE-WAY.md`. This skill writes one principle into it, after it has passed the criterion below. It writes only in `~/.claude/`, and does not look at the `THE-WAY.md` of the project it was launched in. It starts by itself whenever a principle for all the user's projects is about to be added or changed, even if nobody called it; `the-way-global-discover` also calls it for every principle it finds.

## Before anything

1. A rule for all the person's projects, or a choice for the task at hand? If it holds only for the task at hand ("for this file use tables"), say so in one line and stop. If it carries a command, a path or a file name ("always use `fvm flutter`, never bare `flutter`"), it is a rule, not a principle: say so in one line. The rule stays where the person keeps it; this skill does not write rules. Then ask once why the person wants it: if that why would hold for any project in the world (the same result on every machine), stop there; if it is a choice of this person ("run `/grilling` before opening a ticket": first understand, then build), go on with that why as the starting sentence, or name the principle already in `~/.claude/THE-WAY.md` that says it.
2. **Check the global setup.** Run `the-way-global-setup` (call the `Skill` tool with `alecsplus-skills:the-way-global-setup`): it checks that `~/.claude/THE-WAY.md`, `~/.claude/THE-WAY-USAGE.md` and the two import lines in `~/.claude/CLAUDE.md` are in place and written by the current plugin version; if something is missing or out of date, it says which and asks one yes; if all is in order, it says nothing. If it stopped without the yes, stop and say why: the work needs the global principles in place. Then read `~/.claude/THE-WAY.md`. **Ask permission before writing to any file**, every time; a yes to one principle is not a yes to the next.

## Steps

0. If `the-way-global-setup` handed over a principle already written, to read again after a plugin update: pass its line through the criterion. If it passes every point, say nothing and hand back. If a point fails, name it and propose the fixed line, with its own yes, as in step 4; skip steps 1 and 2.
1. Take the sentence as the person leading the project said it (or as `the-way-global-discover` handed it over). It is the starting point, not the principle: the principle enters only with that person's yes to your proposal. Never put in a principle on your own.
2. What the person said is usually a rule: what not to do, or what to do in one case. People are good at giving rules and bad at naming principles; this step raises the level. Find what the person wants that makes that rule follow, then ask once more why they want that: if the answer is a larger thing they really want, that is the principle. Stop when the next why would hold for any project in the world. Write that as the principle; the rule stays as one of its consequences, and so do the cases nobody has met yet (PRINCIPLE_NOT_RULE). A principle that only restates the rule with two words more has not raised the level: "don't log passwords" does not become "passwords, tokens and keys stay out of the logs", it becomes "what a person entrusts to us stays only where it is needed". The same holds when a principle already written is read again: a new sentence that names the mechanism carrying it out (a file, a part of the code, who writes what where) has gone down a level, from the principle to one of its consequences; the principle stays above them. Then write a name and one sentence. Compare only with the principles already in `~/.claude/THE-WAY.md`: if one already says it, say which and stop.
3. Pass it through the criterion. If it fails a point, name it and propose a fixed wording.
4. Propose to the person: the file it writes in (`~/.claude/THE-WAY.md`), the name, the sentence, which list it goes in (see "Result or Work"), and which choices it would decide, starting with the sentence the person said, which must follow from it. If a sentence written in `~/.claude/CLAUDE.md` (handed over by `the-way-global-discover`, or one you know of) says the principle itself, it is a copy once the principle is in `~/.claude/THE-WAY.md`: propose in the same proposal to remove it, quoting it. A rule that only follows from the principle is a copy too: propose removing it in the same yes. A rule that carries a fact the principle does not give (a command, a path, a number) stays. If the sentence already stands, word for word, in the `THE-WAY.md` of a project (handed over by `the-way-global-discover`, or already in front of you, like the one the project's `CLAUDE.md` brings into the session), ask in the same proposal whether to remove that copy from the project or leave it for whoever opens the repo without the global; do not go looking for copies in projects yourself. Wait for the answer; the one yes covers all of it.
5. After the yes, write it (see "Writing it"). A principle that is being changed gets its line rewritten the same way, with the same criterion and the same yes.

## The criterion

Every principle, new or changed, has to pass this. First fix what it is for, then write the sentence; the meaning does not change under objection.

- *Self_explaining*: It has a name of one word, or two joined by `_`, that alone calls back the whole sentence.
- *Short*: It is as short as possible, usually one sentence; a second one enters only if without it the first is misunderstood.
- *General*: It says the general thing from which many choices are born: no cases, examples or history, and it does not repeat another principle.
- *Target*: It says in positive what the project wants to get: not a motto good for everything, not a prohibition. A rule says what not to do and stops there; a principle says what the project wants, so it also decides the case nobody wrote down (PRINCIPLE_NOT_RULE).
- *Who_and_what*: It is clear at once who and what it is about.
- *Exact_words*: Every word means exactly what it says, and is the word the project already uses for that thing.
- *One_reading*: Read by Claude in a fresh session, with nothing of the conversation that wrote it, it has one reading only; a sentence that a person understands from the context is not enough.
- *Uncontradicted*: It is true as written: if a real case contradicts it, fix the sentence before it enters.
- *Has_opposite*: It has an opposite that someone could seriously choose.
- *Meaning_first*: It is born from its meaning: say what it is for, then write the sentence.

A principle may also talk about how the project is worked on, not only about the product.

## Result or Work

Ask two questions of the sentence, each on its own:

1. Is it a quality of the result? Yes: **Result**.
2. Is it how we work to get there? Yes: **Work**.

Ask them of the words of the sentence, not of what you know of the principle. When in doubt, ask who sees it: if whoever uses the finished thing sees it, it is Result; if only whoever builds sees it, it is Work.

You pick the list alone (OBVIOUS) and say it in one line. Yes to both: the principle keeps one name and stands in both lists, with one sentence per list. How the sentences come depends on the sentence you have: if it already says both things whole, it goes under both lists as it is; if it says one thing whole, it goes under that list and you propose a sentence for the other, or leave that side to be written later, saying so; if it says half of one and half of the other, split it in two and complete each half. Propose and ask one yes per sentence written. No to both: it is not a principle. The same name is never in one list twice. The order inside a list is importance: the first weighs more than the last, and no one "wins" over another. Add the new one where it weighs.

## Writing it

One line: `**NAME** — sentence`, NAME in uppercase letters and `_`, without the suffix `_global`: that is added only when the principle is cited. Write it in `~/.claude/THE-WAY.md`, under `## Result` or `## Work`, in the language of the file. If the proposal included a sentence to remove, remove it from its file too: from `~/.claude/CLAUDE.md`, and from the `THE-WAY.md` of a project only if the person said to take the copy away; if they said to leave it, touch nothing there. Nothing else is written outside `~/.claude/`. After writing, say in one line what you added.
