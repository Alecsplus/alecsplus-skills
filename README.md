# alecsplus-skills

*This is the way.* Literally: the skill is called `the-way`, and it keeps [Claude Code](https://code.claude.com/docs/en/plugins) on your project's way.

You write down your project's **principles** once. From then on, every choice Claude and its agents make follows them, and says which one decided. Fewer questions are a happy side effect.

A principle is a short rule with a **name** that decides many choices. One line in `THE-WAY.md`:

```markdown
**SIMPLE** — Do things in the simplest way that works: less is better.
```

## One scene

Claude is about to ask: "Short error message, or long with all the details?" With `the-way` it doesn't:

> I do the short, plain message (SIMPLE).

Disagree? Change the rule once. When two principles pull apart, Claude asks, and shows you the tug of war.

This repo uses the-way on itself: see [its principles](./skills/the-way/THE-WAY.md).

## Install

```bash
claude plugin marketplace add Alecsplus/alecsplus-skills
claude plugin install alecsplus-skills@alecsplus-skills
```

Or in a session: `/plugin marketplace add Alecsplus/alecsplus-skills`, then `/plugin install alecsplus-skills@alecsplus-skills`.

## The four skills

Start from any of them: if setup is missing, the skill says so, asks one yes, prepares it, then does what you asked. Nothing is written without your yes.

- `/alecsplus-skills:the-way-setup` gets a project ready. Try it on a bare project.
- `/alecsplus-skills:the-way-self-answer` answers Claude's question from the principles. Try it when Claude asks "tabs or spaces?".
- `/alecsplus-skills:the-way-discover` finds the principles you already follow without knowing it. Try it on a project with a long history.
- `/alecsplus-skills:the-way-new` writes one principle. Try: "we never change the database by hand".

## License

MIT. See [LICENSE](./LICENSE). The full specification is in [skills/the-way/SPEC.md](./skills/the-way/SPEC.md).
