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

## Stop and report

1. Drain stdout and stderr concurrently while the process runs. Retain only their final 4 KiB in separate fixed-size failure ring buffers; stream or spool success output needed for extraction instead of accumulating either stream in memory.
2. On timeout, request runtime-native cancellation or send graceful termination.
3. After a 10-second grace period, force termination and include the child process group or tree when the runtime supports it.
4. Do not retry automatically. A timed-out agent may already have changed files or spent provider credits.
5. Report the failure as `dispatch_timeout` with the provider route, elapsed time, deadline, last activity event type and timestamp, and whether termination was graceful, forced, or incomplete. Redact the retained tails and emit them with truncation markers when content was discarded.

A timeout is a failed dispatch, not executor output and not successful completion.
