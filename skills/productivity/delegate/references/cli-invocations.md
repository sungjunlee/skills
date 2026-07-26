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
| `claude/*` | `claude -p --permission-mode auto --model <model> <prompt>` | `--effort <low\|medium\|high\|xhigh\|max>` | `DEVNULL` | — (use a full id from current docs, or a latest-family alias only when the user asks for latest) |
| `codex/*` | `codex exec --dangerously-bypass-approvals-and-sandbox -m <model> <prompt>` | argv entries `-c` + `model_reasoning_effort="<effort>"` (model-specific) | `DEVNULL` | — (check `~/.codex/config.toml` and current docs) |
| `pi/*` | `pi --print --model <model> --no-session <prompt>` | `--thinking <off\|minimal\|low\|medium\|high\|xhigh\|max>` | `DEVNULL` | `pi --list-models [search]` |
| `cursor/*` | `agent --print --yolo --trust --model <model> <prompt>` (binary is `agent`, not `cursor`) | select the matching effort-bearing slug from `agent models`; no separate argv | `DEVNULL` | `agent models` |
| `reasonix/*` | `reasonix run -m <model> <prompt>` | `--effort <low\|medium\|high\|max>` | `DEVNULL` | — (no CLI subcommand) |
| `cline-pass/*` | `cline --json -P cline-pass -m <model> <prompt>` | `--thinking <none\|low\|medium\|high\|xhigh>` | `DEVNULL` | — (no CLI subcommand) |

> A `<provider>/*` pattern also matches its bare `<provider>` route. If `<model>` is omitted, drop `-m <model>` from the argv — the CLI uses its configured default, except on `cursor/*`, where the omission selects its `auto` mode rather than a fixed model (see "Effort and id shape").

For CLI-selector routes such as `claude/<model>` or `reasonix/<model>`, `<model>` is the suffix after the first slash. For `opencode/<model>`, resolve that suffix against the live list and pass the returned full id. An `opencode-go/<model>` route is already a live OpenCode `provider/model` id, so preserve the whole route.

## Home route per family

An input that names a model or family without a route resolves to that family's home route. Only an explicit route in the user's input overrides it.

| Family | Home route | Basis |
|---|---|---|
| `gpt-5.6-*` | `codex/*` | the vendor's own CLI, with graded effort as separate argv |
| `claude-*` | `claude/*` | the vendor's own CLI, and the only route exposing all five effort levels |
| `grok-4.5` | `cursor/cursor-grok-4.5-<effort>` | the vendor's own CLI since Cursor was acquired by xAI |

`codex/*` and `claude/*` are also the executors behind this skill's dated `gpt-5.6-*` and `claude-*` evidence. Grok's home route rests on vendor ownership alone, so treat it as a routing default and not as an evidence-backed one.

Grok is the one family whose home route puts the effort inside the id: the slug is `cursor-grok-4.5-<effort>`, never plain `grok-4.5`. Resolve the level first, then take the slug that matches it. `opencode-go/grok-4.5` remains a valid explicit route — name it when you want the plain id, a level Cursor does not list, or comparability with earlier Grok results.

Other families have no home route. `glm-*`, `deepseek-*`, `kimi-*`, `minimax-*`, and `qwen*` are each reachable through several installed routes, so ask which CLI to use instead of picking one.

A home route says which CLI hosts a family. It is not a model-effort profile, so it stands outside the `model-catalog.md` promotion rule, and it never selects an effort — that still comes from the user or the recommendation path.

These are primary-vendor defaults, not a whitelist. Every route-and-model combination its CLI supports stays available on request; a home route means one route is the default for an unrouted family, never that another route is disallowed.

## Effort and id shape

Effort support can vary by model even when the CLI accepts the flag. Reject a value known to be unsupported; if support cannot be verified, report that uncertainty instead of inventing a fallback.

`cursor/*` is the one route with no effort argv: there the level is part of the model id. Match the requested profile to a concrete live slug such as `gpt-5.6-sol-high` or `claude-fable-5-xhigh`, and do not synthesize bracket overrides. That makes id shape route-specific, and the two shapes must never cross:

- Never carry an effort suffix into another route. `-m gpt-5.6-sol-high` on `codex/*` names a different, probably nonexistent model, and rule 1's charset accepts it — no syntactic check catches this one.
- Never send a bare catalog slug to `cursor/*`. `agent models` has no `gpt-5.6-sol`; it has `gpt-5.6-sol-high` and `gpt-5.6-sol-xhigh`.
- When the requested level has no slug on the route, report that. Cursor lists no Sol `medium`, and no Terra or Luna at all, so a catalog profile naming those is unreachable there — do not substitute a neighboring level or a `-fast` variant.
- On `cursor/*`, dropping `-m` does not preserve a configured model: it selects `auto`, Cursor's cost-aware automatic selection over its own lineup, Grok included. That is a legitimate mode — pass no model when the user wants Cursor to choose — but it answers a different request than a named family, so a `cursor/*` request that resolves no effort still has no slug: take a listed level or ask.

Because it is the only live list holding effort-bearing ids, a fuzzy family-plus-effort request appears to match `cursor/*` first. A name match in `agent models` is not by itself a route decision — a bare family name resolves by home route, not by whichever list happens to hold a similar string.

The id shape cuts the other way too. An effort-bearing id such as `gpt-5.6-sol-high` or `claude-fable-5-thinking-xhigh` exists on `cursor/*` and nowhere else, so an input naming one is naming that route even without the prefix. Read the shape as the route signal it is instead of sending it to a home route that has no such model.

## Per-route notes

Claude Code aliases such as `opus`, `sonnet`, and `fable` move with the latest
family release. Prefer the full model id (for example, `claude-opus-5`) when
the user names a version or reproducibility matters. The `opus` alias is
appropriate only for an explicit latest-Opus request.

The prompt is already in argv, so connect stdin to DEVNULL for every current route. In a process API, set the child stdin to DEVNULL. Under rule 2, redirect with `< /dev/null` and never pass the redirect as an argv token. Add a future stdin-consuming route as an explicit exception instead of inheriting an open pipe.

For the OpenCode routes, `--auto` has the same trust implications as other non-interactive permission bypass flags.

For `cline-pass/*`, return JSONL `run_result.text`; if absent, return raw stdout.

Use `reasonix/*` only for non-sensitive, general work: it talks directly to DeepSeek API. Do not use `model-catalog.md`; use an explicit current DeepSeek-compatible id or the CLI default. Do not suggest the retired `deepseek-chat` or `deepseek-reasoner` aliases; DeepSeek discontinued them on 2026-07-24 in favor of the V4 ids.
