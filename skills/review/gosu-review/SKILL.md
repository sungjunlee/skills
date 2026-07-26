---
name: gosu-review
description: Review the current artifact with a real 4-6 person expert subagent panel. Use on explicit /gosu-review calls when code, plans, skills, design docs, decisions, or repo state need multiple context-specific perspectives.
---

# gosu-review

Get a real panel review from multiple experts. Fake panels fail the skill, and so do ungrounded ones — dispatch actual subagents, and keep every finding tied to the evidence that produced it.

## Target

If the user provides `/gosu-review <target>`, review that target. If not, review the most recent artifact in the conversation: code just edited, a plan, a skill definition, a design decision, a document, or similar. If several candidates are plausible, ask a short confirmation question before starting: `Do you want me to review X?` Do not ask when the target is clear.

Always show the selected target near the top of the final output. Handle loose references pragmatically: `"this"` or `"the thing above"` → most recent artifact; `"this repo"` or `"overall"` → current repository state; `"the skill wording"` → the relevant `SKILL.md` plus needed `references/*`. If the target is broad, continue but warn once: `Wide scope: casting may be less sharp. Use /gosu-review <narrower scope> for a tighter review.`

When the target is a change rather than an artifact — a diff, a PR, uncommitted work — name it as one, and carry two extra things in every brief: the defect the change claims to fix, and the change's own premise. Panelists judge a fix by whether it fixes that, and a rule that fails its own premise is invisible to anyone reading the result alone. Reviewing an artifact asks what is missing; reviewing a change asks what it just broke — and a change shipped under a safety label is the one least likely to be asked the second question.

## Cast

Pick 4-6 panelists for this target. The goal is not generic job titles; it is the sharpest reviewers for this artifact. First extract the target's axes:

- Audience: who uses this, and when failure hurts
- Domain: finance, education, community, internal tools, creator workflows, legal, data, research, etc.
- Artifact type: code, UX, doc, policy, skill, strategy, operating process, decision
- Failure mode: trust, cost, comprehension, maintenance, adoption, speed, safety, quality

Then mix the panel. Default includes one challenger:

- 2-3 context-specific experts (e.g. "B2B SaaS onboarding PM", "education content editor", "internal tooling operator", "open-source maintainer", "regulatory risk reviewer", "first-time user advocate")
- 1-2 general quality experts (e.g. architect, implementation expert, QA expert)
- 1 adversarial or surprising outsider (e.g. copy editor, cost watcher, skeptical user, future maintainer, new teammate, customer support rep)
- 1 ruthless simplifier who reviews for what to remove

For each panelist, define:

- **Lens**: what they optimize for
- **Bias**: what they distrust, usually from a specific past failure
- **Blind spot**: what this persona is uniquely likely to catch

All three go into that panelist's brief verbatim. They are the subagent's search key, not casting notes you keep to yourself.

The persona description you write here is what the subagent sees as `You are reviewing as: <persona>`. A label like `PM` produces a generic review; a `PM who shipped three onboarding rewrites and watched activation keep dropping in steps 2-4` produces a gosu one. Pick the scar.

At least one panelist must be explicitly adversarial unless the target is purely exploratory. Use two challengers only when the user asks for challenge, red-team, or adversarial review, or when the target is high-risk. A challenger tries to break the artifact, not balance praise.

On a change, tilt two of the seats. One asks what else reaches the same sink as the thing being fixed — a patch that closes the reported path and leaves its siblings open is the common shape of an incomplete fix. One knows the platforms, shells, or callers the change now claims to cover, because a fix that is correct where its author tested and wrong elsewhere is worse than the silence it replaced. Neither question means anything against an artifact; both are cheap against a diff.

One seat belongs to subtraction. A panel judged on findings drifts additive — every reviewer proposes something to add, and nobody is accountable for what the artifact would be like with less. Cast a ruthless simplifier whose fix path is removal: cut the step, drop the reference, delete the option, merge the two documents, and say so when the artifact should not exist at all. On a four-person panel this can share the challenger's seat; past that keep them apart, because a challenger asks how this breaks and a simplifier asks what here is not carrying its weight.

