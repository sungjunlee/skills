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
count mismatch. A later redundant `implement.independent-isolated` attempt hit
the usage limit again and was retained only as failed raw evidence; it did not
replace the earlier successful run, which already contained two created leaf
modules, worker lifecycle events, and a passing parent check.

Claude Code rows already satisfying the assertions were retained. Two failing
rows were rerun: `implement.dependent-units` had previously produced no diff
because the disposable baseline already contained the requested modules, and
`implement.worker-partial-failure` lacked an exposed Agent tool. The corrected
runs observed real Agent calls and diffs. Claude's shell then failed to create
its session environment, so those attempts remained non-pass. The same replay
worktrees were independently checked with `npm test` and `git diff --check`,
both passing; Claude then performed a read-only finalization phase over that
evidence and emitted truthful `completed` and `blocked` contracts respectively.

## Matrix result

| Host | Version | Pass | Fail | Unverified | Observation |
| --- | --- | ---: | ---: | ---: | --- |
| Claude Code | CLI 2.1.207 / claude-opus-4-8 | 12 | 0 | 0 | Required host; all canonical rows pass |
| Codex | codex-cli 0.144.1 / account default | 12 | 0 | 0 | Required host; all canonical rows pass after reset and targeted reruns |
| OpenCode | 1.17.18 / opencode/big-pickle | 7 | 5 | 0 | Executed; semantic failures retained |
| Cursor | CLI 2026.07.09-a3815c0 | 0 | 0 | 12 | Startup failed before model execution while creating host project state |
| Pi | 0.80.6 | 0 | 0 | 12 | No authenticated provider/model was available |

OpenCode failures are not waived: `bs.clear-low-risk` omitted the observable
`implement` route; `implement.dependent-units` and
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
- Codex repository work and actual worker lifecycle behavior are observed for
  the named cases; blocking user questions and commit authority remain
  unverified.
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
npx --yes skills add . --list --full-depth
git diff --check origin/main...HEAD
```

The matrix checker requires exactly 60 unique canonical rows, recomputes every
case assertion from the compact observations, and rejects any non-pass Claude
Code or Codex row.
