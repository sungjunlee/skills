---
id: SKILL-13
title: 'portability validation: run cross-host semantic replays after the core skills land'
status: Done
labels:
  - type: validation
priority: medium
milestone: Epic 8 - Implementation and validation
created_date: '2026-07-11'
---
## Description
Parent epic: https://github.com/sungjunlee/skills/issues/8

## Context

Issue #12 defines the shared capability vocabulary, replay schemas, and verifier. Issues #9, #10, and #11 implement the three portable skills and contribute their semantic cases.

This issue is the final integration gate. It must not begin until #9-#12 are complete. Its job is to run the same committed cases across supported hosts, record compact evidence, and calibrate routing without changing the ownership model.

## Goal

Demonstrate that `brainstorming`, `feature-spec`, and `implement` preserve artifact, routing, verification, status, and escalation semantics across agent engines.

Claude Code and Codex are required execution hosts. OpenCode, Cursor, and Pi must have complete mappings; run them where locally available and record unavailable behavior as `unverified`, never as a pass.

## Required cases

1. vague feature discovery -> Design Handoff
2. clear small request -> short brainstorming pass without redundant questions
3. settled Design Handoff -> feature spec
4. complete tracker task -> feature spec without reopening settled decisions
5. feature requiring decomposition -> tracker-neutral decomposition handoff plus an observed `shape` recommendation or `shape unavailable`
6. localized implementation -> inline
7. dependent implementation units -> serial workers
8. safely independent units -> bounded parallel
9. shared schema/lockfile risk -> serialize rather than parallelize
10. durability/high-risk request -> relay escalation before editing
11. missing worker capability -> predictable degradation
12. worker partial failure -> non-success final status

## Evidence requirements

For each required host/case pair, commit a compact result conforming to #12's schema. Results include versions, skill revision, assertion outcomes, observed route, question count, side effects, and a short evidence note.

Do not commit raw transcripts, secrets, absolute user paths, or large generated logs. A dated summary under `evals/reports/` may aggregate results and explain known limitations.

## Semantic pass rules

- Required artifact fields are present.
- Expected route/engine matches.
- Question count stays within the case's declared range.
- Forbidden mutations do not occur.
- Worker and final statuses use the defined enum.
- Verification evidence is present when implementation completes.
- Relay escalation occurs before repository mutation in escalation cases.
- Exact prose differences do not fail a case.
- An unexecuted host is `unverified`, not `pass`.

## Acceptance criteria

- [x] #9, #10, #11, and #12 are complete before execution begins.
- [x] Claude Code and Codex pass every required case.
- [x] OpenCode, Cursor, and Pi have complete mappings and honest `pass | fail | unverified` results.
- [x] `npm test` or `npm run verify` validates all committed replay results.
- [x] No required case has a missing result for Claude Code or Codex.
- [x] Failures cause either a narrowly scoped fix in the owning skill or a linked follow-up; they are not waived by prose.
- [x] The report identifies any routing threshold that changed during calibration.
- [x] Final behavior remains within the ownership boundaries in epic #8.

## Verification

```bash
npm test
npx skills add . --list --full-depth
```

Also run the host invocation procedure documented by #12 for every available required host.

## Non-goals

- Adding another skill.
- Changing dev-backlog or dev-relay lifecycle.
- Claiming feature parity between hosts.
- Treating documentation review as runtime evidence.
- Optimizing exact wording across models.
