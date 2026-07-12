---
name: implement
description: Execute a settled feature spec, tracker task, or clear prompt in the current checkout with the lightest safe engine, orchestrator-owned verification, and relay escalation before mutation when durable execution is required.
disable-model-invocation: true
---

# Implement

Execute settled intent continuously in the current session. Do not reopen product decisions or ask whether to continue between normal units. This skill owns no durable run state, worktree lifecycle, PR/MR lifecycle, tracker mutation, or recovery protocol.

## Steps

1. **Pass the pre-edit gate.** Before any mutation:
   - read repository instructions and the settled source artifact;
   - inspect the branch, worktree, and `git status`;
   - inventory pre-existing changes and preserve them without staging, reverting, overwriting, or attributing them to this run;
   - state the mutable and frozen scopes plus authoritative verification commands;
   - analyze dependencies and shared-state hazards before selecting an engine.

   A dirty tree may proceed only when the requested scope is disjoint and preservation is provable. If changes overlap or ownership is ambiguous, block or escalate before editing.

   **Complete when:** the source is executable without re-planning, every pre-existing change is accounted for, scopes and required checks are explicit, and no mutation has occurred.

2. **Select the lightest safe engine.** Read [`references/routing.md`](references/routing.md) before mutation and choose exactly one of `inline`, `serial_workers`, `bounded_parallel`, or `relay`. Honor an explicit route only while its safety assumptions remain true. Use `engine: none` only when the pre-edit gate blocks before an engine can be selected.

   Relay is an escalation handoff: stop before repository mutation and return the inseparable combination `status: escalated`, `engine: relay`, and `handoff.route: relay`. Name `relay-ready`/`relay-plan` as the next owner without invoking it.

   **Complete when:** task shape, host capability, authority, dirty-state, and durability evidence all support the selected engine.

3. **Execute the full authorized scope.** For worker engines, first read [`references/worker-contract.md`](references/worker-contract.md). Give every worker its mutable scope, frozen scope, expected output, and verification responsibility. Continue across normal units without asking permission. Treat worker status as a report, never completion proof.

   The orchestrator owns decomposition, actual-diff inspection, integration, conflict resolution, authoritative verification, risk-sized review, and truthful final status. If new evidence makes execution unsafe, stop before the unsafe mutation and escalate explicitly; never invoke relay silently.

   **Complete when:** every requested unit is integrated or the remaining scope is identified in a non-success handoff, and all actual working-tree changes have been inspected.

4. **Verify the integrated result.** Run every authoritative test, typecheck, lint, and task-specific check. Always inspect the final diff. Add a fresh-context review for multi-worker integration, public or cross-module interfaces, or interactions not covered by deterministic checks.

   `completed` requires the entire scope, actual-diff inspection, and all required checks passing. Use `completed_with_concerns` only for disclosed non-required concerns after the same completion bar; it cannot hide a failed check or partial worker result. Otherwise return `blocked` or `escalated`.

   **Complete when:** the final status follows these invariants and every verification entry records `pass`, `fail`, or `not_run` truthfully.

5. **Return only this contract as the final execution summary.** Populate every field; use empty lists and YAML `null` where appropriate.

```yaml
status: completed | completed_with_concerns | blocked | escalated
engine: none | inline | serial_workers | bounded_parallel | relay
source_artifact: <path, issue URL, or inline description>
files_changed: []
verification:
  - command: ""
    result: pass | fail | not_run
concerns: []
pre_existing_changes_preserved: true | false
handoff:
  route: null | relay
  reason: null | ""
  remaining_scope: []
```

The alternatives above are not independently composable: every relay handoff must use `status: escalated`, `engine: relay`, and `handoff.route: relay` together before repository mutation. Never emit only part of that combination.

## Authority

Edit only the authorized current-repository scope. Commit only when explicitly authorized. Never push, open or merge a PR/MR, mutate tracker or sprint state, deploy, install skills globally, or publish externally or send external messages. Unobserved host capabilities remain `unverified`; degrade engines per [`references/routing.md`](references/routing.md) rather than assuming support.
