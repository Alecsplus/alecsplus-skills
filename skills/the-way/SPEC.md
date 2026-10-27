# Specification

This is the specification of the plugin: the decisions already taken. You do not need it to use the skills.

## 1. What `the way` is

The principles of a project live in one file, `THE-WAY.md`, in the root of the repository. The file has the same name and the same form in every project (GENERIC).

- "The way" names the whole set of principles. A single one is called "principle", in the language of the project (for example "principio" in an Italian project).
- A principle is not a rule, and the documents never call it one: a rule says what not to do and stops there; a principle says what the project wants, so whoever meets a case nobody wrote down can decide it alone (PRINCIPLE_NOT_RULE).
- The principles are those of the project the session runs in. Inside this plugin's repository they guide the plugin; inside another project they guide only that project.
- The plugin applies to itself: its own file is `skills/the-way/THE-WAY.md`. It sits inside the skill folder so it does not guide the other skills that will join the collection; `THE-WAY-USAGE.md` sits next to it, and `CLAUDE.md` imports both from there.

The form of the file is fixed (GENERIC, SIMPLE):

- A one-line opening after the title: "These apply to everything done in this project, including what is not yet named. When a principle guides a choice, cite it by name."
- `## Result`, always present. Fixed line: "The principles in this list say the qualities the result will have. A Mandalorian who orders an armour asks for this: that it stops a blaster shot and weighs little. That is why they want it in beskar."
- `## Work`, always present, even with nothing under it: an empty list says the project has not written how it works yet. Fixed line: "The principles in this list say how we work to get there. The Armorer works one piece at a time, and nothing leaves the forge that she has not hammered herself: it holds for a helmet and it holds for a ring. This is the forge."
- Two questions, asked of each sentence on its own. Is it a quality of the result? Yes: Result. Is it how we work to get there? Yes: Work. Yes to both: the principle keeps one name and stands in both lists, one sentence per list. What to do with the sentence at hand depends on it: whole for both, it goes under both as it is; whole for one, it goes there and the other side gets a proposed sentence or stays to be written later; half and half, it is split in two and each half completed. No to both: it is not a principle. The same name is never in one list twice. Ask them of the words of the sentence, not of what you know of the principle. When in doubt, ask who sees it: if whoever uses the finished thing sees it, it is Result; if only whoever builds sees it, it is Work.
- The order inside a list is importance: the first weighs more than the last. There is no rule "the one above wins".
- Result and Work do not clash by construction: one says a quality of the result, the other how we work, so they answer two different questions and cannot contradict each other.
- One principle per line: `**NAME** — sentence`. NAME is uppercase letters, with `_` instead of spaces.
- No numbers and no date of origin: the trace of the "yes" stays in git history (SIMPLE).
- Free paragraphs are allowed. Only lines that start with `**NAME**` are principles.
- No candidates: a principle is either in the file or not.

The principles of this repository are in [`THE-WAY.md`](./THE-WAY.md), and only there (ONE_PLACE).

## 2. Nothing runs by itself

There are no hooks and no stop check, neither in the plugin nor in the project (SIMPLE). The plugin is only skills.

The project carries everything (NO_PLUGIN_NEEDED):

- The project's `CLAUDE.md` pulls in the file with `@THE-WAY.md` and the instructions for comparing choices to principles with `@THE-WAY-USAGE.md`. Someone who opens the project without the plugin reads and applies the principles all the same.
- Subagents receive both, because they read the project's `CLAUDE.md`. Nothing is copied into the task given to them (NO_PLUGIN_NEEDED, SIMPLE).
- `Explore` and `Plan` do not read `CLAUDE.md`. This is accepted; Claude compares with the principles the choices that come back from them.
- When the instructions change, rerunning `the-way-setup` updates the project; the other three skills run it first, so the update is offered the next time any of them starts. After an update, the principles already written are read again against the criterion, one at a time, and only the ones that fail a point get a proposed change, each with its yes.

## 3. The four skills

Commands: `/alecsplus-skills:the-way-setup`, `/alecsplus-skills:the-way-self-answer`, `/alecsplus-skills:the-way-discover`, `/alecsplus-skills:the-way-new`.

They are four separate skills, not one skill with arguments, because a skill with arguments does not offer its gestures when you type its name.

Every skill asks permission before it writes a file, always, even `setup` on a new project. You can begin with any `the-way-` skill (ANY_DOOR). `the-way-self-answer`, `the-way-discover` and `the-way-new` first run `the-way-setup`, which checks that `THE-WAY.md`, `THE-WAY-USAGE.md` and the two import lines in `CLAUDE.md` are in place and written by the current plugin version. If all is in order, setup says nothing; if something is missing or out of date, it says which, asks for one yes and fixes it, then the skill does what was asked; without the yes the skill stops and says why (VISIBLE). The check and the version number live only in `the-way-setup` (ONE_PLACE).

