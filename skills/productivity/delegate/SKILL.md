---
name: delegate
description: Run a prompt with a chosen provider, model, and optional effort in the current directory, then return its output with bounded non-interactive dispatch guardrails. Use for one-shot delegation through an installed CLI such as opencode, claude, codex, pi, reasonix, agent, or cline.
---

# delegate

## Step

1. Look up the provider in `references/cli-invocations.md`. If the route itself does not match any provider, ask the user which CLI to use.
2. Resolve an execution profile: model plus optional effort.
   - Accept the canonical input `/delegate <route> [effort=<level>] "<prompt>"`. Recognize at most one unquoted `effort=...` token between the route and prompt, remove it before building argv, and preserve the quoted prompt unchanged. Reject duplicate or empty effort options; treat `effort=...` inside the prompt as prompt text.
   - Keep effort separate from the model id. An explicit user effort wins; otherwise use the effort selected by the recommendation path below. If neither resolves an effort, omit its argv and preserve the CLI default.
   - If the provider reference has a list-models command and this is your first dispatch to that provider in this session, run it and treat the result as a session cache.
   - If the user asks for a recommendation or gives a fuzzy model name, read `references/routing-guide.md`, then consult `references/model-catalog.md` for current family and effort hints. Do not use the catalog for `reasonix/*`.
   - Match the explicit or recommendation-selected model string to the closest available id — case-insensitive, treat spaces and hyphens as equivalent. If no list is available, pass that model id through as written. If neither path selects a model, use the CLI default. If no good match, ask the user.
   - If the resolved profile includes an explicit or recommended effort, validate and translate it with the provider row. Reject unsupported values; do not forward or silently drop them.
3. Read `references/dispatch-guardrails.md`, prepare a bounded supervisor, and run the argv in `$PWD` under the provider reference's command-building and stdin contracts — the prompt is one argv element, never a fragment of the command line. Return the executor's stdout, or the provider-specific extracted output when the reference defines one.

**Done when:** the executor exits successfully and its output appears in your response. Report launch failures and timeouts as failures; they do not satisfy this condition.
