# alecsplus-skills

A public collection of Claude Code skills by Alessandro Molteni, modeled on Matt Pocock's collection; today it holds one skill, `the-way`, in three gestures.

This README is currently the specification; a getting-started section will come later.

## 1. What `the way` is

The principles of a project live in one file, `THE-WAY.md`, in the root of the repository. The file has the same name and the same form in every project (GENERICO).

- "The way" names the whole set of principles. A single rule is called "principle", in the language of the project (for example "principio" in an Italian project).
- The principles are those of the project the session runs in. Inside this plugin's repository they guide the plugin; inside another project they guide only that project.
- The plugin applies to itself: its own file is `skills/the-way/THE-WAY.md`. It sits inside the skill folder so it does not guide the other skills that will join the collection.

The form of the file is fixed (GENERICO, SEMPLICE):

- A one-line opening after the title: "They apply to everything done in this project, even what is not yet named. When a principle guides a choice, it is cited by its name."
- `## Primary`, always present. Fixed line: "They are the purpose of the work. In a conflict, they win."
- `## Secondary`, only if there are any. Fixed line: "They give shape to the primary ones: read them in their light, they never contradict them."
- One principle per line: `**NAME** — sentence`. NAME is uppercase letters, with `_` instead of spaces.
- No numbers and no date of origin: the trace of the "yes" stays in git history (SEMPLICE).
- Free paragraphs are allowed. Only lines that start with `**NAME**` are principles.
- No candidates: a principle is either in the file or not.

For the principles of this repository, see `skills/the-way/THE-WAY.md`. They are SEMPLICE, GENERICO, SENZA_PLUGIN, VISIBILE and CITATO.

## 2. Nothing runs by itself

There are no hooks and no stop check, neither in the plugin nor in the project (SEMPLICE). The plugin is only skills.

The project carries everything (SENZA_PLUGIN):

- The project's `CLAUDE.md` pulls the file in with `@THE-WAY.md`, together with the instructions for comparing choices to principles. Someone who opens the project without the plugin reads and applies the principles all the same.
- Subagents receive both, because they read the project's `CLAUDE.md`. Nothing is copied into the task given to them (SENZA_PLUGIN, SEMPLICE).
- `Explore` and `Plan` do not read `CLAUDE.md`. This is accepted; Claude compares with the principles the choices that come back from them.
- When the instructions change, rerunning `the-way-setup` updates the project.

## 3. The three skills

Commands: `/alecsplus-skills:the-way-setup`, `/alecsplus-skills:the-way-self-answer`, `/alecsplus-skills:the-way-discover`.

They are three separate skills, not one skill with arguments, because a skill with arguments does not offer its gestures when you type its name.

Every skill asks permission before it writes a file, always, even `setup` on a new project. If you run a `the-way-` skill before `setup`, it says that setup is missing, asks permission to run it, and then goes on (VISIBILE).

There is no "verify" gesture: it would have no purpose of its own (SEMPLICE).

### the-way-setup

- On a project with no principles: creates an empty `THE-WAY.md` (title, opening line and `## Primary`) and writes the block in `CLAUDE.md` (see section 4). It does not invent principles; `the-way-discover` finds them.
- On a project with principles in another form: asks permission, renames the file to `THE-WAY.md`, brings it to the single form (no numbers, no dates of origin) and updates the `@` import. The words of a principle change only with the "yes" of whoever leads the project.
- Rerun: checks that everything is in place (file, `@` import, up-to-date block in `CLAUDE.md`). It says what is not in place and offers to fix it, with permission (VISIBILE).

### the-way-self-answer

Run when Claude asks "do I put A or B?". It looks only at the principles, nothing else. There are two outcomes:

- A principle decides: Claude writes "I do A (NAME)" and goes on.
- No principle decides: Claude says which two principles pull in opposite directions ("the principles do not decide: X pulls toward B, Y toward A"), and the question stays with whoever reads (CITATO).

The skill is a convenience, not the rule: the instructions in `CLAUDE.md` already tell Claude not to ask what the principles answer, and the reader can always write "answer with the principles when you can" (SENZA_PLUGIN).

### the-way-discover

Run when you want. It searches the conversation, `CLAUDE.md`, the documents and the recorded decisions for principles the project follows without having written them. It proposes them one at a time, each with the "yes" of whoever leads the project. If a principle is already written in another file, it offers to move it into `THE-WAY.md`.

It holds the criterion for writing a principle (section 5) and starts by itself when a principle is added or changed.

## 4. What `setup` writes in `CLAUDE.md`

A block at the top of the file, between two marker lines. The markers let a rerun find the block and update it. The block holds the `@THE-WAY.md` import and these instructions:

- Compare before asking. Before asking a choice of the user, or leaving it to a subagent, compare it with the principles.
- If a principle decides, do not ask. Write "I do A (NAME)".
- Try first. If you already know what the user would answer, a principle has decided. The answer that looks too obvious is the answer.
- Ask only when no principle decides, or when two pull in opposite directions. Under the question, write the comparison, starting with "the principles do not decide".
- The same holds for a "to decide" that comes back in a subagent report: if a principle decides, answer it and cite it.
- Every task given to a subagent ends with the line "In the report, next to each choice, write the project principle that decided it". The task does not copy any principle, and nothing checks the report automatically. Claude reads it in the session.
- A new or changed principle goes through the criterion of the `the-way-discover` skill and the yes of whoever leads the project. Without the plugin, at least the yes remains.

## 5. The criterion for writing a principle

It is one list, the same in every project (GENERICO). A principle:

1. has a name of one word, or two joined by `_`, that alone calls back the whole sentence;
2. is as short as possible, usually one sentence; a second one enters only if the first is misunderstood without it;
3. says the general thing from which many rules come: no cases, examples or history, and no repeating another principle;
4. says in positive terms what you want to obtain: not a motto good for everything, not a prohibition;
5. makes clear at once who and what it talks about;
6. uses every word for exactly what it says, and the word the project already uses for that thing;
7. is true as written: if a real case contradicts it, the sentence is corrected before it enters;
8. has an opposite that someone could seriously choose;
9. is born from the meaning: first fix what it is for, then write the sentence; the meaning does not change under objection;
10. enters only with the words of whoever leads the project, or with their yes;
11. if it is secondary, gives shape to a primary one that you can name.

A principle may talk about how the project is worked on, not only about the product.

The criterion lives only in the `the-way-discover` skill and is not copied into each project, so it is not read again at every session (SEMPLICE). Because starting by itself is not guaranteed, `setup` puts the fixed line about it in `CLAUDE.md` (VISIBILE).

## 6. Language

- The text of the skills and the names of the commands are in English, because the plugin is distributed.
- The texts a skill writes into a project are in the language of that project: the opening of `THE-WAY.md`, the section titles and fixed lines, the name of a single rule, and the instructions in `CLAUDE.md`. The fixed texts exist in Italian and English; for other languages they are translated.

## 7. Out of scope for now

- The principles of an agent.
- Principles shared by all of a person's projects.
- The cycle from candidate to consolidated principle.

## 8. Versioning

The plugin version lives in `plugin.json` and starts at `0.1.0`. Every change to the skills published on GitHub must bump the version; otherwise people who already installed the plugin do not receive the update. The version moves to `1.0.0` once the getting-started README for newcomers is written and tested.

## 9. License

MIT.
