---
name: delegate
description: Run a prompt on a chosen agent/model in your current directory and return its output.
argument-hint: "<provider> [model] <prompt>"
compatibility: Requires the chosen provider's CLI on PATH (opencode, claude, codex, pi, reasonix, agent).
---

# delegate

## Step

1. Look up the provider in `references/cli-invocations.md`. If the route itself does not match any provider, ask the user which CLI to use.
2. Resolve the model:
   - If this is the first time you are dispatching to this provider in this session, run the list-models command from the same file to learn the available ids. Treat the result as a session cache.
   - Match the user's model string to the closest available id — case-insensitive, treat spaces and hyphens as equivalent. If the user gave no model, use the CLI default. If no good match, ask the user.
3. Run the argv in `$PWD`. Return the executor's stdout.

**Done when:** the executor's stdout appears in your response.
