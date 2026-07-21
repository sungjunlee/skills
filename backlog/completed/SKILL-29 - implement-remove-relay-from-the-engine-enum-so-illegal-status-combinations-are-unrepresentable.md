---
id: SKILL-29
title: 'implement: remove relay from the engine enum so illegal status combinations are unrepresentable'
status: Done
labels:
  - type: skill
  - type: validation
priority: medium
milestone: 
created_date: '2026-07-12'
---
## Description
Parent epic: https://github.com/sungjunlee/skills/issues/8
Origin: writing-great-skills review of the Epic 8 skills (2026-07-12). **Deferred — requires a fresh replay pass; do not fold into the text-only pruning batch.**

## Context

implement's final YAML allows illegal states that prose must then forbid: relay sits in the `engine` enum although the skill never executes relay ("It is not relay execution" — `references/routing.md`), so escalation needs the three-field combination `status: escalated` + `engine: relay` + `handoff.route: relay`, guarded by a warning paragraph. Making illegal states unrepresentable — engines are `inline | serial_workers | bounded_parallel`, escalation is expressed by `status` + `handoff` alone — deletes the invariant and its guard prose.

## Why deferred

The current contract is load-bearing validated surface:

- `evals/schema/replay-case.schema.json` (`expected_engine`) and `replay-result.schema.json` (`observed_engine`) encode the enum.
- `evals/cases/implement/high-risk-relay.json` and `selected-implement-becomes-unsafe.json` assert `expected_engine: relay` via `engine_equals`.
- 100+ committed replay results under `evals/results/` are dated observed evidence of the current contract; editing them to match a new enum would fabricate evidence, and `_context.md` records the current rule ("relay escalation uses `engine: relay`").

Honest sequencing: change schema + cases + skill text together, then re-run at least the two escalation cases on the required hosts (Claude Code, Codex) to mint fresh dated evidence, superseding — not rewriting — the old results.

## Acceptance criteria

- [ ] `engine` enum is `none | inline | serial_workers | bounded_parallel` in `SKILL.md`, schemas, and cases; escalation is carried by `status: escalated` + `handoff.route: relay`.
- [ ] The tri-field warning prose is deleted rather than reworded.
- [ ] Escalation replay cases re-run on Claude Code and Codex with fresh dated results; old results are superseded, not edited.
- [ ] `_context.md` engine rule updated to the new invariant.
- [ ] `npm test` and the cross-host matrix verifier pass.
