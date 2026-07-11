---
id: SKILL-12
title: 'portability foundation: define the engine capability contract and replay harness'
status: Done
labels:
  - type: foundation
priority: medium
milestone: Epic 8 - Planning pipeline
created_date: '2026-07-11'
---
## Description
Parent epic: https://github.com/sungjunlee/skills/issues/8

## Context

The repository is adding three engine-agnostic skills: `brainstorming`, `feature-spec`, and `implement`. They need one maintainer-level capability vocabulary and one replay evidence format before each skill invents its own Claude Code, Codex, OpenCode, Cursor, or Pi assumptions.

This issue is the **foundation only**. It defines the contract, repository layout, schemas, and zero-dependency verification harness. It does not claim that unfinished skills pass cross-host replays; that validation belongs to a follow-up issue after #9, #10, and #11 land.

## Goal

Create the smallest shared portability foundation that lets each self-contained skill keep a provider-neutral spine while recording host mappings and semantic replay evidence consistently.

## Canonical repository layout

The repository requires `skills/<category>/<skill-name>/`; do not use a flat `skills/<name>/` layout.

```text
docs/
  engine-capability-contract.md
evals/
  README.md
  schema/
    replay-case.schema.json
    replay-result.schema.json
  cases/
    # committed semantic fixtures, added by consumer skill issues
  results/
    # committed compact evidence summaries; no secrets or raw transcripts
scripts/
  verify-replays.mjs
package.json
skills/
  planning/
    brainstorming/
      SKILL.md
      references/
        host-mappings.md
  planning/
    feature-spec/
      SKILL.md
      references/
        host-mappings.md
  engineering/
    implement/
      SKILL.md
      references/
        host-mappings.md
```

`docs/engine-capability-contract.md` is maintainer guidance, not a runtime dependency. Each skill remains understandable from its own `SKILL.md` and loads only its relevant reference material.

## Capability vocabulary

Define at least:

- inline repository inspection and editing
- blocking user question
- fresh-context worker dispatch
- bounded parallel dispatch
- isolated workspace
- worker messaging and status collection
- external executor transport
- durable task state
- authoritative verification
- commit and publish authority

For every capability, host mappings distinguish `native`, `emulated`, `unavailable`, and `unverified`. Do not rank hosts globally.

## Predictable degradation

The shared default for implementation capabilities is:

```text
isolated bounded parallel
  -> safe bounded parallel in a shared checkout
  -> serial worker
  -> inline
```

A consumer skill may skip an unsafe level. Missing capabilities must not change artifact schemas, worker statuses, verification meaning, or escalation semantics.

## Replay contract

A replay case records:

- `case_id`
- `skill`
- `input_fixture`
- required output fields
- expected route or engine
- allowed question-count range when applicable
- expected escalation
- semantic assertions
- forbidden side effects

A replay result records:

- `case_id`
- `host`
- `host_version`
- `skill_revision`
- `status`: `pass | fail | unverified`
- assertion results
- observed route/engine
- question count
- side effects
- evidence note

The verifier checks schema and semantic assertions. It must not compare exact prose or require raw model transcripts.

## Target files

- Create `docs/engine-capability-contract.md`.
- Create `evals/README.md`.
- Create the two JSON schemas under `evals/schema/`.
- Create zero-dependency `scripts/verify-replays.mjs`.
- Create a minimal `package.json` exposing `npm test` or `npm run verify`.
- Update `README.md` with the category layout, `npx skills` installation path, and maintainer verification command.
- Do not create #9-#11 skill folders in this issue.

## Acceptance criteria

- [x] Repository paths follow `skills/<category>/<skill-name>/`.
- [x] The capability vocabulary and degradation rules are documented once at maintainer level.
- [x] Replay case and result schemas reject missing required semantic fields.
- [x] `scripts/verify-replays.mjs` returns non-zero for invalid fixtures/results and zero for valid examples.
- [x] At least one valid and one intentionally invalid schema fixture exercise the verifier.
- [x] `npm test` or `npm run verify` runs the zero-dependency verifier successfully.
- [x] README documents the actual nested-skill `npx skills add ... --full-depth` discovery/install requirement where applicable.
- [x] No runtime skill depends on reading `docs/`.
- [x] No host is marked supported without observed evidence; unknown behavior is `unverified`.

## Verification

```bash
npm test
npx skills add . --list --full-depth
```

The list command must discover the existing `delegate` and `gosu-review` skills and remain ready to discover the three new categorized skills when they land.

## Dependencies and sequencing

- This issue lands before #9, #10, and #11.
- #9-#11 add their own cases and host mappings using this contract.
- A separate integration issue runs and records the full cross-host matrix after #9-#11 land.

## Non-goals

- Implementing `brainstorming`, `feature-spec`, or `implement`.
- Running the final cross-host matrix.
- Building a universal agent API or orchestration library.
- Requiring identical capabilities across hosts.
- Adding a top-level `references/` directory.
- Storing raw transcripts, credentials, or machine-specific paths.
