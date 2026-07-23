---
milestone: Delegate evidence hardening
status: active
started: 2026-07-23
due: TBD
objectives: [O4, O5]
component: "delegate-evaluation-loop"
---

# delegate evidence hardening

## Goal
The delegate evidence loop can both promote and demote, its `xhigh` guidance is decided by a case that actually scores breadth, and the two shapes still on single-date evidence either hold a default or name the contradiction that blocks one.

## Plan

### Batch 1 — demotion rule

- [ ] #54 define the demotion rule beside the promotion rule: what contradicts a default, whether reliability failures differ from acceptance failures, fallback behavior, and staleness (~1h)
- [ ] #54 apply it retroactively to the current evidence base and record whether any current default is affected (~30min)

### Batch 2 — breadth-scored case

- [ ] #53 author a case whose acceptance checks count distinct genuine findings against a grader-only key and cap false positives (~1.5h)
- [ ] #53 build its fixture generator with a CI-verified premise, following the existing generator contract (~1h)

### Batch 3 — heavier long-horizon fixture

- [ ] #51 build a long-horizon fixture whose difficulty is chain depth, not step count, as a new case beside the existing one (~2h)

### Batch 4 — bounded evidence run

- [ ] #52 run second-date observations for invariants (sol pair) and longhorizon (fable pair), plus a clean review grok-high observation (~1h plus paid calls)
- [ ] #53 run the breadth-scored case as a high-vs-xhigh pairing (~30min plus paid calls)
- [ ] #51 run the heavier long-horizon fixture to confirm it reaches the stall-or-deadline regime (~30min plus paid calls)

### Batch 5 — report and catalog

- [ ] #52 apply the promotion rule to the new evidence; record new defaults or the blocking contradiction (~30min)
- [ ] #53 state explicitly whether the xhigh-premium hypothesis is confirmed or refuted, and update or deliberately keep the catalog's effort hints (~30min)

## Running Context
- The runner stamps `observation_date` in **UTC**: a KST batch before 09:00 lands on the previous UTC date and does not secure a new one. Batch 4 must run after 09:00 KST to count as a second date.
- Current promotion status: terra-high (ambiguous), sol-high (blastradius), fable-high (review) are defaults. invariants and longhorizon have single-date evidence only. mechanical has unresolved contradictions on both grok profiles; review grok-high has one dispatch-reliability failure.
- The high-vs-xhigh outcome-parity-at-higher-cost pattern repeats across blastradius, invariants, and longhorizon. Batch 2 exists to test whether the one exception (blastradius' first observation) reflects a real breadth premium.
- Existing cases and their dated results are append-only; #51 and #53 add new cases rather than rewriting `longhorizon.dep-major-upgrade` or any rubric.
- Answer keys stay grader-side: the breadth-scored case's key lives in acceptance check specs, never in executor-visible fixture text.
- Paid dispatches happen only in Batch 4, explicitly invoked, never in CI.

## Progress
- 2026-07-23: Sprint planned around #51-#54 after the predecessor sprint closed. Spec axis completed the same day (charter PR #44, system map PR #49, capabilities PR #55), so this sprint routes to objectives O4/O5 and the `delegate-evaluation-loop` capability.
