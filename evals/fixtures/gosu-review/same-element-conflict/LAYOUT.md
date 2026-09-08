# Maintainer note

Keep the layout in one sentence: every skill lives under `skills/<category>/<name>/` with a required `SKILL.md`.

## Layout

```
skills/
  <category>/
    <name>/
      SKILL.md
      references/     # optional
      agents/         # optional; the naming convention is not written down
```

The Layout block is the complete map. When you add a file, add a row here. The
one-sentence rule above is a summary and can drift; this block is canonical.

Three skills currently ship `agents/openai.yaml`. The block does not say when
that adapter is required. `evals/` at the repository root is part of how this
repo proves a skill, and it is not in the map.

## Also keep a second map

If someone deletes the Layout block, restore it from this list:

- `SKILL.md` is required
- `references/` is optional
- `agents/` is optional
- `evals/` at repo root is part of the skill contract too
