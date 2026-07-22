---
id: SKILL-33
title: 'delegate: validate routing profiles with a representative task matrix'
status: Done
labels:
  - type: skill
  - type: validation
priority: medium
milestone: Delegate routing validation
created_date: '2026-07-21'
---
## Description
## Context

PR #32 added task-shaped model and effort recommendations, but the catalog intentionally remains a stale-prone hint rather than an authority. Claims such as Luna `xhigh` versus Terra `high`, Sol and Fable effort boundaries, and Grok `medium` versus `high` should be calibrated with representative local outcomes instead of vendor rankings or isolated community reports.

## Goal

Build a small, repeatable evaluation loop that identifies cost-effective model-effort profiles by work shape while keeping live provider capability checks separate from outcome evaluation.

## Proposed evaluation matrix

Cover a compact set of representative work shapes:

- mechanical change with strong tests
- ambiguous normal feature or bug fix
- cross-component change with implicit invariants
- long-horizon autonomous execution
- architecture or other high-blast-radius analysis
- independent review using a different model family

Compare only meaningful profile pairs for each shape, initially including:

- Luna `xhigh` versus Terra `high`
- Sol `high` versus Sol `xhigh`
- Fable `high` versus Fable `xhigh`
- Grok `medium` versus Grok `high`

## Measurements

Record enough evidence to compare task-specific Pareto candidates rather than produce one global model ranking:

- acceptance-test or rubric result
- defects found by an independent reviewer
- wall-clock duration
- input, output, and reasoning-token usage when exposed
- estimated API cost or subscription quota consumption, kept distinct
- amount of follow-up correction required

## Acceptance criteria

- [x] A committed delegate evaluation case format represents work shape, fixture, acceptance checks, candidate profiles, and privacy constraints.
- [x] At least one case exists for each work shape listed above.
- [x] A local runner can execute an explicitly selected subset of cases and profiles without requiring every provider credential.
- [x] A low-cost capability smoke verifies live model IDs and supported effort values before paid evaluation runs where the CLI exposes that information.
- [x] Evaluation results are append-only dated evidence; existing results are never rewritten to match a new profile contract.
- [x] A report groups results by work shape and presents Pareto candidates using quality, latency, and cost or quota signals.
- [x] The catalog promotion rule requires repeated local evidence before a profile becomes a default recommendation.
- [x] `npm test`, schema validation, and a self-test path run without provider credentials.
- [x] Documentation explains how to run a bounded provider-specific evaluation and how to interpret incomplete or unavailable metrics.

## Non-goals

- automatic task classification or automatic provider dispatch
- a universal model leaderboard
- paid provider calls in normal CI
- live pricing or quota synchronization
- expanding the model catalog before evaluation evidence justifies it

## Design constraints

- Prefer live provider model lists over catalog slugs.
- Preserve the catalog as concise routing guidance, not an authoritative registry.
- Keep API marginal cost separate from subscription quota pressure.
- Do not send private fixtures through routes that are not approved for sensitive data.

Depends conceptually on #32. Independent of #29.
