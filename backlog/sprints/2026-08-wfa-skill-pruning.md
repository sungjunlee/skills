---
milestone: wfa-skill-pruning
status: completed
started: 2026-08-19
due: TBD
objectives: [O1]
component: "skill-packaging"
---

# wfa-skill-pruning

## Goal
The five writing-for-agents findings from #107–#111 are landed: daily skills have the right invocation load, and each remaining meaning has one home plus a checkable bound.

## Plan

- [x] #107 gosu-review user-invoked packaging (~0.5h)
- [x] #108 gosu-review collapse contracts and add step bounds (~2h)
- [x] #109 delegate pointer, pre-launch bound, executable refs (~2h)
- [x] #110 planning step bounds and one-home sediment (~1.5h)
- [x] #111 implement relay/dirty-tree one-home and fresh-context bound (~1.5h)

## Running Context

- #107 must land before #108; they share `gosu-review/SKILL.md` and #107 forbids workflow edits.
- Operator routing document stays; #109 only names the absent-doc fallback.
- Do not merge `routing-guide.md` into `model-catalog.md` in #109.

## Progress

- 2026-08-19: sprint admitted from the #107–#111 bank. Starting #107.
- 2026-08-19: #107–#111 implemented locally. `npm test` passed. Shared human-decision token is `Unresolved human decisions`. Dirty-disjoint stays inline/serial only (`routing.md`).
- 2026-08-19: #111 already landed on main via #112; this PR keeps that implement contract and does not add `fresh_context_review`.
- 2026-08-19: PR #113 opened. Round-2 Opus/Sol both **ship**. Merge #113; bank partial-panel eval as follow-up.
- 2026-08-19: Sprint closed. 5/5 tasks completed.
