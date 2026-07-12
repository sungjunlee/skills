# Persistence and routing

## Artifact lifetime

- Default to returning the complete spec in the response.
- Write a file only when edit authority and destination are both unambiguous.
- For multi-session or multi-ticket work, prefer the repository's existing spec convention. If none exists, suggest `docs/specs/YYYY-MM-DD-<slug>.md`.
- With ambiguous authority or destination, return the body plus the suggested path without blocking.
- For short-lived work, recommend a response-only handoff.

Never commit merely for persistence.

## Settled single unit

Emit exactly this handoff, with one recommendation. Honor an already selected route without asking again.

```markdown
## Execution Handoff

1. implement — current-session execution with inline or bounded workers
2. relay — isolated durable execution with manifest, PR/MR, independent review, and recovery

Recommendation: implement | relay
Why: <task-specific durability, isolation, review, risk, and parallelism evidence>
```

Recommend `implement` when the unit can finish in the current session, the checkout is safe, and orchestrator verification is sufficient. Recommend `relay` when durability, isolation, recovery, PR/MR lifecycle, independent review, long-running work, or elevated change risk is material.

The complete Feature Spec is the source artifact for `implement` or `relay-plan`; the route label remains `relay` for durable execution.

## Work requiring decomposition

Emit a tracker-neutral handoff without ticket IDs or invented tracker objects:

```markdown
## Decomposition Handoff

Work shape: <why multiple leaves or dependency ordering are required>
Leaf boundaries: <observable outcome boundaries, not tickets>
Dependency edges: <known ordering or shared constraints>
Shared acceptance criteria: <cross-cutting criteria every leaf must preserve>
Durable spec: <authorized path or suggested path>
Successor availability: dev-backlog shape | shape unavailable
Recommendation: dev-backlog shape | stop
Why: <observed capability and task-shape evidence>
```

- When multi-leaf or dependency shape is observed and `dev-backlog shape` is observed available, recommend `dev-backlog shape`.
- When the same work is observed but that successor is not observed available, write the literal `shape unavailable` and stop. Do not fall back to create, plan, implement, or relay.
- Leaf tasks, if a successor later creates them, should link to the durable spec and carry only slice-specific acceptance criteria.

The complete Feature Spec plus this handoff is the source artifact for `dev-backlog shape`.

## Contract contradictions

If a durable repository contract contradicts the settled source, name the exact contract path and section under `Unresolved human decisions`. Do not choose a winner, amend `spec/*`, or route into execution until a human resolves it. A contradiction overrides a preselected execution route.

Emit exactly this closed handoff:

```markdown
## Human Decision Handoff

Route: blocked-human-decision
Source intent: <the settled decision that conflicts>
Conflicting contract: <exact repository path and section, plus the incompatible requirement>
Decision required: <the choice a human must make before compilation can resume>
Execution status: blocked pending human decision
Resume with: feature-spec after the contradiction is resolved
```

In unattended flows, return the complete spec with this handoff and ask no question. The route ends the current compilation successfully without selecting `implement`, `relay`, or a decomposition successor; it does not authorize execution or contract edits.
