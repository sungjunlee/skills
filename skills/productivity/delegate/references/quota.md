# Quota check

Read before large, repeated, or costly delegation. Quota belongs to the route's configured provider and account, not the model family.

## Read the selected pool

Use an available provider usage tool, CLI, or dashboard. When CodexBar is installed, check its supported provider names with `codexbar usage --help`, then run:

```bash
codexbar usage --provider <provider> --format json --no-color
```

`<provider>` is a supported quota provider name, not a delegate route or model id. `claude/*`, `codex/*`, `cursor/*`, and `grok/*` normally map to `claude`, `codex`, `cursor`, and `grok` respectively; confirm the CLI uses the account being measured. A Claude model on Cursor consumes the Cursor pool. For multi-provider routes (`opencode`, `opencode-go`, `pi`, `cline-pass`, `reasonix`), resolve the configured billing provider/account before choosing its usage source. Do not infer it from the model family or pass the route verbatim to CodexBar.

Record the observation time, route, an account label without email or credentials, and each reported window's used/remaining value, unit, reset, source, and confidence. Include pace or depletion ETA only when supplied or supported by measurements. Missing fields stay `unknown`; retain the last successful observation's timestamp when using it as context.

Compute remaining as `max(0, min(100, 100 - usedPercent))` only for a finite percent value explicitly reported as used. Credits, currency, requests, and tokens keep their own units; never convert or add them to percent windows. A percent alone does not establish how many runs fit.

## Decide

Check every reported window that can limit the planned run, including a weekly window for a short task. Compare available headroom and any measured pace with the task deadline and reset. When headroom is tight, reduce the batch within the user's authorized scope and prefer bounded work with strong verification. Preserve an explicit route/model/effort; do not silently substitute a cheaper profile.

An error, empty response, or missing window means `unknown`, not zero remaining. Use a recent successful observation, auth status, or another available usage source as context. Low-risk bounded work can proceed with that uncertainty disclosed; an unknown pool must not be the sole capacity assumption for high-risk work. Use `N/A` only when the provider confirms a window does not exist.

All active sessions and workers sharing the same provider, account, and window draw from the same pool, including other chats. Do not add their independently observed remaining values. Recheck after costly runs or before expanding a batch; account for work already in flight.

A usage-query failure is distinct from a fatal dispatch auth, quota, or billing error. The latter still stops the child immediately under `SKILL.md`'s guardrails. Failed work may have spent quota; never retry automatically.
