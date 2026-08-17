---
last_amended: 2026-08-17
revision: 1
---

# skills Charter

## Problem            <!-- Tier 1 · Direction (human-gated) -->
Portable agent skills rot in three ways: prompts bloat past quick comprehension, claimed behaviors go unverified against the hosts that actually run them, and routing guidance (which model and effort for which work) drifts from what live providers serve. <!-- src: inferred -->

## Approach           <!-- Tier 1 · Direction (human-gated) -->
Keep each skill a compact, self-contained `SKILL.md` with optional material in `references/`, and hold the collection to evidence discipline: behavioral and routing claims are backed by dated, append-only evidence from real host runs under `evals/`, with contracts verified by credential-free `npm test` and CI. <!-- src: inferred -->

## Non-Goals          <!-- Tier 1 · Direction (human-gated) -->
- Heavier workflow frameworks live in their own repos; this collection stays small drop-in skills.
- Improving the `spec-*` skills from inside this repo — findings are filed upstream, never here; this routing ambiguity caused the 2026-06/07 silent fork.
- A universal model leaderboard or live pricing/quota synchronization — the delegate evidence loop compares task-shaped profiles, nothing more (#33 non-goals).
- Paid provider calls in CI — the `verify` workflow stays credential-free; paid calls happen only in explicitly invoked bounded runs.

## Objectives         <!-- Tier 2 · Predicates (add/remove human-gated; status proof-gated) -->
- O1 [active] Every skill under `skills/<category>/<name>/` is discoverable by `npx skills add . --list --full-depth` and keeps its core workflow inside `SKILL.md`, with only optional material in `references/`. · src: inferred
- O2 [active] `npm test` verifies every committed evidence contract (semantic replay and delegate evaluation) without provider credentials, and CI runs it on every PR and push to main. · src: inferred
- O3 [active] Evidence under `evals/` is dated and append-only: contract migrations supersede via new dated documents and never rewrite or orphan existing ones. · src: inferred
- O4 [active] A delegate routing profile becomes a catalog default only through the promotion rule: at least two dated, all-checks-passing results from different observation dates with no unresolved contradiction. · src: inferred
- O5 [active] Each of the six delegate work shapes can produce a dated evaluation result from a reproducible fixture on a clean machine. · src: inferred

## Decisions          <!-- Tier 3 · History (immutable, append-only) -->

| date | decision | rationale | supersedes |
| --- | --- | --- | --- |
| 2026-07-04 | `spec-*` skill improvement findings are filed as craftkit issues, never here | The 2026-06/07 routing ambiguity caused a silent fork of the spec skills | — |
| 2026-07-21 | Credential-free `verify` CI runs `npm test` plus the cross-host matrix on every PR and push to main | A relay auto-recovery landed a PR missing evidence files while GitHub showed clean; green-with-failing-tests must be impossible | — |
| 2026-07-21 | replay-v1 is frozen as a digest-pinned legacy contract; supersession requires dual-host (Claude Code + Codex) dated evidence | Contract migrations must not rewrite or orphan collected evidence | — |
| 2026-07-22 | delegate-eval-v1: append-only dated results, an executor registry, privacy allowlists for internal/private fixtures, and paid calls only in explicitly invoked bounded runs | Routing claims need local evidence rather than vendor rankings, and CI must stay free | — |
| 2026-07-22 | Catalog promotion rule: at least two dated all-passing results from different observation dates before any profile becomes a shape default | Single observations and community reports were beginning to steer defaults | — |