There is no "verify" gesture: it would have no purpose of its own (SIMPLE).

### the-way-setup

- On a project with no principles: creates an empty `THE-WAY.md` (title, opening line, `## Result` and `## Work` with their fixed lines) and `THE-WAY-USAGE.md`, and puts the two import lines at the top of `CLAUDE.md` (see section 4). It does not invent principles; `the-way-discover` finds them.
- On a project with principles in another form: asks permission, renames the file to `THE-WAY.md`, brings it to the single form (no numbers, no dates of origin) and updates the `@` import, then adds `THE-WAY-USAGE.md` and its import. The words of a principle change only with the "yes" of whoever leads the project. Other lines that still name the old file: a line that only says to read the principles is now a copy of the import, so setup proposes removing it; any other line gets the new name. Both only after a yes.
- Rerun: checks that everything is in place (`THE-WAY.md`, the two `@` imports, `THE-WAY-USAGE.md` written by the current plugin version). It compares only the version number on the first line of `THE-WAY-USAGE.md`: same is fine; older or missing, it offers to rewrite the file; after that rewrite, if the file still has the old sections `## Primary` and `## Secondary` (before 1.1.0), it proposes one division of the whole file into Result and Work as a table (name, sentence, list, doubt), with one yes, asking only about the principles in doubt; a principle that holds for both lists is handled as in section 1; in the same proposal it names the lines of `CLAUDE.md` or other project files that say the principles do not cover how we work, and offers to adjust them; then it passes every principle of `THE-WAY.md` to `the-way-new`, one at a time, to read it again against the criterion, by itself and before any other work: a principle that passes is not mentioned, one that fails a point gets a proposed line and its own yes. It also recognizes the old marker block of setup 0.1.1 and offers to remove it and switch to the file. It says what is not in place and offers to fix it, with permission (VISIBLE).
- Close: in every case, at the end, if `THE-WAY.md` has no principle yet, it adds one line suggesting the next step: on a project with some substance (a `CLAUDE.md` beyond the imports, docs, a git history), first `the-way-discover` (finds the principles the project already follows), then `the-way-new` (writes one) as the alternative; on a practically empty project, the other way round. Nothing more.

### the-way-self-answer

Run when Claude asks "do I put A or B?". It looks only at the principles, nothing else, both lists. There are two outcomes:

- A principle decides: Claude writes "I do A (NAME)" and closes with the decision and the principle, without asking "shall I proceed?".
- No principle decides: Claude says which two principles pull in opposite directions ("the principles do not decide: X pulls toward B, Y toward A"), and the question stays with whoever reads (CITED).

The skill is a convenience, not the rule: the instructions in `CLAUDE.md` already tell Claude not to ask what the principles answer, and the reader can always write "answer with the principles when you can" (NO_PLUGIN_NEEDED).

### the-way-discover

Run when you want. It searches the conversation, `CLAUDE.md`, the documents and the recorded decisions for principles the project follows without having written them. Rules are the clue: several rules that come from the same want point to one principle, and the skill hands over the want (PRINCIPLE_NOT_RULE). It passes each one, one at a time, to `the-way-new` (with the Skill tool), which asks the "yes"; `the-way-discover` does not ask it. When a sentence written in a file says the principle itself, it passes that sentence along: once the principle is in `THE-WAY.md` the sentence is a copy, and `the-way-new` proposes removing it, in the same "yes". A rule that only follows from the principle is a copy too, removed in the same "yes"; a rule that carries a fact the principle does not give (a command, a path, a number) stays. A sentence that repeats a principle already in `THE-WAY.md` is a copy too: `the-way-discover` proposes removing it (ONE_PLACE).

### the-way-new

Writes a principle in `THE-WAY.md`. Run it when you have a principle of the project in mind. It also starts by itself, in any language, when whoever works states a rule for the whole project ("from now on we always do X here", "in this project we never do Y", "this is a rule"), and when a principle is about to be added or changed; it does not start for a choice that holds only for the task at hand.

What the person says is usually a rule (what not to do, or what to do in one case): the skill finds what the project wants behind it, asks once more why the project wants that, and stops when the next why would hold for any project; it proposes that as the principle, with the rule as one of its consequences, so the principle also decides the cases not yet met (PRINCIPLE_NOT_RULE). A rule that carries a command, a path or a file name is a rule and stays one: the skill says so and does not write it anywhere; it proposes a principle only if the why behind it is a choice of this project, not of any project. When a principle already written is read again, the new sentence stays at the level of the principle: one that names the mechanism carrying it out has gone down to a consequence. It passes the sentence through the criterion (section 5) and chooses the list alone with the two questions (OBVIOUS); it asks only when the sentence is yes to both, and then proposes what the sentence allows (section 1), one yes per sentence written. It proposes the name, the sentence, and which list it goes in, and writes only after the "yes". One "yes" covers everything. There is no skill to remove a principle. Its description explains what a principle is, because whoever reads it for the first time does not know the word.

