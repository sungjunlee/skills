---
name: delegate
description: Run a prompt on a chosen agent/model in the current directory and return its output with bounded non-interactive dispatch guardrails. Use for one-shot delegation through an installed provider CLI such as opencode, claude, codex, pi, reasonix, agent, or cline.
---

# delegate

## Step

1. Look up the provider in `references/cli-invocations.md`. If the route itself does not match any provider, ask the user which CLI to use.
2. Resolve the model:
   - If the provider reference has a list-models command and this is your first dispatch to that provider in this session, run it and treat the result as a session cache.
   - If no reliable list is available, the provider is not `claude/*`, `codex/*`, or `reasonix/*`, and the user asks for a recommendation or gives a fuzzy model name, consult `references/model-catalog.md`.
   - Match the user's model string to the closest available id — case-insensitive, treat spaces and hyphens as equivalent. If no list is available, pass the user's model id through as written. If the user gave no model, use the CLI default. If no good match, ask the user.
3. Read `references/dispatch-guardrails.md`, prepare a bounded supervisor, and run the argv in `$PWD` with the provider reference's stdin contract. Return the executor's stdout, or the provider-specific extracted output when the reference defines one.

**Done when:** the executor exits successfully and its output appears in your response. Report launch failures and timeouts as failures; they do not satisfy this condition.
