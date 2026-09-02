# feature-spec successor-neutral contract

Date: 2026-09-02

Implements [#100](https://github.com/sungjunlee/skills/issues/100),
which applies the resolutions of
[#96](https://github.com/sungjunlee/skills/issues/96) and
[#98](https://github.com/sungjunlee/skills/issues/98).

`feature-spec` remains a specification compiler. It owns a completed spec
plus exactly one successor-neutral Execution, Decomposition, or Human
Decision handoff. It does not choose, detect, recommend, or invoke
`implement`, `relay`, `dev-backlog`, or another successor. An explicitly
supplied tool decision is preserved only as source intent.

The 2026-08-17 successor-vocabulary note still describes the earlier
contract, in which single-unit feature-spec routes named `implement` or
`relay`. This observation supersedes that execution-handoff rule for
current skill text. Committed replay-v1 cases and results that expect
`implement`, `relay`, `dev-backlog shape`, `shape unavailable`, or
`blocked-human-decision` stay byte-identical as historical evidence.

## Observation matrix

Five disposable local fixture repositories, same skill/case/fixture
revision `54967bfc8f733d7fe30a21c5fe31848bfa1791387c9767518c78df80d8dbda5e`,
Claude Code CLI 2.1.233 / claude-opus-5 and Codex CLI 0.146.0 / gpt-5.6-sol.

| Case | Claude Code | Codex |
| --- | --- | --- |
| `feature-spec.neutral-authorized-destination` | pass | pass |
| `feature-spec.neutral-durable-ambiguous-authority` | pass | pass |
| `feature-spec.neutral-short-lived-no-edit-authority` | pass | pass |
| `feature-spec.neutral-contract-contradiction` | pass | pass |
| `feature-spec.neutral-multi-leaf-decomposition` | pass | pass |

Ten dated results under `evals/results/feature-spec/v2/2026-09-02/` contain
zero `fail` and zero `unverified`. No result used a live tracker, an
external successor installation, or a named successor route.

## What each boundary proved

1. **Authorized destination.** Edit authority and
   `docs/specs/2026-09-02-coverage-summary.md` together produced that file
   with the completed spec and an Execution Handoff. Fixture HEAD was
   unchanged; `spec/` was untouched; no commit.
2. **Durable ambiguous authority.** Multi-session work with ambiguous
   authority returned the spec body plus a `docs/specs/YYYY-MM-DD-<slug>.md`
   suggested path. Fixture tracked tree unchanged; no write or commit.
3. **Short-lived without edit authority.** Response-only Execution
   handoff; fixture tracked tree unchanged; no write.
4. **Repository-contract contradiction.** Both hosts read
   `spec/capabilities.md` Capability `secret-storage` Hard Constraints,
   named that path and section, emitted a Human Decision Handoff, and left
   the contract unedited.
5. **Multi-leaf work.** Tool-neutral Decomposition Handoff with leaf
   boundaries, dependency edges, and shared acceptance criteria. No
   successor invocation, tracker mutation, or repository write.

Re-run a host observation with
`node scripts/run-feature-spec-replay.mjs --host <claude-code|codex> --case <id>`.
Raw host artifacts remain outside the repository.
