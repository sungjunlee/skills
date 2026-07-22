# Delegate routing evaluation report — 2026-07-22 second observations

Eight further runs, dispatched 22:49–22:58 UTC on 2026-07-22 (local 2026-07-23
morning). The runner stamps UTC, so these are **intra-date repeats**: they add
observations but not a second observation *date*, and therefore nothing in
this report can promote a catalog default yet. Evidence files carry timestamp
suffixes in `evals/delegate/results/2026-07-22/`; the first-observation files
are untouched.

## Headline: the mechanical label trap inverted

| Observation | grok-medium | grok-high |
|---|---|---|
| First (14:07–14:14 UTC) | 3/3 pass, kept the label, 187s | 2/3 fail — changed the label, rewrote the assertion, 374s |
| Second (22:49–22:50 UTC) | 2/3 **fail** — changed the label, rewrote the assertion, 52s | 3/3 **pass** — kept the label, 39s |

The display-label trap outcome is **per-run variance, not a profile
property** — each profile fell in exactly once, on identical generator-built
terrain. The first report's "grok-medium dominated this cell" reading is now
noise; wall clock also swung ~5-10x between sessions on the same route. This
is precisely the single-observation failure mode the promotion rule exists to
filter, demonstrated in the evidence rather than argued.

## First observation for ambiguous_feature — Luna xhigh vs Terra high

Both profiles passed every check from the deterministic dashboard fixture:
both localized the exact invalidation gap (ruling out the edge-cache red
herring), shipped near-identical proportionate fixes, and produced regression
tests that grader-verified red on the pristine fixture and green after.

| Profile | Acceptance | Wall clock | Reported tokens (unsplit) |
|---|---|---|---|
| luna-xhigh | 3/3 pass | 153s | 67,156 |
| terra-high | 3/3 pass | 75s | 38,847 |

On this observation **terra-high matched luna-xhigh at half the latency and
58% of the tokens** — evidence against the community claim (Luna xhigh over
Terra high on ambiguous everyday work) this pairing was designed to test.
Luna's only edge: a marginally more thorough two-session regression test.

## blastradius — parity, unlike the first observation

Both sol profiles passed all rubrics again. But where the first observation
read "xhigh materially richer for modest extra cost," the second reads
**parity with different emphases** (high: conformance-corpus golden cases,
break-glass policy; xhigh: authorization leases, grant-manifest reporting) at
+54% wall clock and +94% tokens for xhigh. The xhigh premium is not yet a
stable property either.

## review — the one axis showing cross-date consistency

- grok-high caught the legacy-cursor deploy break in **both** observations
  (2/2) alongside all seeded defects.
- fable-high improved: its second report caught the legacy-cursor issue it
  had missed in the first, in 69s versus 113s.
- Neither reviewer produced an incorrect claim in any of the four runs.

## Reading these numbers

- Same UTC observation date throughout — the promotion rule's
  different-dates requirement is still unmet for every pair. A small
  date-securing batch after 00:00 UTC is the cheapest way to close that gap.
- Repeat observations changed conclusions twice (mechanical reversal,
  blastradius parity). Treat any single-run comparison in these reports as a
  hypothesis, never a default.
- All runs remain subscription-quota routed; `api_usd` is null everywhere,
  and codex token totals stay unsplit in `quota_note`.
