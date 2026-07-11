---
name: feature-spec
description: Compile a completed Design Handoff, settled conversation or proposal, or clear tracker task into a tracker-neutral Feature Spec. Use explicitly when product and architecture decisions are settled but implementation intent, acceptance criteria, verification, artifact lifetime, and the next execution or decomposition handoff need synthesis.
disable-model-invocation: true
---

# Feature Spec

Compile settled intent; do not brainstorm it again.

## Steps

1. Establish the source of truth. Read the supplied artifact and relevant repository instructions, durable contracts, and implementation context. Preserve every supplied acceptance criterion and settled decision. Ask only when an exact contradiction or genuinely blocking gap can change the spec; in unattended work, record it under `Unresolved human decisions` instead. Name a conflicting contract by path and section, and never amend `spec/*`.

   **Complete when:** every supplied decision and acceptance criterion is either represented or explicitly identified as contradictory.

2. Compile the spec using every heading in [`references/spec-template.md`](references/spec-template.md). Strengthen acceptance criteria only by retaining their original intent and making outcomes observable. Stay at product and architecture altitude: exclude brainstorming recaps, file-by-file steps, pasted implementation code, invented tickets, and forced micro-task checklists.

   **Complete when:** a fresh agent can identify what users will observe, what is in and out, which constraints bind, how completion is verified, and which human choices remain.

3. Before writing `Artifact lifetime` or the final handoff, read [`references/routing.md`](references/routing.md) and select exactly one closed route. Honor a preselected execution route unless a repository-contract contradiction blocks it. Recommend a successor without invoking it or mutating tracker or sprint state.

   **Complete when:** the output contains exactly one of: an evidence-based `implement | relay` recommendation; a decomposition handoff with observed `dev-backlog shape` availability or the literal `shape unavailable` stop; or a Human Decision Handoff with route `blocked-human-decision` for an unresolved repository-contract contradiction.

4. Return the complete spec in the response by default. Write it only with edit authority and an unambiguous destination. Verify all required headings, supplied acceptance criteria, unresolved contradictions, persistence authority, and absence of successor side effects before finishing.

   **Complete when:** the artifact and persistence behavior both match the source and authority actually observed.

## Host adaptation

Core semantics do not vary by host. Read [`references/host-mappings.md`](references/host-mappings.md) only when mapping invocation, repository work, or question capabilities for a host; unobserved capabilities remain `unverified`.
