# skills

A small collection of portable agent skills.

These skills are meant to stay compact, composable, and easy to adapt. Each skill should do one useful thing, keep its core workflow in `SKILL.md`, and move only optional supporting material into `references/`.

## Skills

### Planning

#### brainstorming

Turn a vague idea into one selected direction and a compact Design Handoff, then recommend the next owner. Explicit-only and engine-agnostic.

`brainstorming` inspects safely discoverable repository context, asks only decision-changing questions, compares viable approaches, and converges on a Design Handoff. It recommends a successor (`feature-spec`, a tracker-neutral decomposition handoff, `implement`/relay, stop, or a grill capability) as output — it never invokes one, mutates a tracker, or infers capability availability.

```text
/brainstorming "we need some kind of notifications, not sure where to start"
```

Source:

- `skills/planning/brainstorming/SKILL.md`
- `skills/planning/brainstorming/references/routing.md`
- `skills/planning/brainstorming/agents/openai.yaml`

#### feature-spec

Compile a completed Design Handoff, settled proposal or conversation, or clear tracker task into a tracker-neutral, implementation-ready Feature Spec.

It preserves settled decisions and acceptance criteria, records exact repository-contract contradictions for human resolution, and closes with exactly one of an `implement | relay` recommendation, a decomposition handoff, or a `blocked-human-decision` Human Decision Handoff. It recommends successors without invoking them or mutating tracker state.

Source:

- `skills/planning/feature-spec/SKILL.md`
- `skills/planning/feature-spec/agents/openai.yaml`
- `skills/planning/feature-spec/references/spec-template.md`
- `skills/planning/feature-spec/references/routing.md`

### Engineering

#### implement

Execute a settled feature spec, tracker task, or clear prompt in the current checkout with the lightest safe current-session engine.

`implement` performs a pre-edit safety gate, chooses inline, serial-worker, or bounded-parallel execution, and keeps diff inspection and authoritative verification with the orchestrator. Work that needs durable recovery, isolated lifecycle, or elevated-risk handling is returned as a relay handoff before mutation; relay is never invoked silently.

Source:

- `skills/engineering/implement/SKILL.md`
- `skills/engineering/implement/agents/openai.yaml`
- `skills/engineering/implement/references/routing.md`
- `skills/engineering/implement/references/worker-contract.md`

### Productivity

#### delegate

One-shot delegate a prompt to a chosen agent/model and return its output. No worktree, manifest, or review.

When the full `relay-dispatch` flow is overkill — you just want a quick answer from a specific model — `delegate` shells out directly to the chosen CLI.

```text
/delegate opencode-go/deepseek-v4-pro "refactor this function to use streams"
/delegate reasonix/deepseek-v4-pro "write unit tests for the parser"  # DeepSeek 본체 (학습 리스크 있음)
/delegate pi/alibaba-plan "run this batch"  # provider 지정 (pi는 다중 provider)
/delegate cline-pass/glm-5.2 "review this diff"
/delegate opencode/glm-5.2 "summarize this diff"
/delegate claude/sonnet effort=high "review this migration"
/delegate claude/claude-opus-5 effort=xhigh "analyze this long-horizon refactor"
/delegate codex/gpt-5.6-luna effort=medium "implement this scoped issue"
/delegate gpt-5.6-sol effort=high "analyze this migration"  # no route: home route -> codex
/delegate grok-4.5 effort=high "review this diff"  # home route -> cursor/cursor-grok-4.5-high
/delegate opencode "explain this file"  # no model: CLI default
```

Same model, multiple routes? `references/provider-routing.md` picks the route by
quota, training risk, and cost windows (single-provider CLIs like codex/claude
are fixed; multi-provider CLIs like opencode/pi select explicitly).

Source:

- `skills/productivity/delegate/SKILL.md`
- `skills/productivity/delegate/references/cli-invocations.md`
- `skills/productivity/delegate/references/dispatch-guardrails.md`
- `skills/productivity/delegate/references/model-catalog.md`
- `skills/productivity/delegate/references/provider-routing.md`
- `skills/productivity/delegate/references/routing-guide.md`

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
- `skills/review/gosu-review/references/cross-examine.md`

## Related Larger Projects

These are intentionally not included here because they are heavier workflows rather than small drop-in skills.

- [dev-backlog](https://github.com/sungjunlee/dev-backlog) — keeps GitHub Issues as the source of truth while adding local sprint files as the execution hub for humans, Claude Code, and Codex.
- [dev-relay](https://github.com/sungjunlee/dev-relay) — runs a repeatable plan -> dispatch -> review loop where an executor works in an isolated worktree and an independent reviewer checks the PR before merge.
- [CraftKit](https://github.com/sungjunlee/craftkit) — file-first toolkit for authoring, critiquing, and optimizing prompts and coding-agent skills, plus a repo spec pipeline.

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
backlog/
docs/
  engine-capability-contract.md
evals/
  cases/
  contracts/
  delegate/
  fixtures/
  reports/
  results/
  schema/
scripts/
skills/
  engineering/
    implement/
      SKILL.md
      agents/
        openai.yaml
      references/
        routing.md
        worker-contract.md
  planning/
    brainstorming/
      SKILL.md
      agents/
        openai.yaml
      references/
        routing.md
    feature-spec/
      SKILL.md
      agents/
        openai.yaml
      references/
        routing.md
        spec-template.md
  productivity/
    delegate/
      SKILL.md
      references/
        cli-invocations.md
        dispatch-guardrails.md
        model-catalog.md
        provider-routing.md
        routing-guide.md
  review/
    gosu-review/
      SKILL.md
      references/
        cross-examine.md
        personas.md
spec/
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

The engine capability contract in `docs/` is maintainer guidance. Runtime
skills must remain self-contained and must not depend on reading it.
