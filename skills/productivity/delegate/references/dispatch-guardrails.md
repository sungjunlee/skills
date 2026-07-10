# Dispatch guardrails

Apply these rules before every provider run.

## Bound the run

1. Use an explicit positive finite duration from the user when provided; otherwise use a 30-minute hard deadline.
2. Prefer the caller runtime's execution deadline and cancellation, then a provider-native timeout, then an installed external supervisor. Treat a tool's polling or output-yield interval as observation only, not as a deadline.
3. Do not assume GNU `timeout` exists. When it is available, use a forced-kill grace such as `timeout -k 10s <duration> ...`; keep this wrapper outside the provider argv contract.
4. If no mechanism can enforce the deadline, report `dispatch_unbounded` before launch instead of silently starting an unbounded process.

## Detect progress safely

- Do not classify zero stdout alone as a hang. Batch text modes may emit stdout only after successful completion.
- Apply a startup or inactivity deadline only when the selected output mode documents an initial or progress event. Record the exact event type that resets the timer before launch.
- Otherwise rely on the hard deadline. Do not infer progress from file changes because the delegated task may be read-only.

## Stop and report

1. On timeout, request runtime-native cancellation or send graceful termination.
2. After a 10-second grace period, force termination and include the child process group or tree when the runtime supports it.
3. Do not retry automatically. A timed-out agent may already have changed files or spent provider credits.
4. Report the failure as `dispatch_timeout` with the provider route, elapsed time, deadline, last activity event type and timestamp, and whether termination was graceful, forced, or incomplete. Include at most the final 4 KiB of each stdout and stderr stream after removing sensitive values, and mark truncated excerpts.

A timeout is a failed dispatch, not executor output and not successful completion.
