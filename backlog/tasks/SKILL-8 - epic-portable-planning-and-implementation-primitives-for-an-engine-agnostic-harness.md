---
id: SKILL-8
title: 'Epic: portable planning and implementation primitives for an engine-agnostic harness'
status: To Do
labels: []
priority: medium
milestone:
created_date: '2026-07-11'
---
## Description
## Context

The personal harness currently combines several intentionally separate systems:

- **CraftKit** owns durable repository contracts such as project direction, system shape, and capability contracts.
- **dev-backlog** owns tracker-backed task state, sprint ordering, and session continuity.
- **dev-relay** owns durable delegated execution: isolated workspaces, manifests, independent review, recovery, and PR/MR lifecycle.
- **gstack** remains an external library of specialist lenses rather than a core runtime dependency.
- **delegate** remains a one-shot external executor transport.

Superpowers has been removed as an installed plugin. Its useful disciplines should be selectively absorbed without recreating its framework, hidden chaining, or global skill surface. Matt Pocock's skills are closer to the desired thin explicit primitives, but their setup and issue-management model should not replace the existing CraftKit + dev-backlog + dev-relay ownership model.

Claude Code and Codex are the primary daily hosts, while OpenCode, Cursor, and Pi are also used. Core skill semantics therefore must be agent-engine agnostic.

## Goal

Add a small set of portable personal primitives that cover the missing path from vague intent to current-session implementation:

```text
brainstorming
  -> feature-spec
    -> dev-backlog shape, when decomposition or durable tracking is needed
      -> implement or relay
    -> implement or relay, when the feature is already a single settled unit
```

The user may enter at any stage when the input is already clear. No implicit chain is required.

## Canonical ownership

| Concern | Owner |
|---|---|
| Open-ended intent exploration | `brainstorming` |
| Implementation-ready feature intent | `feature-spec` |
| Epic/issue/local-task decomposition and sprint insertion | dev-backlog `shape` |
| Current-session execution | `implement` |
| Durable isolated execution and PR/MR lifecycle | dev-relay |
| External executor transport | `delegate` |
| Project direction/system/capability contracts | CraftKit |

A primitive may transform or recommend, but it must not silently mutate another owner's state.

## Planned work

- [ ] #12 — land the shared engine capability contract, repository layout, replay schemas, and verifier first.
- [ ] #9 — add the explicit-only `brainstorming` skill after #12.
- [ ] #10 — add the tracker-neutral `feature-spec` compiler after #12.
- [ ] #11 — add portable explicit-only `implement` after #12.
- [ ] #13 — run the cross-host semantic replay and routing calibration after #9-#12.

## Cross-skill contracts

### Design Handoff

Must capture the problem, user outcome, chosen direction, important alternatives, constraints, unresolved decisions, and recommended successor. It is not a file-by-file plan.

### Feature Spec

Must capture scope, non-goals, observable acceptance criteria, verification strategy, and architecture-altitude decisions. It is tracker-neutral and does not publish issues.

### Execution Handoff

Must present both choices when viable:

1. `implement` — current-session execution with orchestrator-owned verification.
2. `relay` — durable isolated execution with manifest, PR/MR lifecycle, independent review, and recovery.

It records one recommendation and task-specific reasons. An explicit user-selected route always wins.

## Portability requirements

- Core instructions describe intent, artifacts, decisions, and completion semantics in tool-neutral language.
- Host-specific tool names, permission modes, dispatch syntax, and metadata stay in references/adapters.
- Capability degradation is predictable: isolated bounded parallel -> serial worker -> inline.
- Artifact formats, statuses, verification, and escalation semantics remain stable across Claude Code, Codex, OpenCode, Cursor, and Pi.
- Shared skills remain installable through `npx skills`; no single-host plugin is required.

## Non-goals

- Reintroducing Superpowers as a framework.
- Installing `setup-matt-pocock-skills` as a project control plane.
- Creating a second tracker vocabulary or `ready-for-agent` lifecycle.
- Folding worktrees, crash recovery, PR/MR management, or repeated independent review into `implement`.
- Replacing CraftKit specs, dev-backlog state, relay manifests, or forge handoff artifacts.
- Building a new generic router or autonomous loop.

## Completion criteria

- #12 lands before #9-#11, and #13 records the final replay evidence after all three skills land.
- The same conceptual workflow works on at least Claude Code and Codex, with documented degradation for other hosts.
- Medium current-session work is routed to `implement`; durability-heavy work is routed to relay before editing.
- No new source of truth or mandatory setup framework is introduced.


## Cross-repository work

- [ ] [dev-backlog direction decision](https://github.com/sungjunlee/dev-backlog/issues/270) — accept or reject the configured-tracker boundary before adapter implementation issues are opened.
- [ ] [CraftKit portability guidance](https://github.com/sungjunlee/craftkit/issues/142) — maintain general capability-based skill-authoring guidance.
- [ ] [autoloop repository retirement](https://github.com/sungjunlee/autoloop/issues/1) — remove the unused autonomous loop from active discovery.
- [ ] [autoloop operator cleanup](https://github.com/sungjunlee/autoloop/issues/2) — remove installed entries and make the repository archive decision outside relay.
- [x] [dev-relay external refinement adapter proposal](https://github.com/sungjunlee/dev-relay/issues/131) — closed in favor of settled-artifact handoff.
- [ ] [craft-autoresearch posture](https://github.com/sungjunlee/craftkit/issues/107) — retain only as a dormant explicit-only experiment tool.

The dev-backlog foundation issues and any thin relay integration issue should be opened only after their upstream contracts are accepted. GitLab, Gitea, and Forgejo adapter issues are deferred until the GitHub/local seam passes its core sprint-cycle evidence.


## Delivery order

```text
                 -> #9 brainstorming ----\
#12 foundation -> #10 feature-spec -------+-> #13 cross-host validation
                 -> #11 implement --------/
```

#9 and #10 may proceed in parallel after #12. #11 may begin from settled fixtures after #12, but #13 is the authority for end-to-end route calibration. The epic itself is not a relay leaf and must not be dispatched as one task.
