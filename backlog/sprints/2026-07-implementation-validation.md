---
milestone: Epic 8 - Implementation and validation
status: active
started: 2026-07-11
due: TBD
objectives: []
component: ""
---

# implementation-validation

## Goal
The repository can execute settled current-session work through a safe portable `implement` primitive and proves the complete workflow semantics on Claude Code and Codex.

## Plan

### Batch 1 — current-session implementation

- [ ] #11 implement: add portable current-session execution with relay escalation (~2 days; blocks #13)

### Batch 2 — cross-host integration gate

- [ ] #13 portability validation: run cross-host semantic replays after the core skills land (~2-3 days; starts only after #11 merges)

## Running Context

- #11 starts from the merged #9/#10 planning primitives and foundation; their directories, replay schemas, verifier, package metadata, and backlog state are frozen unless a concrete blocker is reported.
- `implement` must remain materially lighter than relay: no durable manifest, worktree lifecycle, crash recovery, PR/MR lifecycle, tracker mutation, push, or implicit relay invocation.
- `engine: none` is valid only for pre-edit `blocked`; relay escalation uses `engine: relay` and occurs before repository mutation.
- #11 commits all required cases plus one primary-host smoke set. #13 alone owns Claude Code/Codex equivalence and the complete matrix.
- #13 must record unavailable OpenCode/Cursor/Pi execution honestly as `unverified`, never infer support from documentation.

## Progress

- 2026-07-11 16:04: [actor:codex] Planning pipeline sprint closed after PRs #16, #19, and #20; implementation-validation sprint opened with #11 next.
