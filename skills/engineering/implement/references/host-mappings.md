# Host mappings

Capability states are `native` (observed direct support), `emulated` (observed equivalent composition), `unavailable` (observed absence), and `unverified` (no current observation). A host mapping changes mechanics only; it never changes the engine/status invariants, worker reports, verification meaning, relay boundary, or final YAML.

| Host | Version | inline repository work | fresh worker dispatch | bounded parallel dispatch | isolated workspace | worker messaging/status | authoritative verification | commit authority | Evidence |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Codex | GPT-5 | native | native | native | emulated | native | native | unverified | 2026-07-11 ten-case primary-host smoke under `evals/results/implement/`; isolation used disjoint disposable unit workspaces |
| Claude Code | unverified | unverified | unverified | unverified | unverified | unverified | unverified | unverified | Owned by #13 |
| OpenCode | unverified | unverified | unverified | unverified | unverified | unverified | unverified | unverified | No observation |
| Cursor | unverified | unverified | unverified | unverified | unverified | unverified | unverified | unverified | No observation |
| Pi | unverified | unverified | unverified | unverified | unverified | unverified | unverified | unverified | No observation |

For every host, apply the degradation order from `routing.md`: isolated bounded parallel, safe shared-checkout bounded parallel, serial worker, then inline. Skip unsafe or unverified mechanics rather than pretending support. If no safe current-session engine exists, block before editing; if durability or isolation requires relay, return the handoff without invoking it.
