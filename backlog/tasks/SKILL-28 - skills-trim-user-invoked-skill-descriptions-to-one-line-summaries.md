---
id: SKILL-28
title: 'skills: trim user-invoked skill descriptions to one-line summaries'
status: To Do
labels:
  - type: skill
priority: medium
milestone: Epic 8 - Skill pruning
created_date: '2026-07-12'
---
## Description
Parent epic: https://github.com/sungjunlee/skills/issues/8
Origin: writing-great-skills review of the Epic 8 skills (2026-07-12).

## Context

All three Epic 8 skills set `disable-model-invocation: true`, so their `description` is human-facing. Per writing-great-skills, a user-invoked skill's description should be a one-line summary with trigger lists stripped — yet brainstorming and feature-spec carry model-invocation-style trigger phrasing ("Use on an explicit brainstorm/explore request when...", "Not for stress-testing...") that nobody's invocation machinery reads. The routing content the triggers gesture at already lives in the skill bodies and README.

## Goal

Each Epic 8 skill description is a single human-facing sentence.

## Acceptance criteria

- [ ] `brainstorming`, `feature-spec`, and `implement` descriptions are one sentence each, without trigger or anti-trigger lists.
- [ ] `agents/openai.yaml` interface strings stay consistent with the trimmed descriptions.
- [ ] No body or reference content changes under this issue.
- [ ] `npm test` passes.
