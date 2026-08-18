---
name: brainstorming
description: Turn a vague idea into one selected direction and a compact Design Handoff, then recommend the next owner.
disable-model-invocation: true
---

# brainstorming

Turn vague intent into one selected direction and a Design Handoff. Stay at product/design/architecture altitude: no file-by-file steps, tracker mutations, executor prompts, or a parallel project charter. Recommend the next owner as text; never invoke it.

## Workflow

1. **Ground in context first.** Inspect safely discoverable repository context (README, docs, existing code, existing task or tracker artifacts, sprint notes) before asking anything. Ask only what that context and the user have not already answered.

   **Complete when:** every question candidate is something repository context and the user have not already answered.

2. **Size the pass by clarity.**
   - Genuinely vague work: ask 1-5 material questions, one at a time, each only when its answer would change the decision. Stop asking once the direction is determined.
   - Clear, low-risk request: ask at most one question — often zero. Keep the pass short.
   - Honor an explicitly requested successor or route without re-asking.
   - If the user delegates the judgment, choose and explain rather than block.

   **Complete when:** the direction is determined, or every remaining uncertainty is classified as high-impact (still open) or low-impact.

3. **Compare viable approaches.** Name the genuinely viable approaches and their material trade-offs. Recommend one. Accept an override.

   **Complete when:** every genuinely viable approach is named, one is recommended, and an override if given is the chosen direction.

4. **Resolve what matters.** Settle high-impact uncertainty. Record low-impact uncertainty under *Unresolved human decisions* instead of prolonging the interview.

   **Complete when:** every remaining uncertainty is either settled in the Chosen direction or listed under Unresolved human decisions.

5. **Emit the Design Handoff** below — every field, verbatim labels.
6. **Recommend a successor** using the routing table.

   **Complete when:** exactly one row of the routing table is selected.

## Design Handoff

```markdown
## Design Handoff

Problem:
User-visible outcome:
Chosen direction:
Why this direction:
Important alternatives rejected:
Constraints and compatibility requirements:
Unresolved human decisions:
Unit boundaries:
Dependencies:
Recommended next step:
Why:
```

Write `None` for Unit boundaries and Dependencies unless the work needs decomposition.

## Successor routing

Recommend exactly one, based on the result.

| Result | Recommended next step |
| --- | --- |
| Direction selected, implementation intent still needs synthesis | `feature-spec` |
| An adequate source artifact needs decomposition/tracking | fill Unit boundaries and Dependencies; Recommended next step: stop |
| Already a settled single unit | `implement` (localized) or relay (durable/high-risk), by task-specific evidence |
| User asked for exploration only | stop after the handoff |
| User asked to stress-test an already-chosen plan | recommend a compatible grill capability only when it is observed available, else record it unavailable and stop — do not impersonate grill |

Availability is observed, never inferred from prose or from unrelated global installations on this machine. Read `references/routing.md` for mixed-signal, contradicting-evidence, and worked-example cases.

## Capabilities

Uses two capabilities: read-only `inline_repository_work` and `blocking_user_question`. If the blocking-question capability is unavailable, do not guess through the blocker — inspect what is discoverable, move every unresolved material decision into *Unresolved human decisions*, and keep the Design Handoff contract unchanged.
