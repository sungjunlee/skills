# Quota check

Read before launching several children, or one long run on a frontier-cost profile.

## Find the pool

The pool is the account the route's CLI bills for this launch: subscription or API key, as configured. `claude/*`, `codex/*`, `cursor/*`, and `grok/*` bill their own vendor account; a Claude model on `cursor/*` bills Cursor. For `opencode`, `opencode-go`, `pi`, `cline-pass`, and `reasonix`, read the billing provider from that CLI's config. Do not infer the pool from the model family, and do not run a login flow.

## Read the pool

Use the first that applies:

1. A usage tool installed here that reports that provider's remaining windows. For example, with CodexBar: `codexbar usage --provider <provider> --format json --no-color` (`codexbar usage --help` lists provider names; they are not route or model ids).
2. A figure the user already gave.
3. Neither: the pool is `unknown`.

Per-session token or cost logs show spending, not remaining headroom.

Report the time, route, and each window's remaining value, unit, reset, and source. Omit email and credentials. Missing fields stay `unknown`; an error or empty response is `unknown`, not zero. A past reading is not a current one.

Compute remaining as `max(0, min(100, 100 - used))` only from a used percent on a 0–100 scale. Credits, currency, requests, and tokens keep their own units. A percent does not say how many runs fit.

## Decide

Check every window that can limit the run, including a weekly window. Compare headroom with the user's deadline and each reset; the dispatch deadline in `SKILL.md` is a separate limit. When headroom is tight, tell the user and launch fewer children within what they asked. Keep an explicit route, model, and effort.

Every session on the same account shares one pool. Do not add remaining values seen by different sessions. Read again after a costly child and before a larger batch.

## Unknown pool

Say the pool is `unknown`. A single child may proceed under the dispatch deadline. For a batch, run one slice first and expand only after it exits successfully with no quota or rate-limit error. Stop the batch on `dispatch_timeout`, `dispatch_cli_error`, or any quota or rate-limit error. If later slices cannot be dropped, ask the user before the first.

A failed usage query is not a dispatch error. A quota, auth, or billing error from the delegated CLI still stops that child under `SKILL.md`'s guardrails.
