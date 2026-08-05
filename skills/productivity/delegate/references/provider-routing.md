# Provider routing

Reference for choosing which provider route to use when one model is reachable through multiple providers.
If `cli-invocations.md` is "how to invoke a CLI", this document is "**which provider to use for the same model**".

> Snapshot: 2026-08-05. Auth state changes frequently — re-check each CLI's auth lightly before dispatching.
> Model existence is decided by the **live CLI model lists** (`opencode models`, `pi --list-models`, `agent models`), not by the matrix below. The matrix is only a snapshot at check time.

## 1. CLI classification

### Single-provider (fixed route — no choice)

| CLI | Fixed provider | Auth | Models |
|---|---|---|---|
| `codex/*` | OpenAI (ChatGPT OAuth) | `auth_mode: chatgpt` | gpt-5.6-sol / terra / luna |
| `claude/*` | Anthropic (claude.ai) | firstParty OAuth | claude-fable-5 / opus-5 / sonnet-5 |
| `reasonix/*` | DeepSeek first-party API | DEEPSEEK_API_KEY | deepseek-v4-* |
| `cursor/*` | Cursor/xAI (Grok family) | Cursor OAuth | cursor-grok-4.5-* |
| `cline-pass/*` | Cline Pass (fixed) | cline-pass provider | glm-5.2 etc. |

For a single-provider CLI, choosing the route IS choosing the provider: `codex` → OpenAI, `claude` → Anthropic, `reasonix` → DeepSeek first-party, `cursor` → Cursor/xAI, `cline-pass` → Cline Pass.

### Multi-provider (provider selection matters)

| CLI | Authenticated providers | Auth |
|---|---|---|
| `opencode/*` | `opencode-go` (Go subscription), `opencode` (free models) | api key (auth.json) |
| `pi/*` | `opencode-go` (api_key), `alibaba-plan` (OAuth, expires 2027-07-21) | auth.json |

`opencode` and `pi` can name a provider explicitly (`opencode-go/deepseek-v4-flash`, `pi --provider alibaba-plan ...`).

## 2. Model × route matrix

Which routes a model can reach. **Bold = recommended default**. Re-verify existence against live model lists before dispatch.

| Model | Reachable routes | Quota shape | Risk/cost notes |
|---|---|---|---|
| `deepseek-v4-flash` | **`opencode-go`** · `pi/alibaba-plan` · `opencode`(free) · `reasonix`(first-party) | subscription (incl. free) vs prepaid | first-party = training risk + 2x peak → prefer subscription by default |
| `deepseek-v4-pro` | **`opencode-go`** · `pi/alibaba-plan` · `reasonix`(first-party) | subscription vs prepaid | same as above |
| `glm-5.2` | **`opencode-go`** · `pi/alibaba-plan` · `opencode` · `cline-pass` | subscription | long-horizon coding/reasoning. opencode/cline-pass routes also appear in README examples |
| `qwen3.7-max` / `qwen3.8-max` | **`pi/alibaba-plan`** · `opencode-go` | subscription (Alibaba Token Plan) | off-peak 50% discount KST 23:00–09:00 → defer heavy work to night. catalog only describes qwen3.8-max (qwen3.7-max is in pi list but not in catalog) |
| `gpt-5.6-luna` | **`codex`** · `opencode-go` | Pro subscription vs Go subscription | fallback to opencode-go when codex is at 0% |
| `grok-4.5` | **`cursor/*`** (post-xAI acquisition) · `opencode-go` | subscription | tool-heavy work |
| `kimi-k3` / `kimi-k2.7-code` | **`opencode-go`** | Go subscription | kimi-k2.7-code was retired from the catalog but still exists in the opencode-go list (re-check before dispatch) |
| `mimo-v2.5` | **`opencode-go`** · `opencode`(free) | Go subscription | multimodal only (deepseek is better for text) |
| `mimo-v2.5-pro` | `opencode-go` | Go subscription | catalog excluded the pro tier (slow, undercut) — not a recommended default |
| `minimax-m3` | **`opencode-go`** | Go subscription | long-context/multimodal |
| `hy3` | **`opencode-go`** | Go subscription | low hallucination. pi/openrouter route has no auth (2026-08-05) |
| `claude-*` | `claude/*` single | Max subscription (company-paid) | fixed route |
| `gpt-5.6-sol/terra` | `codex/*` single | Pro subscription | fixed route |

## 3. Selection rules (priority)

When the same model exists on multiple routes:

1. **Single-provider models** → use that route. No deliberation.
2. **Avoid training risk** — for sensitive/proprietary code, avoid `reasonix` (DeepSeek first-party, trains) and use subscriptions (OpenCode Go, Alibaba). Use first-party only for work where training is acceptable.
3. **Quota burn strategy** — burn prepaid balances (DeepSeek/OpenRouter) first; keep subscriptions (Go/Alibaba) as the always-on pool.
4. **Off-peak discounts** — Alibaba Token Plan is 50% off KST 23:00–09:00 → defer heavy batchable work to this window.
5. **Peak-rate avoidance** — DeepSeek first-party is 2x during KST 10:00–13:00 and 15:00–19:00 → use subscriptions in those hours.
6. **Codex at 0%** — when codex weekly quota is 0%, fall back `gpt-5.6-luna` to `opencode-go`.

Decision order: risk → quota burn → cost (peak/discount) → capability. An explicit provider named by the user always wins. The bolded defaults above apply when the user names no provider — for families where `cli-invocations.md` would say "ask the user" (glm/deepseek/kimi/minimax/mimo/hy3/qwen), use the bolded default instead of asking, unless the user already named a provider or the reference lists no default for that family.

## 4. Auth snapshot (2026-08-05)

| CLI/provider | Status |
|---|---|
| codex (ChatGPT) | ✅ logged in |
| claude (claude.ai) | ✅ logged in (max) |
| cursor (agent CLI) | ✅ logged in |
| opencode-go | ✅ key present |
| pi/alibaba-plan | ✅ OAuth (until 2027-07-21) |
| pi/nous-portal | ⚠️ exposed in catalog, auth unverified |
| reasonix (DeepSeek) | ✅ key present (symlinked) |
| openrouter | ❌ not in Hermes .env — OpenRouter models currently unrouted (no pi/openrouter auth either) |

> Note: `model-catalog.md`'s evidence-backed defaults are about model *capability*; this document is about *route selection*. Read both together for capability + route. Models retired/undescribed in the catalog can still exist in live CLI lists, so the live list is the final authority right before dispatch.
