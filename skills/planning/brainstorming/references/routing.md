# Successor routing — worked examples

These examples illustrate the routing table in `SKILL.md`. They do not restate its rules; consult the table for the authoritative mapping.

## Direction selected -> feature-spec

A vague "we need some kind of notifications" converges on "in-app notification center now, digest email later." The direction is chosen, but the implementation intent (data model, delivery, settings surface) is unsynthesized. Recommend `feature-spec`.

## Needs decomposition -> unit boundaries in the Design Handoff, then stop

A large multi-surface feature (auth + billing + admin) already has an adequate source artifact and now needs trackable units. Fill Unit boundaries and Dependencies, set Recommended next step to stop, and write no tickets.

## Settled single unit -> implement or relay

"Add a `--json` flag to the existing status command" is one localized, low-risk unit -> recommend `implement`. "Rotate the production signing keys" is settled but durable and high-risk -> recommend relay so an isolated, verified execution owns it. Choose by task-specific evidence (blast radius, reversibility, isolation need), not by a fixed default.

## Exploration only -> stop

The user is thinking out loud and explicitly does not want to commit yet. Emit the Design Handoff and stop.

## Grill request -> compatible grill capability or stop

The user wants an already-chosen plan stress-tested adversarially. That is grilling, not discovery: apply the routing table's grill row.

## Edge cases

- **Mixed signals.** If a request contains both a vague area and one settled sub-decision, brainstorm only the open area; do not reopen the settled sub-decision unless repository evidence contradicts it.
- **Contradicting evidence.** Reopen a settled direction only when discoverable repository context directly conflicts with it; name the conflict under *Unresolved human decisions*.
