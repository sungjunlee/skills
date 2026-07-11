---
id: SKILL-11
title: 'implement: add portable current-session execution with relay escalation'
status: Done
labels:
  - type: skill
priority: medium
milestone: Epic 8 - Implementation and validation
created_date: '2026-07-11'
---
## Description
Parent epic: https://github.com/sungjunlee/skills/issues/8

## Context

Most substantial work uses dev-relay because it provides durable isolation, manifests, recovery, independent review, and PR/MR lifecycle. Some well-specified tasks are too small for that machinery but still benefit from disciplined autonomous execution and optional fresh-context workers.

The repository needs one thin `implement` primitive for current-session work. It should absorb the useful parts of Matt Pocock's settled-input implementation style and Superpowers' fresh-context execution discipline without becoming a second relay.

`delegate` remains a one-shot external executor transport. It may be used by an adapter, but it does not define this workflow.

## Goal

Add an explicit-only, engine-agnostic `implement` skill that consumes a settled feature spec, tracker task, or clear prompt; selects the lightest safe execution engine; implements continuously; and returns authoritative verification evidence.

## Execution engines

| Engine | Use when | Contract |
|---|---|---|
| Inline | Localized work with no useful decomposition | Current agent implements and verifies |
| Serial workers | Dependent units or uncertain parallel safety | One fresh writer at a time; orchestrator inspects each actual diff |
| Bounded parallel workers | Independent units with isolated workspaces or truly disjoint shared state | Bounded dependency-layer execution; orchestrator integrates and verifies |
| Relay escalation | Durable recovery, isolated PR/MR lifecycle, high risk, repeated review, or long-running work | Hand the settled source artifact to relay-ready/relay-plan before editing |

Parallel-safety analysis must include shared types, schemas, migrations, generated files, lockfiles, environment singletons, and integration order—not only file overlap.

## Orchestrator responsibilities

Regardless of worker transport, the current orchestrator owns:

- input readiness and route confirmation
- decomposition and parallel-safety decision
- inspection of actual working-tree diffs
- integration and conflict resolution
- authoritative tests, typechecking, linting, and relevant verification
- risk-sized final review
- truthful completion status
- optional current-branch commit only when authorized

Workers report one of: `DONE`, `DONE_WITH_CONCERNS`, `NEEDS_CONTEXT`, or `BLOCKED`. The orchestrator evaluates evidence rather than accepting status text as completion proof.

## Routing signals

Recommend `implement` when work is likely to finish now, the current checkout is safe, orchestrator verification is sufficient, and delivery is a local verified change or current-branch commit.

Escalate to relay when the task needs a dedicated worktree/branch, unattended or multi-session recovery, frozen rubric and repeated independent review, PR/MR/CI/merge lifecycle, several durable leaves, or carries security/migration/data-loss/deployment risk.

An explicit user request for `implement`, `relay`, or full relay wins. If new evidence makes the chosen route unsafe, stop before mutation and explain the escalation.

## Portability and degradation

Core semantics are host-neutral. Host mappings may implement workers through native subagents, process-based agents, or `delegate`.

When capabilities are absent, degrade in this order:

```text
isolated bounded parallel -> safe bounded parallel -> serial worker -> inline
```

The skill must not pretend isolation or parallel safety exists. Statuses, verification, completion, and relay-escalation semantics remain the same across hosts.

## Acceptance criteria

- [ ] Accepts feature specs, tracker tasks, and already-clear prompts without re-planning settled intent.
- [ ] Selects inline, serial, bounded-parallel, or relay escalation from explicit evidence.
- [ ] Continuous execution does not ask “should I continue?” between normal units.
- [ ] Orchestrator inspects actual diffs and runs authoritative final verification.
- [ ] Worker failures and partial completion cannot be reported as success.
- [ ] Risky or durability-heavy fixtures escalate before editing.
- [ ] Committed cases plus at least one observed primary-host smoke result validate output semantics; #13 owns Claude Code/Codex equivalence.
- [ ] OpenCode, Cursor, and Pi mappings document supported capabilities and degradation.
- [ ] The skill remains materially lighter than relay.

## Non-goals

- Tracker publication or sprint state mutation.
- Durable run manifests, crash recovery, worktree lifecycle, or PR/MR management.
- Mandatory worktrees, per-task reviewers, progress ledgers, or forced commits.
- A separate `delegated-work` skill.
- Replacing `delegate` transport or dev-relay lifecycle.


