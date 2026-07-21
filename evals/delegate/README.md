# Delegate routing evaluation (delegate-eval-v1)

Evidence loop for issue #33: compare delegate model-effort profiles per work
shape instead of trusting the catalog. The catalog in
`skills/productivity/delegate/references/model-catalog.md` stays a stale-prone
routing hint; the dated evidence here is what may promote a profile to a
default recommendation.

## Layout

```
evals/delegate/
  schema/    eval-case.schema.json, eval-result.schema.json
  cases/     committed evaluation cases (one or more per work shape)
  results/   append-only dated evidence: results/<YYYY-MM-DD>/<file>.json
  fixtures/  valid/ must pass, invalid/ must be rejected (self-test)
```

## Contract

- A **case** declares its work shape, fixture, acceptance checks, meaningful
  candidate profile pairs with a `pairing_rationale`, and privacy constraints.
  `internal`/`private` fixtures require an explicit `approved_routes`
  allowlist; runners must never send such fixtures through other routes.
- A **result** records one profile run: acceptance outcomes plus wall-clock,
  token, and cost measurements. API marginal cost (`api_usd`) and subscription
  quota pressure (`quota_note`) stay separate signals; unavailable metrics are
  `null`, never guessed.
- Results are **append-only dated evidence**: they live under an
  `observation_date` directory and existing files are never rewritten to match
  a newer contract.
- `scripts/verify-delegate-evals.mjs` (part of `npm test` and CI) validates
  schemas, case/result pairing, and the fixtures — all without provider
  credentials. Paid provider calls happen only in explicitly invoked bounded
  runs, never in CI.
