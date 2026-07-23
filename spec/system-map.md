# skills System Map

## System Shape

A collection of portable agent skills wrapped in an evidence apparatus. The
product surface is `skills/<category>/<name>/` — each skill a self-sufficient
`SKILL.md` with optional `references/` — and everything else exists to keep
those skills honest: JSON-schema evidence contracts and append-only dated
results under `evals/`, credential-free verifiers under `scripts/`, and a CI
gate that runs them on every change. All tooling is zero-dependency Node 22.

```text
skills/  (product: portable prompts)
   ▲ verified against
evals/   (contracts + append-only dated evidence)
   ▲ enforced by
scripts/ (verifiers + explicitly-invoked eval runner)
   ▲ run by
npm test / .github/workflows/verify.yml
```

## Runtime Boundaries

- `skills/` owns the runtime prompt surface. Each `SKILL.md` must work
  standalone; it never depends on `docs/`, `evals/`, or repo tooling.
- `evals/` owns evidence contracts and their history: semantic replays for
  the implement skill's engine contract (`evals/schema`, `evals/contracts`,
  frozen `replay-v1`), and the delegate routing loop
  (`evals/delegate/{schema,cases,results,reports,fixtures,executors.json}`).
- `scripts/` owns verification (`verify-replays`, `verify-delegate-evals`,
  `verify-fixture-generators`, `verify-cross-host-matrix`) and the bounded
  eval runner (`run-delegate-eval.mjs`), which is never run implicitly.
- `docs/` is maintainer guidance (engine capability contract vocabulary);
  explicitly not a runtime dependency of any skill.
- `backlog/` is dev-backlog execution state (sprints, tasks); GitHub Issues
  stay the source of truth and sync is always explicit.
- `spec/` is the reference axis (charter, this map).

## Core Flows

1. **Skill consumption:** `npx skills add . --full-depth` (or symlink) →
   host agent loads `SKILL.md` → references load on demand.
2. **Verification:** `npm test` → replay verifier + delegate verifier +
   fixture-generator verifier + runner dry-run → same chain in CI on every
   PR and push to main.
3. **Bounded evaluation:** explicit invocation → capability smoke →
   dispatch through the executor registry (sandboxed provider CLIs, one
   lane per executor, disposable generator-built fixture repos) →
   gitignored drafts → human-graded promotion into
   `evals/delegate/results/<date>/` → dated report → the promotion rule
   alone may change a catalog default.
4. **Backlog execution:** GitHub Issue → sprint file batches → PR (squash,
   titled `<title> (#issue) (#PR)`) → sprint close moves tasks to
   `backlog/completed/`.

## Storage And External Systems

- **GitHub**: issue/PR source of truth; Actions runs the `verify` workflow.
- **`evals/*/results/`**: append-only dated evidence store; the only
  authority behind behavioral or routing claims.
- **`evals/delegate/drafts/`** (gitignored): uncurated runner transcripts
  pending human assessment.
- **Provider CLIs** (`codex`, `claude`, `opencode`): external executors,
  subscription-quota routed, reached only from explicitly invoked bounded
  runs — never from CI.

## Project-Wide Invariants

- Evidence is dated and append-only; contract migrations supersede via new
  dated documents and never rewrite or orphan existing ones.
- `npm test` and CI stay credential-free; paid provider calls happen only
  in explicitly invoked bounded runs.
- Executor-visible fixture text never contains grader answer keys.
- Skills remain self-contained; repo tooling may know about skills, never
  the reverse.
- Catalog entries are hints; a default recommendation requires the
  promotion rule's repeated dated evidence.
- All scripts are zero-dependency Node 22 using `execFileSync`/`spawnSync`
  with array argv (no shell interpolation).

## Candidate Capability Boundaries

- `replay-evidence` — evidence: `verify-replays.mjs`, digest-pinned
  `evals/contracts/replay-v1.json`, dual-host supersession results; owns
  the replay contract lifecycle (freeze, supersession, digest guard);
  uncertainty: whether the migration rules generalize beyond replay-v1→v2.
- `delegate-evaluation-loop` — evidence: delegate-eval-v1 schemas, verifier,
  runner, fixture generators, promotion rule, 28+ dated results; owns the
  bounded-run and promotion lifecycle; uncertainty: demotion semantics
  (when a promoted default gets revoked) and cross-machine evidence rules.
- `skill-packaging` — evidence: `skills/<category>/<name>/` layout rules in
  AGENTS.md, full-depth discovery in README install flow; owns the portable
  skill layout contract; uncertainty: whether the category taxonomy is a
  contract or a convention.

Promotion criteria for `spec-grill`: prefer candidates with at least two
evidence classes, a distinct contract surface, and Behaviors/Hard
Constraints that would differ from neighboring candidates.

## Where To Go Next

- Product direction: [`charter.md`](charter.md)
- Capability contracts: `capabilities.md` (not yet created — ask spec-grill
  to review the candidates above)
- Engine capability vocabulary: [`../docs/engine-capability-contract.md`](../docs/engine-capability-contract.md)
- Delegate evaluation loop: [`../evals/delegate/README.md`](../evals/delegate/README.md)
