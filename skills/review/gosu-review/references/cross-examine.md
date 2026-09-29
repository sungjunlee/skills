# gosu-review cross-examination

Read this when two panel entries conflict. `SKILL.md` decides whether to run a round; this file is the brief and how to read the returns.

## The brief

Both sides get the same shape, so neither is cast as the defendant.

```text
Another reviewer read the same target and reached the opposite position.

Their claim: <claim>
Their evidence: <evidence>
Their fix: <fix>

Your position was: <claim> / <evidence> / <fix>

Go back to the artifact and find out which position it supports. You are not
defending your entry.

Return:
- position: hold | concede | refine
- why: what in the artifact decides it, cited as your findings were, with at
  least one anchor you had not cited before
- resolved fix: the action you would now take

With nothing further to check in the artifact, say it alone cannot settle it.
```

Resume the original subagent when the host can continue it; it has already read the target. Otherwise dispatch a fresh one carrying the seat's question, the Target, the original Context, both positions, and the return shape. Record the route in Meta as `resume` or `fresh`. One round only.

## Reading the result

- **One concedes** — resolved. Say who moved and on what evidence; two readings converging on the artifact is the strongest result the panel produces.
- **One refines** — usually the real answer. Report the narrowed fix, not a merge of both.
- **Both hold with new evidence** — the disagreement is real. Report it unresolved and name what would settle it; do not invent a middle.
- **Both hold without new evidence** — the round failed, not the artifact. Report both positions as the panel left them.
