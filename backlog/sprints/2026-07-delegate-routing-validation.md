---
milestone: Delegate routing validation
status: active
started: 2026-07-21
due: TBD
objectives: []
component: ""
---

# delegate-routing-validation

## Goal
A committed, credential-optional delegate evaluation loop produces its first dated, work-shape-grouped Pareto evidence for at least two of the profile pairs named in #33, without touching the append-only history or promoting any catalog default prematurely.

## Plan

### Batch 1 — evaluation contract

- [x] #33 define the committed evaluation case format: work shape, fixture, acceptance checks, candidate profiles, privacy constraints (~1h) → PR #37 (merged)
- [x] #33 wire schema validation and a credential-free self-test path into npm test (~1h) → PR #37 (merged)

### Batch 2 — case matrix

- [x] #33 author one case per work shape: mechanical-with-tests, ambiguous feature/bugfix, cross-component invariants, long-horizon autonomous, high-blast-radius analysis, independent cross-family review (~1.5h) → PR #38 (merged)
- [x] #33 attach only meaningful profile pairs per shape: Luna xhigh vs Terra high, Sol high vs xhigh, Fable high vs xhigh, Grok medium vs high (~30min) → PR #38 (merged)

### Batch 3 — runner and capability smoke

- [x] #33 build a local runner that executes an explicitly selected subset of cases and profiles; missing provider credentials skip, never fail (~2h) → commit f1edcc6 (direct to main; verify CI green)
- [x] #33 add a low-cost live capability smoke verifying model IDs and supported effort values, separate from outcome evaluation (~1h) → commit f1edcc6

### Batch 4 — first bounded evaluation run

- [ ] #33 run 1-2 profile pairs across 2-3 cases and record acceptance, reviewer defects, wall-clock, tokens, and cost vs quota as append-only dated evidence (~2h plus paid calls)

### Batch 5 — report, promotion rule, docs

- [ ] #33 report results grouped by work shape with Pareto candidates on quality, latency, and cost signals (~1h)
- [ ] #33 add the catalog promotion rule requiring repeated local evidence before a profile becomes a default recommendation (~30min)
- [ ] #33 document bounded provider-specific runs and how to read incomplete or unavailable metrics (~30min)

## Running Context
- The #32 catalog stays a stale-prone routing hint, never an authority; live provider model lists win over catalog slugs.
- Keep API marginal cost and subscription quota pressure as separate signals; never sum them.
- Observed on this machine 2026-07-21: codex-cli 0.144.4 defaulted to `gpt-5.6-sol` — the capability smoke must observe live values like this, not assume catalog ones.
- Evaluation results are append-only dated evidence; a new profile contract never rewrites existing results (mirrors the replay-evidence freeze pattern from #29/PR #34).
- Paid provider calls happen only in explicitly invoked bounded runs (Batch 4), never in CI; the `verify` workflow must stay credential-free.
- 2026-07-21: PR #36 added K3 and Qwen 3.8 to the delegate model catalog mid-planning; Batch 2 pairing and the Batch 3 capability smoke should re-read the live catalog at execution time instead of trusting this plan's snapshot.
- fixture.value is executor-visible verbatim; grader answer keys belong only in acceptance check specs (the review case leaked its seeded defects this way in Batch 2 and was fixed in Batch 3).
- 2026-07-22 smoke on this machine: claude CLI 2.1.217 available (fable high/xhigh statically supported); opencode 1.17.18 available with grok-4.5 in its live model list (effort variant support unverified). Batch 4 can run the fable and grok pairs here; sol/terra/luna pairs need the codex route re-smoked at run time.
- Runner drafts are gitignored under evals/delegate/drafts/; promotion into append-only results/ is a manual curation step after human assessment.

## Progress
- 2026-07-22: Batch 3 done via commit f1edcc6 — pushed to main directly by mistake (branch step skipped after the Batch 2 merge); push-triggered verify CI green, runner/smoke/registry negative-tested locally before push. Runner + smoke + executor registry landed; review-case answer-key leak fixed. AC items 3 and 4 verified.
- 2026-07-22: Batch 2 done via PR #38 (merged; verify CI + CodeRabbit both green): six-shape case matrix committed, one calibration pair per shape placed where catalog hints diverge; cross-family review uses fable-high vs grok-high because same-family pairs cannot exercise that shape. Verifier now enforces shape coverage. K3/Qwen excluded per non-goal. AC item 2 verified.
- 2026-07-21: Batch 1 done via PR #37 (merged, verify CI green): delegate-eval-v1 case/result schemas, credential-free verifier joined to npm test, fixture self-test, shared schema validator extracted to scripts/lib/. AC items 1 and 8 verified. CodeRabbit was rate-limited on both PRs today; verify CI is the effective gate.
- 2026-07-21: Sprint planned around #33. Predecessor thread closed the same day: PR #34 (issue #29 engine-enum contract) repaired after incomplete relay auto-recovery and merged; CI `verify` workflow added (#35). Created GitHub milestone "Delegate routing validation" and assigned #33 to it.
