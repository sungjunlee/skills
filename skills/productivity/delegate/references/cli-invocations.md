# CLI invocations

argv per provider. Cwd is always the caller's `$PWD`.

Verify each row against your installed CLI: `<cli> run --help` (or `<cli> exec --help` for codex), then edit to match.

## Auto / yolo mode

`delegate` is a one-shot. The user invoked the skill intentionally, so the dispatch should not block on permission prompts. Each CLI handles this differently — pick the flag that matches its idiom.

| Provider | Mechanism | Flag |
|---|---|---|
| `claude/*` | Auto mode classifier | `--permission-mode auto` |
| `codex/*` | Bypass approvals + sandbox | `--dangerously-bypass-approvals-and-sandbox` |
| `cursor/*` | Yolo + workspace trust | `--yolo --trust` |
| `pi/*` | Default (no flag) | — (pi allows tools by default) |
| `opencode/*` | Default (no flag) | — (opencode uses its own config) |
| `reasonix/*` | Default (no flag) | — (reasonix `run` is non-interactive) |

## List models

When the model name is fuzzy (e.g. "DeepSeek V4 Pro"), use the list command to find the exact id before dispatching.

| Provider | List command |
|---|---|
| `opencode/*` | `opencode models [provider]` |
| `claude/*` | `claude models` |
| `pi/*` | `pi --list-models [search]` |
| `cursor/*` | `agent models` |
| `codex/*` | — (no CLI subcommand; check `~/.codex/config.toml` or auth) |
| `reasonix/*` | — (no CLI subcommand; see docs) |

## Table

```text
opencode/*    opencode run -m <model> <prompt>
claude/*      claude    -p   --permission-mode auto --model <model> <prompt>
codex/*       codex exec    --dangerously-bypass-approvals-and-sandbox -m <model> <prompt>
pi/*          pi        --print --model <model> --no-session <prompt>
cursor/*      agent  --print --yolo --trust  --model <model> <prompt>
reasonix/*    reasonix run -m <model> <prompt>
```

> If `<model>` is omitted from the route, drop `-m <model>` from the argv — the CLI uses its configured default.

## Notes

- `opencode`: `-m` accepts `provider/model` directly (e.g. `anthropic/claude-sonnet-4-6`). No permission flag; opencode applies the user's own permission policy.
- `claude`: `-p` is required for non-interactive mode. `--permission-mode auto` lets claude's classifier auto-approve safe operations; risky ones still pause.
- `codex exec`: `--dangerously-bypass-approvals-and-sandbox` removes all approval prompts and the sandbox. Required for a non-blocking one-shot.
- `pi`: `--print` is required for non-interactive mode. `--no-session` keeps the dispatch from polluting the user's session history. pi has no yolo flag — defaults to allowing all tools.
- `cursor`: the binary is `agent` (Cursor Agent CLI), not `cursor` (the editor). The provider prefix `cursor` is a routing label; the actual executable is on `$PATH` as `agent`. `--yolo` aliases `--force`; combined with `--trust` for headless mode.
- `reasonix`: the `run` subcommand is non-interactive by design and prints the task result to stdout. `-m` takes a DeepSeek model id (e.g. `deepseek-v4-flash`). No permission flag — reasonix runs tools as configured.
