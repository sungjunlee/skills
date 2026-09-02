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
/delegate claude/claude-opus-5 effort=xhigh "analyze this long-horizon refactor"
/delegate codex/gpt-5.6-luna effort=medium "implement this scoped issue"
/delegate gpt-5.6-sol effort=high "analyze this migration"  # no route: home route -> codex
/delegate grok-4.6 effort=high "review this diff"  # no route: home route -> grok
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

#### gosu-review

Review the current artifact with a real 4-6 person expert subagent panel. Explicit-only: invoke with `/gosu-review`.

Single-agent reviews collapse into one voice. `gosu-review` keeps each panelist's independent lens visible, then surfaces the orchestrator's tensions, consensus, and per-persona verdicts.

```text
/gosu-review
/gosu-review skills/review/gosu-review/SKILL.md
/gosu-review "review this product launch plan"
```

Source:

- `skills/review/gosu-review/SKILL.md`
- `skills/review/gosu-review/agents/openai.yaml`
- `skills/review/gosu-review/references/personas.md`
- `skills/review/gosu-review/references/cross-examine.md`

### Evaluated, not yet used in daily workflows

These have committed replay and cross-host evidence. They have not been used in the daily loop.

#### brainstorming

Turn a vague idea into one selected direction and a compact Design Handoff, then recommend the next owner. Explicit-only and engine-agnostic.

`brainstorming` inspects safely discoverable repository context, asks only decision-changing questions, compares viable approaches, and converges on a Design Handoff. It recommends a successor (`feature-spec`, `implement`/relay, stop, or a grill capability) or records unit boundaries and stops — it never invokes a successor, mutates a tracker, or infers capability availability.

```text
/brainstorming "we need some kind of notifications, not sure where to start"
```

Source:

- `skills/planning/brainstorming/SKILL.md`
- `skills/planning/brainstorming/references/routing.md`
- `skills/planning/brainstorming/agents/openai.yaml`

#### feature-spec

Compile a completed Design Handoff, settled proposal or conversation, or clear tracker task into a tracker-neutral, implementation-ready Feature Spec.

It preserves settled decisions and acceptance criteria, records exact repository-contract contradictions for human resolution, and closes with exactly one successor-neutral Execution, Decomposition, or Human Decision handoff. It does not choose, detect, recommend, or invoke a successor, and it does not mutate tracker state.

Source:

- `skills/planning/feature-spec/SKILL.md`
- `skills/planning/feature-spec/agents/openai.yaml`
- `skills/planning/feature-spec/references/spec-template.md`
- `skills/planning/feature-spec/references/routing.md`

#### implement

Execute a settled feature spec, tracker task, or clear prompt in the current checkout with the lightest safe current-session engine.

`implement` performs a pre-edit safety gate, chooses inline, serial-worker, or bounded-parallel execution, and keeps diff inspection and authoritative verification with the orchestrator. Work that needs durable recovery, isolated lifecycle, or elevated-risk handling is returned as a relay handoff before mutation; relay is never invoked silently.

Source:

- `skills/engineering/implement/SKILL.md`
- `skills/engineering/implement/agents/openai.yaml`
- `skills/engineering/implement/references/routing.md`
- `skills/engineering/implement/references/worker-contract.md`

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
      agents/
        openai.yaml
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
