# gosu-review persona seeds

This file is a seed list, not a menu. Prefer inventing context-specific experts over copying these labels. The casting rule (2-3 specialized + 1-2 quality + 1 adversarial) lives in the SKILL.md Cast section.

## What "gosu" means

A gosu persona is not a job title. It is a specific practitioner with **scars** — past incidents, near-misses, or repeated patterns that shaped how they think. The scar is what makes them sharp; without it, the persona catches nothing.

- **label**: "PM" — anyone with the title
- **role**: "B2B SaaS onboarding PM" — a class of practitioners
- **gosu**: "B2B SaaS PM who shipped three onboarding rewrites, watched activation keep dropping in steps 2-4, and now reviews every flow against the 'first-time user without help' test" — a specific person with a scar

- **label**: "security expert"
- **role**: "internal-tool security reviewer"
- **gosu**: "security reviewer who has been paged at 3am for a leaked API key in a config file, learned to scan for env-var sprawl and unrotated tokens, and now treats every config file as a potential incident waiting to happen"

- **label**: "writer"
- **role**: "support-doc editor"
- **gosu**: "support-doc editor who has answered the same 200+ tickets about the same misfeature, knows the docs describe what we wish users did, and now reads every doc for 'is this what users actually do'"

A gosu persona names a scar, names what they look for now, and speaks in domain language. A label catches nothing. If you cannot point to a specific past failure that shaped this persona, it is not yet a gosu — go back to the target and find what failure mode matters here.

## Attributes

For each panelist, define:

- **Lens**: what they optimize for
- **Bias**: what they distrust, usually from a specific past failure
- **Blind spot**: what this persona is uniquely likely to catch

## Context-specific seeds

Use these patterns to generate sharper personas:

- `<domain> practitioner who has been bitten by <specific failure>`
- `<audience> first-time user who hit <specific friction> and abandoned`
- `<team> maintainer who inherited <specific kind of mess> six months later`
- `<business model> operator who watched cost or churn spike because of <specific cause>`
- `<regulated domain> reviewer worried about <specific compliance gap> in <specific context>`
- `<workflow> power user who broke <specific bottleneck> by <specific workaround>`
- `<community> moderator who has seen <specific abuse pattern> and how it spread`
- `<content type> editor who has answered <specific question> 200+ times because the doc was wrong`
- `<buyer/user split> stakeholder who pays but has seen <specific failure> cost real money`
- `<support role> person who handles the fallout when <specific failure> hits production`

## General quality seeds

Use sparingly, when the target needs fundamentals:

- Architect: structure, responsibility, boundaries
- Implementation expert: edge cases, errors, maintainability
- QA expert: observable behavior, regressions, failure cases
- Security expert: trust boundaries, inputs, secrets, abuse
- Ops/SRE expert: cost, runtime failure, repeated execution
- Prompt/skill expert: trigger fit, instruction clarity, portability
- Product skeptic: scope, user value, simpler alternatives
- UX/copy expert: comprehension, next action, tone

## Outsider seeds

Add one when it could reveal a blind spot:

- New teammate trying to onboard
- Customer support person reading the output after a failure
- Finance person asking what repeated use costs
- Legal/compliance person asking what must be recorded
- Accessibility reviewer
- Non-technical stakeholder who only sees the final artifact
- Competitor or critic looking for the weak point

## Adversarial seeds

Use when the review should find failures a normal reviewer would miss:

- Red-team reviewer trying to make the artifact fail in public
- Skeptical buyer looking for the reason not to adopt
- Abuse-minded operator looking for incentives and misuse paths
- Future maintainer looking for the hidden cost six months later
- Incident reviewer asking what would make this embarrassing in hindsight

## Avoid

- Do not fill the panel with only engineering roles unless the target is purely engineering.
- Do not reuse the same generic panel every time.
- Do not create personas so broad that they can only say generic things.
- Do not let the surprising outsider dominate the practical recommendations.
- Do not make the adversarial reviewer theatrical. They need evidence and a fix path.
- Do not ship a persona without a scar — a scar is what makes a gosu different from a label.
