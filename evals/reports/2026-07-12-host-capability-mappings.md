# Host capability mappings — consolidated evidence (2026-07-12)

Dated per-skill capability evidence, relocated from the three Epic 8 skills'
`references/host-mappings.md` files (#26). The observations come from the #13
cross-host replay run (see
[`2026-07-11-epic-8-cross-host.md`](2026-07-11-epic-8-cross-host.md)) and the
#11 primary-host smoke set; every row is preserved verbatim from the skill
references it replaces.

Evidence states are `native | emulated | unavailable | unverified`, defined in
`docs/engine-capability-contract.md`. A state above `unverified` requires
dated, observed evidence; availability is never inferred from prose or from
unrelated global installations. Unknown hosts and versions stay `unverified`.
A mapping changes mechanics only — it never changes artifact contracts, status
vocabulary, verification meaning, routing semantics, or escalation boundaries.

## brainstorming

Uses read-only `inline_repository_work` and `blocking_user_question`.

| Host | Version | inline_repository_work | blocking_user_question | Evidence |
| --- | --- | --- | --- | --- |
| Claude Code | CLI 2.1.207 / claude-opus-4-8 | native | native | 2026-07-11 #13 `bs.vague-feature` two-phase replay: phase 1 (`--session-id`) emitted five material blocking questions and stopped; phase 2 (`--resume`, same session id) took the fixed answer sequence and settled the Design Handoff; read-only inspection also observed |
| Codex | codex-cli 0.144.1 / account default | native | native | 2026-07-12 #13 `bs.vague-feature` two-phase replay: phase 1 read the disposable repository, emitted five material blocking questions, and stopped without an artifact; phase 2 used `exec resume` on the exact persisted thread with the fixed answer sequence and settled the Design Handoff |
| OpenCode | 1.17.18 / opencode/big-pickle | native | unverified | 2026-07-11 #13 `bs.vague-feature` two-phase attempt (`opencode run` phase 1, `run -s <session>` phase 2): phase 1 returned a one-shot Design Handoff instead of stopping on real emitted questions, so no genuine blocking-question round trip was observed and the discovery row is recorded `fail`; that semantic mismatch does not prove the host capability unavailable |
| Cursor | CLI 2026.07.09-a3815c0 | unverified | unverified | Authenticated preflight succeeded, but replay startup failed before model execution with EPERM creating host project state |
| Pi | 0.80.6 | unverified | unverified | Installed preflight returned no available models because no provider authentication was configured |

Missing `inline_repository_work` only reduces the discoverable context the
skill can ground in; missing `blocking_user_question` yields the same Design
Handoff with unresolved material decisions recorded, never permission to guess
(the operative rule lives in the skill's `SKILL.md`). Successors are
recommended by name only; a successor is recorded available only when observed
on the active host — dev-backlog `shape` and a grill capability were not
implemented in the runtime at observation time.

## feature-spec

| Host | Version | Explicit invocation | inline_repository_work | blocking_user_question | Evidence |
| --- | --- | --- | --- | --- | --- |
| Codex | codex-cli 0.144.1 / account default | `agents/openai.yaml` disables implicit invocation | native | unverified | 2026-07-11 primary smoke plus #13 isolated CLI replays; no blocking question executed |
| Claude Code | CLI 2.1.207 / claude-opus-4-8 | `disable-model-invocation: true`; explicit path prompt observed | native | unverified | 2026-07-11 #13 three isolated CLI replays compiled settled artifacts without repository writes |
| OpenCode | 1.17.18 / opencode/big-pickle | emulated by explicit `SKILL.md` path prompt | native | unverified | 2026-07-11 #13 three isolated `opencode run` replays; no blocking-question case was executed, so capability availability remains unverified |
| Cursor | CLI 2026.07.09-a3815c0 | unverified | unverified | unverified | Authenticated preflight succeeded, but replay startup failed before model execution with EPERM creating host project state |
| Pi | 0.80.6 | unverified | unverified | unverified | Installed preflight returned no available models because no provider authentication was configured |

The observations prove only the named mechanics; they do not imply tracker,
persistence, or successor availability.

## implement

| Host | Version | inline repository work | fresh worker dispatch | bounded parallel dispatch | isolated workspace | worker messaging/status | authoritative verification | commit authority | Evidence |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Codex | codex-cli 0.144.1 / account default | native | native | native | emulated | native | native | unverified | 2026-07-11 primary smoke plus 2026-07-12 #13 replay: actual serial and bounded worker lifecycle, shared-checkout edits, orchestrator diff inspection, and host-run checks observed; the partial-failure replay dispatched base then consumer, inspected the base artifact before the dependent dispatch, and preserved the consumer's genuine required-check failure; isolation evidence remains limited to disjoint disposable unit workspaces |
| Claude Code | CLI 2.1.207 / claude-opus-4-8 | native | native | native | emulated | native | native | unverified | 2026-07-11 and 2026-07-12 #13 single-lineage disposable-host replays (sanitized env): real `Agent` lifecycle was observed for serial and bounded-parallel workers. The selected isolated replay composed two linked Git worktrees/branches from one clean baseline, started alpha then beta concurrently before either completed, observed both completions, inspected each leaf artifact/diff and local check, integrated alpha then beta without commits, inspected the parent diffs, and passed the authoritative check. The R2 shared-schema replay completed worker 1, inspected its schema/lock/consumer diff, then dispatched worker 2 and verified the integrated result; no commit was observed |
| OpenCode | 1.17.18 / opencode/big-pickle | native | unavailable | unavailable | unavailable | unavailable | native | unverified | 2026-07-11 #13 isolated `opencode run` replays exposed only inline read/write/shell tools; artifact worker labels without dispatch events were recorded as failures; fixture checks passed |
| Cursor | CLI 2026.07.09-a3815c0 | unverified | unverified | unverified | unverified | unverified | unverified | unverified | Authenticated headless preflight succeeded, but replay startup failed before model execution with EPERM creating host project state |
| Pi | 0.80.6 | unverified | unverified | unverified | unverified | unverified | unverified | unverified | Installed preflight returned no available models because no provider authentication was configured |

The operative degradation order (isolated bounded parallel → safe shared
checkout → serial → inline) lives in the skill's `references/routing.md`;
unsafe or unverified mechanics are skipped rather than pretended.
