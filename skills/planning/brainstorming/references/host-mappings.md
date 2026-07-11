# Host mappings — brainstorming

`brainstorming` uses only two capabilities from the engine capability contract:

- `inline_repository_work` — read-only inspection of safely discoverable repository context. This skill never edits, commits, or pushes.
- `blocking_user_question` — pause for a material decision, then resume with the answer.

Evidence states are `native | emulated | unavailable | unverified`, defined in `docs/engine-capability-contract.md`. A state above `unverified` requires dated, observed evidence. Do not infer availability from prose or from unrelated global installations on the current machine. Unknown hosts and versions stay `unverified`.

## Capability mappings

| Host | Version | inline_repository_work | blocking_user_question | Evidence |
| --- | --- | --- | --- | --- |
| Claude Code | CLI 2.1.207 / claude-opus-4-8 | native | native | 2026-07-11 #13 isolated CLI replays for `bs.vague-feature` and `bs.clear-low-risk`; read-only inspection and the existing blocking-question smoke remain observed |
| Codex | codex-cli 0.144.1 / account default | native | unverified | 2026-07-11 #13 isolated CLI replays; repository inspection observed, no blocking question executed |
| OpenCode | 1.17.18 / opencode/big-pickle | native | unavailable | 2026-07-11 #13 `opencode run` replays inspected the fixture; non-interactive run exposed no blocking-question round trip |
| Cursor | CLI 2026.07.09-a3815c0 | unverified | unverified | Authenticated preflight succeeded, but replay startup failed before model execution with EPERM creating host project state |
| Pi | 0.80.6 | unverified | unverified | Installed preflight returned no available models because no provider authentication was configured |

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
