# Host mappings

Evidence states use the repository capability contract: `native`, `emulated`, `unavailable`, or `unverified`. A mapping changes mechanics only; the Feature Spec, persistence rules, and routing semantics remain identical.

| Host | Version | Explicit invocation | `inline_repository_work` | `blocking_user_question` | Evidence |
| --- | --- | --- | --- | --- | --- |
| Codex | codex-cli 0.144.1 / account default | `agents/openai.yaml` disables implicit invocation | native | unverified | 2026-07-11 primary smoke plus #13 isolated CLI replays; no blocking question executed |
| Claude Code | CLI 2.1.207 / claude-opus-4-8 | `disable-model-invocation: true`; explicit path prompt observed | native | unverified | 2026-07-11 #13 three isolated CLI replays compiled settled artifacts without repository writes |
| OpenCode | 1.17.18 / opencode/big-pickle | emulated by explicit `SKILL.md` path prompt | native | unverified | 2026-07-11 #13 three isolated `opencode run` replays; no blocking-question case was executed, so capability availability remains unverified |
| Cursor | CLI 2026.07.09-a3815c0 | unverified | unverified | unverified | Authenticated preflight succeeded, but replay startup failed before model execution with EPERM creating host project state |
| Pi | 0.80.6 | unverified | unverified | unverified | Installed preflight returned no available models because no provider authentication was configured |

The observations prove only the named mechanics. They do not imply tracker, persistence, or successor availability. In unattended runs, record unresolved decisions rather than simulating a blocking question.
