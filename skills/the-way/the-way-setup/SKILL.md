---
name: the-way-setup
description: Set up, or check, a project's principles. Puts THE-WAY.md in the repo root and the instructions for comparing choices against it at the top of CLAUDE.md. Use when the user wants principles in a project, wants to move an existing principles file to THE-WAY.md, or wants to check that the setup is still right.
---

# The way: setup

Give the project one file of principles, `THE-WAY.md` in the repo root, and make the project's `CLAUDE.md` carry it and the instructions on how to use it. Everything lives in the project, so it works for anyone who opens it, with or without this plugin.

The fixed texts to write are at the end of this file, under "Fixed texts".

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
- Which language does the project use? Read the existing `CLAUDE.md`, README and docs. Italian and English texts are fixed in the fixed texts below; for another language, translate them faithfully.

## 2. Pick the case

**A. The project has no principles.** Ask permission to create `THE-WAY.md` (empty: opening line and the primary section, nothing else) and to put the block at the top of `CLAUDE.md` (creating the file if needed). Name the language you will use. After the yes, write both. Then tell the user: the file has no principles yet, and `/alecsplus-skills:the-way-discover` finds the ones the project already follows.

**B. The project has principles in another form or file.** Ask permission to: rename the file to `THE-WAY.md` (`git mv` if it is tracked); bring it to the single form; update every `@old-name` import in `CLAUDE.md` files; add the block. The single form:
- opening: the fixed title and line of the fixed texts below;
- `## Primary` always (fixed line), `## Secondary` only if the project has secondary principles (fixed line);
- each principle on one line: `**NAME** — sentence`, NAME in uppercase letters, with `_` for spaces; no number, no origin sentence or date;
- other free paragraphs may stay.

The words of a principle change only with the yes of whoever leads the project. Removing numbers and origin sentences is allowed; if bringing a principle to the form would change its words, show the change and ask. Then list, without editing them, the other places that still mention the old file name (grep the repo): the user decides.

**C. The setup already exists.** Check, and report each point as ok or not ok:
1. `THE-WAY.md` exists and has the opening, the sections and the one-line form;
2. `CLAUDE.md` imports `@THE-WAY.md`;
3. the block in `CLAUDE.md` is the same as the current text in the fixed texts below (compare in the project's language).

If all is right, say so in one line. For whatever is not, say what differs and propose the fix; apply it only after a yes. Do not touch the principles themselves.

## 3. Close

Say in two lines what was written and where. Nothing more.

## Fixed texts

These texts are the only ones the skill writes into a project. Use them word for word in Italian or English, according to the project's language. For any other language, translate them faithfully: same meaning, same order, same shape (`**NAME** — sentence`, the two marker lines, the `@THE-WAY.md` line). Never add or remove a rule when translating.

The markers are always in English, whatever the language: the skill finds its block by them.

### THE-WAY.md, empty

#### English

```markdown
# Principles

These apply to everything done in this project, including what is not yet named. When a principle guides a choice, cite it by name.

## Primary

They are the point of the work. In a conflict they win.
```

#### Italiano

```markdown
# Principi

Valgono per tutto quello che si fa in questo progetto, anche quello che non è ancora nominato. Quando un principio guida una scelta, lo si cita col suo nome.

## Primari

Sono il senso del lavoro. In conflitto vincono loro.
```

#### Secondary section

Added by `the-way-discover` only when a secondary principle exists, after the last primary.

English:

```markdown
## Secondary

They give substance to the primary ones: read them in their light; they do not contradict them.
```

Italiano:

```markdown
## Secondari

Danno corpo ai primari: si leggono alla loro luce e non li contraddicono.
```

### Block for CLAUDE.md

Written at the top of the project's `CLAUDE.md` (before any other content), from the start marker to the end marker included. Nothing else in the file is touched. If `CLAUDE.md` does not exist, the file is created with only this block.

#### English

```markdown
<!-- the-way:start (written by /alecsplus-skills:the-way-setup; rerun it to update, do not edit by hand) -->
## Principles

The project's principles are in THE-WAY.md, imported below. They apply to everything done in this project, including how we work.

@THE-WAY.md

How to use them:
- Before asking the person leading the project to choose, compare the choice with the principles. If one decides, do not ask: write "I do A (NAME)" and go on. Never ask what the principles already answer.
- Try first: if you already know what the person would answer, a principle has decided. The answer that looks too obvious is the answer.
- Ask only when no principle decides or two pull in opposite directions. Then the question carries its comparison right under it, starting with the words "the principles do not decide:" and saying which two principles pull in opposite directions (X toward B, Y toward A).
- The same holds for a "to decide" coming back from a subagent's report: compare first, then ask only if needed.
- End every task you give to a subagent with this line: "In the report, next to each choice, write the project principle that decided it." Do not copy any principle into the task.
- A new or changed principle goes through the criterion of the `the-way-discover` skill and the yes of whoever leads the project.
<!-- the-way:end -->
```

#### Italiano

```markdown
<!-- the-way:start (written by /alecsplus-skills:the-way-setup; rerun it to update, do not edit by hand) -->
## Principi

I principi del progetto stanno in THE-WAY.md, richiamato qui sotto. Valgono per tutto quello che si fa in questo progetto, anche per come ci si lavora.

@THE-WAY.md

Come si usano:
- Prima di chiedere una scelta a chi guida il progetto, la si confronta coi principi. Se uno decide, non si chiede: si scrive «faccio A (NOME)» e si va avanti. Non si chiede mai quello a cui i principi già rispondono.
- Prova prima di chiedere: se sai già cosa risponderebbe chi guida, un principio ha deciso. La risposta che sembra troppo ovvia è la risposta.
- Si chiede solo quando nessun principio decide o due tirano in direzioni opposte. Allora la domanda porta sotto di sé il suo confronto, che comincia con le parole «i principi non decidono:» e dice quali due principi tirano in direzioni opposte (X verso B, Y verso A).
- Vale anche per un «da decidere» che torna dal report di un agente: prima il confronto, poi la domanda solo se serve.
- Chiudi ogni compito affidato a un agente con la riga: «Nel report, accanto a ogni scelta, scrivi il principio del progetto che l'ha decisa». Nel compito non si ricopia nessun principio.
- Un principio nuovo o cambiato passa dal criterio della skill `the-way-discover` e dal sì di chi guida il progetto.
<!-- the-way:end -->
```
