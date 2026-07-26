# AGENTS.md

This repo is a small collection of portable agent skills. Each skill is self-contained under `skills/<category>/<skill-name>/`: a required `SKILL.md`, optional `references/`, and — for explicit-only skills — an `agents/<host>.yaml` adapter carrying invocation policy only, never `SKILL.md` semantics.

## Rules

- A `SKILL.md` opens with YAML frontmatter carrying `name`, matching its directory, and `description`. Without it the skill is not discoverable and no host will list or trigger it.
- A skill that must only run on an explicit call sets `disable-model-invocation: true` in that frontmatter, and its `agents/<host>.yaml` mirrors the same decision — for OpenAI hosts, `policy.allow_implicit_invocation: false`.
- Keep `SKILL.md` short. Material read only when a condition fires belongs in `references/`; material read on every invocation stays in `SKILL.md` even when that makes it longer.
- Reference material is never factored out of a skill — not to the repo root, not to `skills/`, not to a category directory — even when two skills would share content. A skill is installed on its own, so it must execute from files inside its own directory.
- When adding or removing a skill, update its `README.md` category entry, its `Source:` file list, and the Repo Layout example in the same change.
- Run `npm test` before landing. `scripts/verify-skills.mjs` checks the rules above that can be checked.
