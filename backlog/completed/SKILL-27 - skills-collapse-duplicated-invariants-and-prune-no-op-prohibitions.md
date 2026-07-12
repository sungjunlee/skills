---
id: SKILL-27
title: 'skills: collapse duplicated invariants and prune no-op prohibitions'
status: Done
labels:
  - type: skill
priority: medium
milestone: Epic 8 - Skill pruning
created_date: '2026-07-12'
---
## Description
Parent epic: https://github.com/sungjunlee/skills/issues/8
Origin: writing-great-skills review of the Epic 8 skills (2026-07-12).

## Context

Several invariants are restated many times within a single skill, inflating maintenance cost and token load without adding behavior:

- brainstorming states "recommend, never invoke" three times inside `SKILL.md` alone (intro, step 6, routing section), plus again in `references/routing.md`.
- implement states the `status: escalated` + `engine: relay` + `handoff.route: relay` combination twice in `SKILL.md` (step 2 and the post-YAML warning paragraph), and "never invoke relay" three times across `SKILL.md`/`routing.md`.
- Worker concurrency caps (default 2, max 4) appear in both `references/routing.md` and `references/worker-contract.md`.
- feature-spec `references/routing.md` restates the no-invoke/no-tracker rules its `SKILL.md` steps already own.
- The Authority and worker prohibition lists include no-ops ("deploy, install skills globally, publish externally or send external messages") that fail the writing-great-skills no-op test.

Scope note: single source of truth is per skill — cross-skill repetition (e.g. `shape unavailable` in both brainstorming and feature-spec) stays, because each skill installs independently. The `shape unavailable` protocol itself is a recorded architecture decision and is not up for removal here.

## Goal

Each rule has exactly one home inside its skill; prohibition lists keep only entries that change behavior.

## Acceptance criteria

- [x] "Recommend, never invoke" (and its tracker-mutation twin) is stated once per skill; worked-example files illustrate without restating rules.
- [x] The escalated/relay field combination is stated once in implement's `SKILL.md`; the post-YAML warning paragraph is gone.
- [x] Worker concurrency caps live only in `worker-contract.md`.
- [x] Authority and dispatch-packet prohibition lists are pruned to behavior-changing entries (scope, commit/push/PR, tracker mutation).
- [x] No semantic change: routes, statuses, artifacts, and escalation rules are untouched.
- [x] `npm test` passes.
