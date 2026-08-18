---
name: implement
description: Execute settled work in the current checkout with the lightest safe engine, escalating durable or high-risk work to relay before mutation.
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

   Dirty-checkout policy lives in [`references/routing.md`](references/routing.md). Apply that file before choosing an engine.

   **Complete when:** the source is executable without re-planning, every pre-existing change is accounted for, scopes and required checks are explicit, and no mutation has occurred.

2. **Select the lightest safe engine.** Read [`references/routing.md`](references/routing.md) before mutation and choose exactly one of `inline`, `serial_workers`, or `bounded_parallel`, or return a pre-edit `blocked` / `escalated` with `engine: none`. The `engine` field always reports what this session actually ran.

   Relay escalation meaning lives in [`references/routing.md`](references/routing.md). This step only records `handoff.route: relay` when that file says to escalate.

   **Complete when:** either (a) task shape, host capability, authority, dirty-state, and durability evidence all support the selected engine, or (b) no mutation occurred and the YAML reports `blocked` or `escalated` with `engine: none`.

3. **Execute the full authorized scope.** For worker engines, first read [`references/worker-contract.md`](references/worker-contract.md). Give every worker its mutable scope, frozen scope, expected output, and verification responsibility. Continue across normal units without asking permission. Worker-status meaning lives in that file.

   The orchestrator owns decomposition, actual-diff inspection, integration, conflict resolution, authoritative verification, risk-sized review, and truthful final status. If new evidence makes execution unsafe, stop before the unsafe mutation and escalate explicitly.

   **Complete when:** every requested unit is integrated or the remaining scope is identified in a non-success handoff, and all actual working-tree changes have been inspected.

4. **Verify the integrated result.** Run every authoritative test, typecheck, lint, and task-specific check. Always inspect the final diff.

   **Fresh-context review** fires for multi-worker integration, public or cross-module interfaces, or interactions not covered by deterministic checks. Review the integrated actual diff against the settled source and the required checks. Required verdict is `pass`. Record it as a `verification` entry whose `command` names the review and whose `result` is `pass`, `fail`, or `not_run`. If a fresh reviewer is unavailable, set `result: not_run`, add a concern, and do not treat absence as `pass`; `completed` is then unavailable — use `completed_with_concerns` only when every deterministic required check passed, otherwise `blocked`.

   `completed` requires the entire scope, actual-diff inspection, all required checks passing, and a `pass` on any fresh-context review that fired. Use `completed_with_concerns` only for disclosed non-required concerns after the same completion bar; it cannot hide a failed check or partial worker result. Otherwise return `blocked` or `escalated`.

   **Complete when:** the final status follows these invariants and every verification entry records `pass`, `fail`, or `not_run` truthfully.

5. **Return only this contract as the final execution summary.** Populate every field; use empty lists and YAML `null` where appropriate.

```yaml
status: completed | completed_with_concerns | blocked | escalated
engine: none | inline | serial_workers | bounded_parallel
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

## Authority

Edit only the authorized current-repository scope. Commit only when explicitly authorized. Never push, open or merge a PR/MR, or mutate tracker or sprint state. Unobserved host capabilities remain `unverified`; degrade engines per [`references/routing.md`](references/routing.md) rather than assuming support.
