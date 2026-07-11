---
id: SKILL-10
title: 'feature-spec: compile settled design into tracker-neutral implementation intent'
status: To Do
labels:
  - type: skill
priority: medium
milestone: Epic 8 - Planning pipeline
created_date: '2026-07-11'
---
## Description
Parent epic: https://github.com/sungjunlee/skills/issues/8

## Context

The most useful workflow includes a distinct specification pass after brainstorming and before epic/issue creation or implementation. Collapsing a selected design directly into tickets loses cross-cutting intent; using a detailed implementation plan too early adds file-level guesses and duplicates executor planning.

The missing primitive is closer to Matt Pocock's `to-spec` than to Superpowers' `writing-plans`: it should synthesize settled decisions into implementation-ready intent while remaining independent of any tracker, setup framework, or execution engine.

## Goal

Add a tracker-neutral `feature-spec` skill that lets a fresh agent understand what must be delivered and verified without rediscovering product decisions.

It may consume a Design Handoff, conversation, existing proposal, tracker task, or equivalent settled source. It should inspect relevant repository contracts and implementation context, but it must not reopen decisions unless evidence shows a contradiction or a genuinely blocking gap.

## Output contract

A feature spec must include:

- problem and user-visible outcome
- selected approach and rationale
- important rejected alternatives
- scope and non-goals
- constraints and compatibility requirements
- observable acceptance criteria
- verification strategy
- architecture-altitude technical decisions
- unresolved human decisions, if any
- artifact lifetime recommendation
- execution handoff or routing to dev-backlog `shape`

For multi-session or multi-ticket work, recommend one durable Markdown feature spec using the repository's existing convention, falling back to `docs/specs/YYYY-MM-DD-<slug>.md`. Leaf tasks should link to it and carry only slice-specific acceptance criteria. For short-lived work, returning the spec as an uncommitted handoff is sufficient.

## Routing behavior

- If decomposition, dependency edges, or durable collaboration are required, emit a tracker-neutral decomposition handoff. Recommend dev-backlog `shape` only when that capability is observed as available; otherwise record `shape unavailable` and stop without tracker mutation.
- If the spec is a settled single unit, emit:

```markdown
## Execution Handoff

1. implement — current-session execution with inline or bounded workers
2. relay — isolated durable execution with manifest, PR/MR, independent review, and recovery

Recommendation: implement | relay
Why: <task-specific durability, isolation, review, risk, and parallelism evidence>
```

- Honor an already selected route without asking again.
- In unattended/file-based flows, record the recommendation rather than introducing a blocking prompt.

## Boundaries

The feature spec does not replace:

- `spec/charter.md`, `spec/system-map.md`, or `spec/capabilities.md`
- tracker-task acceptance criteria
- dev-backlog ticket/sprint state
- relay-plan's frozen Done Criteria and rubric
- code-level implementation planning

It may read durable repository contracts as constraints, but it cannot amend them.

## Portability requirements

- The artifact and completion semantics are identical across Claude Code, Codex, OpenCode, Cursor, and Pi.
- Core instructions use capability language rather than host tool names.
- Tracker publication and execution are successor-owner operations, not hidden effects.
- No dependency on `setup-matt-pocock-skills` or any host plugin.

## Acceptance criteria

- [ ] Produces all required sections from a Design Handoff and from an already-clear tracker task.
- [ ] Does not repeat a completed brainstorming interview.
- [ ] Detects and reports contradictions with durable repository contracts.
- [ ] Emits observable AC and verification strategy without file-by-file micro-steps or pasted implementation code.
- [ ] Correctly chooses among an observed `shape` successor, a `shape unavailable` decomposition handoff, and a direct Execution Handoff in replay fixtures.
- [ ] Direct consumers can use the artifact: dev-backlog `shape`, `implement`, and relay-plan.
- [ ] Claude Code and Codex replays yield semantically equivalent artifacts.

## Non-goals

- Publishing or editing tracker items.
- Owning dependency graphs or sprint insertion.
- Mandatory persistence for small work.
- Forced commits or micro-task checklists.
- Replacing CraftKit's durable project contracts.


## Relay execution contract

### Dependencies

Blocked by #12. Use its category layout, replay schemas, capability vocabulary, and verifier. #9 is not a code dependency; a committed Design Handoff fixture may stand in until #9 lands. Full cross-skill execution is verified in #13.

### Target files

- Create `skills/planning/feature-spec/SKILL.md`.
- Create `skills/planning/feature-spec/references/spec-template.md` for the complete output template.
- Create `skills/planning/feature-spec/references/routing.md` for persistence and successor rules.
- Create `skills/planning/feature-spec/references/host-mappings.md`.
- Create explicit-only metadata under `agents/openai.yaml` and Claude-compatible frontmatter.
- Add the skill under Planning in `README.md` and update the Repo Layout example.
- Add cases/results under the #12 `evals/` contract.

### Required output headings

```markdown
# Feature Spec: <title>

## Problem
## User-visible outcome
## Chosen approach
## Important rejected alternatives
## Scope
## Non-goals
## Constraints and compatibility
## Acceptance criteria
## Verification strategy
## Architecture-level decisions
## Unresolved human decisions
## Artifact lifetime
## Execution Handoff
```

When decomposition is still required, replace `Execution Handoff` with the tracker-neutral decomposition handoff. Add a `dev-backlog shape` recommendation only when that capability is observed as available; otherwise record `shape unavailable`.

### Persistence authority

- Default: return the complete feature spec in the response.
- Write a repository file only when the invocation authorizes edits and the destination is unambiguous.
- For durable multi-session/multi-ticket work, prefer the repository's existing spec convention; otherwise suggest `docs/specs/YYYY-MM-DD-<slug>.md`.
- If edit authority or destination is ambiguous, return the body plus suggested path without blocking.
- Never publish tracker items, mutate sprint state, or invoke the successor implicitly.

### Required replay cases

1. Complete Design Handoff -> full feature spec without repeating the interview.
2. Complete tracker task -> full feature spec preserving supplied AC.
3. Contradiction with `spec/*` -> reports the exact conflicting contract and leaves a human decision unresolved.
4. Single settled unit -> Execution Handoff with one evidence-based `implement | relay` recommendation.
5. Multi-leaf work -> emits a tracker-neutral decomposition handoff; recommends dev-backlog `shape` only when observed available, otherwise records `shape unavailable`; does not invent tickets.
6. Short-lived task without edit authority -> returns the artifact without writing a file.

### Observable completion criteria

- Required headings parse from every successful result.
- Existing AC are preserved or strengthened, never silently dropped.
- Cases assert route, persistence behavior, unresolved-decision behavior, and forbidden side effects.
- Compatibility with `shape`, `implement`, and relay-plan is validated at schema/fixture level here; real integration belongs to #13.
- `npm test` passes.
- `npx skills add . --list --full-depth` discovers `feature-spec`.

### Authority boundary

This issue implements a specification compiler, not a tracker publisher or project-contract editor. It may read `spec/*`; it cannot amend those files.
