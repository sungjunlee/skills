---
id: SKILL-9
title: 'brainstorming: add a thin explicit-only Design Handoff primitive'
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

The current harness has strong durable specification, backlog, and delegated-execution systems, but it lacks a small personal primitive for exploring an initially vague idea before those systems should take ownership.

Superpowers `brainstorming` has been the most useful reference because it helps discover intent and converge on a design before implementation. However, importing the full Superpowers workflow would add implicit chaining and ceremony that do not fit this skill collection. Matt Pocock's `grill-*` skills are useful for adversarial refinement but solve a different problem: they stress-test an existing direction rather than collaboratively discovering one.

## Goal

Add an explicit-only, engine-agnostic `brainstorming` skill that turns vague intent into a selected direction and a compact Design Handoff.

The skill should ask only questions that materially change the decision, inspect relevant repository context when available, compare viable approaches, and converge without forcing the user through a fixed interview.

## Required behavior

1. Establish the problem, desired user-visible outcome, constraints, and current repository context.
2. Identify genuinely viable approaches and explain their material trade-offs.
3. Recommend one direction while allowing the user to override it.
4. Resolve high-impact uncertainty; record lower-impact uncertainty instead of prolonging the interview.
5. Produce the Design Handoff below.
6. Recommend a successor based on the result:
   - `feature-spec` when the direction is selected but implementation intent needs synthesis.
   - dev-backlog `shape` when an adequate source artifact already needs decomposition/tracking.
   - `implement` or relay when the work is already a settled single unit.
   - stop after the handoff when the user requested exploration only.
7. Never rely on implicit skill chaining; express the recommendation as output.

## Design Handoff contract

```markdown
## Design Handoff

Problem:
User-visible outcome:
Chosen direction:
Why this direction:
Important alternatives rejected:
Constraints and compatibility requirements:
Open decisions requiring a human:
Recommended next step:
Why:
```

The handoff stays at product/design/architecture altitude. It must not contain file-by-file implementation steps, tracker mutations, executor prompts, or a parallel project charter.

## Interaction rules

- Prefer one high-information question at a time when user input is required.
- Do not ask questions whose answers can be discovered safely from repository context.
- Do not repeat settled decisions.
- For a clear, low-risk request, keep the pass short.
- For consequential ambiguity, surface the branch and recommendation explicitly.
- If the user delegates judgment, choose and explain rather than blocking.
- Honor an explicitly requested next route without asking again.

## Portability

- Core `SKILL.md` uses no Claude Code-, Codex-, OpenCode-, Cursor-, or Pi-specific tool names.
- Repository inspection and blocking questions are described as capabilities.
- Host-specific invocation metadata may live in adapters/references.
- Lack of a host feature must shorten or degrade the interaction predictably, not change the artifact contract.

## Acceptance criteria

- [ ] The skill is explicit-only wherever host metadata supports it.
- [ ] It emits the complete Design Handoff contract.
- [ ] It distinguishes exploration from adversarial grilling and implementation planning.
- [ ] It recommends, but does not automatically invoke, the next owner.
- [ ] Historical vague-feature prompts are replayed on Claude Code and Codex.
- [ ] Replays demonstrate that settled questions are not repeated and trivial work is not over-interviewed.
- [ ] Installation and discovery work through the repository's normal `npx skills` distribution.

## Non-goals

- Recreating Superpowers' framework or mandatory writing-plans chain.
- Replacing CraftKit's project direction, system map, or capability contracts.
- Publishing issues or mutating dev-backlog.
- Producing an executor-ready micro-plan.
- Building a generic autonomous router.


## Relay execution contract

### Dependencies

Blocked by #12. Use its category layout, capability vocabulary, replay schemas, and verifier. This issue may land independently of #10 and #11.

### Target files

- Create `skills/planning/brainstorming/SKILL.md`.
- Create `skills/planning/brainstorming/references/routing.md` only for detailed successor examples and edge cases.
- Create `skills/planning/brainstorming/references/host-mappings.md` for host-specific invocation/question capabilities.
- Create `skills/planning/brainstorming/agents/openai.yaml` with `policy.allow_implicit_invocation: false`.
- Set `disable-model-invocation: true` in `SKILL.md` for Claude Code.
- Add the skill under a new Planning category in `README.md` and update the Repo Layout example.
- Add replay cases/results under the #12 `evals/` contract.

Keep the core spine short and understandable alone. Do not add a top-level `references/` directory.

### Required replay cases

1. **Vague feature:** emits every Design Handoff field, asks 1-5 material questions, and recommends `feature-spec`.
2. **Clear low-risk request:** asks at most one question, does not repeat supplied facts, and either emits a compact handoff or honors the explicitly requested successor.
3. **Exploration-only request:** emits a handoff and stops without invoking or mutating a successor.
4. **Existing settled design:** does not reopen the chosen direction unless repository evidence contradicts it.
5. **Grill request:** distinguishes adversarial stress-testing; recommends a compatible grill capability only when it is observed as available, otherwise records the successor as unavailable and stops after the Design Handoff rather than impersonating it.

Question-count assertions count actual blocking user questions, not rhetorical questions in explanatory prose.

### Observable completion criteria

- `npm test` validates all committed cases and result schemas.
- `npx skills add . --list --full-depth` discovers `brainstorming`.
- Both Claude Code and Codex result records satisfy cases 1-4; other hosts may remain `unverified` until #13.
- No case mutates tracker state, creates implementation files, or invokes a successor implicitly.
- README paths exactly match the committed folder.

### Authority boundary

This implementation changes only this repository. It must not globally install the skill, modify user-level agent configuration, or invoke dev-backlog/relay. Installation proof is discovery-only.


## Verification

```bash
npm test
npx skills add . --list --full-depth
```

The discovery output must include the new skill name and must not install or mutate global agent state.
