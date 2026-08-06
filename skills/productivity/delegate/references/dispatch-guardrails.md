# Dispatch guardrails

Apply these rules before every provider run.

## Bound the run

1. Use an explicit positive finite duration from the user when provided; otherwise use a 30-minute hard deadline.
2. Select a mechanism that enforces the duration: prefer a finite caller-runtime execution deadline, then a provider-native timeout, then an installed external supervisor. Cancellation without a timer is only a termination path, not deadline enforcement. Treat a tool's polling or output-yield interval as observation only.
3. Do not assume GNU `timeout` exists. When it is available, use a forced-kill grace such as `timeout -k 10s <duration> ...`; keep this wrapper outside the provider argv contract.
4. If no mechanism can enforce the deadline, report `dispatch_unbounded` before launch instead of silently starting an unbounded process.

## Detect progress safely

- Do not classify zero stdout alone as a hang. Batch text modes may emit stdout only after successful completion.
- Apply a startup or inactivity deadline only when the selected output mode documents an initial or progress event. Record the exact event type that resets the timer before launch.
- Otherwise rely on the hard deadline. Do not infer progress from file changes because the delegated task may be read-only.

## Surface fatal errors early

A CLI can report a fatal provider error — quota, auth, billing — and keep running, so waiting for exit turns a known failure into a spent deadline. Observed 2026-08-06 with exhausted quotas: codex exited nonzero within seconds; pi printed `429 … quota … reset at <UTC>` and kept running; opencode printed nothing at its default log level and kept running, leaving an exhausted quota indistinguishable from a healthy silent run.

- Treat a definitive provider error on stderr as terminal. Terminate at once and report `dispatch_cli_error` with that line and any reset time it names, rather than waiting for the process to exit or for the deadline.
- Prefer a route flag that surfaces such errors over discovering them by timeout. `opencode run` needs `--print-logs --log-level ERROR`, which surfaces quota exhaustion about 36 seconds in, after the CLI's internal retries.
- Send a bounded canary (≤90 s, `Reply with exactly: OK`) only for a route that stays silent and exposes no error channel. A silent canary condemns the route, not the model.

## Stop and report

1. Drain stdout and stderr concurrently while the process runs. Retain only their final 4 KiB in separate fixed-size failure ring buffers; stream or spool success output needed for extraction instead of accumulating either stream in memory.
2. On timeout, request runtime-native cancellation or send graceful termination.
3. After a 10-second grace period, force termination and include the child process group or tree when the runtime supports it.
4. Do not retry automatically. A timed-out agent may already have changed files or spent provider credits.
5. Report the failure with its code from the table below. Redact the retained tails and emit them with truncation markers when content was discarded.

## Failure codes

A dispatch either returns executor output or reports one of these. None of them is executor output, and none satisfies the skill's done condition.

| Code | Fires when |
|---|---|
| `dispatch_unbounded` | no mechanism can enforce the deadline, before launch |
| `dispatch_launch_failure` | the process never started — binary missing, not executable, argv rejected |
| `dispatch_timeout` | the deadline elapsed |
| `dispatch_cli_error` | the process exited nonzero and it was not a timeout |
| `dispatch_empty_output` | the process exited zero and both the extracted output and raw stdout are empty |

Every report names the provider route, the resolved model and effort, elapsed time, and the retained stderr tail — on the recommendation path the route alone does not say what ran or what it cost. `dispatch_timeout` adds the deadline, the last activity event type and timestamp, and whether termination was graceful, forced, or incomplete.

`dispatch_empty_output` is the one that looks like success, so report the two causes it cannot distinguish: the executor produced nothing, or the prompt never reached it. The prompt is the last argv element on every route, so one that matches a flag the CLI accepts is absorbed as a duplicate flag and the child runs promptless against `DEVNULL` stdin. Check the assembled argv before concluding the model had nothing to say.

A dispatch that ends in any of these codes is a failed dispatch, not executor output and not successful completion.
