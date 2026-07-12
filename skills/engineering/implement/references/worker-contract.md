# Worker contract

Use workers only after the orchestrator passes the pre-edit gate and selects `serial_workers` or `bounded_parallel`.

## Dispatch packet

Give each worker:

- one bounded outcome and its dependency inputs;
- exact mutable paths and an explicit frozen scope;
- expected artifacts or diff;
- local verification responsibility;
- the status vocabulary below;
- a prohibition on commits unless separately authorized; and
- an unconditional prohibition on edits outside scope, push, PR/MR operations, and tracker or sprint mutation.

Require exactly one report status:

| Status | Meaning |
| --- | --- |
| `DONE` | Assigned scope is complete and local checks passed. |
| `DONE_WITH_CONCERNS` | Scope is complete and checks passed, with a concrete non-required concern. |
| `NEEDS_CONTEXT` | A missing decision or input prevents safe continuation. |
| `BLOCKED` | The unit cannot complete safely or its required check failed. |

The report includes files changed, checks run with exit outcomes, concerns, and remaining scope. Status text is evidence to inspect, not proof.

## Parallel safety

Default concurrency is 2; the hard maximum is 4 without a user override. Use shared-checkout parallel writers only when both file writes and shared resources are disjoint. Analyze at least:

- shared types and public interfaces;
- schemas and migrations;
- generated files and build outputs;
- lockfiles and dependency resolution;
- formatters and broad rewrite tools;
- shared test fixtures and snapshots;
- environment, port, database, cache, and process singletons;
- integration and merge order.

Any collision or uncertain ordering forces isolated workspaces, serialization, or inline execution. A shared schema or lockfile is sufficient to serialize even when leaf source files differ.

## Orchestrator integration

For serial work, inspect and verify each worker's actual diff before dispatching the dependent unit. For bounded parallel work, cap the active dependency layer, collect every lifecycle result, inspect every diff, then integrate in a declared order. Resolve conflicts centrally; never ask workers to overwrite one another.

A `NEEDS_CONTEXT`, `BLOCKED`, missing result, failed required check, or incomplete unit makes the final result non-success until the orchestrator safely completes and re-verifies that scope. Worker partial completion alone must end as `blocked`, with the remaining scope named.
