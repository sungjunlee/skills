---
milestone: Epic 8 - Planning pipeline
status: active
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

- [~] #12 portability foundation: define the engine capability contract and replay harness (~1-2 days; blocks #9 and #10) [branch:issue-12-portability-foundation] [run:issue-12-20260711060421727-70124bfe]

### Batch 2 — planning primitives

- [ ] #9 brainstorming: add a thin explicit-only Design Handoff primitive (~1 day; may dispatch in parallel with #10 after #12)
- [ ] #10 feature-spec: compile settled design into tracker-neutral implementation intent (~1 day; may dispatch in parallel with #9 after #12)

## Running Context

- PR #7 merged as baseline commit `e30ab09`; new work starts from updated `origin/main`.
- dev-backlog #270 direction is accepted only for a future single configured `github | local` tracker boundary. The current runtime remains GitHub-only.
- `dev-backlog shape` is not implemented. #10 must emit a tracker-neutral decomposition handoff and record `shape unavailable` unless the capability is actually observed.
- Consumer issues add committed cases and focused host smoke evidence. #13 remains the authority for the complete Claude Code/Codex cross-host matrix.
- #9 and #10 use isolated branches. Because both touch README and eval surfaces, merge one first and rebase the other before final review.

## Progress

- 2026-07-11 14:55: [actor:codex] Epic #8 reviewed; PR #7 merged; milestones, labels, task mirrors, and this active sprint created. #12 is next.
- 2026-07-11 15:04: [actor:codex] #12 dispatched through relay with delayed publication; run `issue-12-20260711060421727-70124bfe` is in flight on `issue-12-portability-foundation`.
