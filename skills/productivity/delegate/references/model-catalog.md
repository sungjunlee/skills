# Model catalog

Last checked: 2026-09-23. Treat as stale after 30 days.

Use only when the user asks for a recommendation or gives a fuzzy model name. Prefer live provider model lists when available. These are bare family slugs, not routes: resolve the route first from the home-route table in `cli-invocations.md`, then adapt the slug to that route's id shape.

## Frontier families

| Model | Selection hint | Effort profile | Cost shape |
|---|---|---|---|
| `gpt-6-astra` | Hardest end-to-end work across code, browsers, and professional software; complex research and document creation. Leads independent cross-file code-review evals. May stop before a multi-step task is done, so state the completion condition. | `low` for scoped, checkable work; `medium` otherwise; `high`–`max` only where task evals show a gain | frontier; $10/$50 per 1M in/out, $1 cached input; about 1/3 the output tokens of Fable per task; over 272K input, 2× input/cache and 1.5× output |
| `gpt-6-sol` | Demanding coding, review, and debugging; at `xhigh` it tops Astra `low` on the vendor's agent-workflow eval at about 1/4 the task cost. | `xhigh`; `medium` (vendor default) for scoped, checkable work | flagship; $2/$10 per 1M in/out, $0.20 cached input; over 272K input, 2× input/cache and 1.5× output |
| `gpt-6-luna` | High-volume, clear-goal work, including bounded coding. | `max`; `medium` (vendor default) for simple extraction and summaries | deep value; $0.10/$0.50 per 1M in/out, $0.01 cached input; over 272K input, 2× input/cache and 1.5× output |
| `claude-fable-5-1` | Long-running, highly ambitious work that earns frontier spend. | `low` for scoped, checkable work; `medium` for most planning and coding; `high` for difficult or ambiguous work; `xhigh`–`max` only where evals show a gain on long-horizon tasks | frontier; $10/$50 per 1M in/out, $0.25 cache read |
| `claude-opus-5-5` | Long-running agentic coding, code review, and knowledge work at Fable 5.1 level on most tasks. | `medium` (default); `low` for scoped coding; `xhigh`–`max` only where evals show a gain, since it thinks more per turn there | premium; $4/$20 per 1M in/out, $0.20 cache read |
| `claude-sonnet-5` | Scaled daily agentic coding and execution. | `medium` | balanced |
| `grok-4.7` | Long-running agent loops, tool-heavy coding, 500K-context knowledge and document work, or an independent frontier-family review; pick it for persistence and breadth, not terminal-heavy accuracy. | `high` (vendor default); `xhigh` for long agent trajectories, at a steep output-token cost; `medium`/`low` when latency matters | value frontier; $2/$6 per 1M in/out below 200K prompt tokens, doubling above; `grok-4.7-build-fast` 2× price for 2× speed |
| `kimi-k3` | Long-horizon coding, tool-heavy knowledge work, or multimodal implementation where completion quality matters more than latency. | route default; API ships `max` thinking, `low` and `high` announced | frontier; high output-token and latency risk |
| `qwen3.8-max` | Complex reasoning and coding through Alibaba's Token Plan. Off-peak Credits are 50% off daily 22:00–08:00 UTC+8, so defer batchable work to that window. | route default; API has a thinking toggle, no graded effort | subscription |

## Value and other families

| Model | Selection hint | Effort profile | Cost shape |
|---|---|---|---|
| `glm-5.3` | Complex or long-horizon text coding; 1M context. | route default; Z.ai API `low`/`high`/`max` (default `max`, always thinking) | $1.40/$4.40 per 1M in/out (Z.ai direct API) |
| `glm-5.3-flash` | Value coding and native multimodal office work; 1M context. | as GLM-5.3 | $0.15/$0.50 per 1M in/out (Z.ai direct API); 3× GLM-5.3 quota on Z.ai Coding Plan |
| `gemini-3.8-flash` | Complex, long-horizon coding/agents and multimodal work; 1M context. | route default; API `low`/`medium`/`high` (default `medium`; no `minimal`) | $0.75/$3.75 introductory through 2026-12-31, then $1.50/$7.50 per 1M in/out (Google direct API) |
| `muse-spark-1.3` | Long-horizon coding and multimodal work; 1M context. | route default | route-priced; the cheaper Contributor variant trains on prompts and completions |
| `glm-5.2` | Long-horizon coding and reasoning with an open-weight route. | route default | premium open |
| `hy3` | Coding, document, and frontend work with low-hallucination behavior; open weights. | route default (no-think); `low`/`high` thinking for multi-step work | mid; ~$0.13/$0.53 per 1M via OpenRouter |
| `minimax-m3` | Long-context, multimodal, or general agentic coding. | `high` for complex agentic work; otherwise route default | mid |
| `mimo-v2.6-pro` | Long-horizon agentic and full-modal work at open-weight prices; trails on terminal-heavy tasks. | route default; API thinking on/off only (default on), no graded effort | $0.435/$0.87 per 1M in/out, batch half price; `mimo-v2.6-pro-ultraspeed` 10× price for speed |
| `mimo-v2.6-flash` | Cheap full-modal (image/video/audio) work with 1M context and tool calling. | as MiMo V2.6 Pro | cheap; $0.14/$0.28 per 1M in/out, batch half price |
| `deepseek-v4.1-flash` | Fast iteration, mechanical work, cheap retries, and image input; API id `deepseek-flash`, which also serves the retired V4 ids. Verbose (about 2× median output tokens), so compare cost per task, not per token. | route default; API `low`/`high`/`max` | cheap; $0.30/$1.20 per 1M in/out at peak (weekdays 01:00–04:00 and 06:00–10:00 UTC), half off-peak |

