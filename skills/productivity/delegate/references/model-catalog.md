# Model catalog

Last checked: 2026-09-05. Treat as stale after 30 days.

Use only when the user asks for a recommendation or gives a fuzzy model name. Prefer live provider model lists when available. These are bare family slugs, not routes: resolve the route first from the home-route table in `cli-invocations.md`, then adapt the slug to that route's id shape.

## Frontier families

| Model | Selection hint | Effort profile | Cost shape |
|---|---|---|---|
| `gpt-6-astra` | Hardest end-to-end work and sustained workflows across code, browsers, and professional software; also complex research and document creation. | vendor guidance starts migrations from `none` or `minimal` at `low`; re-sweep `low` and `medium` on the target task rather than inheriting an older-model setting, and use `high`–`max` only where task evals show a gain | frontier; $10/$50 per 1M in/out, $1 cached input; vendor reports lower estimated cost per task on some evals; over 272K input, the full request costs 2× input/cache and 1.5× output |
| `gpt-5.6-sol` | Complex professional work where the established Sol profile already meets the task's acceptance checks. | `medium` is the vendor default and fits bounded hard work with strong checks; `high` for high-blast-radius or cross-boundary work with consequential tradeoffs; `xhigh` for long-horizon work that benefits from broad exploration and self-checking | flagship; $4/$20 per 1M in/out, $0.40 cached input; over 272K input, the full request costs 2× input and 1.5× output |
| `gpt-5.6-terra` | Balanced GPT-5.6 tier for ambiguous everyday work. | `medium`; test before using `high`+ as a value step | balanced |
| `gpt-5.6-luna` | Fast, high-volume, or tightly scoped GPT-5.6 work; repriced −80% on 2026-07-30 ($0.20/$1.20 per 1M in/out). | `high`; `xhigh`–`max` for bounded, genuinely hard work — community reports favor `max` there and warn against it for vague or coordination-heavy tasks | deep value |
| `claude-fable-5-1` | Long-running, highly ambitious work that earns frontier spend. | `low` for scoped, checkable work that does not rely on broad retrieval; `medium` for most planning and coding already routed to Fable; `high` for difficult or ambiguous work; use `xhigh` or `max` only where evals show a gain on genuinely long-horizon tasks | frontier; $10/$50 per 1M in/out, $0.25 cache read |
| `claude-opus-5` | Complex agentic coding, long-horizon execution, code review, vision-heavy implementation, or document work when Fable-tier spend is not justified. | `high` by default; `xhigh` for demanding coding and agentic work; reserve `max` for unconstrained frontier problems; re-sweep `low` and `medium` rather than inheriting an older Opus setting | premium |
| `claude-sonnet-5` | Scaled daily agentic coding and execution. | `medium` | balanced |
| `grok-4.6` | Long-running agent loops, tool-heavy coding, and 500K-context knowledge work, or an independent frontier-family review. Released 2026-08-12; public coding benchmarks still trail the strongest GPT-5.6 profile, so pick it for step persistence and breadth, not peak code accuracy. | `high` is the vendor default; `xhigh` is new in 4.6 for long agent trajectories; `medium` when latency matters more than reasoning depth | value frontier; $2/$6 per 1M in/out below 200K prompt tokens, doubling above it |
| `kimi-k3` | Long-horizon coding, tool-heavy knowledge work, or multimodal implementation where completion quality matters more than latency. | route default; launch API uses `max` thinking, with `low` and `high` announced for later | frontier; high output-token and latency risk |
| `qwen3.8-max` | Complex reasoning and coding through Alibaba's Token Plan; GA on 2026-08-03, replacing the preview. Off-peak Credits run 50% off daily 22:00–08:00 UTC+8 (23:00–09:00 KST), so deferrable work is markedly better value dispatched at night; the vendor may modify the discount. | route default; the thinking toggle (`enable_thinking`) is documented, graded effort behavior is not | subscription |

## Value and other families

| Model | Selection hint | Effort profile | Cost shape |
|---|---|---|---|
| `glm-5.3` | Complex or long-horizon text coding; 1M context. | route default; Z.ai API `low`/`high`/`max` (default `max`, always thinking) | $1.40/$4.40 per 1M in/out (Z.ai direct API) |
| `glm-5.3-flash` | Value coding and native multimodal office work; 1M context. | route default; same Z.ai API settings as GLM-5.3 | $0.15/$0.50 standard per 1M in/out (Z.ai direct API); 3× GLM-5.3 quota on Z.ai Coding Plan |
| `gemini-3.8-flash` | Complex, long-horizon coding/agents and multimodal work; 1M context. | route default; API `low`/`medium`/`high` (default `medium`; no `minimal`) | $0.75/$3.75 introductory through 2026-12-31, then $1.50/$7.50 per 1M in/out (Google direct API) |
| `muse-spark-1.3` | Long-horizon coding and multimodal work; 1M context. | route default; `max` announced but not yet launched | route-priced; Contributor is cheaper in exchange for permission to train on prompts and completions |
| `glm-5.2` | Long-horizon coding and reasoning with an open-weight route. | route default | premium open |
| `deepseek-v4-pro` | Larger changes when direct-API cost/performance matters. | `high` for ambiguous or multi-stage work; otherwise route default | pro value |
| `hy3` | Coding, document, and frontend work with grounded low-hallucination behavior; Tencent's open-weight generalist, GA 2026-07-06 (~$0.13/$0.53 per 1M via OpenRouter). | route default is no-think; `low` and `high` thinking modes documented for complex multi-step work | mid |
| `minimax-m3` | Long-context, multimodal, or general agentic coding. | `high` for complex agentic work; otherwise route default | mid |
| `mimo-v2.5` | Multimodal work — native image, video, and audio input with 1M context at near-flash prices (~$0.11/$0.22 per 1M via OpenRouter); community reports single out its multimodal quality. On text-only work `deepseek-v4-flash` benchmarks meaningfully higher — pick MiMo for the modalities, not for text. | route default | cheap |
| `deepseek-v4-flash` | Fast iteration, mechanical work, and cheap retries. The 0731 in-place refresh (public beta) sharply raised agentic and coding capability at unchanged prices ($0.14/$0.28 per 1M in/out). | route default | cheap |

