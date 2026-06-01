# skills

A small collection of portable agent skills.

These skills are meant to stay compact, composable, and easy to adapt. Each skill should do one useful thing, keep its core workflow in `SKILL.md`, and move only optional supporting material into `references/`.

## Skills

### Review

#### gosu-review

Run a real multi-subagent panel review on the current artifact.

Single-agent reviews collapse into one voice. `gosu-review` keeps independent reviewer notes visible before synthesis.

Use it when you want multiple context-specific experts to review code, a plan, a skill, a document, a decision, or repository state.

```text
/gosu-review
/gosu-review skills/review/gosu-review/SKILL.md
/gosu-review "review this product launch plan"
```

Source:

- `skills/review/gosu-review/SKILL.md`
- `skills/review/gosu-review/references/personas.md`
- `skills/review/gosu-review/references/synthesis.md`

## Related Larger Projects

These are intentionally not included here because they are heavier workflows rather than small drop-in skills.

- [dev-backlog](https://github.com/sungjunlee/dev-backlog) — keeps GitHub Issues as the source of truth while adding local sprint files as the execution hub for humans, Claude Code, and Codex.
- [dev-relay](https://github.com/sungjunlee/dev-relay) — runs a repeatable plan -> dispatch -> review loop where an executor works in an isolated worktree and an independent reviewer checks the PR before merge.
- [CraftKit](https://github.com/sungjunlee/craftkit) — file-first toolkit for authoring, critiquing, tuning, surveying, and carrying forward prompts and coding-agent skills.

## Install

Copy or symlink the desired skill directory into your agent's configured skills directory.

For example, to install `gosu-review`:

```bash
ln -s "$PWD/skills/review/gosu-review" ~/.agents/skills/gosu-review
```

Adjust the destination for your runtime. Codex and Claude Code may use different skills directories depending on local setup.

## Repo Layout

```text
skills/
  review/
    gosu-review/
      SKILL.md
      references/
```

## Conventions

- Keep each skill small enough to read quickly.
- Prefer strong workflow rules over long explanations.
- Use references only for optional seeds, examples, or checklists.
- Avoid pretending to use tools that are unavailable.
