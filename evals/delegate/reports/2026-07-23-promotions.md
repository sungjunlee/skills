# Delegate routing evaluation report — 2026-07-23 promotion decisions

Eight date-securing runs dispatched 00:01–00:09 UTC on 2026-07-23 gave every
active pair a second observation date. This report applies the catalog
promotion rule (two dated all-checks-passing results from different
observation dates, no unresolved contradiction) to the full evidence base:
20 results across 2026-07-22 and 2026-07-23.

## Promoted (evidence-backed defaults)

| Work shape | Default | Evidence | Note |
|---|---|---|---|
| ambiguous_feature | **terra-high** | 2/2 all-pass across both dates | Matched luna-xhigh's quality on both dates at lower latency and tokens (75s/38.8k and 91s/39.5k versus 153s/67.2k and 115s/58.6k) — the community Luna-over-Terra claim did not survive local evidence. luna-xhigh also satisfies the rule and stays a valid alternative. |
| high_blast_radius_analysis | **sol-high** | 3/3 all-pass across both dates | Matched sol-xhigh on every rubric in all three paired observations at a consistently lower token count (30.4k/21.4k/23.4k versus 33.2k/41.4k/34.9k). sol-xhigh also satisfies the rule; keep it for runs where register depth is the deliverable — its first observation was materially richer. |
| independent_cross_family_review | **fable-high** | 3/3 all-pass across both dates | Reports improved run over run (the second and third caught the legacy-cursor break the first missed); zero incorrect claims in any run. |

## Not promoted

- **mechanical_with_tests** — grok-medium is 1 pass / 2 fail and grok-high
  2 pass / 1 fail on the display-label trap across three observations each.
  Both carry unresolved contradictions; the trend now leans toward grok-high
  but variance is the dominant signal. No default until a profile clears the
  rule cleanly.
- **review × grok-high** — two strong passes (legacy-cursor caught 2/2),
  then an empty-output run on 2026-07-23: the executor explored the empty
  workspace and emitted no report (recorded as failed, no auto-retry). A
  reliability contradiction, not a capability one; needs a clean second date.
- **long_horizon_autonomous** — no observations yet (fixture now exists via
  the #41 generator; first run is a cost decision).

## Method notes

- Same fixtures on both dates: generator-built repos for mechanical and
  ambiguous, the identical embedded diff for review, the same prompt and
  seeded empty directories for blastradius.
- The empty grok-high review run consumed quota and is counted as evidence;
  the no-auto-retry rule kept it a single honest failure.
- All measurements remain subscription-quota routed (`api_usd` null); codex
  totals stay unsplit in `quota_note`.