## Relay execution contract

### Dependencies

Blocked by #12. Reuse its capability vocabulary, status schema conventions, replay evidence format, and verifier. A feature-spec fixture may be used before #10 lands; full cross-skill behavior is verified in #13.

### Target files

- Create `skills/engineering/implement/SKILL.md`.
- Create `skills/engineering/implement/references/routing.md`.
- Create `skills/engineering/implement/references/worker-contract.md`.
- Create `skills/engineering/implement/references/host-mappings.md`.
- Create explicit-only metadata under `agents/openai.yaml` and Claude-compatible frontmatter.
- Add an Engineering category and this skill to `README.md`; update Repo Layout.
- Add cases/results under the #12 `evals/` contract.

### Pre-edit safety gate

Before mutation:

1. inspect repository instructions and the settled source artifact
2. inspect branch/worktree and `git status`
3. identify pre-existing user changes and never overwrite, stage, rollback, or attribute them to this run
4. define the mutable scope and authoritative verification commands
5. select an engine only after checking dependency and shared-state hazards

A dirty tree is not an automatic failure. Inline/serial work may proceed when the requested scope is disjoint and preservation is provable. If overlap or ownership is ambiguous, return `BLOCKED` or escalate to relay before editing.

### Worker and parallelism limits

- Default worker concurrency: 2.
- Hard maximum without a user override: 4.
- Shared-checkout parallel writers are allowed only when files and shared resources are disjoint.
- Shared types, schemas, migrations, generated files, lockfiles, build outputs, formatters, test fixtures, and environment singletons force serialization or isolated workspaces.
- Every worker receives mutable scope, frozen scope, expected output, and verification responsibility.
- The orchestrator owns integration; worker status text is never completion proof.

### Safety precedence

An explicit route selection is honored only while its safety assumptions remain true. Newly discovered overlap, destructive risk, missing authority, or required durable recovery overrides `implement`: stop before the unsafe mutation and return an escalation handoff. Do not silently continue through relay.

### Final output contract

```yaml
status: completed | completed_with_concerns | blocked | escalated
engine: none | inline | serial_workers | bounded_parallel | relay
source_artifact: <path, issue URL, or inline description>
files_changed: []
verification:
  - command: ""
    result: pass | fail | not_run
concerns: []
pre_existing_changes_preserved: true | false
handoff:
  route: null | relay
  reason: null | ""
  remaining_scope: []
```

`engine: none` is valid only for a pre-edit `blocked` result where no safe engine was selected. A successful status requires actual diff inspection and passing authoritative verification. `completed_with_concerns` cannot hide a failed required check.

### Review sizing

- Always perform orchestrator diff inspection.
- Add a fresh-context final review for multi-worker integration, cross-module/public-interface changes, or a diff whose interactions are not covered by deterministic verification.
- Security, destructive migration, deployment, data-loss, or mandatory PR/MR lifecycle cases escalate to relay before editing.

### Required replay cases

1. localized safe change -> inline
2. dependent units -> serial workers
3. independent isolated units -> bounded parallel with concurrency <= 2 by default
4. shared schema or lockfile -> serialize
5. dirty disjoint scope -> preserve existing changes and proceed safely
6. dirty overlapping scope -> block/escalate before editing
7. worker partial failure -> non-success final status
8. durability/high-risk request -> relay handoff before repository mutation
9. unavailable worker capability -> degrade to serial or inline
10. user-selected `implement` becomes unsafe -> explicit escalation, no silent relay invocation

### Observable completion criteria

- Every case records engine, status, mutation evidence, verification, and side effects.
- Forbidden-mutation assertions prove escalation cases did not edit the repository.
- `npm test` passes all schemas and committed cases.
- `npx skills add . --list --full-depth` discovers `implement`.
- At least one primary host executes the required local smoke cases; full Claude Code/Codex matrix and calibration close in #13.
- The skill creates no run manifest, worktree lifecycle, PR/MR lifecycle, or crash-recovery state.

### Authority boundary

The skill may edit the current repository within the authorized scope. It may commit only when explicitly authorized. It never pushes, opens/merges a PR/MR, mutates tracker state, or globally installs skills unless separately requested.


## Verification

```bash
npm test
npx skills add . --list --full-depth
```

The discovery output must include the new skill name and must not install or mutate global agent state.
