# CLI invocations

argv per provider. Cwd is always the caller's `$PWD`.

`delegate` is a one-shot, so the dispatch should not block on permission prompts. Each CLI has a different idiom — the `Run argv` column below shows the full command including the mode flag where one exists.

Verify each row against your installed CLI: `<cli> run --help` (or `<cli> exec --help` for codex), then edit to match.

## Per-provider reference

| Provider | Run argv | List models |
|---|---|---|
| `opencode/*` | `opencode run -m <model> <prompt>` | `opencode models [provider]` |
| `claude/*` | `claude -p --permission-mode auto --model <model> <prompt>` | `claude models` |
| `codex/*` | `codex exec --dangerously-bypass-approvals-and-sandbox -m <model> <prompt>` | — (check `~/.codex/config.toml`) |
| `pi/*` | `pi --print --model <model> --no-session <prompt>` | `pi --list-models [search]` |
| `cursor/*` | `agent --print --yolo --trust --model <model> <prompt>` (binary is `agent`, not `cursor`) | `agent models` |
| `reasonix/*` | `reasonix run -m <model> <prompt>` | — (no CLI subcommand) |
| `cline-pass/*` | `cline --json -P cline-pass -m <model> <prompt>` | — (no CLI subcommand) |

> If `<model>` is omitted from the route, drop `-m <model>` from the argv — the CLI uses its configured default.

For `cline-pass/*`, return JSONL `run_result.text`; if absent, return raw stdout.

Use `reasonix/*` only for non-sensitive, general work: it talks directly to DeepSeek API. Do not use `model-catalog.md`; use an explicit DeepSeek-compatible id or the CLI default.
