# Host mappings — brainstorming

`brainstorming` uses only two capabilities from the engine capability contract:

- `inline_repository_work` — read-only inspection of safely discoverable repository context. This skill never edits, commits, or pushes.
- `blocking_user_question` — pause for a material decision, then resume with the answer.

Evidence states are `native | emulated | unavailable | unverified`, defined in `docs/engine-capability-contract.md`. A state above `unverified` requires dated, observed evidence. Do not infer availability from prose or from unrelated global installations on the current machine. Unknown hosts and versions stay `unverified`.

## Capability mappings

| Host | Version | inline_repository_work | blocking_user_question | Evidence |
| --- | --- | --- | --- | --- |
| Claude Code | opus-4.8 | native | native | 2026-07-11 authored smoke for cases `bs.*` 1-4: read-only repo inspection and single blocking questions observed |
| Codex | — | unverified | unverified | Owned by #13 cross-host matrix |
| OpenCode | — | unverified | unverified | No observation |
| Cursor | — | unverified | unverified | No observation |
| Pi | — | unverified | unverified | No observation |

## Degradation

The blocking-question degradation rule lives in `SKILL.md` (Capabilities). It aligns with the engine capability contract: a missing blocking-question capability yields the same durable handoff, never permission to guess through the blocker. Missing `inline_repository_work` only reduces the discoverable context this skill can ground in; it does not change the Design Handoff contract or the successor rules.

## Successor availability

`brainstorming` recommends successors as text; it never invokes them. A successor is recorded as available only when observed on the active host, never inferred.

| Successor | Default state | Note |
| --- | --- | --- |
| `feature-spec` | recommended by name | Named as the next step; this skill asserts no host availability for it |
| dev-backlog `shape` | unverified | Not implemented in the current runtime; record literal `shape unavailable` unless actually observed |
| grill (adversarial) | unverified | Recommend only when a compatible grill capability is observed on the host; otherwise record it unavailable and stop |
| `implement` / relay | recommended by name | Named using task-specific evidence; execution ownership stays with that successor |
