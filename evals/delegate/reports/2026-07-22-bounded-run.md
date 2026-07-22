# Delegate routing evaluation report — 2026-07-22 bounded run

First dated evidence from the delegate-eval-v1 loop (issue #33). Six runs across
three work shapes, one observation per (case, profile) cell, all on 2026-07-22,
one machine, subscription-quota routes. Evidence files:
`evals/delegate/results/2026-07-22/`. This report interprets; it never restates
evidence differently than the result files record it.

## mechanical_with_tests — Grok medium vs high

| Profile | Acceptance | Wall clock | Defects (independent review) | Follow-up |
|---|---|---|---|---|
| grok-medium | 3/3 pass | 187s | 0 | 0 |
| grok-high | 2/3 (rename-only-diff fail) | 374s | 1 | 1 |

**Pareto candidate: `grok-medium`** — it dominated this cell: equal-or-better on
every quality signal at half the latency on the same route. The interesting part
is *how* high lost: it renamed the public display label ("Shipped" →
"Dispatched") and rewrote the guarding test assertion, so the suite stayed green
while observable behavior changed. On strong-test mechanical terrain, the extra
effort budget produced scope creep, not quality. This matches — and sharpens —
the catalog hint that medium suffices where tests catch every mistake.

## high_blast_radius_analysis — Sol high vs xhigh

| Profile | Acceptance | Wall clock | Reported tokens (unsplit) |
|---|---|---|---|
| sol-high | 3/3 pass | 188s | 30,400 |
| sol-xhigh | 3/3 pass | 251s | 33,215 |

**Both stay on the Pareto frontier.** Both memos passed every rubric; xhigh's
risk register was materially richer (five-way drift-mismatch taxonomy,
decision-versus-enforcement audit reconciliation, cohort-canary rollback
strategy) for +34% wall clock and +9% reported tokens. When the register *is*
the deliverable, xhigh bought real depth cheaply; when an adequate register
unblocks a decision, high is the value pick. The pairing question — does broader
exploration surface materially more risk — resolved to **yes** in this
observation.

## independent_cross_family_review — Fable high vs Grok high

| Profile | Seeded defects | Extra genuine finds | Non-defect noise | Wall clock |
|---|---|---|---|---|
| fable-high | 3/3 | 2 | ≤1 minor nit | 113s |
| grok-high | 3/3 | 3 (incl. a deploy-breaking legacy-cursor incompatibility fable missed) | ≤2 conditional observations | 182s |

**Both stay on the Pareto frontier.** Both cleared every check. grok-high caught
the most consequential unseeded issue (in-flight cursors hard-fail across a
deploy); fable-high was 38% faster with the tighter report. One run cannot
separate them; the cross-family requirement means both remain recommended
reviewer routes.

## Not run in this bounded run

`ambiguous_feature` (Luna xhigh vs Terra high), `cross_component_invariants`
(Sol high vs xhigh), and `long_horizon_autonomous` (Fable high vs xhigh) were
not dispatched: their cases need real fixture repositories that do not exist
yet. This is a scope gap, not a finding — tracked as a follow-up issue.

## How to read these numbers

- **One observation per cell.** Nothing here meets the promotion rule (two
  dated results on separate dates); every conclusion above is a hint with
  evidence, not a default.
- **Token and cost fields are honest, therefore sparse.** codex exposes only an
  unsplit total (recorded in `quota_note`); opencode and plain `claude -p`
  expose nothing (recorded as null). Wall clock is the only latency signal
  measured uniformly.
- **All runs consumed subscription quota, not API dollars** — `api_usd` is null
  everywhere; comparing these routes on marginal cost is not yet possible.
