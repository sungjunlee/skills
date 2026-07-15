# Model catalog

Frontier rows become stale after 14 days; other rows after 30 days. Re-check the selected provider before dispatch because access, aliases, effort support, quotas, and prices can differ by route.

Use only when the user asks for a recommendation or gives a fuzzy model name. Prefer live provider model lists when available. Provider prefixes vary, so adapt the slug to the selected route format.

## Frontier families

| Model | Selection hint | Effort surface | Cost shape | Checked |
|---|---|---|---|---|
| `gpt-5.6-sol` | Highest-stakes or hardest GPT-5.6 work. | `none` through `max` | flagship | 2026-07-15 |
| `gpt-5.6-terra` | Balanced GPT-5.6 tier for ambiguous everyday work. | `none` through `max` | balanced | 2026-07-15 |
| `gpt-5.6-luna` | Fast, high-volume, or tightly scoped GPT-5.6 work. | `none` through `max` | value | 2026-07-15 |
| `claude-fable-5` | Long-running, highly ambitious work that earns frontier spend. | CLI `low` through `max` | frontier | 2026-07-15 |
| `claude-opus-4-8` | Complex implementation, planning, or independent review. | CLI `low` through `max` | premium | 2026-07-15 |
| `claude-sonnet-5` | Scaled daily agentic coding and execution. | CLI `low` through `max` | balanced | 2026-07-15 |
| `grok-4.5` | Coding and agentic work when Grok is an available independent family. | `low`, `medium`, `high` | value frontier | 2026-07-15 |

## Value and open-weight families

| Model | Selection hint | Thinking surface | Cost shape | Checked |
|---|---|---|---|---|
| `glm-5.2` | Long-horizon coding and reasoning with an open-weight route. | route-specific | premium open | 2026-07-15 |
| `kimi-k2.7-code` | Coding-focused long-horizon execution with lower thinking-token use than K2.6. | forced thinking on official API | premium open | 2026-07-15 |
| `deepseek-v4-pro` | Larger changes when direct-API cost/performance matters. | thinking or non-thinking | pro value | 2026-07-15 |
| `minimax-m3` | Long-context, multimodal, or general agentic coding. | thinking on/off | mid | 2026-07-15 |
| `deepseek-v4-flash` | Fast iteration, mechanical work, and cheap retries. | thinking or non-thinking | cheap | 2026-07-15 |

## Sources

- [OpenAI model catalog](https://developers.openai.com/api/docs/models)
- [Anthropic Fable 5](https://www.anthropic.com/claude/fable), [Opus 4.8](https://www.anthropic.com/news/claude-opus-4-8), and [Sonnet 5](https://www.anthropic.com/news/claude-sonnet-5)
- [xAI Grok 4.5](https://docs.x.ai/developers/grok-4-5)
- [Z.ai GLM-5.2](https://z.ai/blog/glm-5.2)
- [Moonshot Kimi K2.7 Code model card](https://huggingface.co/moonshotai/Kimi-K2.7-Code)
- [DeepSeek V4](https://api-docs.deepseek.com/news/news260424/)
- [MiniMax M3](https://www.minimax.io/blog/minimax-m3)

These are starting hints, not rankings. Vendor evaluations and early community reports do not replace a task-local check. Distinguish API marginal cost from subscription quota pressure when comparing routes.
