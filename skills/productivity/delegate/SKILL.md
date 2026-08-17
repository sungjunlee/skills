---
name: delegate
description: Run a prompt with a chosen provider, model, and optional effort in the current directory, then return its output with bounded non-interactive dispatch guardrails. Use for one-shot delegation through an installed CLI such as codex, claude, grok, opencode, pi, cursor, reasonix, or cline-pass.
---

# delegate

## Step

1. Look up the provider in `references/cli-invocations.md`. If the input names a model or family instead of a route, resolve its home route from that file. When the same model is reachable through multiple routes, consult `references/provider-routing.md` for the general selection rules (single-provider vs multi-provider CLI shapes, training risk, quota burn, cost windows, family-first) and the operator's own routing document for current subscriptions/balances — do not ask the user which CLI unless the user already named a provider or no default is available for that family.
2. Resolve an execution profile: model plus optional effort.
   - Accept the canonical input `/delegate <route> [effort=<level>] "<prompt>"`. Recognize at most one unquoted `effort=...` token between the route and prompt, remove it before building argv, and preserve the quoted prompt unchanged. Reject duplicate or empty effort options; treat `effort=...` inside the prompt as prompt text.
   - Keep effort separate from the model id. An explicit user effort wins; otherwise use the effort selected by the recommendation path below. If neither resolves an effort, omit its argv and preserve the CLI default — except on a route that encodes effort in the model id, which has no such default, so resolve a level there before naming the model.
   - If the provider reference has a list-models command and this is your first dispatch to that provider in this session, run it and treat the result as a session cache.
   - If the user asks for a recommendation or gives a fuzzy model name, read `references/routing-guide.md`, then consult `references/model-catalog.md` for current family and effort hints. Do not use the catalog for `reasonix/*`.
   - Match the explicit or recommendation-selected model string to the closest available id — case-insensitive, treat spaces and hyphens as equivalent. Match only within the resolved route, in that route's id shape; a name match in another provider's list never changes the route. If no list is available, pass that model id through as written. If neither path selects a model, use the CLI default. If no good match, ask the user.
   - If the resolved profile includes an explicit or recommended effort, validate and translate it with the provider row. Reject unsupported values; do not forward or silently drop them.
3. Read `references/dispatch-guardrails.md`, prepare a bounded supervisor, and run the argv in `$PWD` under the provider reference's command-building and stdin contracts — the prompt is one argv element, never a fragment of the command line. Return the executor's stdout, or the provider-specific extracted output when the reference defines one.

**Done when:** the executor exits successfully and non-empty output appears in your response. Anything else is a failed dispatch reported with its code from `references/dispatch-guardrails.md` — including a zero exit that produced nothing, which is a failure and never an empty answer.