## 4. What `setup` writes in the project

The file `THE-WAY-USAGE.md` in the root of the project, next to `THE-WAY.md`, always rewritten whole. Its first line says which plugin version wrote it (`*Written by `/alecsplus-skills:the-way-setup` 1.1.0: rerun it to update.*`, in the language of the project). In `CLAUDE.md`, setup puts only two lines at the top, `@THE-WAY.md` and `@THE-WAY-USAGE.md`, with no markers (SIMPLE). The file holds these instructions:

- Compare before asking. Before asking a choice of the user, or leaving it to a subagent, compare it with the principles.
- If a principle decides, do not ask. Write "I do A (NAME)".
- Try first. If you already know what the user would answer, a principle has decided. The answer that looks too obvious is the answer.
- Ask only when no principle decides, or when two pull in opposite directions. Under the question, write the comparison, starting with "the principles do not decide", naming the two principles.
- Never go against a principle in silence. If a choice goes against one, say which one and why, before doing it.
- The same holds for a "to decide" that comes back in a subagent report: if a principle decides, answer it and cite it.
- Every task given to a subagent ends with the line "In the report, next to each choice, write the project principle that decided it". The task does not copy any principle, and nothing checks the report automatically. Claude reads it in the session.
- A rule said for the whole project is a principle waiting to be named: find what the project wants behind it and propose that, not the rule. A new or changed principle goes through the criterion of the `the-way-new` skill and the yes of whoever leads the project. Without the plugin, at least the yes remains.

## 5. The criterion for writing a principle

It is one list, the same in every project (GENERIC); each point has a name, written in italics so it is not mistaken for a principle of the project. A principle:

- *Self_explaining*: Has a name of one word, or two joined by `_`, that alone calls back the whole sentence;
- *Short*: Is as short as possible, usually one sentence; a second one enters only if the first is misunderstood without it;
- *General*: Says the general thing from which many choices come: no cases, examples or history, and no repeating another principle;
- *Target*: Says in positive terms what you want to obtain: not a motto good for everything, not a prohibition. A rule says what not to do and stops there; a principle says what the project wants, so it also decides the case nobody wrote down (PRINCIPLE_NOT_RULE);
- *Who_and_what*: Makes clear at once who and what it talks about;
- *Exact_words*: Uses every word for exactly what it says, and the word the project already uses for that thing;
- *One_reading*: Read by Claude in a fresh session, with nothing of the conversation that wrote it, has one reading only; a sentence that a person understands from the context is not enough;
- *Uncontradicted*: Is true as written: if a real case contradicts it, the sentence is corrected before it enters;
- *Has_opposite*: Has an opposite that someone could seriously choose;
- *Meaning_first*: Is born from the meaning: first fix what it is for, then write the sentence; the meaning does not change under objection;

A principle may talk about how the project is worked on (Work), not only about the finished thing (Result).

The criterion lives only in the `the-way-new` skill and is not copied into each project, so it is not read again at every session (SIMPLE). Because starting by itself is not guaranteed, `setup` puts the fixed line about it in `THE-WAY-USAGE.md` (VISIBLE).

## 6. Language

- The text of the skills and the names of the commands are in English, because the plugin is distributed.
- The texts a skill writes into a project are in the language of that project: the opening of `THE-WAY.md`, the section titles ("Risultato" / "Lavoro" in an Italian project) and fixed lines, the name of a single principle, and the instructions in `THE-WAY-USAGE.md`. The fixed texts exist in one version only, in English; the skill translates them into the language of the project, Italian included.

## 7. Out of scope for now

- The principles of an agent.
- Principles shared by all of a person's projects.
- The cycle from candidate to consolidated principle.

## 8. Versioning

The plugin version lives in `plugin.json` and starts at `0.1.0`. Every change to the skills published on GitHub must bump the version; otherwise people who already installed the plugin do not receive the update. The version moves to `1.0.0` only after the project lead has checked by hand all the published files and after the getting-started README for newcomers is written and tested.

The version number is also written in `skills/the-way/the-way-setup/SKILL.md`, because `setup` puts it on the first line of `THE-WAY-USAGE.md` and reading the plugin's own files can be refused; the two numbers change together at every release (SIMPLE).

## 9. License

MIT. See [LICENSE](../../LICENSE).
