# Delegate routing evaluation (delegate-eval-v1)

Evidence loop for issue #33: compare delegate model-effort profiles per work
shape instead of trusting the catalog. The catalog in
`skills/productivity/delegate/references/model-catalog.md` stays a stale-prone
routing hint; the dated evidence here is what may promote a profile to a
default recommendation.

## Layout

```
evals/delegate/
  schema/         eval-case, eval-result, executors schemas
  cases/          committed evaluation cases (verifier enforces one per work shape)
  results/        append-only dated evidence: results/<YYYY-MM-DD>/<file>.json
  fixtures/       valid/ must pass, invalid/ must be rejected (self-test)
  executors.json  model → CLI dispatch registry for the runner
  drafts/         uncurated runner output (gitignored)
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
  schemas, case/result pairing, work-shape coverage, the executor registry,
  and the fixtures — all without provider credentials. Paid provider calls
  happen only in explicitly invoked bounded runs, never in CI.

## Runner

`scripts/run-delegate-eval.mjs` executes an explicitly selected subset — it
never runs everything implicitly and never fails on a missing provider CLI
(that run is recorded as `skipped`):

```bash
# free: resolved argv only, no spawn (this is what CI runs)
node scripts/run-delegate-eval.mjs --dry-run --cases <id,...> --profiles <id,...>

# low-cost: CLI availability, live model list where exposed, effort support
node scripts/run-delegate-eval.mjs --smoke --cases <id,...> --profiles <id,...>

# paid: bounded dispatch (default 30-minute hard deadline per run)
node scripts/run-delegate-eval.mjs --cases <id,...> --profiles <id,...>
```

Real runs write draft results plus captured stdout/stderr to `drafts/`
(gitignored). A human assesses the output against the case's acceptance
checks, fills the measurements, and only then promotes a finished result into
`results/<observation_date>/`. `internal`/`private` cases refuse dispatch on
routes outside their `approved_routes`. Executors run sandboxed (codex uses
`--sandbox workspace-write`, not the delegate skill's bypass flags). A
timed-out run is reported as `failed` (`dispatch_timeout`) and is never
retried automatically.
