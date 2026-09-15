# Astra evidence status — 2026-09-15 (issue #124 refresh gate)

Issue #124 asked for a post-launch refresh of the `delegate` GPT-6 Astra
guidance using mature external evidence plus #123's repeated local
Astra-versus-Sol runs. This stub records the local evidence state as of
2026-09-15 so the catalog is not refreshed on launch-window claims alone.

## Committed local evidence

committed_gpt-6-astra_results: 0

No committed result under `evals/delegate/results/` uses model
`gpt-6-astra` on any observation date. The `astra-medium` candidate
profile exists in `cases/review.cross-family-diff.json` (added with the
Astra entry in PRs #121/#122) but #123 has not yet landed runs for it.

## Decision

- The `gpt-6-astra` row in `skills/productivity/delegate/references/model-catalog.md`
  keeps its launch-window wording; nothing in it is promoted to the
  Evidence-backed defaults list.
- The Astra `low`/`medium` versus Sol `medium` boundary stays explicitly
  unevidenced locally. Catalog cost-shape claims (including the
  output-token ratio) remain vendor/launch-sourced until #123 results
  are committed and re-checked against them.
- Muse Spark 1.3 and all other model entries are untouched.

## Gate

`scripts/verify-delegate-evals.mjs` cross-checks the
`committed_gpt-6-astra_results` count above against the committed
results on disk. When #123 lands Astra runs, this stub must be updated
in the same change (or replaced by a full promotion-style report), and
the #124 catalog refresh becomes unblocked.
