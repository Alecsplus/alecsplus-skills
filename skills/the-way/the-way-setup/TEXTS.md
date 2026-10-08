# Fixed texts written by `the-way-setup`

These texts are the only ones the skill writes into a project. Use them word for word in Italian or English, according to the project's language. For any other language, translate them faithfully: same meaning, same order, same shape (`**NAME** — sentence`, the two marker lines, the `@THE-WAY.md` line). Never add or remove a rule when translating.

The markers are always in English, whatever the language: the skill finds its block by them.

## THE-WAY.md, empty

### English

```markdown
# Principles

These apply to everything done in this project, including what is not yet named. When a principle guides a choice, cite it by name.

## Primary

They are the point of the work. In a conflict they win.
```

### Italiano

```markdown
# Principi

Valgono per tutto quello che si fa in questo progetto, anche quello che non è ancora nominato. Quando un principio guida una scelta, lo si cita col suo nome.

## Primari

Sono il senso del lavoro. In conflitto vincono loro.
```

### Secondary section

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

## Block for CLAUDE.md

Written at the top of the project's `CLAUDE.md` (before any other content), from the start marker to the end marker included. Nothing else in the file is touched. If `CLAUDE.md` does not exist, the file is created with only this block.

### English

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

### Italiano

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