## Evidence-backed defaults

From dated local runs (2026-07-22/23). Community reports and vendor
rankings never override this list, and the 30-day staleness note above
does not expire it — observed results stand until contradicted by new
local runs.

- Ambiguous everyday feature/bugfix work → Terra `high`; Luna `xhigh`
  also passed both dates and stays a valid alternative.
- High-blast-radius analysis → Sol `high`; use `xhigh` when register
  depth is the deliverable.
- Independent cross-family review → Fable 5 `high` (not yet validated on 5.1). The Grok side of that
  comparison was `grok-4.5` (strong twice, one empty-output run) and
  retires with the model — evidence never transfers to a successor, so
  `grok-4.6` enters this list unevidenced.
- Mechanical work with strong tests: no default — per-run variance
  dominates, and both `grok-4.5` efforts tripped a behavior-preserving
  trap.

## Sources

- [GPT-6 Astra model](https://developers.openai.com/api/docs/models/gpt-6-astra), [Astra model guidance](https://developers.openai.com/api/docs/guides/latest-model), [GPT-5.6 Sol model](https://developers.openai.com/api/docs/models/gpt-5.6-sol), [OpenAI model catalog](https://developers.openai.com/api/docs/models), [OpenAI model comparison](https://developers.openai.com/api/docs/models/compare), and [GPT-5.6 effort guidance](https://openai.com/index/gpt-5-6/)
- [Anthropic effort guidance](https://platform.claude.com/docs/en/build-with-claude/effort), [Opus 5 changes](https://platform.claude.com/docs/en/about-claude/models/whats-new-opus-5), [Opus 5 migration guide](https://platform.claude.com/docs/en/about-claude/models/migration-guide), [Fable 5.1](https://platform.claude.com/docs/en/models/fable-5-1/overview), and [Sonnet 5](https://www.anthropic.com/news/claude-sonnet-5)
- [xAI Grok 4.6](https://docs.x.ai/developers/grok-4-6) and [xAI models and pricing](https://docs.x.ai/developers/models)
- [Z.ai GLM-5.2](https://z.ai/blog/glm-5.2)
- [Moonshot Kimi K3](https://www.kimi.com/blog/kimi-k3)
- [Xiaomi MiMo model releases](https://mimo.mi.com/docs/en-US/updates/model) and [MiMo-V2.5 on OpenRouter](https://openrouter.ai/xiaomi/mimo-v2.5) (price source; route discount included)
- [Tencent Hunyuan Hy3 release](https://www.tencent.com/en-us/articles/2202386.html) and [Hy3 on OpenRouter](https://openrouter.ai/tencent/hy3) (price source; route discount included)
- [Qwen Cloud text-generation models](https://docs.qwencloud.com/developer-guides/getting-started/text-generation-models) and [Token Plan](https://docs.qwencloud.com/token-plan/overview)
- [DeepSeek API changelog](https://api-docs.deepseek.com/updates/)
- [MiniMax M3](https://www.minimax.io/blog/minimax-m3)
- [Z.ai GLM-5.3 guide](https://docs.z.ai/guides/llm/glm-5.3), [GLM-5.3 Flash guide](https://docs.z.ai/guides/vlm/glm-5.3-flash), and [Z.ai pricing](https://docs.z.ai/guides/overview/pricing)
- [Gemini 3.8 Flash model docs](https://ai.google.dev/gemini-api/docs/models/gemini-3.8-flash) and [Gemini pricing](https://ai.google.dev/gemini-api/docs/latest-model)
- [Meta Muse Spark 1.3](https://research.meta.ai/blog/introducing-muse-spark-1-3), [OpenCode Zen privacy](https://opencode.ai/docs/zen/#privacy), and [OpenCode Go privacy](https://opencode.ai/docs/go/#privacy)

These are profile hints, not rankings. Choose the profile from the task before dispatch; do not treat effort levels as a retry staircase. OpenAI's 2026-07-30 reprice (Luna −80%, Terra −20%) postdates the cost side of the 2026-07-22/23 observations — the acceptance-parity finding on those fixtures stands, but re-check dollar costs before letting them decide. Distinguish API marginal cost from subscription quota pressure when comparing routes.
