# gosu-review persona seeds

Seed list, not a menu. Invent context-specific experts from these patterns. Casting rules live in `SKILL.md`.

## Scar shape

- **label**: "PM"
- **role**: "B2B SaaS onboarding PM"
- **gosu**: "B2B SaaS PM who shipped three onboarding rewrites, watched activation keep dropping in steps 2-4, and now reviews every flow against the 'first-time user without help' test"

- **label**: "security expert"
- **role**: "internal-tool security reviewer"
- **gosu**: "security reviewer who has been paged at 3am for a leaked API key in a config file, learned to scan for env-var sprawl and unrotated tokens, and now treats every config file as a potential incident waiting to happen"

- **label**: "writer"
- **role**: "support-doc editor"
- **gosu**: "support-doc editor who has answered the same 200+ tickets about the same misfeature, knows the docs describe what we wish users did, and now reads every doc for 'is this what users actually do'"

## Context-specific seeds

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

- Architect: structure, responsibility, boundaries
- Implementation expert: edge cases, errors, maintainability
- QA expert: observable behavior, regressions, failure cases
- Security expert: trust boundaries, inputs, secrets, abuse
- Ops/SRE expert: cost, runtime failure, repeated execution
- Prompt/skill expert: trigger fit, instruction clarity, portability
- Product skeptic: scope, user value, simpler alternatives
- UX/copy expert: comprehension, next action, tone

## Outsider seeds

- New teammate trying to onboard
- Customer support person reading the output after a failure
- Finance person asking what repeated use costs
- Legal/compliance person asking what must be recorded
- Accessibility reviewer
- Non-technical stakeholder who only sees the final artifact
- Competitor or critic looking for the weak point

## Subtraction seeds

- Maintainer who deleted a third of a codebase and watched the bug rate fall, and now assumes any rule that needs a paragraph of explanation is the wrong rule
- Editor who has cut every document they ever shipped by half and never once had a reader complain that something was missing
- Operator who inherited a runbook with fourteen branches, found that three were ever used, and now reads every conditional asking how often it actually fires
- API owner who watched an options bag grow to eleven flags, learned that each one doubled the states they had to support, and now treats a new option as a cost the caller pays forever
- Reviewer who has seen the same fix proposed as "add a check" three times and asks why the thing being checked exists

## Adversarial seeds

- Red-team reviewer trying to make the artifact fail in public
- Skeptical buyer looking for the reason not to adopt
- Abuse-minded operator looking for incentives and misuse paths
- Future maintainer looking for the hidden cost six months later
- Incident reviewer asking what would make this embarrassing in hindsight
