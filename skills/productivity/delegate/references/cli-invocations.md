# CLI invocations

argv and stdio per provider. Cwd is always the caller's `$PWD`.

`delegate` is a one-shot, so the dispatch should not block on permission prompts. Each CLI has a different idiom — the `Run argv` column below shows the full command including the mode flag where one exists.

Verify each row against your installed CLI: `<cli> run --help` (or `<cli> exec --help` for codex), then edit to match.

## Per-provider reference

| Provider | Run argv | Stdin | List models |
|---|---|---|---|
| `opencode/*` | `opencode run --auto -m <model> <prompt>` | `DEVNULL` | `opencode models [provider]` |
| `claude/*` | `claude -p --permission-mode auto --model <model> <prompt>` | `DEVNULL` | `claude models` |
| `codex/*` | `codex exec --dangerously-bypass-approvals-and-sandbox -m <model> <prompt>` | `DEVNULL` | — (check `~/.codex/config.toml`) |
| `pi/*` | `pi --print --model <model> --no-session <prompt>` | `DEVNULL` | `pi --list-models [search]` |
| `cursor/*` | `agent --print --yolo --trust --model <model> <prompt>` (binary is `agent`, not `cursor`) | `DEVNULL` | `agent models` |
| `reasonix/*` | `reasonix run -m <model> <prompt>` | `DEVNULL` | — (no CLI subcommand) |
| `cline-pass/*` | `cline --json -P cline-pass -m <model> <prompt>` | `DEVNULL` | — (no CLI subcommand) |

> If `<model>` is omitted from the route, drop `-m <model>` from the argv — the CLI uses its configured default.

The prompt is already in argv, so connect stdin to DEVNULL for every current route. In a process API, set the child stdin to DEVNULL. In shell form, redirect from the platform's null device (`< /dev/null` on POSIX or `< NUL` in Windows cmd); do not pass the redirect as an argv token. Add a future stdin-consuming route as an explicit exception instead of inheriting an open pipe.

For `opencode/*`, `--auto` has the same trust implications as other non-interactive permission bypass flags.

For `cline-pass/*`, return JSONL `run_result.text`; if absent, return raw stdout.

Use `reasonix/*` only for non-sensitive, general work: it talks directly to DeepSeek API. Do not use `model-catalog.md`; use an explicit DeepSeek-compatible id or the CLI default.
