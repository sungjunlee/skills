# gosu-review output format

The required shape for the final review. One `<details>` block per returned subagent; the Panel section repeats the same fields inline for quick scanning.

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
