# Model catalog

Last checked: 2026-07-26. Treat as stale after 30 days.

Use only when the user asks for a recommendation or gives a fuzzy model name. Prefer live provider model lists when available. These are bare family slugs, not routes: resolve the route first from the home-route table in `cli-invocations.md`, then adapt the slug to that route's id shape.

## Frontier families

| Model | Selection hint | Effort profile | Cost shape |
|---|---|---|---|
| `gpt-5.6-sol` | Highest-stakes or hardest GPT-5.6 work. | `medium` for bounded hard work with strong checks; `high` for high-blast-radius or cross-boundary work with consequential tradeoffs; `xhigh` for long-horizon work that benefits from broad exploration and self-checking | flagship |
| `gpt-5.6-terra` | Balanced GPT-5.6 tier for ambiguous everyday work. | `medium`; test before using `high`+ as a value step | balanced |
| `gpt-5.6-luna` | Fast, high-volume, or tightly scoped GPT-5.6 work. | `high`; try `xhigh` for scoped hard work | value |
| `claude-fable-5` | Long-running, highly ambitious work that earns frontier spend. | `high` by default; `xhigh` for the most capability-sensitive or long-running autonomous work; step down to `medium` only when cost or interactivity matters more than peak quality | frontier |
| `claude-opus-5` | Complex agentic coding, long-horizon execution, code review, vision-heavy implementation, or document work when Fable-tier spend is not justified. | `high` by default; `xhigh` for demanding coding and agentic work; reserve `max` for unconstrained frontier problems; re-sweep `low` and `medium` rather than inheriting an older Opus setting | premium |
| `claude-sonnet-5` | Scaled daily agentic coding and execution. | `medium` | balanced |
| `grok-4.5` | Tool-heavy coding, long-context knowledge work, or an independent frontier-family review. | `high` for difficult coding and multi-step agent loops; `medium` when latency matters more than maximum reasoning depth | value frontier |
| `kimi-k3` | Long-horizon coding, tool-heavy knowledge work, or multimodal implementation where completion quality matters more than latency. | route default; launch API uses `max` thinking, with `low` and `high` announced for later | frontier; high output-token and latency risk |

## Value and open-weight families

| Model | Selection hint | Effort profile | Cost shape |
|---|---|---|---|
| `glm-5.2` | Long-horizon coding and reasoning with an open-weight route. | route default | premium open |
| `kimi-k2.7-code` | Coding-focused long-horizon execution with lower thinking-token use than K2.6. | route default; official API forces thinking | premium open |
| `deepseek-v4-pro` | Larger changes when direct-API cost/performance matters. | `high` for ambiguous or multi-stage work; otherwise route default | pro value |
| `minimax-m3` | Long-context, multimodal, or general agentic coding. | `high` for complex agentic work; otherwise route default | mid |
| `deepseek-v4-flash` | Fast iteration, mechanical work, and cheap retries. | route default | cheap |

## Preview candidates

| Model | Selection hint | Effort profile | Cost shape |
|---|---|---|---|
| `qwen3.8-max-preview` | Evaluation candidate for complex reasoning and coding through Alibaba Token Plan; attractive while the temporary 10x credit promotion lasts, but keep a stable model as the control until independent results and a production release arrive. | route default; thinking is supported, but graded effort behavior is not documented | preview subscription |

## Promotion rule

A model-effort profile becomes a default recommendation for a work shape only
with repeated local evidence: at least two dated, all-checks-passing results
for that shape and profile in `evals/delegate/results/` from different
observation dates, with no unresolved contradicting result for the same
pairing. A single run, a community report, or a vendor ranking may at most
sharpen a hint's wording, never set a default.

Evidence-backed defaults (promoted 2026-07-23 from dated results on
2026-07-22 and 2026-07-23; see `evals/delegate/reports/`):

- **Ambiguous everyday feature/bugfix work → Terra `high`.** Matched Luna
  `xhigh` on quality both dates at lower latency and tokens; the community
  Luna-over-Terra claim did not survive local evidence. Luna `xhigh` also
  passed both dates and remains a valid alternative.
