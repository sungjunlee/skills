# Routing guide

Choose the least expensive execution profile likely to finish correctly. Judge task scope, ambiguity, blast radius, feedback strength, privacy, latency, and retry cost — not difficulty alone.

| Work shape | Start with | Escalate when |
|---|---|---|
| Search, explanation, or bounded reconnaissance | fast/value model at default or low effort | evidence conflicts or broad repo synthesis is required |
| Mechanical change with strong tests | fast/value model at medium effort | validation fails after one focused retry |
| Normal feature or bug fix | balanced model at medium effort | requirements are ambiguous, the change crosses boundaries, or retries repeat |
| Architecture, migration, auth, payments, or other high-blast-radius work | strong balanced or frontier model at medium/high effort | unresolved tradeoffs or verification gaps remain |
| Independent review | a different model family at medium/high effort | the reviewer finds systemic risk or cannot trace the changed behavior |
| Failed delegation | diagnose the failure, then raise one axis: effort or model tier | do not jump to max without identifying why the prior profile failed |

## Effort rules

- When recommending, choose a complete model-effort profile from `model-catalog.md`; otherwise omit effort to preserve the provider default.
- Do not assume model tiers form a cost/performance ladder. A smaller model at high effort can dominate a middle tier, while another task may reverse the result.
- Use `xhigh` or `max` only when the model-specific start hint supports it or the task is high-blast-radius, ambiguous, long-horizon, or still failing without a cheaper feedback loop.
- Do not map product-level multi-agent modes such as `ultra` to an effort value unless the selected CLI exposes a verified invocation contract.
- Prefer tests, type checks, linters, and a different-family reviewer over repeatedly increasing effort on the same model.

## Cost and evidence

- Compare expected completion cost, including retries and review, rather than token price alone.
- Apply privacy, data-residency, and provider-policy constraints before comparing cost.
- Separate API marginal pricing from subscription quota consumption and rate limits.
- Treat vendor benchmarks as capability signals and community reports as hypotheses. Promote a route to a default only after it works on representative local tasks.
