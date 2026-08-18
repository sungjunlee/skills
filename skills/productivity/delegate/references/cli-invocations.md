# CLI invocations

argv and stdio per provider. Cwd is always the caller's `$PWD`.

`delegate` is a one-shot, so the dispatch should not block on permission prompts. Each CLI has a different idiom — the `Run argv` column below shows the full command including the mode flag where one exists.

These rows are dispatch contracts. A run uses them as written. A maintainer updating this file checks each row against `<cli> run --help` (or `<cli> exec --help` for codex).

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

If the resolved profile includes an effort, append or translate it with the Effort argv column.

| Provider | Run argv | Effort argv | Stdin | List models |
|---|---|---|---|---|
| `opencode/*`, `opencode-go/*` | `opencode run --auto --print-logs --log-level ERROR -m <model> <prompt>` | `--variant <effort>` (provider-specific) | `DEVNULL` | `opencode models [provider]` |
| `claude/*` | `claude -p --permission-mode auto --model <model> <prompt>` | `--effort <low\|medium\|high\|xhigh\|max>` | `DEVNULL` | — (use a full id from current docs, or a latest-family alias only when the user asks for latest) |
| `codex/*` | `codex exec --dangerously-bypass-approvals-and-sandbox -m <model> <prompt>` | argv entries `-c` + `model_reasoning_effort="<effort>"` (model-specific) | `DEVNULL` | — (check `~/.codex/config.toml` and current docs) |
| `pi/*` | `pi --print --model <model> --no-session <prompt>` | `--thinking <off\|minimal\|low\|medium\|high\|xhigh\|max>` | `DEVNULL` | `pi --list-models [search]` |
| `cursor/*` | `cursor-agent --print --yolo --trust --model <model> <prompt>` (not `agent`, which is Grok Build) | select the matching effort-bearing slug from `cursor-agent models`; no separate argv | `DEVNULL` | `cursor-agent models` |
| `grok/*` | `grok --always-approve -m <model> -p <prompt>` (the prompt is `-p`'s value; passed positionally it opens the TUI and fails headless) | `--effort <low\|medium\|high\|xhigh>` | `DEVNULL` | `grok models` |
| `reasonix/*` | `reasonix run -m <model> <prompt>` | `--effort <low\|medium\|high\|max>` | `DEVNULL` | — (no CLI subcommand) |
| `cline-pass/*` | `cline --json -P cline-pass -m <model> <prompt>` | `--thinking <none\|low\|medium\|high\|xhigh>` | `DEVNULL` | — (no CLI subcommand) |

> A `<provider>/*` pattern also matches its bare `<provider>` route. If `<model>` is omitted, drop that row's model selector with its value — a bare flag would absorb the prompt — and the CLI uses its configured default, except on `cursor/*`, where the omission selects its `auto` mode rather than a fixed model (see "Effort and id shape").

For CLI-selector routes such as `claude/<model>` or `reasonix/<model>`, `<model>` is the suffix after the first slash. For `opencode/<model>`, resolve that suffix against the live list and pass the returned full id. An `opencode-go/<model>` route is already a live OpenCode `provider/model` id, so preserve the whole route.

## Home route per family

An input that names a model or family without a route resolves to that family's home route; an explicit route always overrides it, and no combination a CLI supports is ever ruled out.

| Family | Home route | Basis |
|---|---|---|
| `gpt-5.6-*` | `codex/*` | the vendor's own CLI, with graded effort as separate argv |
| `claude-*` | `claude/*` | the vendor's own CLI, and the only route exposing all five effort levels |
| `grok-4.6` | `grok/*` | the vendor's own coding CLI |

A family absent from the table has no default — `glm-*`, `deepseek-*`, `kimi-*`, `minimax-*`, `mimo-*`, `hy3`, and `qwen*` each run on several installed routes, so ask which CLI to use.

A home route says which CLI hosts a family, nothing more; it is not a model-effort profile, so it never needs an evidence-backed default. Effort still comes from the user or the recommendation path. Where the route encodes effort in the id, as `cursor/*` does, that level is part of the model's name rather than an option — resolve it from the family's catalog effort profile before building the slug, and ask when the catalog offers none.

## Effort and id shape

Effort support can vary by model even when the CLI accepts the flag. Reject a value known to be unsupported; if support cannot be verified, report that uncertainty instead of inventing a fallback.

`cursor/*` is the one route with no effort argv: there the level is part of the model id, so match the requested profile to a concrete live slug such as `gpt-5.6-sol-high` and do not synthesize bracket overrides. Its list is also the only one holding effort-bearing ids, which is why a fuzzy family-plus-effort request appears to match there first. Id shape is therefore route-specific, and the shapes must not cross:

- Never carry an effort suffix into another route. `-m gpt-5.6-sol-high` on `codex/*` names a different, probably nonexistent model, and rule 1's charset accepts it — no syntactic check catches this one.
- Never send a bare catalog slug to `cursor/*`; conversely, an effort-bearing id names `cursor/*` even without the route prefix, since no other route has one.
- Dispatch only ids the route's own list holds. When the requested profile has no id there, report that — do not approximate with a neighboring level, a `-fast` variant, or a dropped `-m`. Omitting the model on `cursor/*` selects its `auto` mode, which is a valid request when the user wants Cursor to choose but not a substitute for a named family.

## Per-route notes

Claude Code aliases such as `opus`, `sonnet`, and `fable` move with the latest
family release. Prefer the full model id (for example, `claude-opus-5`) when
the user names a version or reproducibility matters. The `opus` alias is
appropriate only for an explicit latest-Opus request.

The prompt is already in argv, so connect stdin to DEVNULL for every current route. In a process API, set the child stdin to DEVNULL. Under rule 2, redirect with `< /dev/null` and never pass the redirect as an argv token. Add a future stdin-consuming route as an explicit exception instead of inheriting an open pipe.

For the OpenCode routes, `--auto` has the same trust implications as other non-interactive permission bypass flags. The two log flags are not optional either: without them a fatal provider error prints nothing, the run stays silent as if healthy, and the failure only surfaces as a spent deadline. They leave stdout clean, so extraction is unaffected.

For `cline-pass/*`, return JSONL `run_result.text`; if absent, return raw stdout.

Use `reasonix/*` only for non-sensitive, general work: it talks directly to DeepSeek API. Do not use `model-catalog.md`; use an explicit current DeepSeek-compatible id or the CLI default. Do not suggest the retired `deepseek-chat` or `deepseek-reasoner` aliases; DeepSeek discontinued them on 2026-07-24 in favor of the V4 ids.
