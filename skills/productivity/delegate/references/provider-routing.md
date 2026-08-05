# Provider routing

Reference for choosing which provider route to use when one model is reachable through multiple providers.
If `cli-invocations.md` is "how to invoke a CLI", this document is "**which provider to use for the same model**".

> Snapshot: 2026-08-05. Auth state changes frequently — re-check each CLI's auth lightly before dispatching.
> Model existence is decided by the **live CLI model lists** (`opencode models`, `pi --list-models`, `agent models`, `cline auth`), not by the matrix below. The matrix is only a snapshot at check time.

## 1. CLI classification

### Single-provider (fixed route — no choice)

| CLI | Fixed provider | Auth | Models |
|---|---|---|---|
| `codex/*` | OpenAI (ChatGPT OAuth) | `auth_mode: chatgpt` | gpt-5.6-sol / terra / luna |
| `claude/*` | Anthropic (claude.ai) | firstParty OAuth | claude-fable-5 / opus-5 / sonnet-5 |
| `reasonix/*` | DeepSeek first-party API | DEEPSEEK_API_KEY | deepseek-v4-* |

For a single-provider CLI, choosing the route IS choosing the provider: `codex` → OpenAI, `claude` → Anthropic, `reasonix` → DeepSeek first-party.

### Subscription-bounded multi-model (one provider auth, many models)

| CLI | Provider/billing | Auth | Models |
|---|---|---|---|
| `cursor/*` (agent CLI) | Cursor subscription | Cursor OAuth | cursor-grok-4.5-*, gpt-5.6-sol-*, claude-opus/fable/sonnet-*-*, kimi-k3-*, composer-2.5-*, gpt-5.x-* — many families, all under the cursor plan |
| `cline/*` | configurable provider; `cline-pass` is one provider id among many | per-provider (manual key, Azure, etc. via `cline auth`) | varies by provider; cline-pass serves glm-5.2 etc. |

- `cursor/*` is one subscription (Cursor) that exposes many model families; the route's model id selects the family. It is not a single model, but billing is fixed to Cursor. Choose it when the user's active quota is comfortable on Cursor, or when a family (e.g. grok) is only reachable there.
- `cline/*` is genuinely multi-provider: `-P, --provider <id>` switches provider (default `cline`), `cline auth` adds/authenticates them (manual key, Azure, base URL). `cline-pass` is the provider id used for the Cline Pass quota — not a fixed provider of the whole CLI.

### Multi-provider (provider selection matters)

| CLI | Authenticated providers | Auth |
|---|---|---|
| `opencode/*` | `opencode-go` (Go subscription), `opencode` (free models) | api key (auth.json) |
| `pi/*` | `opencode-go` (api_key), `alibaba-plan` (OAuth, expires 2027-07-21) | auth.json |

`opencode` and `pi` name a provider explicitly (`opencode-go/deepseek-v4-flash`, `pi --provider alibaba-plan ...`).

## 2. Model × route matrix

Which routes a model can reach. **Bold = recommended default**. Re-verify existence against live model lists before dispatch.

