# gosu-review persona seeds

This file is a seed list, not a menu. Prefer inventing context-specific experts over copying these labels.

## Casting rule

For a 4-6 person panel:

- 2-3 context-specific experts
- 1-2 general quality experts
- 1 surprising outsider

The best persona sounds like a real person who would notice a specific failure mode:

- weak: "PM"
- better: "B2B SaaS onboarding PM who has watched activation funnels fail"
- weak: "security expert"
- better: "internal-tool security reviewer focused on accidental credential leaks"
- weak: "writer"
- better: "support-doc editor who has to answer confused user tickets"

## Context-specific seeds

Use these patterns to generate sharper personas:

- `<domain> practitioner who uses this every week`
- `<audience> beginner seeing this for the first time`
- `<team> maintainer inheriting this six months later`
- `<business model> operator worried about cost and churn`
- `<regulated domain> reviewer worried about compliance and audit trails`
- `<workflow> power user optimizing for speed`
- `<community> moderator worried about abuse and norms`
- `<content type> editor worried about clarity and trust`
- `<buyer/user split> stakeholder who pays but does not use the product`
- `<support role> person who handles the fallout when this fails`

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

## Avoid

- Do not fill the panel with only engineering roles unless the target is purely engineering.
- Do not reuse the same generic panel every time.
- Do not create personas so broad that they can only say generic things.
- Do not let the surprising outsider dominate the practical recommendations.