- **High-blast-radius analysis → Sol `high`.** Matched Sol `xhigh` on every
  rubric across three paired observations at consistently lower token cost;
  keep `xhigh` for runs where register depth is the deliverable.
- **Independent cross-family review → Fable `high`.** Three all-pass reports
  across two dates with zero incorrect claims. Grok `high` reviews were
  strong twice but produced one empty-output run, an unresolved reliability
  contradiction.
- **Mechanical work with strong tests: no default.** Both Grok profiles fell
  into a behavior-preserving trap at least once across three observations
  each; per-run variance dominates the medium-versus-high split there.

Claude Opus 5 is a candidate, not a promoted default. Its provider guidance
supports all five effort levels and recommends a fresh effort sweep instead of
carrying settings over from an earlier model. Existing Fable or other
Claude-family evidence does not satisfy the promotion rule for Opus 5.

## Demotion rule

A default is revoked as soon as one dated result fails an acceptance check
for that shape and profile. Promotion needs repetition because a single pass
can be luck; demotion needs only one failure because a default is a claim
that the profile reliably passes, and one counterexample disproves it.

- **Acceptance failure → demote.** The shape falls back to a runner-up only
  if that profile independently satisfies the promotion rule; otherwise the
  shape has no default until new evidence promotes one.
- **Dispatch-reliability failure → do not demote; record it.** These are the
  `dispatch_*` codes in `dispatch-guardrails.md`; record the code, not a prose
  paraphrase. These say something about the route on that day, not
  about the profile's judgment. They still block a *pending* promotion under
  the no-unresolved-contradiction clause, and a profile with repeated
  reliability failures should be described as unreliable in its hint even
  while it keeps a default earned on quality.
- **Staleness does not demote.** Old evidence stays valid until contradicted;
  the catalog's 30-day staleness note is about model availability and vendor
  facts, not about outcomes already observed locally.

Demotion changes catalog wording only. The failing result and every earlier
passing result stay exactly as committed — a revoked default must remain
traceable to the evidence that both created and ended it.

Applied retroactively on 2026-07-23: no current default is affected. The
failures on record (the Grok mechanical label-trap inversions and the one
Grok review empty-output run) belong to shapes and profiles that never held
a default.

## Sources

- [OpenAI model catalog](https://developers.openai.com/api/docs/models) and [GPT-5.6 effort guidance](https://openai.com/index/gpt-5-6/)
- [Anthropic effort guidance](https://platform.claude.com/docs/en/build-with-claude/effort), [Opus 5 changes](https://platform.claude.com/docs/en/about-claude/models/whats-new-opus-5), [Opus 5 migration guide](https://platform.claude.com/docs/en/about-claude/models/migration-guide), [Fable 5](https://www.anthropic.com/claude/fable), and [Sonnet 5](https://www.anthropic.com/news/claude-sonnet-5)
- [xAI Grok 4.5](https://docs.x.ai/developers/grok-4-5)
- [Z.ai GLM-5.2](https://z.ai/blog/glm-5.2)
- [Moonshot Kimi K3](https://www.kimi.com/blog/kimi-k3) and [Kimi K2.7 Code model card](https://huggingface.co/moonshotai/Kimi-K2.7-Code)
- [Qwen Cloud text-generation models](https://docs.qwencloud.com/developer-guides/getting-started/text-generation-models) and [Token Plan](https://docs.qwencloud.com/token-plan/overview)
- [DeepSeek API changelog](https://api-docs.deepseek.com/updates/)
- [MiniMax M3](https://www.minimax.io/blog/minimax-m3)

These are profile hints, not rankings. Choose the profile from the task before dispatch; do not treat effort levels as a retry staircase. Early field reports favored Luna `xhigh` over Terra `high`, but local dated evidence (2026-07-22/23) found Terra `high` matching Luna `xhigh` at lower cost on ambiguous work — test complete model-effort profiles locally rather than trusting rankings. Distinguish API marginal cost from subscription quota pressure when comparing routes.
