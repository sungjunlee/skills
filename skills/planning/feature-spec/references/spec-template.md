# Feature Spec template

Use these headings exactly and in this order. Replace the final heading as directed by the routing reference; do not add placeholder prose when a section has no items—state `None` and why.

```markdown
# Feature Spec: <title>

## Problem
<Current problem and who experiences it.>

## User-visible outcome
<Observable change for the user.>

## Chosen approach
<Selected approach and task-specific rationale.>

## Important rejected alternatives
<Material alternatives already considered and why they lost.>

## Scope
<Included behavior and boundaries.>

## Non-goals
<Explicit exclusions.>

## Constraints and compatibility
<Repository contracts, platform constraints, compatibility, and preserved behavior.>

## Acceptance criteria
<Observable outcomes. Preserve supplied criteria or strengthen them without dropping intent.>

## Verification strategy
<Evidence that will prove each acceptance outcome without prescribing file-level implementation.>

## Architecture-level decisions
<Interfaces, ownership, data flow, invariants, and compatibility choices only.>

## Unresolved human decisions
<Only choices that require a human, including exact repository-contract contradictions.>

## Artifact lifetime
<Response-only, suggested durable path, or authorized repository path, with rationale.>

## Execution Handoff
<Use the closed single-unit form from routing.md. Replace this heading with `## Decomposition Handoff` when decomposition is required or `## Human Decision Handoff` when a repository-contract contradiction blocks execution.>
```
