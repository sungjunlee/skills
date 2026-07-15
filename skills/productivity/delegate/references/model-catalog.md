# Model catalog

Last checked: 2026-07-15. Treat as stale after 30 days.

Use only when the user asks for a recommendation or gives a fuzzy model name. Prefer live provider model lists when available. Provider prefixes vary, so adapt the slug to the selected route format.

## Frontier families

| Model | Selection hint | Start hint | Cost shape |
|---|---|---|---|
| `gpt-5.6-sol` | Highest-stakes or hardest GPT-5.6 work. | `medium`; raise for unresolved high-risk work | flagship |
| `gpt-5.6-terra` | Balanced GPT-5.6 tier for ambiguous everyday work. | `medium`; test before using `high`+ as a value step | balanced |
| `gpt-5.6-luna` | Fast, high-volume, or tightly scoped GPT-5.6 work. | `high`; try `xhigh` for scoped hard work | value |
| `claude-fable-5` | Long-running, highly ambitious work that earns frontier spend. | `medium`; raise only when the horizon earns it | frontier |
| `claude-opus-4-8` | Complex implementation, planning, or independent review. | `high` | premium |
| `claude-sonnet-5` | Scaled daily agentic coding and execution. | `medium` | balanced |
| `grok-4.5` | Coding and agentic work when Grok is an available independent family. | `high`; Cursor's former `xhigh` slug was renamed `high` | value frontier |

## Value and open-weight families

| Model | Selection hint | Start hint | Cost shape |
|---|---|---|---|
| `glm-5.2` | Long-horizon coding and reasoning with an open-weight route. | route default | premium open |
| `kimi-k2.7-code` | Coding-focused long-horizon execution with lower thinking-token use than K2.6. | forced thinking on official API | premium open |
| `deepseek-v4-pro` | Larger changes when direct-API cost/performance matters. | thinking for ambiguous work | pro value |
| `minimax-m3` | Long-context, multimodal, or general agentic coding. | thinking on for complex work | mid |
| `deepseek-v4-flash` | Fast iteration, mechanical work, and cheap retries. | non-thinking; enable thinking after a failed pass | cheap |

## Sources

- [OpenAI model catalog](https://developers.openai.com/api/docs/models)
- [Anthropic Fable 5](https://www.anthropic.com/claude/fable), [Opus 4.8](https://www.anthropic.com/news/claude-opus-4-8), and [Sonnet 5](https://www.anthropic.com/news/claude-sonnet-5)
- [xAI Grok 4.5](https://docs.x.ai/developers/grok-4-5)
- [Cursor Grok 4.5 slug rename](https://forum.cursor.com/t/cursor-grok-4-5-high-fast-doesnt-offer-a-50-discount-at-all/165551/8)
- [Z.ai GLM-5.2](https://z.ai/blog/glm-5.2)
- [Moonshot Kimi K2.7 Code model card](https://huggingface.co/moonshotai/Kimi-K2.7-Code)
- [DeepSeek V4](https://api-docs.deepseek.com/news/news260424/)
- [MiniMax M3](https://www.minimax.io/blog/minimax-m3)

These are starting hints, not rankings. Early field reports often favor Luna `xhigh` over Terra `high`, but results vary by task and quota accounting; test complete model-effort profiles locally. Distinguish API marginal cost from subscription quota pressure when comparing routes.
