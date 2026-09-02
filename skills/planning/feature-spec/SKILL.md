---
name: feature-spec
description: Compile settled intent into a tracker-neutral, implementation-ready Feature Spec with exactly one successor-neutral closing handoff.
disable-model-invocation: true
---

# Feature Spec

Compile settled intent; do not brainstorm it again. Close with a completed spec plus exactly one successor-neutral handoff. Do not choose, detect, recommend, or invoke a successor.

## Steps

1. Establish the source of truth. Read the supplied artifact and relevant repository instructions, durable contracts, and implementation context. Preserve every supplied acceptance criterion, settled decision, and any explicitly supplied tool decision as source intent — never as a recommendation or availability claim. Ask only when an exact contradiction or genuinely blocking gap can change the spec; in unattended work, record it under `Unresolved human decisions` instead. Name a conflicting contract by path and section, and never amend `spec/*`.

   **Complete when:** every supplied decision and acceptance criterion is either represented or explicitly identified as contradictory.

2. Compile the spec using every heading in [`references/spec-template.md`](references/spec-template.md). Strengthen acceptance criteria only by retaining their original intent and making outcomes observable. Stay at product and architecture altitude: exclude brainstorming recaps, file-by-file steps, pasted implementation code, invented tickets, and forced micro-task checklists.

   **Complete when:** a fresh agent can identify what users will observe, what is in and out, which constraints bind, how completion is verified, and which human choices remain.

3. Before writing `Artifact lifetime` or the final handoff, read [`references/routing.md`](references/routing.md) and emit exactly one closed handoff. Do not invoke a successor or mutate tracker or sprint state.

   **Complete when:** the output contains exactly one of: an Execution Handoff that states observed execution characteristics without naming a successor; a Decomposition Handoff that stops without naming a successor; or a Human Decision Handoff for an unresolved repository-contract contradiction.

4. Follow Artifact lifetime in [`references/routing.md`](references/routing.md). Verify all required headings, supplied acceptance criteria, unresolved contradictions, persistence authority, and absence of successor side effects before finishing.

   **Complete when:** the artifact and persistence behavior both match the source and the authority actually observed.
