# Host mappings

Capability states are `native` (observed direct support), `emulated` (observed equivalent composition), `unavailable` (observed absence), and `unverified` (no current observation). A host mapping changes mechanics only; it never changes the engine/status invariants, worker reports, verification meaning, relay boundary, or final YAML.

| Host | Version | inline repository work | fresh worker dispatch | bounded parallel dispatch | isolated workspace | worker messaging/status | authoritative verification | commit authority | Evidence |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Codex | codex-cli 0.144.1 / account default | native | native | native | emulated | native | native | unverified | 2026-07-11 primary smoke plus #13 isolated CLI replays: actual serial and bounded worker lifecycle, shared-checkout edits, orchestrator diff inspection, and host-run checks observed; isolation evidence remains limited to disjoint disposable unit workspaces |
| Claude Code | CLI 2.1.207 / claude-opus-4-8 | native | native | native | unavailable | native | native | unverified | 2026-07-11 #13 disposable-workspace replay: explicit `Agent` dispatch, bounded two-worker execution in a provably disjoint shared checkout, lifecycle collection, repository edits, and host-run checks observed; no worker-isolated checkout or commit observed |
| OpenCode | 1.17.18 / opencode/big-pickle | native | unavailable | unavailable | unavailable | unavailable | native | unverified | 2026-07-11 #13 isolated `opencode run` replays exposed only inline read/write/shell tools; artifact worker labels without dispatch events were recorded as failures; fixture checks passed |
| Cursor | CLI 2026.07.09-a3815c0 | unverified | unverified | unverified | unverified | unverified | unverified | unverified | Authenticated headless preflight succeeded, but replay startup failed before model execution with EPERM creating host project state |
| Pi | 0.80.6 | unverified | unverified | unverified | unverified | unverified | unverified | unverified | Installed preflight returned no available models because no provider authentication was configured |

For every host, apply the degradation order from `routing.md`: isolated bounded parallel, safe shared-checkout bounded parallel, serial worker, then inline. Skip unsafe or unverified mechanics rather than pretending support. If no safe current-session engine exists, block before editing; if durability or isolation requires relay, return the handoff without invoking it.