| Model | Reachable routes | Quota shape | Risk/cost notes |
|---|---|---|---|
| `deepseek-v4-flash` | **`opencode-go`** · `pi/alibaba-plan` · `opencode`(free) · `reasonix`(first-party) | subscription (incl. free) vs prepaid | first-party = training risk + 2x peak → prefer subscription by default |
| `deepseek-v4-pro` | **`opencode-go`** · `pi/alibaba-plan` · `reasonix`(first-party) | subscription vs prepaid | same as above |
| `glm-5.2` | **`opencode-go`** · `pi/alibaba-plan` · `opencode` · `cline-pass` | subscription | long-horizon coding/reasoning. opencode/cline-pass routes also appear in README examples |
| `qwen3.7-max` / `qwen3.8-max` | **`pi/alibaba-plan`** · `opencode-go` | subscription (Alibaba Token Plan) | off-peak 50% discount KST 23:00–09:00 → defer heavy work to night. catalog only describes qwen3.8-max (qwen3.7-max is in pi list but not in catalog) |
| `gpt-5.6-luna` | **`codex`** · `opencode-go` · `cursor/gpt-5.6-luna-*` | Pro / Go / Cursor subs | fallback to opencode-go or cursor when codex is at 0% |
| `claude-opus/fable/sonnet` | **`claude/*`** · `cursor/claude-*-*` | Anthropic Max vs Cursor sub | prefer `claude/*` (native 5 effort levels); cursor exposes 1M-token thinking variants |
| `grok-4.5` | **`cursor/*`** (xAI acquisition) · `opencode-go` | Cursor sub / Go sub | tool-heavy work |
| `kimi-k3` / `kimi-k2.7-code` | **`opencode-go`** · `cursor/kimi-k3-*` | Go sub / Cursor sub | kimi-k2.7-code retired from catalog but still in opencode-go list (re-check before dispatch) |
| `mimo-v2.5` | **`opencode-go`** · `opencode`(free) | Go subscription | multimodal only (deepseek better for text) |
| `mimo-v2.5-pro` | `opencode-go` | Go subscription | catalog excluded pro tier (Artificial Analysis 42, slow) — not a recommended default |
| `minimax-m3` | **`opencode-go`** | Go subscription | long-context/multimodal |
| `hy3` | **`opencode-go`** | Go subscription | low hallucination. pi/openrouter route has no auth (2026-08-05) |
| `claude-*` | `claude/*` single | Max subscription (company-paid) | fixed route |
| `gpt-5.6-sol/terra` | `codex/*` single · `cursor/gpt-5.6-sol-*` | Pro sub / Cursor sub | codex native; cursor exposes 1M variants |

## 3. Selection rules (priority)

When the same model exists on multiple routes:

1. **Single-provider models** → use that route. No deliberation.
2. **Avoid training risk** — for sensitive/proprietary code, avoid `reasonix` (DeepSeek first-party, trains) and use subscriptions (OpenCode Go, Alibaba). Use first-party only for work where training is acceptable.
3. **Quota burn strategy** — burn prepaid balances (DeepSeek/OpenRouter) first; keep subscriptions (Go/Alibaba/Cursor) as the always-on pool.
4. **Off-peak discounts** — Alibaba Token Plan is 50% off KST 23:00–09:00 → defer heavy batchable work to this window.
5. **Peak-rate avoidance** — DeepSeek first-party is 2x during KST 10:00–13:00 and 15:00–19:00 → use subscriptions in those hours.
6. **Codex at 0%** — when codex weekly quota is 0%, fall back `gpt-5.6-luna` to `opencode-go` or `cursor`.
7. **Family-first, then billing** — for families reachable in multiple subscriptions (claude-, gpt-5.6-, kimi-, grok), prefer the native CLI (`claude/*`, `codex/*`) for full effort control; use the `cursor/*` route for its 1M-token variants or when that subscription has spare quota. An explicit provider or route named by the user always wins.

Decision order: risk → explicit user route → quota burn → cost (peak/discount) → capability.

## 4. Auth snapshot (2026-08-05)

| CLI/provider | Status |
|---|---|
| codex (ChatGPT) | ✅ logged in |
| claude (claude.ai) | ✅ logged in (max) |
| cursor (agent CLI) | ✅ logged in |
| opencode-go | ✅ key present |
| pi/alibaba-plan | ✅ OAuth (until 2027-07-21) |
| pi/nous-portal | ⚠️ exposed in catalog, auth unverified |
| cline | ✅ cline provider configured (default); cline-pass and others available via `cline auth` |
| reasonix (DeepSeek) | ✅ key present (symlinked) |
| openrouter | ❌ not in Hermes .env — OpenRouter models currently unrouted (no pi/openrouter auth either) |

> Note: `model-catalog.md`'s evidence-backed defaults are about model *capability*; this document is about *route selection*. Read both together for capability + route. Models retired/undescribed in the catalog can still exist in live CLI lists, so the live list is the final authority right before dispatch.
