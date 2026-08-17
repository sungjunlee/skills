# skills Capabilities

This file is the middle layer between `spec/charter.md` (north star) and the active sprint (this week's tasks). Each capability describes one subsystem buckets-worth of work with a frozen-ish contract and a structurally-bounded live-feedback channel.

Use loose prose and strict handles. Goal, scope, behaviors, sprint Plan, and Running Context are where agents can explain nuance. Capability IDs and sprint `component:` values are routing handles: use one lowercase slug such as `sprint-execution`, not a sentence or comma-separated list.

Mutation discipline (matches the design doc):

| Section | Who writes | When | Gate |
|---|---|---|---|
| `Goal`, `In-scope`, `Out-of-scope` | human via `spec-grill` | when the contract changes | challenge + confirm + apply |
| `Expected Behaviors`, `Hard Constraints` | human via grill | when a behavior or bright-line changes | grill + 3-axis predicate test |
| `## Learnings` (between magic markers) | bounded Learnings writer when one exists; otherwise human-approved Learning Action | after a successful run discovers reusable operational knowledge for this primary capability slug | structurally bounded append; no free-editing during ordinary grilling |
| `## Decisions` | human, append-only | when a capability-level decision is made | append-only by convention; promote to `spec/charter.md` if cross-cutting |

Compactness budget:

- Target 5-10 capabilities.
- Warn above 12 capabilities or 400 lines.
- Split above 500 lines, above 15 capabilities, or when ownership boundaries demand separate review paths.
- Keep the most recent 5-7 Learnings inline per capability; promote durable rules to Decisions and archive older history outside this hot file.

Do not create one capability per feature folder. A capability is a durable contract boundary with distinct Behaviors and Hard Constraints.

Do not store issue-specific acceptance criteria, scoring rubrics, or review notes here. Those belong to GitHub/task files, sprint files, and durable execution artifacts. Capability specs may be informed by that evidence, but they record only durable contracts.

---

## Capability: skill-packaging

**Goal:** Someone can install any skill in this repo into their own agent and it works from its own `SKILL.md`, without carrying repo tooling along.

**In-scope:**
- The `skills/<category>/<name>/` layout and its discoverability by full-depth scanning installers
- What belongs in `SKILL.md` versus `references/`, and each skill's self-sufficiency
- README skill listings staying in step with what exists on disk

**Out-of-scope:**
- What any individual skill's workflow should say — that is the skill author's judgment, not a repo contract
- Evidence that a skill behaves as documented — owned by `replay-evidence`
- Model or effort routing advice inside the delegate skill — owned by `delegate-evaluation-loop`

### Expected Behaviors
- Every skill directory resolves through `npx skills add . --list --full-depth` and exposes exactly one `SKILL.md` at its root.
- A skill's documented workflow can be executed by reading only files inside that skill's own directory.
- A skill added to or removed from `skills/` is reflected in the README's skill list and layout example in the same change.

### Hard Constraints
- A `SKILL.md` never requires reading `docs/`, `evals/`, `spec/`, or repo scripts to be usable; maintainer-only material stays out of the runtime path even when that means repeating a definition.
- Supporting material is never added at the repository root as a shared `references/` directory; references live inside the skill that needs them, even when two skills would share content.

### Learnings
<!-- LEARN:BEGIN -->
<!-- entries appended by the bounded Learnings writer when one exists -->
<!-- until then, change this block only through a human-approved Learning Action -->
<!-- format: - YYYY-MM-DD (run #N): <one-line> [PR #X] -->
<!-- LEARN:END -->

### Decisions

| date | decision | rationale | supersedes |
| --- | --- | --- | --- |

---

## Capability: replay-evidence

**Goal:** A behavioral claim a skill makes about itself can be checked against dated transcripts of that skill actually running on real hosts, and old evidence stays readable after the contract changes.

**In-scope:**
- The replay case/result schemas, the frozen `replay-v1` legacy contract and its digest pin, and supersession rules
- `verify-replays.mjs` and `verify-cross-host-matrix.mjs`, including their self-test paths
- The engine capability vocabulary in `docs/engine-capability-contract.md` as maintainer guidance

**Out-of-scope:**
- Model-and-effort routing evidence and its promotion lifecycle — owned by `delegate-evaluation-loop`
- The content of the skills whose behavior is replayed
- Deciding whether a host is "better"; the vocabulary records per-capability observations, not rankings

### Expected Behaviors
- A contract migration lands as new dated documents that supersede the old ones, leaving every previously committed result file byte-identical.
- Superseding evidence carries observations from both required hosts on the migration date, with the date present in the result's path.
- Tampering with any digest-pinned legacy document fails verification with a message naming the frozen contract.

### Hard Constraints
- Evidence is never written from a summary, a memory of a run, or a re-used transcript; a result exists only after the host actually ran and its observation was recorded, even when regenerating "the same" evidence.
- No raw transcript, secret, or machine-specific absolute path is committed alongside a result, regardless of how much context it would add.

### Learnings
<!-- LEARN:BEGIN -->
<!-- entries appended by the bounded Learnings writer when one exists -->
<!-- until then, change this block only through a human-approved Learning Action -->
<!-- format: - YYYY-MM-DD (run #N): <one-line> [PR #X] -->
<!-- LEARN:END -->

### Decisions

| date | decision | rationale | supersedes |
| --- | --- | --- | --- |
| 2026-07-21 | `replay-v1` frozen as a digest-pinned legacy contract; supersession requires dual-host dated evidence | Contract migrations must not rewrite or orphan collected evidence | — |

---

## Capability: delegate-evaluation-loop

**Goal:** A routing recommendation in the delegate catalog can be traced to dated local runs that support it, and a claim without that evidence is visibly marked as a hint.

**In-scope:**
- The `delegate-eval-v1` case/result contract, the executor registry, and the fixture generators
- The bounded runner, its capability smoke, and the draft-then-promote curation step
- The promotion rule and the dated reports that apply it

**Out-of-scope:**
- The delegate skill's own dispatch workflow (`SKILL.md`) — owned by `skill-packaging`
- Replay evidence for skill behavior — owned by `replay-evidence`
- Live pricing or quota synchronization; costs are recorded as observed, never fetched

### Expected Behaviors
- A profile becomes a work-shape default only after all-checks-passing results on at least two distinct observation dates with no unresolved contradicting result; anything less stays a hint.
- Every committed result records tokens and cost only where the executor exposed them, leaving unavailable measurements null and keeping API marginal cost separate from subscription quota pressure.
- A failed or empty dispatch is committed as evidence of that failure rather than retried into a passing result.

### Hard Constraints
- Paid provider calls happen only inside an explicitly invoked bounded run; nothing in `npm test` or CI ever dispatches to a provider, even to verify the runner works.
- A fixture whose sensitivity is internal or private is never dispatched to a route outside its `approved_routes` allowlist, and grader answer keys never appear in executor-visible fixture text.

### Learnings
<!-- LEARN:BEGIN -->
<!-- entries appended by the bounded Learnings writer when one exists -->
<!-- until then, change this block only through a human-approved Learning Action -->
<!-- format: - YYYY-MM-DD (run #N): <one-line> [PR #X] -->
<!-- LEARN:END -->

### Decisions

| date | decision | rationale | supersedes |
| --- | --- | --- | --- |
| 2026-07-22 | `delegate-eval-v1`: append-only dated results, executor registry, privacy allowlists, paid calls only in explicitly invoked bounded runs | Routing claims need local evidence rather than vendor rankings, and CI must stay free | — |
| 2026-07-22 | Promotion rule: two dated all-passing results from different observation dates, no unresolved contradiction | Single observations and community reports were beginning to steer defaults | — |

---
