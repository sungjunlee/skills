# skills

A small collection of portable agent skills.

These skills are meant to stay compact, composable, and easy to adapt. Each skill should do one useful thing, keep its core workflow in `SKILL.md`, and move only optional supporting material into `references/`.

## Skills

### Productivity

#### delegate

One-shot delegate a prompt to a chosen agent/model and return its output. No worktree, manifest, or review.

When the full `relay-dispatch` flow is overkill — you just want a quick answer from a specific model — `delegate` shells out directly to the chosen CLI.

```text
/delegate opencode-go/deepseek-v4-pro "refactor this function to use streams"
/delegate reasonix/deepseek-v4-pro "write unit tests for the parser"
/delegate cline-pass/glm-5.2 "review this diff"
/delegate opencode/glm-5.2 "summarize this diff"
/delegate opencode "explain this file"  # no model: CLI default
```

Source:

- `skills/productivity/delegate/SKILL.md`
- `skills/productivity/delegate/references/cli-invocations.md`
- `skills/productivity/delegate/references/dispatch-guardrails.md`
- `skills/productivity/delegate/references/model-catalog.md`

### Review

#### gosu-review

Run a real multi-subagent panel review on the current artifact.

Single-agent reviews collapse into one voice. `gosu-review` keeps each panelist's independent lens visible, then surfaces the orchestrator's tensions, consensus, and per-persona verdicts.

Use it when you want multiple context-specific experts to review code, a plan, a skill, a document, a decision, or repository state.

```text
/gosu-review
/gosu-review skills/review/gosu-review/SKILL.md
/gosu-review "review this product launch plan"
```

Source:

- `skills/review/gosu-review/SKILL.md`
- `skills/review/gosu-review/references/personas.md`

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
  productivity/
    delegate/
      SKILL.md
      references/
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
