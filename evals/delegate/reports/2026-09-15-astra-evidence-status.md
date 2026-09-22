# Astra evidence status — 2026-09-15 observations (updated 2026-09-21)

Issue #124 asked for a post-launch refresh of the `delegate` GPT-6 Astra
guidance using mature external evidence plus #123's repeated local
Astra-versus-Sol runs. This report reconciles the committed September 15
observations after their landing; it does not perform the later external
refresh or promote a model default.

## Committed local evidence

committed_gpt-6-astra_results: 2

Both records use `astra-medium` on `delegate.review.cross-family-diff`
and have observation date 2026-09-15:

- [Initial dispatch](../results/2026-09-15/delegate.review.cross-family-diff.astra-medium.json):
  failed before generation because Codex 0.146.0 rejected the model with HTTP
  400. No review was produced and all acceptance checks are `not_run`.
  This is dispatch-reliability evidence, not a capability result.
- [Later dispatch](../results/2026-09-15/delegate.review.cross-family-diff.astra-medium.2026-09-15T14-23-44.json):
  completed on Codex 0.154.0; all three acceptance checks passed. The original
  failed record remains unchanged. The successful run took 44 seconds and
  reported an unsplit token total; input/output/reasoning and API cost remain
  unknown in the curated schema.

Two committed records therefore mean one completed capability observation
on one UTC date, not the two dated observations required by #123. The fixture
is Sol-authored, so the completed run measures seeded-defect recall and
cannot establish a cross-family review default.

## Decision

- No catalog wording or Evidence-backed default is promoted by this update.
- The Astra `low`/`medium` versus Sol `medium` boundary remains unevidenced by
  these records: #123's current lane compares Astra `medium` with Sol `high`,
  not Sol `medium`, and contains no Astra `low` observation.
- The reported wall time and unsplit tokens do not establish completed-task
  API cost or an output-token ratio.
- Muse Spark 1.3 and all other model entries are untouched.

## Gate

`scripts/verify-delegate-evals.mjs` cross-checks the
`committed_gpt-6-astra_results` count above against all committed Astra result
records on disk, including failed dispatches. Update this report whenever
another Astra result lands; a count match alone does not satisfy a promotion
gate.

As observed at 2026-09-21T19:35:10+09:00, [issue #123](https://github.com/sungjunlee/skills/issues/123)
and [issue #124](https://github.com/sungjunlee/skills/issues/124) are closed, but
the available records still cover only one UTC date. The second-date
requirement in #123 and #124's external-evidence review after 2026-10-05 remain
separate evidence conditions; this metadata correction does not claim either
is complete.
