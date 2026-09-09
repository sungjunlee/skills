# gosu-review cross-examination fallback observation

Issue #72 required the fresh-subagent cross-examination path
and the panel depth counters to be observed off Claude Code's
resume-only record. Issue #92 set the dual-route gate: resume on
Claude Code, equivalent-context fresh dispatch on Codex, with a
Round-two trace rather than an aggregate dispatch count.

## What landed

The case `gosu-review.cross-examined-tension` now carries a
`round_two_contract`. Passing evidence must preserve route identity
(`resume` or `fresh`), both sides' delivery/reread/new-anchor/
`hold|concede|refine`/resolved-fix, tension derivation, and extra-round
count. A non-conflicting first panel cannot pass. Host or tool failure
is `unverified`. Orchestrator-invented resolution, missing reread or
new anchor, or a second extra round fails. Verifier smoke fixtures
cover those bounds.

`references/cross-examine.md` states the fresh brief (persona, original
Context, both positions, return shape) and records the route in Meta.
Skill semantics are unchanged.

## 2026-09-08 observations

Same fixture: `evals/fixtures/gosu-review/same-element-conflict/LAYOUT.md`.

- Claude Code (`CLI 2.1.263 / claude-opus-5[1m]`): five panel Agent
  calls, then resume attempted (`ListAgents` / `SendMessage`) and
  unavailable. Two fresh Explore agents carried persona, original
  Context, and both positions. Both refined on a new `LAYOUT.md:23-30`
  anchor. The `evals/` add-versus-delete conflict resolved to delete.
  Recorded as `gosu-review.cross-examined-tension` (fresh route) and
  `gosu-review.evidence-anchored-panel` (20 anchored findings).
- Codex (`codex-cli 0.146.0 / gpt-5.6-sol`): `codex exec` failed
  immediately on ChatGPT usage limit (retry 2026-09-15 10:56). No
  `collaboration.spawn_agent` events. Recorded `unverified` for both
  cases. Depth counters remain uncounted on Codex.

The Claude Code run is evidence of the fresh fallback, including the
resume-unavailable branch the skill describes. It is not Codex evidence
and does not claim resume/fresh semantic equivalence across hosts.
