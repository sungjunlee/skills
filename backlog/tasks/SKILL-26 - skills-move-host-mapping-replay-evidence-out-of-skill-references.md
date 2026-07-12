---
id: SKILL-26
title: 'skills: move host-mapping replay evidence out of skill references'
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

The three `references/host-mappings.md` files (~1,200 words total) are dated replay-evidence tables ("2026-07-11 #13 replay observed ..."), not runtime reference. An agent running the skill never needs another host's observation log; the only runtime-relevant content in those files is a few lines of degradation/`unverified` rules that already live in each `SKILL.md` or `routing.md`. This is validation record sitting in the skill's context-pointer position — sediment per writing-great-skills.

Skills are independent distribution units (installed without `evals/` or `docs/`), so the fix is relocation, not cross-linking: evidence moves to the repo's evidence home, and skills keep only the semantics they execute.

## Goal

Skill references carry only runtime host-adaptation semantics; dated capability evidence lives under `evals/reports/` beside the existing cross-host report.

## Acceptance criteria

- [ ] The dated capability-evidence tables from `brainstorming`, `feature-spec`, and `implement` `references/host-mappings.md` are consolidated into a dated report under `evals/reports/`, preserving every evidence row.
- [ ] The three `references/host-mappings.md` files are removed; any surviving runtime rule (degradation order, `unverified` default) has exactly one home inside its skill.
- [ ] No `SKILL.md` or `agents/openai.yaml` points at `references/host-mappings.md` or outside its own skill directory.
- [ ] `docs/engine-capability-contract.md` § Host mapping rules is amended: evidence rows belong in `evals/reports/`; skill references hold adaptation semantics only.
- [ ] `README.md` source lists and layout tree no longer list the removed files.
- [ ] `npm test` passes.
