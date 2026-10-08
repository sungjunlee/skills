# Quota check

Read before large, repeated, or costly delegation. Quota belongs to the route's configured provider and account, not the model family.

## Find the pool

Resolve which provider account the route bills. `claude/*`, `codex/*`, `cursor/*`, and `grok/*` normally bill their own vendor account; confirm the CLI is logged into the account being measured. A Claude model on Cursor consumes the Cursor pool. For multi-provider routes (`opencode`, `opencode-go`, `pi`, `cline-pass`, `reasonix`), resolve the configured billing provider/account; do not infer it from the model family.

## Read the pool

Use the first source available here:

1. A usage tool already installed that reports that provider's remaining windows. For example, CodexBar: check `codexbar usage --help` for its provider names, then `codexbar usage --provider <provider> --format json --no-color`. Its provider name is not a route or model id.
2. The provider's own usage, status, or billing view, read by the host or reported by the user.
3. None: the pool is `unknown`; follow **Without a reading** below.

Per-session token or cost logs report spending, not remaining headroom; they are not a reading of the pool.

Record the observation time, route, an account label without email or credentials, and each reported window's used/remaining value, unit, reset, source, and confidence. Include pace or depletion ETA only when supplied or supported by measurements. Missing fields stay `unknown`; retain the last successful observation's timestamp when using it as context.

Compute remaining as `max(0, min(100, 100 - usedPercent))` only for a finite percent value explicitly reported as used. Credits, currency, requests, and tokens keep their own units; never convert or add them to percent windows. A percent alone does not establish how many runs fit.

## Decide

Check every reported window that can limit the planned run, including a weekly window for a short task. Compare available headroom and any measured pace with the task deadline and reset. When headroom is tight, reduce the batch within the user's authorized scope and prefer bounded work with strong verification. Preserve an explicit route/model/effort; do not silently substitute a cheaper profile.

An error, empty response, or missing window means `unknown`, not zero remaining. Use `N/A` only when the provider confirms a window does not exist.

All active sessions and workers sharing the same provider, account, and window draw from the same pool, including other chats. Do not add their independently observed remaining values. Recheck after costly runs or before expanding a batch; account for work already in flight.

## Without a reading

When the pool is `unknown`, say so and size the work by observation instead:

- Low-risk bounded work can proceed with the uncertainty disclosed.
- Split a large batch. Run a small first slice, confirm it finished without a provider quota or rate-limit error, then expand in steps. Stop expanding at the first such error.
- An unknown pool must not be the sole capacity assumption for high-risk work or work that cannot be safely abandoned mid-batch; ask the user or reduce scope.

A usage-query failure is distinct from a fatal dispatch auth, quota, or billing error. The latter still stops the child immediately under `SKILL.md`'s guardrails. Failed work may have spent quota; never retry automatically.
