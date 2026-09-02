---
name: gosu-review
description: Review the current artifact with a real 4-6 person expert subagent panel.
disable-model-invocation: true
---

# gosu-review

Get a real panel review from multiple experts. Fake panels fail the skill, and so do ungrounded ones — dispatch actual subagents, and keep every finding tied to the evidence that produced it.

## Target

If the user provides `/gosu-review <target>`, review that target. If not, review the most recent artifact in the conversation: code just edited, a plan, a skill definition, a design decision, a document, or similar. If several candidates are plausible, ask a short confirmation question before starting: `Do you want me to review X?` Ask only when the target is unclear.

Always show the selected target near the top of the final output. Handle loose references pragmatically: `"this"` or `"the thing above"` → most recent artifact; `"this repo"` or `"overall"` → current repository state; `"the skill wording"` → the relevant `SKILL.md` plus needed `references/*`. If the target is broad, continue but warn once: `Wide scope: casting may be less sharp. Use /gosu-review <narrower scope> for a tighter review.`

When the target is a change — a diff, a PR, uncommitted work — name it as one. Every brief then carries the defect the change claims to fix, and the change's own premise. Panelists judge a fix by whether it fixes that. Tilt two seats: one asks what else reaches the same sink as the thing being fixed; one knows the platforms, shells, or callers the change now claims to cover.

**Complete when:** exactly one target is named, or one confirmation question is asked and nothing else has started.

## Cast

Pick 4-6 panelists for this target. Extract the target's axes first:

- Audience: who uses this, and when failure hurts
- Domain: finance, education, community, internal tools, creator workflows, legal, data, research, etc.
- Artifact type: code, UX, doc, policy, skill, strategy, operating process, decision
- Failure mode: trust, cost, comprehension, maintenance, adoption, speed, safety, quality

Then mix the panel:

- 2-3 context-specific experts
- 1-2 general quality experts
- 1 adversarial or surprising outsider
- 1 ruthless simplifier whose fix path is removal — cut the step, drop the reference, delete the option, merge the two documents, or say the artifact should not exist. On a four-person panel this seat may share the challenger's; past that keep them apart.

For each panelist, put these three into the brief verbatim — they are the subagent's search key:

- **Lens**: what they optimize for
- **Bias**: what they distrust, usually from a specific past failure
- **Blind spot**: what this persona is uniquely likely to catch

The persona line is `You are reviewing as: <persona>`. Pick the scar: a specific past failure that shaped how they look. A label like `PM` produces a generic review; a `PM who shipped three onboarding rewrites and watched activation keep dropping in steps 2-4` produces a gosu one.

At least one panelist is explicitly adversarial unless the target is purely exploratory. Use two challengers only when the user asks for challenge, red-team, or adversarial review, or when the target is high-risk. A challenger tries to break the artifact.

When casting is not obvious, invent from the seed patterns in `references/personas.md` rather than copying that list.

**Complete when:** 4–6 personas are named, every brief carries a scar plus Lens / Bias / Blind spot, the mix above is present, and the adversarial rule above holds.

## Dispatch

Find the available subagent or multi-agent tool, then spawn one real subagent per persona. Dispatch every panelist before reading any result. If the host caps concurrency, start the remaining panelists as slots free; that is still a parallel panel. Prefer a read-only role that can open whole files and judge them. If a tool option fails, retry with a simpler call. Wait for completion without busy polling.

If subagents cannot be found or called, stop with:

```text
subagent unavailable: <reason>
This is not a gosu-review result. I can do a single-agent review instead if you ask.
```

Give each subagent this brief. Subagents see only the brief, so it carries the entry shape itself.

```text
You are reviewing as: <persona>
Lens: <what you optimize for>
Bias: <what you distrust, and the failure that taught you>
Uniquely likely to catch: <this persona's blind-spot coverage>

Target: <path, diff, repo scope, or artifact>
Context: <5-10 lines: what, why, constraints>
Focus: <persona-specific mandate>
Change (only if the target is a change): claimed defect; the change's premise

Open the target and read it before you write anything. Your bias is the search
key: find where that failure pattern shows up here, or say plainly that it does
not. A claim you did not check against the artifact does not belong in the
answer.

Return one panel entry:

- verdict: ship | fix | rethink
    ship: it would land as-is; remaining findings are optional
    fix: specific named changes, then it lands
    rethink: the approach is wrong, not the details; listed fixes would not save it
- sharp take: one sentence — the headline, not the argument
- findings: 0-4 entries, each with
    what: the claim
    evidence: file:line, a quote, or the specific detail you observed
    so what: the concrete failure — who it hurts, when, how badly
    fix: the change you would make
- what would change my mind: the observation that would retract your main finding

Length follows what you found. If your axis turns up nothing real, return zero
findings and say why — that is a useful answer, not a failed one.
```

The brief carries the three-line verdict definition panelists need; `references/verdict.md` has the worked boundaries for choosing between neighbors.

**Complete when:** every cast panelist has been spawned before any result is read, or the unavailable stop block has been returned.

## Cross-examine

A conflict is two entries that name the same element and point opposite ways — remove it versus extend it, this mechanism versus that one. One panelist covering ground another missed is not a conflict, and neither is disagreement about severity.

Run one round, only on a conflict, at most the two sharpest by cost of getting them wrong. Put those two panelists back in front of the artifact with each other's position; read `references/cross-examine.md` for the brief and how to read the returns.

## Output

Lead with a one-line verdict summary. Render in the template order. Panel displays each returned brief; it does not redefine the shape. Invent nothing in synthesis: a finding with no evidence stays in Panel and never reaches Consensus. An empty findings list stays empty. A removal and an addition on the same element is a Tension, not two Consensus items.

A complete gosu-review requires `requested == returned` and both in 4–6. Otherwise label Meta `partial` and present it as partial. If fewer than 2 agents return, skip synthesis and show only raw notes plus a retry recommendation.

```text
# gosu-review: <target>
target: <selected target>
casting: <2-3 specialized + 1-2 quality + 1 outsider/adversarial + 1 simplifier, one line>

**Verdicts**
- <persona>: <verdict> — <sharp take>

## Tensions
- <A> vs <B>: <what>.
  resolved: <who moved, on what evidence> — <the call>
  or unresolved: <both positions held> — <what would settle it>

## Consensus
- [P1] <action> — <persona names>

## Panel
### <persona> — <verdict>
<sharp take>
- <what> — <evidence> → <so what>. Fix: <fix>
would change my mind: <falsifier>

## Meta
- requested: N agents / returned: M / tool: <name or "unavailable">
- panel: complete | partial
```
