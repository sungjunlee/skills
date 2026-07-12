---
milestone: Epic 8 - Skill pruning
status: active
started: 2026-07-12
due: TBD
objectives: []
component: ""
---

# epic8-skill-pruning

## Goal
The three Epic 8 skills read as simple, single-source skills: validation evidence lives under `evals/reports/`, every rule has one home per skill, and descriptions are one-line human-facing summaries — with zero semantic change to routes, statuses, or artifacts.

## Plan

### Batch 1 — text-only pruning (one session, ordered)

- [~] #26 skills: move host-mapping replay evidence out of skill references (~1h; do first — removes the files #27 would otherwise dedupe) [branch:epic8-pruning-pass] → PR #30 (review)
- [~] #27 skills: collapse duplicated invariants and prune no-op prohibitions (~1h; after #26) [branch:epic8-pruning-pass] → PR #30 (review)
- [~] #28 skills: trim user-invoked skill descriptions to one-line summaries (~15m) [branch:epic8-pruning-pass] → PR #30 (review)

Deferred, not in this sprint: #29 (engine-enum change) needs a fresh Claude Code/Codex replay pass because it invalidates dated evidence; see the issue for sequencing.

## Running Context

- Single source of truth is scoped per skill: cross-skill repetition (e.g. `shape unavailable` in brainstorming and feature-spec) stays because each skill installs independently; `SKILL.md` must never point outside its own skill directory.
- The `shape unavailable` protocol and the current `engine: relay` escalation encoding are recorded architecture decisions (`_context.md`); this sprint prunes prose only and must not alter them.
- `npm test` plus `node scripts/verify-cross-host-matrix.mjs` are the authoritative checks; the verifier never compares prose, so text-only pruning cannot break replay results.

## Progress

- 2026-07-12 13:45: [actor:claude] #26-#28 implemented on branch `epic8-pruning-pass` and published as PR #30 (Fixes #26/#27/#28). All ACs verified: npm test (101 replay docs), cross-host matrix verifier (60 rows), full-depth skill discovery, no dangling host-mappings references. SKILL.md word counts 515/376/639 → 452/335/584; ~1,150 words of evidence moved to `evals/reports/2026-07-12-host-capability-mappings.md`. Awaiting review/merge.
- 2026-07-12 13:40: [actor:claude] Sprint opened from the writing-great-skills review; issues #26-#29 filed, #29 deferred pending re-replay.
