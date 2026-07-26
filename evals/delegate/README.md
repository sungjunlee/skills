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
- `executors.json` is the runner's **controlled transport, not a replay of the
  skill's dispatch**. It compares model-effort profiles, so it holds one
  harness steady across observation dates rather than following the skill's
  routing — see the sandboxing note under Runner. `grok-4.5` is the widest
  gap: the skill routes it to `cursor/*` while the runner keeps
  `opencode-go/grok-4.5`, so a Grok promotion from these results must record
  that its evidence came from another harness. A result's `executor` field,
  never the skill's default, says what ran.
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

## Bounded run procedure

A bounded run is explicitly invoked, never scheduled. The 2026-07-22 run
(`reports/2026-07-22-bounded-run.md`) followed this shape:

1. `--smoke` the exact (case, profile) selection first and fix any route
   problem it reports — e.g. a model served only under a provider-qualified
   id, which the bare catalog slug will not dispatch.
2. Dispatch one lane per executor CLI, sequential within the lane, so
   wall-clock comparisons are not skewed by local contention or provider
   rate limiting; lanes on different executors may run in parallel.
3. The runner's dispatch inherits its working directory. Run repository
   fixtures from inside a disposable seeded git repo — one fresh copy per
   profile, suite verified green and `git status` clean before dispatch.
   Analysis-only cases run from a seeded empty repo so `no-repo-mutation`
   checks stay verifiable. Repository fixtures are built deterministically
   by the generators in `fixtures/generators/` (`node
   fixtures/generators/<case>.mjs <target-dir>` builds, verifies green, and
   git-seeds one copy); `scripts/verify-fixture-generators.mjs` keeps them
   and their case premises honest in CI.
4. Grade command checks mechanically (test suite, grep, git status) and
   rubric checks with written evidence grounded in the recorded output.
5. Copy the draft into `results/<observation_date>/`, fill the acceptance
   and measurement fields, and run `npm test` before committing.

## Interpreting incomplete metrics

- `null` means the CLI did not expose the value — never a guess, never zero.
  Plain `claude -p` and `opencode run` expose no token usage; codex prints
  an unsplit total, which belongs in `quota_note`, not divided across the
  token fields.
- `api_usd` and `quota_note` are different economies; never sum or compare
  them directly. Subscription-routed runs leave `api_usd` null.
- `wall_clock_seconds` is measured uniformly by the runner and is the only
  latency signal comparable across executors.
- A `failed` result with `dispatch_timeout` may still have consumed provider
  quota; it is evidence of the failure, never a slot to retry silently.
- Promotion to a catalog default follows the repeated-evidence rule in
  `skills/productivity/delegate/references/model-catalog.md`; a single dated
  run is a hint with evidence, not a default.
