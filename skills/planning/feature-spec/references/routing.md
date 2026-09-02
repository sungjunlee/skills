# Persistence and routing

## Artifact lifetime

- Default to returning the complete spec in the response.
- Write a file only when edit authority and destination are both unambiguous.
- For multi-session or multi-ticket work, prefer the repository's existing spec convention. If none exists, suggest `docs/specs/YYYY-MM-DD-<slug>.md`.
- With ambiguous authority or destination, return the body plus the suggested path without blocking.
- For short-lived work, recommend a response-only handoff.

Never commit merely for persistence.

## Settled single unit

Emit exactly this handoff. Describe observed execution characteristics only. Do not name, choose, detect, recommend, or invoke `implement`, `relay`, `dev-backlog`, or any other successor. Preserve an explicitly supplied tool decision only under `Constraints`, as source intent.

```markdown
## Execution Handoff

Durability: <current-session sufficient | durable recovery required>
Isolation: <shared checkout is safe | isolated workspace required>
Review: <orchestrator verification sufficient | independent review required>
Current-session suitability: <can finish in the current session | long-running or elevated-risk handling required>
Constraints: <binding execution constraints, including any tool decision supplied in the source; or None>
```

## Work requiring decomposition

Emit a tracker-neutral handoff without ticket IDs, invented tracker objects, or a successor name:

```markdown
## Decomposition Handoff

Work shape: <why multiple leaves or dependency ordering are required>
Leaf boundaries: <observable outcome boundaries, not tickets>
Dependency edges: <known ordering or shared constraints>
Shared acceptance criteria: <cross-cutting criteria every leaf must preserve>
Durable spec: <authorized path or suggested path>
```

- When multi-leaf or dependency shape is observed, emit this handoff and stop. Do not invent tickets, continue into execution, or name a successor.
- Leaf tasks, if later work creates them, should link to the durable spec and carry only slice-specific acceptance criteria.

The complete Feature Spec plus this handoff is the source artifact for later decomposition or tracking.

## Contract contradictions

If a durable repository contract contradicts the settled source, name the exact contract path and section under `Unresolved human decisions`. Do not choose a winner, amend `spec/*`, or continue into execution until a human resolves it.

Emit exactly this closed handoff:

```markdown
## Human Decision Handoff

Source intent: <the settled decision that conflicts>
Conflicting contract: <exact repository path and section, plus the incompatible requirement>
Decision required: <the choice a human must make before compilation can resume>
Execution status: blocked pending human decision
Resume: compile again after the contradiction is resolved
```

In unattended flows, return the complete spec with this handoff and ask no question. The handoff ends the current compilation successfully without selecting a successor; it does not authorize execution or contract edits.
