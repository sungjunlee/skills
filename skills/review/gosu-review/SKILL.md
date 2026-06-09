---
name: gosu-review
description: Review the current artifact with a real 4-6 person expert subagent panel. Use on explicit /gosu-review calls when code, plans, skills, design docs, decisions, or repo state need multiple context-specific perspectives. The core requirement is to dispatch actual subagents and preserve their raw notes before synthesis.
---

# gosu-review

Get a real panel review from multiple experts.

The loop is simple:

1. Pick 4-6 distinct experts.
2. Dispatch real subagents in parallel.
3. Make each panelist use a distinct lens.
4. Show each panelist's view first.
5. Synthesize briefly at the end.

Fake panels fail the skill. If actual subagents are unavailable, say so instead of presenting a simulated panel review.

## Target

If the user provides `/gosu-review <target>`, review that target.

If no target is provided, review the most recent artifact in the conversation: code just edited, a plan, a skill definition, a design decision, a document, or similar.

If several candidates are plausible, ask a short confirmation question before starting: `Do you want me to review X?` Do not ask when the target is clear.

Always show the selected target near the top of the final output.

Handle loose references pragmatically:

- "this" or "the thing above" -> the most recent artifact
- "this repo" or "overall" -> current repository state
- "the skill wording" -> the relevant `SKILL.md` plus needed `references/*`

If the target is broad, continue but warn once:

> Wide scope: casting may be less sharp. Use `/gosu-review <file or narrower scope>` for a tighter review.

## Cast

Pick 4-6 panelists for this target. The goal is not to choose generic job titles; it is to create the sharpest reviewers for this artifact.

First extract the target's axes:

- Audience: who uses this, and when failure hurts
- Domain: finance, education, community, internal tools, creator workflows, legal, data, research, etc.
- Artifact type: code, UX, doc, policy, skill, strategy, operating process, decision
- Failure mode: trust, cost, comprehension, maintenance, adoption, speed, safety, quality

Then mix the panel. The default panel includes one challenger:

- 2-3 context-specific experts.
  Example: "B2B SaaS onboarding PM", "education content editor", "internal tooling operator", "open-source maintainer", "regulatory risk reviewer", "first-time user advocate".
- 1-2 general quality experts.
  Example: architect, implementation expert, QA expert, security expert, ops/SRE expert.
- 1 adversarial or surprising outsider.
  Example: copy editor, cost watcher, skeptical user, future maintainer, new teammate, customer support rep.

For each panelist, define:

- Lens: what this person optimizes for
- Bias: what this person distrusts or refuses to hand-wave
- Missed-by-others: the failure this person is likely to catch

At least one panelist must be explicitly adversarial unless the target is purely exploratory. Use two challengers only when the user asks for challenge, red-team, or adversarial review, or when the target is high-risk. A challenger tries to break the artifact, not balance praise.

Read `references/personas.md` only when casting is not obvious. Do not fill the panel by copying that list.

## Dispatch

Use the subagent tools available in the current environment.

- Find the available subagent or multi-agent tool first.
- Spawn one real subagent per persona.
- Spawn all subagents first, then wait for results. Do not repeat spawn/wait sequentially.
- Prefer read-only or explorer-style roles for review when available.
- If a tool option combination fails, do not fight the options. Put the needed context in the brief and retry with a simpler call.
- Wait for completion without busy polling.

Examples: Claude Code uses the `Agent` tool family. Codex uses the multi-agent spawn tool found through `tool_search`.

If subagents cannot be found or called, stop with:

```text
subagent unavailable: <reason>
This is not a gosu-review result. I can do a single-agent review instead if you ask.
```

Give each subagent a short brief:

```text
You are reviewing as: <persona>

Target:
<path, diff, repo scope, or serialized conversation artifact>

Context:
<5-10 lines max: what this is, why it exists, relevant constraints>

Focus:
<persona-specific mandate>

Return this shape:
verdict: ship | fix | rethink
sharp_take: <the strongest opinion from this persona>
top_findings:
- [P1/P2/P3] <finding> (evidence: <file/line/section or concrete detail>)
what_others_may_miss: <one thing this persona is likely to notice>
first_fix: <one concrete change>
score_optional: <0-100, only if useful or requested, with one short reason>
```

## Output

Show the panel voices first, then synthesize.

```text
# gosu-review: <target>

target: <selected target>
casting: <2-3 specialized + 1-2 quality + 1 outsider/adversarial, one line>

## Panel
### <persona>
verdict: <ship|fix|rethink>
sharp take: <one strong sentence>
first fix: <one concrete action>
missed by others: <one unusual concern>
score: <optional N/100 — one short reason>

## Tensions
- <persona A> vs <persona B>: <what they disagree about>. Recommendation: <short call>

## Consensus
- [P1] <action> — <persona names> (source: Raw Notes)
- [P2] <action> — <persona names> (source: Raw Notes)

## Raw Notes
<details>
<summary><persona></summary>

verdict: ...
sharp_take: ...
top_findings:
- ...
what_others_may_miss: ...
first_fix: ...
score_optional: ...

</details>

## Meta
- requested: N agents
- returned: M agents
- tool: <tool name or "unavailable">
```

Rules:

- Include one `<details>` block for every returned subagent.
- Do not invent findings during synthesis. Every consensus item must name the persona(s) it came from.
- If fewer than 2 agents return, skip synthesis and show only raw notes plus a retry recommendation.
- Use scores only when they add signal. A score without a reason is noise.
- Keep the final answer compact. This is a panel review, not a research report.

## Optional References

- `references/personas.md` — persona seeds. Use only when casting is not obvious.
- `references/synthesis.md` — tiny synthesis checklist.
