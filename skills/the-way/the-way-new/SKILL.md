---
name: the-way-new
description: Write a new principle into THE-WAY.md, the file where a project keeps its standing rules (a principle is a rule that decides many choices of the project, not one choice). Checks the rule against a written criterion, proposes a name and a sentence, and writes only after a yes. Use when the user runs it; and by yourself, in any language, when someone states a rule that holds for the whole project ("from now on we always do X here", "in this project we never do Y", "this is a rule"), or when a principle in THE-WAY.md is about to be added or changed. Do not use for a choice that holds only for the task at hand.
---

# The way: new

Principles live in `THE-WAY.md` in the repo root. This skill writes one principle into it, after it has passed the criterion below. It starts by itself whenever a principle is about to be added or changed, even if nobody called it; `the-way-discover` also calls it for every principle it finds.

## Before anything

1. A rule for the whole project, or a choice for the task at hand? If it holds only for the task at hand ("for this file use tables"), say so in one line and stop.
2. Read `THE-WAY.md`. If it does not exist, say so, explain that the project has no principles yet, and ask one yes to run `the-way-setup`; after the yes, run it and then go on with the principle. **Ask permission before writing to any file**, every time; a yes to one principle is not a yes to the next.

## Steps

1. Take the rule as the person leading the project said it (or as `the-way-discover` handed it over). Words come from that person or from their yes to your proposal. Never put in a principle on your own.
2. Fix what the rule is for, then write a name and one sentence. Compare with the principles already there: if one already says it, say which and stop.
3. Pass it through the criterion. If it fails a rule, say which one and propose a fixed wording.
4. Propose to the leader: the name, the sentence, whether it is primary or secondary, and which choices it would decide. If `the-way-discover` also asked to remove it from another file, say so in the same proposal. Wait for the answer; the one yes covers all of it.
5. After the yes, write it (see "Writing it"). A principle that is being changed gets its line rewritten the same way, with the same criterion and the same yes.

## The criterion

Every principle, new or changed, has to pass this. First fix what it is for, then write the sentence; the meaning does not change under objection.

1. It has a name of one word, or two joined by `_`, that alone calls back the whole sentence.
2. It is as short as possible, usually one sentence; a second one enters only if without it the first is misunderstood.
3. It says the general thing from which many rules are born: no cases, examples or history, and it does not repeat another principle.
4. It says in positive what the project wants to get: not a motto good for everything, not a prohibition.
5. It is clear at once who and what it is about.
6. Every word means exactly what it says, and is the word the project already uses for that thing.
7. It is true as written: if a real case contradicts it, fix the sentence before it enters.
8. It has an opposite that someone could seriously choose.
9. It is born from its meaning: say what it is for, then write the sentence.
10. It enters only with the words of whoever leads the project, or with their yes.
11. If it is secondary, it gives substance to a primary that you can name.

A principle may also talk about how the project is worked on, not only about the product.

## Writing it

One line: `**NAME** — sentence`, NAME in uppercase letters and `_`. Under `## Primary`, or under `## Secondary` (create the section, with its fixed line, if it is not there: "## Secondary" then "They give substance to the primary ones: read them in their light; they do not contradict them.", translated faithfully into the project's language) when rule 11 holds. Write in the language of the file. If the principle was moved from another file, remove it from there too. After writing, say in one line what you added.
