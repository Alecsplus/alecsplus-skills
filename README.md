# alecsplus-skills

*This is the way.* Literally: the skill is called `the-way`, and it keeps [Claude Code](https://code.claude.com/docs/en/plugins) on your project's way.

You write down your project's **principles** once. From then on, every choice Claude and its agents make follows them, and says which one decided. Fewer questions are a happy side effect.

A principle is what your project cares about, said in one sentence with a **name**: it decides many choices. One line in `THE-WAY.md`:

```markdown
**USER_FIRST** — When in doubt, pick what is easier for whoever uses the product.
```

## One scene

Claude is about to ask: "Short error message, or long with all the details?" With `the-way` it doesn't:

> I do the short, plain message (USER_FIRST). The details go to the log.

Disagree? Change the principle once. When two principles pull apart, Claude asks, and shows you the tug of war.

## Rules in, principles out

We humans are good at giving rules ("don't log passwords") and bad at naming principles. A rule says what not to do, and stops there. So `the-way-new` raises the level: it takes the rule you said, finds what your project wants behind it, and proposes that as the principle.

| You said | It comes out as | And it also decides |
|---|---|---|
| "Don't log passwords" | **NOTHING_LEAKS** — What a person entrusts to us stays only where it is needed. | Tokens in URLs, emails in error messages, debug dumps. |
| "Never more than three clicks to reach anything" | **WITHIN_REACH** — What a person does every day is one gesture away. | Keyboard shortcuts, prefilled values, menu order. The rule counted clicks; the principle looks at the gesture. |

Your rule still holds, as one consequence. The gain: by looking at the past, the principle also decides the cases that have not happened yet, the ones you cannot foresee.

This repo uses the-way on itself: see [its principles](./skills/the-way/THE-WAY.md).

## Install

```bash
claude plugin marketplace add Alecsplus/alecsplus-skills
claude plugin install alecsplus-skills@alecsplus-skills
```

Or in a session: `/plugin marketplace add Alecsplus/alecsplus-skills`, then `/plugin install alecsplus-skills@alecsplus-skills`.

## The four skills

Got a project with some history? Start with `the-way-discover`: it finds the principles you already follow. Starting from scratch? `the-way-new` writes your first one.

Any skill can be the first: if setup is missing, the skill says so, asks one yes, prepares it, then does what you asked. Nothing is written without your yes.

- `/alecsplus-skills:the-way-setup` gets a project ready, and keeps it up to date after a plugin update. You rarely run it: the other three run it first.
- `/alecsplus-skills:the-way-self-answer` answers Claude's question from the principles. Try it when Claude asks "tabs or spaces?".
- `/alecsplus-skills:the-way-discover` finds the principles you already follow without knowing it. Try it on a project with a long history.
- `/alecsplus-skills:the-way-new` writes one principle, raising your rule to the level above. Try: "don't log passwords".

## License

MIT. See [LICENSE](./LICENSE). The full specification is in [skills/the-way/SPEC.md](./skills/the-way/SPEC.md).
