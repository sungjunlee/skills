# CLI invocations

argv and stdio per provider. Cwd is always the caller's `$PWD`.

`delegate` is a one-shot, so the dispatch should not block on permission prompts. Each CLI has a different idiom — the `Run argv` column below shows the full command including the mode flag where one exists.

Verify each row against your installed CLI: `<cli> run --help` (or `<cli> exec --help` for codex), then edit to match.

## Per-provider reference

Append the effort argv only when the user explicitly supplies effort.

| Provider | Run argv | Effort argv | Stdin | List models |
|---|---|---|---|---|
| `opencode/*` | `opencode run --auto -m <model> <prompt>` | `--variant <effort>` (provider-specific) | `DEVNULL` | `opencode models [provider]` |
| `claude/*` | `claude -p --permission-mode auto --model <model> <prompt>` | `--effort <low\|medium\|high\|xhigh\|max>` | `DEVNULL` | — (use aliases or a full id from current docs) |
| `codex/*` | `codex exec --dangerously-bypass-approvals-and-sandbox -m <model> <prompt>` | argv entries `-c` + `model_reasoning_effort="<effort>"` (model-specific) | `DEVNULL` | — (check `~/.codex/config.toml` and current docs) |
| `pi/*` | `pi --print --model <model> --no-session <prompt>` | `--thinking <off\|minimal\|low\|medium\|high\|xhigh\|max>` | `DEVNULL` | `pi --list-models [search]` |
| `cursor/*` | `agent --print --yolo --trust --model <model> <prompt>` (binary is `agent`, not `cursor`) | merge `effort=<level>` into the model's bracket overrides | `DEVNULL` | `agent models` |
| `reasonix/*` | `reasonix run -m <model> <prompt>` | `--effort <low\|medium\|high\|max>` | `DEVNULL` | — (no CLI subcommand) |
| `cline-pass/*` | `cline --json -P cline-pass -m <model> <prompt>` | `--thinking <none\|low\|medium\|high\|xhigh>` | `DEVNULL` | — (no CLI subcommand) |

> If `<model>` is omitted from the route, drop `-m <model>` from the argv — the CLI uses its configured default.

Effort support can vary by model even when the CLI accepts the flag. Reject a value known to be unsupported; if support cannot be verified, report that uncertainty instead of inventing a fallback. For Cursor, preserve existing bracket overrides: for example, merge effort into `claude-opus-4-8[context=1m,fast=false]` rather than appending a second bracket block.

The prompt is already in argv, so connect stdin to DEVNULL for every current route. In a process API, set the child stdin to DEVNULL. In shell form, redirect from the platform's null device (`< /dev/null` on POSIX or `< NUL` in Windows cmd); do not pass the redirect as an argv token. Add a future stdin-consuming route as an explicit exception instead of inheriting an open pipe.

For `opencode/*`, `--auto` has the same trust implications as other non-interactive permission bypass flags.

For `cline-pass/*`, return JSONL `run_result.text`; if absent, return raw stdout.

Use `reasonix/*` only for non-sensitive, general work: it talks directly to DeepSeek API. Do not use `model-catalog.md`; use an explicit DeepSeek-compatible id or the CLI default.
