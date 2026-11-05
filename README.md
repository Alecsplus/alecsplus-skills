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

## Beskar and the forge

**Beskar.** Result principles say the qualities the result will have. A Mandalorian who orders an armour asks that it stops a blaster shot and weighs little: that is why they want it in beskar. Example from this repo: **GENERIC**, the plugin works the same way in every project: a form or a rule that holds in only one project does not enter.

**The forge.** Work principles say how we work to get there. The Armorer works one piece at a time, and nothing leaves the forge that she has not hammered herself. Example from this repo: **SIMPLE**, things are done in the simplest and most linear way: a complexity solved, not avoided.

Both lists sit in the same file, `THE-WAY.md`: `## Result` first, `## Work` after.

This repo uses the-way on itself: see [its principles](./skills/the-way/THE-WAY.md).

## Install

```bash
claude plugin marketplace add Alecsplus/alecsplus-skills
claude plugin install alecsplus-skills@alecsplus-skills
```

Or in a session: `/plugin marketplace add Alecsplus/alecsplus-skills`, then `/plugin install alecsplus-skills@alecsplus-skills`.

Already installed? Update with `claude plugin update alecsplus-skills@alecsplus-skills`.

## The eight skills

Got a project with some history? Start with `the-way-discover`: it finds the principles you already follow. Starting from scratch? `the-way-new` writes your first one.

Any skill can be the first: if setup is missing, the skill says so, asks one yes, prepares it, then does what you asked. Nothing is written without your yes. Files are written in your project's language (for the global ones, in yours).

- `/alecsplus-skills:the-way-setup` gets a project ready, and keeps it up to date after a plugin update. You rarely run it: the other skills run it first.
- `/alecsplus-skills:the-way-self-answer` answers Claude's question from the principles. Try it when Claude asks "tabs or spaces?".
- `/alecsplus-skills:the-way-discover` finds the principles you already follow without knowing it. Try it on a project with a long history.
- `/alecsplus-skills:the-way-new` writes one principle, raising your rule to the level above. Try: "don't log passwords".
- `/alecsplus-skills:the-way-grilling` grills your plan with Pocock's `grilling` and hangs every answer on your principles, with their weight; needs `mattpocock-skills` installed. Try it on a decision you are not sure about.
- `/alecsplus-skills:the-way-global-setup` gets `~/.claude/` ready for principles that hold in all your projects. The three below run it first.
- `/alecsplus-skills:the-way-global-new` writes one global principle. Try: "in all my projects, never X".
- `/alecsplus-skills:the-way-global-discover` finds the principles you follow in every project.

The global level is one more `THE-WAY.md`, in `~/.claude/`: it holds in every project, and cited as `NAME_global`. In a project that has its own file, the project wins.

## License

MIT. See [LICENSE](./LICENSE). The full specification is in [skills/the-way/SPEC.md](./skills/the-way/SPEC.md).
