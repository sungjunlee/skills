# Provider routing

Reference for choosing which provider route to use when one model is reachable through multiple providers.
If `cli-invocations.md` is "how to invoke a CLI", this document is "**which provider to use for the same model**".

This file intentionally contains **no user-specific state** (no subscriptions, balances, expiry dates, or "which CLI is connected to which provider"). Those live in the operator's own routing/ops document. Everything here is general enough to reuse on any machine.

> Model existence and reachable routes are decided by the **live CLI model lists** (`opencode models`, `pi --list-models`, `cursor-agent models`, `grok models`) — never by a static table. A model may appear in multiple providers; check the actual lists at dispatch time.

## 1. CLI classification

### Single-provider (fixed route — no choice)

| CLI | Fixed provider | Auth | Models |
|---|---|---|---|
| `codex/*` | OpenAI (ChatGPT OAuth) | `auth_mode: chatgpt` | gpt-5.6-sol / terra / luna |
| `claude/*` | Anthropic (claude.ai) | firstParty OAuth | claude-fable-5 / opus-5 / sonnet-5 |
| `reasonix/*` | DeepSeek first-party API | DEEPSEEK_API_KEY | deepseek-v4-* |
| `grok/*` | xAI (Grok Build CLI) | grok.com OAuth, or `XAI_API_KEY` where no browser is available | grok-4.6 / grok-4.5 |

For a single-provider CLI, choosing the route IS choosing the provider: `codex` → OpenAI, `claude` → Anthropic, `grok` → xAI, `reasonix` → DeepSeek first-party.

### Subscription-bounded multi-model (one provider auth, many models)

| CLI | Provider/billing | Auth | Models |
|---|---|---|---|
| `cursor/*` | Cursor subscription | Cursor OAuth | many families under the cursor plan: cursor-grok-4.6-*, gpt-5.6-sol-*, claude-opus/fable/sonnet-*-*, kimi-k3-*, composer-2.5-*, gpt-5.x-* |
| `cline/*` | configurable provider; `cline-pass` is one provider id among many | per-provider (`cline auth`: manual key, Azure, base URL) | varies by provider; cline-pass serves glm-5.2 etc. |

- `cursor/*` is one subscription (Cursor) that exposes many model families; the route's model id selects the family. Billing is fixed to Cursor, but the model set is broad.
- `cline/*` is genuinely multi-provider: `-P, --provider <id>` switches provider (default `cline`), `cline auth` adds/authenticates them (manual key, Azure, base URL). `cline-pass` is a provider id used for the Cline Pass quota — not a fixed provider of the whole CLI.

### Multi-provider (provider selection matters)

| CLI | Shape | Auth |
|---|---|---|
| `opencode/*` | provider-scoped model ids (`opencode-go/...`, `opencode/...` free, or BYOK providers) | api key(s) in auth.json |
| `pi/*` | provider-scoped (`pi --provider <id>`, e.g. alibaba-plan, opencode-go) | api keys / OAuth in auth.json |

`opencode` and `pi` name a provider explicitly (`opencode-go/deepseek-v4-flash`, `pi --provider alibaba-plan ...`). Which providers are actually connected is operator state, not a property of these CLIs.

## 2. Route discovery, not a static matrix

Do not maintain a model → route table here. Instead, at dispatch time:

1. Resolve the model/family home route from `cli-invocations.md`.
2. For multi-provider CLIs, list the live models (`opencode models [provider]`, `pi --list-models`, `cursor-agent models`) and see which providers actually expose the model.
3. Choose among the reachable providers using §3 rules and the operator's own routing document (subscriptions, balances, expiry, quotas).

A static matrix rots: subscriptions change, providers drop models, quotas reset. The live list is the only authority.

## 3. Selection rules (priority)

When the same model exists on multiple routes:

1. **Single-provider models** → use that route. No deliberation.
2. **Avoid training risk** — for sensitive/proprietary code, avoid first-party APIs that train on input (e.g. some providers' first-party routes) and prefer subscriptions or BYOK routes that do not. Use training-capable first-party only for work where training is acceptable.
3. **Quota burn strategy** — burn prepaid balances first; keep subscriptions as the always-on pool. Exact balances live in the operator's routing document.
4. **Off-peak discounts** — if a provider offers off-peak discounts, defer heavy batchable work to that window.
5. **Peak-rate avoidance** — if a first-party API is more expensive during peak hours, use subscriptions in those hours.
6. **Quota-exhausted fallback** — when a preferred route is at 0%, fall back to another route that exposes the same model.
7. **Family-first, then billing** — for families reachable in multiple subscriptions, prefer the native CLI (e.g. `claude/*` for claude models, `codex/*` for gpt-5.6) for full effort control; use a bundled subscription (e.g. `cursor/*`) for 1M-token variants or when that subscription has spare quota. An explicit provider or route named by the user always wins.

Decision order: risk → explicit user route → quota burn → cost (peak/discount) → capability.

## 4. Operator state lives elsewhere

- Subscriptions, prices, expiry, current balances → the operator's own routing/ops document.
- Auth snapshot (which CLI is logged in, which providers have keys) → check live before dispatch, or read the operator's doc.
- Model capability/effort hints → `model-catalog.md` (evidence-backed defaults) + `routing-guide.md`.

> Note: `model-catalog.md`'s evidence-backed defaults are about model *capability*; this document is about *route selection*. Read both together for capability + route.
