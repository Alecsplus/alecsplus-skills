---
name: the-way-global-discover
description: Find the principles that hold in all the user's projects without being written in ~/.claude/THE-WAY.md (a principle is what the person cares about, said in one sentence with a name, that decides many of their choices), and hand each one to the-way-global-new, which writes it into ~/.claude/THE-WAY.md with the yes of the person. Use when the user wants to find the principles they follow in every project.
---

# The way: global discover

The principles of all the user's projects live in `~/.claude/THE-WAY.md`. This skill finds the ones that are missing and hands each to `the-way-global-new`, which holds the criterion and writes it.

## Before anything

**Check the global setup.** Run `the-way-global-setup` (call the `Skill` tool with `alecsplus-skills:the-way-global-setup`): it checks that `~/.claude/THE-WAY.md`, `~/.claude/THE-WAY-USAGE.md` and the two import lines in `~/.claude/CLAUDE.md` are in place and written by the current plugin version; if something is missing or out of date, it says which and asks one yes; if all is in order, it says nothing. If it stopped without the yes, stop and say why: the work needs the global principles in place. Then read `~/.claude/THE-WAY.md`. **Ask permission before writing to any file**, every time; a yes to one principle is not a yes to the next. This skill writes only the copies it removes after a yes, in `~/.claude/CLAUDE.md`, in `~/.claude/rules/` or in the `THE-WAY.md` of a project; it does not check, set up or add principles in the `THE-WAY.md` of any project, the one it was launched in included; reading it to discover is fine.

## Finding principles

Look for principles the person follows in every project without having written them, in:

- the conversation;
- `~/.claude/CLAUDE.md` and the files it imports, and `~/.claude/rules/` if it exists (Claude Code loads it like `CLAUDE.md`);
- the memory in `~/.claude/projects/*/memory/`;
- the `THE-WAY.md` of the projects. The projects are the folders of `~/.claude/projects/`. Do not read a folder name as a path: its `-` stands for `/`, but also for `-`, `_` and `.`. Read the real path from the `"cwd"` field of any session file (`*.jsonl`) in the folder (`grep -o -m1 '"cwd":"[^"]*"' ~/.claude/projects/<folder>/*.jsonl | head -1`; always give the whole path, because a folder name begins with `-` and a command would read it as an option). With no session file, walk the folder name from `/`, one piece at a time: at each `-` keep only the readings (`/`, `-`, `_`, `.`) for which the path so far is a folder that exists, or the start of a name in its parent folder (`--` is `/.`); never try every combination. If no path is left at the end, skip the folder for its `THE-WAY.md`. Take the git root of that path, once per repo: a session opened in a subfolder counts as its repo; a path that is in no git repo counts as itself.

A principle is a thing that decides many choices, not one choice. Look for both kinds: what the finished thing must be however we work (Result) and how we work whatever we build (Work); `the-way-global-new` puts each in its list. Rules are the clue: several rules that come from the same want ("don't log passwords", "no emails in error messages") point to one principle. Hand over the want, with the rules as the sentences it explains (PRINCIPLE_NOT_RULE).

**What counts as global.** `~/.claude/CLAUDE.md` and `~/.claude/rules/` already speak for all the projects, so a candidate found there is enough by itself. A project is a repo: the memory of every folder that leads to the same git root and the `THE-WAY.md` of that repo count together as one project; a folder whose path is not found counts alone, with its memory. The same principle must stand in more than one project to be a candidate. A principle that stands in one project only is ignored: do not hand it over and do not mention it. In the conversation, count only what the person says in the words of all their projects ("in all my projects", "always, everywhere").

- A sentence written in `~/.claude/CLAUDE.md` or `~/.claude/rules/` that says the principle itself is a copy once the principle is in `~/.claude/THE-WAY.md`: hand over the file and the sentence so they are removed (only after a yes). A rule that only follows from the principle is a copy too: hand it over the same way. A rule that carries a fact the principle does not give (a command, a path, a number) stays. A principle found only in the conversation has nothing to remove.
- A `THE-WAY.md` of a project that already has, word for word, a principle written in `~/.claude/THE-WAY.md` has a copy: ask the person who launched this skill, once per project and sentence, "remove the copy from that project, or leave it for whoever opens the repo without your global file?". On "remove", remove that line from that file yourself, after the yes; on "leave", touch nothing. The same question holds for a principle `the-way-global-new` has just written from your handover, when the line written is word for word the same as one in a project you read: ask it after the answer of `the-way-global-new`, before the next candidate.
- Take **one principle at a time**. Call the `Skill` tool with `alecsplus-skills:the-way-global-new` and hand it the candidate: the name, the sentence, where you found it, which choices it would decide, and the file and sentence to remove, if any. `the-way-global-new` checks it, proposes it and asks the yes of the person; you ask nothing yourself. Do not hand over the next before the answer.
- A sentence that repeats a principle already in `~/.claude/THE-WAY.md` is a copy: quote it with its file (`~/.claude/CLAUDE.md` or a file of `~/.claude/rules/`) and propose removing it, one yes per sentence. The copies are the only things you ask yourself.
- Words come from the person or from their yes to the proposal. Never put in a principle on your own.
