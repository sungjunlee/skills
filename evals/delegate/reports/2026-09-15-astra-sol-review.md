# Delegate routing evaluation report — 2026-09-15 Astra medium vs Sol high

First dated observation for issue #123 after the 2026-09-15 09:31Z Codex Pro
quota reset. Lane: `delegate.review.cross-family-diff` only, profiles
`sol-high` and `astra-medium`. Evidence files:
`evals/delegate/results/2026-09-15/`. This report interprets; it never
restates evidence differently than the result files record it.

Both profiles share the fixture author's GPT family, so they measure
seeded-defect recall only and cannot promote a cross-family default.

## independent_cross_family_review — Sol high vs Astra medium

| Profile | Acceptance | Wall clock | Tokens (unsplit) | Notes |
|---|---|---|---|---|
| sol-high | 3/3 pass | 112s | 24,945 | Codex 0.146.0; missed the legacy-cursor extra |
| astra-medium (14:20Z) | failed (not graded) | 6s | n/a | Codex 0.146.0 HTTP 400: gpt-6-astra needs a newer CLI |
| astra-medium (14:23Z) | 3/3 pass | 44s | 24,553 | Codex 0.154.0; caught the legacy-cursor extra |

On this date, once Astra could dispatch, **Astra `medium` matched Sol `high`
on seeded-defect recall** (3/3 each). Astra was faster at a nearly identical
unsplit token total. That is one observation, not a default: the promotion
rule needs a second UTC date, and this pair still cannot set the
cross-family review default.

The 14:20Z Astra failure is dispatch reliability, not capability. Codex
0.146.0 cannot request `gpt-6-astra` (floor 0.153.1). It was recorded and
not auto-retried; the 14:23Z run used a PATH-local 0.154.0 binary and left
the operator CLI on 0.146.0.

## Not changed

- Catalog Evidence-backed defaults: one date, and this pair is in-family
  recall only.
- Everyday and long-horizon lanes; Astra `low` / `high`+.
- The unverified "2.5× Sol" rate claim stays dropped.

## Second date still required

A second UTC-dated run of the same command is still open:

```bash
node scripts/run-delegate-eval.mjs --cases delegate.review.cross-family-diff --profiles sol-high,astra-medium
```

Empty output remains a failed run and is never auto-retried. Use Codex
≥ 0.153.1 for the Astra cell.
