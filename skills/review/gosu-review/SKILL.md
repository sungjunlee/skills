---
name: gosu-review
description: Review the current artifact with a real 4-6 person expert subagent panel. Use on explicit /gosu-review calls when code, plans, skills, design docs, decisions, or repo state need multiple context-specific perspectives.
---

# gosu-review

Get a real panel review from multiple experts. Fake panels fail the skill — dispatch actual subagents and preserve their raw notes before synthesis.

## Target

If the user provides `/gosu-review <target>`, review that target. If not, review the most recent artifact in the conversation: code just edited, a plan, a skill definition, a design decision, a document, or similar. If several candidates are plausible, ask a short confirmation question before starting: `Do you want me to review X?` Do not ask when the target is clear.

Always show the selected target near the top of the final output. Handle loose references pragmatically: `"this"` or `"the thing above"` → most recent artifact; `"this repo"` or `"overall"` → current repository state; `"the skill wording"` → the relevant `SKILL.md` plus needed `references/*`. If the target is broad, continue but warn once: `Wide scope: casting may be less sharp. Use /gosu-review <narrower scope> for a tighter review.`

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

For each panelist, define:

- **Lens**: what they optimize for
- **Bias**: what they distrust
- **Blind spot**: what this persona is uniquely likely to catch

At least one panelist must be explicitly adversarial unless the target is purely exploratory. Use two challengers only when the user asks for challenge, red-team, or adversarial review, or when the target is high-risk. A challenger tries to break the artifact, not balance praise.

See `references/personas.md` for seed patterns. Do not fill the panel by copying that list.

## Dispatch

Find the available subagent or multi-agent tool, then spawn one real subagent per persona. Spawn all subagents first, then wait for results — do not repeat spawn/wait sequentially. Prefer read-only or explorer-style roles for review when available. If a tool option fails, retry with a simpler call rather than fighting the options. Wait for completion without busy polling.

If subagents cannot be found or called, stop with:

```text
subagent unavailable: <reason>
This is not a gosu-review result. I can do a single-agent review instead if you ask.
```

Give each subagent this brief:

```text
You are reviewing as: <persona>

Target: <path, diff, repo scope, or artifact>
Context: <5-10 lines: what, why, constraints>
Focus: <persona-specific mandate>

Return one panel entry using the shape defined in the Output section.
```

## Output

Show panel voices first, then synthesize. Lead with a one-line verdict summary so the reader can scan before diving into detail.

**Panel entry shape** (each subagent returns one):

- **verdict**: `ship` | `fix` | `rethink`
- **sharp take**: one strong sentence
- **first fix**: one concrete action
- **blind spot**: one unique concern
- **score**: optional N/100, with one short reason

**Output shape:**

```text
# gosu-review: <target>
target: <selected target>
casting: <2-3 specialized + 1-2 quality + 1 outsider/adversarial, one line>

**Verdicts**                          # one line per panelist
- <persona>: <verdict> — <sharp take>

## Tensions                            # only if personas disagree
- <A> vs <B>: <what>. Recommendation: <short call>

## Consensus                           # only if 2+ agree
- [P1] <action> — <persona names>

## Panel
### <persona>
verdict / sharp take / first fix / blind spot / score

## Meta
- requested: N agents / returned: M / tool: <name or "unavailable">
```

Rules:

- Do not invent findings during synthesis.
- If fewer than 2 agents return, skip synthesis and show only raw notes plus a retry recommendation.

## Optional References

- `references/personas.md` — persona seeds. Use only when casting is not obvious.
