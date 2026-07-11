---
milestone: Epic 8 - Planning pipeline
status: completed
started: 2026-07-11
due: TBD
objectives: []
component: ""
---

# planning-pipeline

## Goal
The repository can turn vague intent into a portable Design Handoff and tracker-neutral Feature Spec on top of a verified shared replay foundation.

## Plan

### Batch 1 — shared foundation

- [x] #12 portability foundation: define the engine capability contract and replay harness (~1-2 days; blocks #9 and #10) → PR #16 (merged)

### Batch 2 — planning primitives

- [x] #9 brainstorming: add a thin explicit-only Design Handoff primitive (~1 day) → PR #19 (merged)
- [x] #10 feature-spec: compile settled design into tracker-neutral implementation intent (~1 day) → PR #20 (merged)

## Running Context

- PR #7 merged as baseline commit `e30ab09`; new work starts from updated `origin/main`.
- dev-backlog #270 direction is accepted only for a future single configured `github | local` tracker boundary. The current runtime remains GitHub-only.
- `dev-backlog shape` is not implemented. #10 must emit a tracker-neutral decomposition handoff and record `shape unavailable` unless the capability is actually observed.
- Consumer issues add committed cases and focused host smoke evidence. #13 remains the authority for the complete Claude Code/Codex cross-host matrix.
- #9 and #10 use isolated branches. Because both touch README and eval surfaces, merge one first and rebase the other before final review.
- Replay discovery must infer case/result kinds from containment under recursive `evals/cases/` and `evals/results/` trees, not only immediate parent names or filename prefixes.
- In parallel relay batches that both edit README, merge one PR first, then rebase the remaining branch only after its review-fix commits are complete; re-dispatch from `changes_requested` restores the canonical remote branch and can supersede an early local rebase.

## Progress

- 2026-07-11 14:55: [actor:codex] Epic #8 reviewed; PR #7 merged; milestones, labels, task mirrors, and this active sprint created. #12 is next.
- 2026-07-11 15:04: [actor:codex] #12 dispatched through relay with delayed publication; run `issue-12-20260711060421727-70124bfe` is in flight on `issue-12-portability-foundation`.
- 2026-07-11 15:23: [actor:codex] #12 → PR #16 → reviewed (LGTM, round 3) → merged; nested replay document inference was fixed before publication.
- 2026-07-11 15:29: [actor:codex] #9 and #10 dispatched in parallel from merged #12 foundation with isolated branches and delayed publication.
- 2026-07-11 16:02: [actor:codex] #9 → PR #19 (LGTM, round 2) and #10 → PR #20 (LGTM, round 4) merged; Planning pipeline complete.
- 2026-07-11: Sprint closed. 3/3 tasks completed.
