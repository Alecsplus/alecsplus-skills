# alecsplus-skills

Skills for Claude Code. The first skill is `the-way`; how the skills work is in [`skills/the-way/SPEC.md`](skills/the-way/SPEC.md).

@skills/the-way/THE-WAY.md
@skills/the-way/THE-WAY-USAGE.md

## Checks

No build, no tests: the plugin is Markdown. Before a release, run from the repo root:

```sh
python3 -c 'import json; json.load(open(".claude-plugin/plugin.json"))'
for s in $(python3 -c 'import json; print(" ".join(json.load(open(".claude-plugin/plugin.json"))["skills"]))'); do head -5 "$s/SKILL.md" | grep -q "^name: $(basename "$s")$" || echo "bad or missing SKILL.md: $s"; done
grep -n '1\.[0-9]\.[0-9]' .claude-plugin/plugin.json skills/the-way/the-way-setup/SKILL.md skills/the-way/the-way-global-setup/SKILL.md 2>/dev/null
```

The last line must show the same version everywhere.
