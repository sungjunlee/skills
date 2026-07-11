# Host mappings

Evidence states use the repository capability contract: `native`, `emulated`, `unavailable`, or `unverified`. A mapping changes mechanics only; the Feature Spec, persistence rules, and routing semantics remain identical.

| Host | Version | Explicit invocation | `inline_repository_work` | `blocking_user_question` | Evidence |
| --- | --- | --- | --- | --- | --- |
| Codex | GPT-5 | `agents/openai.yaml` disables implicit invocation | native | unverified | 2026-07-11 primary-host smoke: `evals/results/feature-spec/design-handoff.codex.json` |
| Claude Code | unverified | `disable-model-invocation: true` in `SKILL.md` | unverified | unverified | No committed host replay |
| OpenCode | unverified | unverified | unverified | unverified | No committed host replay |
| Cursor | unverified | unverified | unverified | unverified | No committed host replay |
| Pi | unverified | unverified | unverified | unverified | No committed host replay |

The Codex observation proves only repository inspection and response generation in the named smoke. It does not imply blocking-question, tracker, persistence, or successor availability. In unattended runs, record unresolved decisions rather than simulating a blocking question.
