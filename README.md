# skills

A small collection of portable agent skills.

These skills are meant to stay compact, composable, and easy to adapt. Each skill should do one useful thing, keep its core workflow in `SKILL.md`, and move only optional supporting material into `references/`. Heavier workflow frameworks live in their own repositories.

## Skills

### In daily use

#### delegate

One-shot delegate a prompt to a chosen agent/model and return its output. No worktree, manifest, or review.

When you just want a quick answer from a specific model, `delegate` shells out directly to the chosen CLI.

```text
/delegate opencode-go/deepseek-v4-pro "refactor this function to use streams"
/delegate reasonix/deepseek-v4-pro "write unit tests for the parser"  # DeepSeek first-party (training risk)
/delegate pi/alibaba-plan "run this batch"  # provider specified (pi is multi-provider)
/delegate cline-pass/glm-5.2 "review this diff"
/delegate opencode/glm-5.2 "summarize this diff"
/delegate claude/sonnet effort=high "review this migration"
/delegate claude/claude-opus-5-5 effort=xhigh "analyze this long-horizon refactor"
/delegate codex/gpt-6-luna effort=max "implement this scoped issue"
/delegate gpt-6-sol effort=xhigh "analyze this migration"  # no route: home route -> codex
/delegate grok-4.7 effort=high "review this diff"  # no route: home route -> grok
/delegate opencode "explain this file"  # no model: CLI default
```

Single-provider CLIs such as codex and claude fix the route; multi-provider
CLIs such as opencode and pi name the provider explicitly.

Source:

- `skills/productivity/delegate/SKILL.md`
- `skills/productivity/delegate/references/cli-invocations.md`
- `skills/productivity/delegate/references/model-catalog.md`

#### gosu-review

Post-build value review, not a bug review: a real panel of 5-6 independent subagents asks whether something already built is still worth it. Explicit-only: invoke with `/gosu-review`.

A plain review already finds the defects. `gosu-review` asks whether the result is still worth it: each seat looks from a different vantage — the user, the premise, what can be cut, the project's purpose, the alternatives — and the panel surfaces what changes the decision and where the seats disagree.

```text
/gosu-review
/gosu-review skills/review/gosu-review/SKILL.md
/gosu-review "review this product launch plan"
```

Source:

- `skills/review/gosu-review/SKILL.md`
- `skills/review/gosu-review/agents/openai.yaml`
- `skills/review/gosu-review/references/cross-examine.md`

### Not yet in daily use

#### brainstorming

Divergent, critical thinking partner for an idea before it is built. Explicit-only: invoke with `/brainstorming`.

It widens the field before narrowing — a reframing, the smallest version or doing nothing, what already exists, a contrary option — attacks each option, asks only questions that change the call, and converges only when asked, into a short brief with acceptance criteria. It stays read-only and suggests a next step without starting it.

```text
/brainstorming "we need some kind of notifications, not sure where to start"
```

Source:

- `skills/planning/brainstorming/SKILL.md`
- `skills/planning/brainstorming/agents/openai.yaml`

## Install

Skills in this repository use the required nested path
`skills/<category>/<skill-name>/`. Ask the `skills` CLI to scan the full depth;
without `--full-depth`, nested skills may not be discovered.

List all discoverable skills before installation:

```bash
npx skills add . --list --full-depth
```

Install from this repository with the same full-depth scan:

```bash
npx skills add . --full-depth
```

Alternatively, copy or symlink the desired skill directory into your agent's
configured skills directory.

For example, to install `gosu-review`:

```bash
ln -s "$PWD/skills/review/gosu-review" ~/.agents/skills/gosu-review
```

Adjust the destination for your runtime. Codex and Claude Code may use different skills directories depending on local setup.

## Repo Layout

```text
evals/
  cases/
  delegate/
  fixtures/
  reports/
  results/
  schema/
scripts/
skills/
  planning/
    brainstorming/
      SKILL.md
      agents/
        openai.yaml
  productivity/
    delegate/
      SKILL.md
      references/
        cli-invocations.md
        model-catalog.md
  review/
    gosu-review/
      SKILL.md
      agents/
        openai.yaml
      references/
        cross-examine.md
```

## Conventions

- Keep each skill small enough to read quickly.
- Prefer strong workflow rules over long explanations.
- Use references only for optional seeds, examples, or checklists.
- Avoid pretending to use tools that are unavailable.

## Maintainer Verification

Run the semantic replay verifier and confirm nested skill discovery before
landing changes:

```bash
npm test
npx skills add . --list --full-depth
git diff --check
```
