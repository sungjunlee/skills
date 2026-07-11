# Epic 8 cross-host semantic replay report — 2026-07-11

## Frozen scope

- Run base: `66c13f499f522da0fbc92354ca0fa5e8753bca7e`.
- Canonical matrix: 12 cases × 5 hosts = 60 unique rows, defined by
  [`../fixtures/cross-host/matrix.json`](../fixtures/cross-host/matrix.json).
- The replay cases, schemas, ownership boundaries, `README.md`,
  `evals/README.md`, and `package.json` did not change.
- Committed execution inputs are limited to the common answer contract and the
  canonical matrix under `evals/fixtures/cross-host/`. One-off execution and
  compilation helpers remain outside the repository because they are not
  required landing artifacts.

## Method and provenance

Each executed row used a disposable Git repository containing the evaluated
skill, sanitized case input, common answer contract, and minimal fixture source.
Expected assertions were applied only after execution. A pass required a
successful host exit, the declared artifact fields, route or engine, question
range, escalation, forbidden-side-effect checks, and operational evidence.
Implementation completion additionally required a real diff and an independent
fixture check. Worker engines required observed host worker lifecycle evidence;
a worker label or worker self-report alone was rejected.

Raw CLI events, answers, diffs, verification logs, temporary authentication
state, and disposable workspaces remain outside the repository. Compact results
contain no raw transcript, secret, or machine-specific path.

### Quota reset and reruns

The pre-reset draft recorded all 12 Codex rows as unverified after the Codex CLI
hit its usage limit. After the reset, all 12 canonical Codex cases were executed
with `codex-cli 0.144.1`. Failing rows were rerun only for observed reasons:
missing implementation diffs, absent worker lifecycle evidence, or a question
count mismatch. A 2026-07-12 follow-up established the two missing Codex
contracts. `bs.vague-feature` used two turns of one persisted thread: phase 1
read the fixture, emitted five material blocking questions, and stopped without
an artifact; phase 2 resumed that exact thread with the fixed answer sequence
and returned the settled Design Handoff. A setup probe that could not initialize
the local Codex state/sandbox was discarded rather than combined with the
selected clean two-phase lineage.

The 2026-07-12 Codex `implement.worker-partial-failure` replay used one
authoritative CLI lineage and two real serial worker dispatches. The base worker
created an inspected working-tree artifact and passed its check before the
consumer was dispatched. The consumer then created its artifact and hit the
fixture's genuine required-check failure. The parent re-inspected both files,
reran the passing base and failing consumer checks, and returned the required
blocked contract; the consumer check failure is disclosed as the operational
failure exercised by the case. Host exit was 0 and no forbidden external side
effect occurred.

Claude Code rows already satisfying the assertions were retained. The R1
corrections reran `implement.dependent-units` and
`implement.worker-partial-failure` from start to finish in sanitized disposable
host environments. Each selected lineage exited 0, contained two real `Agent`
dispatches, shared-checkout writes, orchestrator diff inspection before the
dependent worker, and orchestrator-owned checks. The dependent-units lineage
passed its authoritative check. The partial-failure lineage truthfully returned
blocked after the consumer's required check failed; that expected operational
failure is disclosed in its compact row. No failed execution was combined with
a separate finalization.

## Matrix result

| Host | Version | Pass | Fail | Unverified | Observation |
| --- | --- | ---: | ---: | ---: | --- |
| Claude Code | CLI 2.1.207 / claude-opus-4-8 | 12 | 0 | 0 | Required host; all canonical rows pass |
| Codex | codex-cli 0.144.1 / account default | 12 | 0 | 0 | Required host; all canonical rows pass after reset and targeted reruns |
| OpenCode | 1.17.18 / opencode/big-pickle | 6 | 6 | 0 | Executed; semantic failures retained |
| Cursor | CLI 2026.07.09-a3815c0 | 0 | 0 | 12 | Startup failed before model execution while creating host project state |
| Pi | 0.80.6 | 0 | 0 | 12 | No authenticated provider/model was available |

OpenCode failures are not waived: `bs.vague-feature` returned a complete
one-shot handoff in phase 1 instead of a genuine stop/resume question turn;
`bs.clear-low-risk` omitted the observable `implement` route;
`implement.dependent-units` and
`implement.independent-isolated` had no observed worker dispatch;
`implement.shared-schema-serializes` omitted the execution-summary contract;
and `implement.worker-partial-failure` used inline execution. Cursor and Pi are
unverified rather than passes.

## Calibration

Routing changes: None.

The `inline → serial_workers → bounded_parallel → relay` rules, concurrency
cap, dirty-tree behavior, escalation boundary, status vocabulary, and ownership
model did not change. Calibration changed only evidence-backed host capability
mappings:

- Claude Code worker dispatch, bounded dispatch, lifecycle collection,
  repository editing, and verification are observed. Shared-checkout workers
  are not described as isolated workspaces.
- Codex repository work, actual worker lifecycle behavior, and same-thread
  blocking-question/resume behavior are observed for the named cases; commit
  authority remains unverified.
- OpenCode has observed inline repository work and verification, but no worker
  dispatch or non-interactive blocking-question round trip.
- Cursor and Pi capabilities remain unverified for the recorded preflight
  reasons.

## Ownership and verification

Planning skills only returned artifacts and recommendations. `implement` did
not acquire durable run, PR, tracker, deployment, publication, or implicit relay
ownership. No replay committed, pushed, opened a PR, mutated an issue, deployed,
or sent an external message.

Landing gates:

```text
npm test
node scripts/verify-cross-host-matrix.mjs
node scripts/verify-cross-host-matrix.mjs --required
node scripts/verify-cross-host-matrix.mjs --selftest
NPM_CONFIG_CACHE="$(mktemp -d)" npx --yes skills add . --list --full-depth
git diff --check
```

The matrix checker requires exactly 60 unique canonical rows, recomputes every
case assertion from the compact observations, and rejects any non-pass Claude
Code or Codex row. It also rejects invalid optional statuses, revision drift,
the wrong or missing dated report, machine paths, credential-like values, and
raw host transcript markers across all compact results, the report, and the
cross-host fixtures. Its deterministic negative self-tests cover each new
failure class. Separate scope, secret/path, and raw-transcript scans confirmed
that no frozen file or raw evidence entered the committed diff.
