# Project Context

## Architecture Decisions

- GitHub Issues are the current task source of truth; `backlog/` is the explicit execution layer.
- Core skill semantics and artifacts are engine-agnostic. Host-specific invocation metadata and capability mappings stay in skill-local references or adapters.
- CraftKit owns durable project contracts, dev-backlog owns task and sprint state, dev-relay owns durable isolated execution, and `delegate` is only a one-shot executor transport.
- A successor capability must be observed before it is recommended as available. Missing `dev-backlog shape` support produces a tracker-neutral handoff with `shape unavailable`, never an implicit tracker mutation.

## Conventions

- Keep each `SKILL.md` short and self-contained; optional detail belongs under that skill's `references/` directory.
- Do not create a repository-root `references/` directory.
- Do not commit `.agents/` or `skills-lock.json`.
- Preserve compact replay evidence only; never commit raw transcripts, secrets, or machine-specific absolute paths.
