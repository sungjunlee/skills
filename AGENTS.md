# AGENTS.md

This repo is a small collection of portable agent skills. Each skill is self-contained under `skills/<category>/<skill-name>/` with a `SKILL.md` at its root and optional `references/`.

## Layout

```
skills/
  <category>/
    <skill-name>/
      SKILL.md         # required, the skill's core workflow
      references/      # optional, supporting material only
```

## Rules

- Do not edit a `SKILL.md` without reading the whole file first.
- Keep `SKILL.md` short. Move optional material into `references/`.
- Do not add a new top-level `references/` at the repo root — references belong inside a skill.
- Do not commit `.agents/` or `skills-lock.json`; both are local install state.
- When adding a new skill, list it under the matching category in `README.md` and update the "Repo Layout" example.
