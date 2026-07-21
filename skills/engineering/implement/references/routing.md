# Engine routing

Select from evidence before editing. The selected engine changes mechanics, not status, verification, escalation, or authority semantics.

| Engine | Select when |
| --- | --- |
| `inline` | Work is localized and useful decomposition would add no safety or verification value. |
| `serial_workers` | Units depend on one another, parallel safety is uncertain, or shared state forces ordered writers. |
| `bounded_parallel` | Units are independent and use isolated workspaces or provably disjoint files and shared resources. Concurrency caps live in `worker-contract.md`. |

## Relay escalation

Escalate before mutation when work needs durable recovery, a dedicated worktree/branch, frozen rubric and repeated independent review, PR/MR/CI/merge lifecycle, several durable leaves, long-running unattended ownership, or carries security, destructive migration, deployment, data-loss, or comparable risk. Relay is the next route, not a current-session engine.

## Safety precedence

- Honor a user-selected engine only while its assumptions remain true.
- Escalate before mutation when relay evidence is already present.
- If destructive risk, missing authority, overlap, or durability need appears later, stop before the newly unsafe mutation and return an explicit relay handoff.
- A relay handoff names the settled source artifact, reason, and remaining scope. It is not relay execution.

## Dirty checkout

- **Disjoint:** proceed inline or serial only after recording the pre-existing paths and proving the authorized writes and verification will not overwrite, stage, format, generate over, or otherwise absorb them. Return `pre_existing_changes_preserved: true` only after final diff inspection.
- **Overlapping or ambiguous:** do not edit. Return pre-edit `blocked` with `engine: none`, or `escalated` with `engine: none` when isolation/durability requires a relay handoff.

These outcomes must remain observably different: the disjoint path produces and verifies authorized changes while preserving the inventory; the overlapping path records no repository mutation by this run.

## Capability degradation

Try only safe levels, in this order:

```text
isolated bounded parallel
  -> safe bounded parallel in a shared checkout
  -> serial worker
  -> inline
```

Skip any unavailable or unsafe level. Never describe a shared checkout as isolated, infer parallel safety from file separation alone, or change the final output contract because the engine degraded.
