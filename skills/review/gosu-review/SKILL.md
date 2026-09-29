---
name: gosu-review
description: Post-build value review, not a bug review. A real panel of 4-6 independent subagents re-examines a built feature, PR, plan, or skill from the user's, the premise's, the project's, and the alternatives' vantage, and returns keep/sharpen/rethink/drop verdicts, what changes the decision, where the seats disagree, and lighter shapes worth considering.
disable-model-invocation: true
---

# gosu-review

A plain review already finds the defects in what was built. gosu-review asks what that review does not: now that it exists, is it still worth it — to the people it was built for, to what the project is for, against the alternatives? Each seat is a real subagent with fresh context, looking from a vantage above the change itself. Leave line-level defects to a normal review; a seat that sees a critical one notes it in a line.

## Target

Review `/gosu-review <target>` when given; otherwise the most recent artifact in the conversation — a feature, a change, a plan, a skill, a document. If several are plausible, ask one question, `Do you want me to review X?`, and start nothing else. Read `"this"` as the most recent artifact and `"this repo"` as the current repository state. On a broad target, continue but warn once that a narrower scope gives a sharper review.

Gather two things for every brief: the origin — the issue, plan, or request that asked for it and why — and the project's own statement of purpose, such as its README, charter, or spec. When either is missing, say so in the brief rather than inventing it.

## Seats

Pick 4-6 vantages that could reach different answers, one seat each. Three are always there:

- **User** — meets it as the person it was built for. Would they notice it, reach for it, trust it? What do they do instead today?
- **Premise** — knowing what the build revealed, would we build this again, in this shape? Is it the right problem?
- **Subtract** — what can go with nothing lost: an option, a mode, the whole thing.

Fill the rest from what the target puts at stake:

- **Project thesis** — does it strengthen what the project says it is for, or pull it sideways?
- **Alternatives** — what already does this: other tools, built-ins, the obvious manual way. Why would anyone pick this one?
- **Cost of owning** — what this value costs in complexity, upkeep, and attention over the next year.
- A specific audience the target serves or burdens: a buyer, a maintainer, a newcomer, an operator.

## Dispatch

Spawn one real subagent per seat, all before reading any result. If the host caps concurrency, start the rest as slots free. Prefer a role that can read whole files and, for outward-looking seats, search the web. If a call fails, retry it simpler. Wait without busy polling.

If subagents cannot be found or called, stop with:

```text
subagent unavailable: <reason>
This is not a gosu-review result. I can do a single-agent review instead if you ask.
```

Each subagent sees only its brief:

```text
You are one of several independent reviewers of something already built. The
question is not whether it has bugs but whether it is worth it. Your vantage:
<vantage and its question>
<optional one-line role>

Target: <path, diff, repo scope, or artifact>
Origin: <what it was meant to achieve, and why; or "not found">
Project purpose: <what the project says it is for, and where it says so; or "not stated">
Context: <audience, constraints, anything else>

Read the target, and try it if you can, before you write. Go deeper on your
vantage than a general reviewer would. Keep what you observed — in the target,
the origin, or a source you cite — apart from what you judge; a judgment is
welcome when you say what it rests on. When your vantage looks outward, check
claims about alternatives or the market against current sources on the web
rather than memory, and cite them. Leave line-level defects to a normal review;
note a critical one in a line. Finding nothing that changes the call is a
valid answer; say why.

Return:
- verdict: keep (worth it as built) | sharpen (worth it after the changes you name) |
  rethink (the value is real but this is the wrong shape) | drop (not worth keeping)
- headline: one sentence
- points: each with the claim, what it rests on (observed: anchor or source;
  judged: the observations it builds on, then the reasoning), who it matters
  to, and what you would do
- critical defects, only if seen: one line each
- what would change my mind
```

## Cross-examine

A conflict is two entries that point opposite ways on the same element — keep it versus drop it, widen it versus cut it. A vantage one seat missed is not a conflict, and neither is severity. On a conflict, run one round on at most the two costliest to get wrong: read `references/cross-examine.md`.

## Output

Lead with a one-line answer to whether it is still worth it. Synthesis invents nothing: a point reaches the decision only through the observations it rests on, anything else stays in Panel, and agreement is not evidence. A point only one seat raised stands on its basis like any other. Keep versus drop on the same element is a Tension.

```text
# gosu-review: <target>
target: <selected target>
casting: <the vantages, one line>

**Verdicts**
- <seat>: <verdict> — <headline>

## What changes the decision
- <point> — <seat(s), or "only <seat>"> — <observed: anchor/source | judged: basis>

## Tensions
- <A> vs <B>: <what>. resolved: <who moved, on what basis> — <the call>
  | unresolved: <both positions> — <what would settle it>

## Critical defects (only if a seat noted one)
- <defect> — <seat> — <anchor>

## Panel
### <seat> — <verdict>
<headline>
- <claim> — <basis> → <who it matters to>. Do: <action>
would change my mind: <falsifier>

## Meta
- requested: N / returned: M / tool: <name>
- panel: complete | partial
- cross-examine: none | resume | fresh
- web: used by <seats> | unavailable | not needed
```

The panel is complete when `requested == returned`, both in 4-6; otherwise label it partial. If fewer than 2 return, skip synthesis: show the raw entries and recommend a retry.
