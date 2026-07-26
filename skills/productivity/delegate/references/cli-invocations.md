# CLI invocations

argv and stdio per provider. Cwd is always the caller's `$PWD`.

`delegate` is a one-shot, so the dispatch should not block on permission prompts. Each CLI has a different idiom — the `Run argv` column below shows the full command including the mode flag where one exists.

Verify each row against your installed CLI: `<cli> run --help` (or `<cli> exec --help` for codex), then edit to match.

## Building the command

The rows below are argv, not command lines. Read them as token lists.

1. **Every token is one argv element, and nothing is interpolated into a command line.** `<prompt>` passes through unmodified. `<model>` and `<effort>` come from the route, `model-catalog.md`, or a live model list; each must match `[A-Za-z0-9._/:-]+` and must not begin with `-`. Reject a non-conforming value and ask; do not silently repair it. A list-returned id is the one value here with a third-party source, and the charset is its only protection under rule 2.
2. **When the execution primitive is a shell**, single-quote the prompt and replace each embedded `'` with `'\''`. Never double-quote it — `$` and backticks survive double quotes, and the prompt is untrusted text that routinely arrives pasted from an issue, a README, or an error message. Worked example, prompt on the left:

   ```text
   don't run $(rm -rf .) or `id`
   'don'\''t run $(rm -rf .) or `id`'
   ```

   This procedure is POSIX-only. There is no safe shell form under Windows `cmd`, where `'` does not quote at all, or under PowerShell, where `\` does not escape inside single quotes. On those, use rule 1 or report that dispatch is unavailable — do not improvise a third quoting scheme.

These two rules are not per-provider. They apply before any row below is used.

## Per-provider reference

Append or translate effort only when the resolved profile contains an explicit or recommendation-selected effort. Otherwise preserve the CLI default.

| Provider | Run argv | Effort argv | Stdin | List models |
|---|---|---|---|---|
| `opencode/*`, `opencode-go/*` | `opencode run --auto -m <model> <prompt>` | `--variant <effort>` (provider-specific) | `DEVNULL` | `opencode models [provider]` |
| `claude/*` | `claude -p --permission-mode auto --model <model> <prompt>` | `--effort <low\|medium\|high\|xhigh\|max>` | `DEVNULL` | — (use aliases or a full id from current docs) |
| `codex/*` | `codex exec --dangerously-bypass-approvals-and-sandbox -m <model> <prompt>` | argv entries `-c` + `model_reasoning_effort="<effort>"` (model-specific) | `DEVNULL` | — (check `~/.codex/config.toml` and current docs) |
| `pi/*` | `pi --print --model <model> --no-session <prompt>` | `--thinking <off\|minimal\|low\|medium\|high\|xhigh\|max>` | `DEVNULL` | `pi --list-models [search]` |
| `cursor/*` | `agent --print --yolo --trust --model <model> <prompt>` (binary is `agent`, not `cursor`) | select the matching effort-bearing slug from `agent models`; no separate argv | `DEVNULL` | `agent models` |
| `reasonix/*` | `reasonix run -m <model> <prompt>` | `--effort <low\|medium\|high\|max>` | `DEVNULL` | — (no CLI subcommand) |
| `cline-pass/*` | `cline --json -P cline-pass -m <model> <prompt>` | `--thinking <none\|low\|medium\|high\|xhigh>` | `DEVNULL` | — (no CLI subcommand) |

> A `<provider>/*` pattern also matches its bare `<provider>` route. If `<model>` is omitted, drop `-m <model>` from the argv — the CLI uses its configured default.

For CLI-selector routes such as `claude/<model>` or `reasonix/<model>`, `<model>` is the suffix after the first slash. For `opencode/<model>`, resolve that suffix against the live list and pass the returned full id. An `opencode-go/<model>` route is already a live OpenCode `provider/model` id, so preserve the whole route.

Effort support can vary by model even when the CLI accepts the flag. Reject a value known to be unsupported; if support cannot be verified, report that uncertainty instead of inventing a fallback. For Cursor, do not synthesize bracket overrides: match the requested profile to a concrete live slug such as `gpt-5.6-sol-high` or `claude-fable-5-xhigh`.

The prompt is already in argv, so connect stdin to DEVNULL for every current route. In a process API, set the child stdin to DEVNULL. Under rule 2, redirect with `< /dev/null` and never pass the redirect as an argv token. Add a future stdin-consuming route as an explicit exception instead of inheriting an open pipe.

For the OpenCode routes, `--auto` has the same trust implications as other non-interactive permission bypass flags.

For `cline-pass/*`, return JSONL `run_result.text`; if absent, return raw stdout.

Use `reasonix/*` only for non-sensitive, general work: it talks directly to DeepSeek API. Do not use `model-catalog.md`; use an explicit DeepSeek-compatible id or the CLI default.
