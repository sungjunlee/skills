---
name: gosu-review
description: Review the current artifact with a real panel of 4-6 independent subagents, each starting from a different question, one of them whether the premise holds.
disable-model-invocation: true
---

# gosu-review

One independent reviewer already catches most defects. A panel earns its cost in two places a single pass does not reach: reviewers who start from different questions, so they diverge instead of repeating one pass, and a reviewer who does not accept the premise. Every seat is a real subagent with fresh context, and every finding points at the artifact.

## Target

Review `/gosu-review <target>` when given; otherwise the most recent artifact in the conversation — code just edited, a plan, a skill, a decision, a document. If several are plausible, ask one question, `Do you want me to review X?`, and start nothing else. Read `"this"` as the most recent artifact and `"this repo"` as the current repository state. On a broad target, continue but warn once that a narrower scope gives a sharper review.

When the target is a change — a diff, a PR, uncommitted work — every brief carries the defect it claims to fix and its premise, and a fix is judged by whether it fixes that.

## Seats

Pick 4-6 questions that pull apart on this target, one seat each. Three are always there:

- **Premise** — does not accept the framing. Is this the right problem and the right approach? What is the strongest alternative, and should this exist at all?
- **Break** — tries to make it fail: inputs, callers, states, timing, misuse. Add a second when the user asks for red-team or the target is high-risk.
- **Subtract** — what can go: a step, an option, a file, the whole thing.

Fill the rest with questions only someone close to this target would ask — what a first-time user hits at step 2, what the thousandth run costs, what a maintainer inherits in six months. On a change, one seat asks what else reaches the same sink as the defect, and one knows the platforms or callers the change now claims to cover. A one-line role may sharpen a question; a backstory does not.

## Dispatch

Spawn one real subagent per seat, all before reading any result. If the host caps concurrency, start the rest as slots free. Prefer a read-only role that can open whole files. If a call fails, retry it simpler. Wait without busy polling.

If subagents cannot be found or called, stop with:

```text
subagent unavailable: <reason>
This is not a gosu-review result. I can do a single-agent review instead if you ask.
```

Each subagent sees only its brief:

```text
You are one of several independent reviewers, each starting from a different
question. Yours: <question>
<optional one-line role>

Target: <path, diff, repo scope, or artifact>
Context: <what it is, why it exists, constraints>
Change (only for a change): <the defect it claims to fix>; <its premise>

Read the target before you write. Other seats and a general pass cover the
obvious defects; go deeper on your question than they would, and list other
real defects you see in a line each. Tie each finding to the artifact — file:line, a
quote, or the detail you observed; a claim you did not check does not belong.
Say plainly when the approach is wrong. Zero findings is a valid answer; say why.

Return:
- verdict: ship (lands as-is) | fix (lands after the changes you name) |
  rethink (the approach is wrong; fixes would not save it)
- headline: one sentence
- findings: each with the claim, its evidence, what it breaks and for whom, and the fix
- what would change your mind
```

## Cross-examine

A conflict is two entries that point opposite ways on the same element — remove it versus extend it, this mechanism versus that one. Coverage one seat missed is not a conflict, and neither is severity. On a conflict, run one round on at most the two costliest to get wrong: read `references/cross-examine.md`.

## Output

Lead with a one-line call. Synthesis invents nothing: a finding without evidence stays in Panel, and agreement is not evidence — the artifact is. A finding only one seat raised stands on its evidence like any other. A removal and an addition on the same element is a Tension.

```text
# gosu-review: <target>
target: <selected target>
casting: <the seat questions, one line>

**Verdicts**
- <seat>: <verdict> — <headline>

## What changes the decision
- <finding> — <seat(s), or "only <seat>"> — <evidence>

## Tensions
- <A> vs <B>: <what>. resolved: <who moved, on what evidence> — <the call>
  | unresolved: <both positions> — <what would settle it>

## Panel
### <seat> — <verdict>
<headline>
- <claim> — <evidence> → <what it breaks>. Fix: <fix>
would change my mind: <falsifier>

## Meta
- requested: N / returned: M / tool: <name>
- panel: complete | partial
- cross-examine: none | resume | fresh
```

The panel is complete when `requested == returned`, both in 4-6; otherwise label it partial. If fewer than 2 return, skip synthesis: show the raw entries and recommend a retry.
