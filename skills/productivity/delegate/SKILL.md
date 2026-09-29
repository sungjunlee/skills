---
name: delegate
description: Delegate a prompt to an installed CLI in the current directory and return its output. Use when the user names a provider, model, or family for a one-shot.
---

# delegate

## Steps

1. **Route.** Look up the provider in `references/cli-invocations.md`. An explicit user route always wins. A model or family without a route resolves to its home route there. With no home route, follow the operator's own routing notes, and ask which CLI when they do not settle it.
2. **Profile.** Accept `/delegate <route> [effort=<level>] "<prompt>"`: one unquoted `effort=` token between route and prompt is the effort; anything inside the prompt is prompt text. Keep effort out of the model id, except on routes whose ids encode it. Match the model to an id in the route's own live list when the route has one; if nothing matches, ask. With no model or effort from the user, keep the CLI default.
   - For a recommendation or a fuzzy model name, read `references/model-catalog.md`. Choose the cheapest profile likely to finish correctly, counting retries and review, and pick a different family for independent review. Do not use the catalog for `reasonix/*`.
3. **Run.** Build argv from the provider row, with the prompt as one argv element and stdin from DEVNULL, and run it in `$PWD` under the guardrails below. Return the executor's stdout, or the extracted output where the row defines one.

## Guardrails

- **Bound the run.** Use the user's duration, else a 30-minute hard deadline, enforced by a real timer: the caller runtime's deadline, a provider timeout, or an installed supervisor. A tool's own foreground limit may be shorter than the deadline; run long dispatches in the background with the timer still bound to the child. If nothing can enforce a deadline, report `dispatch_unbounded` before launch.
- **Do not read silence as a hang.** Batch text modes print only on completion; rely on the deadline, not on stdout or file changes.
- **Stop on a fatal provider error.** A CLI can print a quota, auth, or billing error and keep running. Treat a definitive provider error on stderr as terminal: stop the child at once and report `dispatch_cli_error` with that line and any reset time it names.
- **Never retry automatically.** A timed-out or failed agent may already have changed files or spent credits. On timeout, terminate gracefully, then force-kill the process tree after about 10 seconds.

## Report

Success is a zero exit with non-empty output. Anything else is a failed dispatch with one code:

| Code | When |
| --- | --- |
| `dispatch_unbounded` | no mechanism can enforce the deadline; nothing launched |
| `dispatch_launch_failure` | the process never started: binary missing, argv rejected |
| `dispatch_timeout` | the deadline elapsed |
| `dispatch_cli_error` | nonzero exit, or stopped on a definitive provider error |
| `dispatch_empty_output` | zero exit, but both extracted output and raw stdout are empty |

Every report names the route, model, effort, and elapsed time, plus the redacted stderr tail on failure. `dispatch_empty_output` looks like success, so check the assembled argv: a prompt that matches a flag the CLI accepts is absorbed as that flag, and the child runs promptless.
