# Routing guide

Choose the least expensive execution profile likely to finish correctly. Judge task scope, ambiguity, blast radius, feedback strength, privacy, latency, and retry cost — not difficulty alone.

| Work shape | Initial profile | Choose more capability up front when |
|---|---|---|
| Search, explanation, or bounded reconnaissance | fast/value model at default or low effort | evidence is likely to conflict or broad repo synthesis is required |
| Mechanical change with strong tests | fast/value model at medium effort | tests are incomplete, feedback is weak, or a wrong first pass is costly |
| Normal feature or bug fix | balanced model at medium effort | requirements are ambiguous, the change crosses boundaries, or retry cost is high |
| Architecture, migration, auth, payments, or other high-blast-radius work | strong balanced or frontier model at medium/high effort | feedback is weak, the horizon is long, or unresolved tradeoffs require broad exploration |
| Independent review | a different model family at medium/high effort | systemic risk is plausible or tracing the changed behavior requires deep context |

## Effort rules

- When recommending, choose a complete model-effort profile from `model-catalog.md`. Outside that path, honor an explicit user effort; if neither path selects one, preserve the provider default.
- Choose effort before dispatch from first-pass failure cost, feedback strength, work horizon, and the value of internal exploration; do not require a failed run before selecting `high` or `xhigh`.
- Do not assume model tiers form a cost/performance ladder. A smaller model at high effort can dominate a middle tier, while another task may reverse the result.
- Consider `xhigh` or `max` only when the selected route and model support that exact level, then only for high-blast-radius, ambiguous, or long-horizon work without a cheaper feedback loop.
- After a failed delegation, diagnose the profile mismatch and change one axis: effort or model tier. Failure is corrective evidence, not the routing strategy.
- Do not map product-level multi-agent modes such as `ultra` to an effort value unless the selected CLI exposes a verified invocation contract.
- Prefer tests, type checks, linters, and a different-family reviewer over repeatedly increasing effort on the same model.

## Cost and evidence

- Compare expected completion cost, including retries and review, rather than token price alone.
- Apply privacy, data-residency, and provider-policy constraints before comparing cost.
- Separate API marginal pricing from subscription quota consumption and rate limits.
- Treat vendor benchmarks as capability signals and community reports as hypotheses. Promote a route to a default only after it works on representative local tasks.