See `references/personas.md` for seed patterns. Do not fill the panel by copying that list.

## Dispatch

Find the available subagent or multi-agent tool, then spawn one real subagent per persona. Dispatch every panelist before reading any result — never run a spawn-then-wait cycle per persona, which turns the panel into a relay. If the host caps concurrency, start the remaining panelists as slots free; that is still a parallel panel. Prefer a read-only role that can open whole files and judge them. Avoid locator or search-style roles that return excerpts without a verdict — they find where things are, which is not a review. If a tool option fails, retry with a simpler call rather than fighting the options. Wait for completion without busy polling.

If subagents cannot be found or called, stop with:

```text
subagent unavailable: <reason>
This is not a gosu-review result. I can do a single-agent review instead if you ask.
```

Give each subagent this brief. Subagents see only the brief, so it carries the entry shape itself — never point them at a section of this file.

```text
You are reviewing as: <persona>
Lens: <what you optimize for>
Bias: <what you distrust, and the failure that taught you>
Uniquely likely to catch: <this persona's blind-spot coverage>

Target: <path, diff, repo scope, or artifact>
Context: <5-10 lines: what, why, constraints>
Focus: <persona-specific mandate>

Open the target and read it before you write anything. Your bias is the search
key: find where that failure pattern shows up here, or say plainly that it does
not. A claim you did not check against the artifact does not belong in the
answer.

Return one panel entry:

- verdict: ship | fix | rethink
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

## Cross-examine

Run one round, and only when the panel actually conflicts: two entries name the same element and point opposite ways — remove it versus extend it, this mechanism versus that one. One panelist covering ground another missed is not a conflict, and neither is disagreement about severity.

When that happens, put the two panelists back in front of the artifact with each other's position rather than deciding it yourself. Take at most the two sharpest conflicts, and read `references/cross-examine.md` for the brief. Resume the original panelist when the host can — they have already read the target.

Do not force agreement. If both hold with evidence, report the tension unresolved and say what would settle it. An orchestrator's private call is worth less than a disagreement the panel could not close, because the second is a finding about the artifact.

## Output

Show panel voices first, then synthesize. Lead with a one-line verdict summary so the reader can scan before diving into detail.

**Panel entry shape** (each subagent returns one):

- **verdict**: `ship` | `fix` | `rethink`
- **sharp take**: one sentence, the headline
- **findings**: 0-4, each carrying `what` / `evidence` / `so what` / `fix`
- **what would change my mind**: the falsifier for the main finding

**Output shape:**

```text
# gosu-review: <target>
target: <selected target>
casting: <2-3 specialized + 1-2 quality + 1 outsider/adversarial + 1 simplifier, one line>

**Verdicts**                          # one line per panelist
- <persona>: <verdict> — <sharp take>

## Tensions                            # only if personas disagree
- <A> vs <B>: <what>.
  resolved: <who moved, on what evidence> — <the call>
  or unresolved: <both positions held> — <what would settle it>

## Consensus                           # only if 2+ agree
- [P1] <action> — <persona names>

## Panel
### <persona> — <verdict>
<sharp take>
- <what> — <evidence> → <so what>. Fix: <fix>   # one line per finding
                                                # or: no finding on this axis — <why>
would change my mind: <falsifier>

## Meta
- requested: N agents / returned: M / tool: <name or "unavailable">
```

Rules:

- Do not invent findings during synthesis.
- Carry each finding's evidence through. A finding with no evidence stays in Panel and never reaches Consensus.
- Report an empty findings list as-is. Never backfill a panelist who found nothing.
- When a removal and an addition name the same element, that is a Tension, not two Consensus items. Do not let the additive side win by default because more panelists proposed additions.
- Cross-examination is one round. Never open a second, and never adjudicate a tension you did not send back to the panel.
- If fewer than 2 agents return, skip synthesis and show only raw notes plus a retry recommendation.

## Optional References

- `references/personas.md` — persona seeds. Use only when casting is not obvious.
- `references/cross-examine.md` — the round-two brief. Read when the panel conflicts.