## Evidence-backed defaults

From dated local runs (2026-07-22/23). Community reports and vendor
rankings never override this list, and the 30-day staleness note above
does not expire it — observed results stand until contradicted by new
local runs.

- Ambiguous everyday work and high-blast-radius analysis: no default —
  the `gpt-5.6-*` evidence retires with that generation, so `gpt-6-*`
  enters unevidenced.
- Independent cross-family review → Fable 5 `high` (not yet validated on 5.1). The Grok side of that
  comparison was `grok-4.5` (strong twice, one empty-output run) and
  retires with the model — evidence never transfers to a successor, so
  `grok-4.7` enters this list unevidenced.
- Mechanical work with strong tests: no default — per-run variance
  dominates, and both `grok-4.5` efforts tripped a behavior-preserving
  trap.

## Sources

- [GPT-6 Astra model](https://developers.openai.com/api/docs/models/gpt-6-astra), [Astra model guidance](https://developers.openai.com/api/docs/guides/latest-model), [Benchmarking GPT-6 Astra](https://artificialanalysis.ai/articles/benchmarking-gpt-6-astra), [Astra code-review evaluation](https://www.coderabbit.ai/blog/gpt-6-astra-code-review-evaluation), [GPT-6 Sol model](https://developers.openai.com/api/docs/models/gpt-6-sol), [GPT-6 Luna model](https://developers.openai.com/api/docs/models/gpt-6-luna), [GPT-6 Sol and Luna announcement](https://openai.com/index/introducing-gpt-6-sol-and-luna/), [GPT-6 Sol and Luna benchmarks](https://venturebeat.com/technology/openai-releases-gpt-6-sol-and-luna-models-slashing-api-costs-50-or-more), [OpenAI model catalog](https://developers.openai.com/api/docs/models), and [OpenAI model comparison](https://developers.openai.com/api/docs/models/compare)
- [Anthropic effort guidance](https://platform.claude.com/docs/en/build-with-claude/effort), [Opus 5.5 changes](https://platform.claude.com/docs/en/models/opus-5-5/whats-new-opus-5-5), [Prompting Opus 5.5](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-opus-5-5), [Benchmarking Opus 5.5](https://artificialanalysis.ai/articles/claude-opus-5-5), [Fable 5.1](https://platform.claude.com/docs/en/models/fable-5-1/overview), and [Sonnet 5](https://www.anthropic.com/news/claude-sonnet-5)
- [xAI Grok 4.7](https://docs.x.ai/developers/grok-4-7), [xAI models and pricing](https://docs.x.ai/developers/models), [Grok 4.7 model card](https://media.x.ai/v1/website/4p7card-5eccc980.pdf), [Grok 4.7 announcement](https://x.ai/news/grok-4-7), and [Benchmarking Grok 4.7](https://artificialanalysis.ai/articles/benchmarking-grok-4-7)
- [Z.ai GLM-5.2](https://z.ai/blog/glm-5.2)
- [Moonshot Kimi K3](https://www.kimi.com/blog/kimi-k3)
- [Xiaomi MiMo model releases](https://mimo.mi.com/docs/en-US/updates/model), [MiMo models](https://mimo.mi.com/docs/en-US/quick-start/summary/model), [MiMo pricing](https://mimo.mi.com/docs/en-US/price/pay-as-you-go), [MiMo deep-thinking mode](https://mimo.mi.com/docs/en-US/quick-start/usage-guide/text-generation/deep-thinking), [Benchmarking MiMo V2.6 Pro](https://artificialanalysis.ai/models/mimo-v2-6-pro), and [OpenRouter model list](https://openrouter.ai/api/v1/models) (xiaomi/mimo-v2.6-\*, x-ai/grok-4.7; price cross-check)
- [Tencent Hunyuan Hy3 release](https://www.tencent.com/en-us/articles/2202386.html) and [Hy3 on OpenRouter](https://openrouter.ai/tencent/hy3) (price source; route discount included)
- [Qwen Cloud text-generation models](https://docs.qwencloud.com/developer-guides/getting-started/text-generation-models) and [Token Plan](https://docs.qwencloud.com/token-plan/overview)
- [DeepSeek API changelog](https://api-docs.deepseek.com/updates/) and [DeepSeek models and pricing](https://api-docs.deepseek.com/quick_start/pricing/)
- [MiniMax M3](https://www.minimax.io/blog/minimax-m3)
- [Z.ai GLM-5.3 guide](https://docs.z.ai/guides/llm/glm-5.3), [GLM-5.3 Flash guide](https://docs.z.ai/guides/vlm/glm-5.3-flash), and [Z.ai pricing](https://docs.z.ai/guides/overview/pricing)
- [Gemini 3.8 Flash model docs](https://ai.google.dev/gemini-api/docs/models/gemini-3.8-flash) and [Gemini pricing](https://ai.google.dev/gemini-api/docs/latest-model)
- [Meta Muse Spark 1.3](https://research.meta.ai/blog/introducing-muse-spark-1-3), [OpenCode Zen privacy](https://opencode.ai/docs/zen/#privacy), and [OpenCode Go privacy](https://opencode.ai/docs/go/#privacy)

These are profile hints, not rankings. Choose the profile from the task before dispatch; do not treat effort levels as a retry staircase. Prices moved after the 2026-07-22/23 runs: the acceptance findings stand, but re-check cost before it decides. Distinguish API marginal cost from subscription quota pressure when comparing routes.
