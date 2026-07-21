# Project Context

## Architecture Decisions

- GitHub Issues are the current task source of truth; `backlog/` is the explicit execution layer.
- Core skill semantics and artifacts are engine-agnostic. Host-specific invocation metadata and capability mappings stay in skill-local references or adapters.
- CraftKit owns durable project contracts, dev-backlog owns task and sprint state, dev-relay owns durable isolated execution, and `delegate` is only a one-shot executor transport.
- A successor capability must be observed before it is recommended as available. Missing `dev-backlog shape` support produces a tracker-neutral handoff with `shape unavailable`, never an implicit tracker mutation.
- Replay document kind is inferred from containment under recursive `evals/cases/` and `evals/results/` trees; consumer files may use skill-local subdirectories and free filenames.
- In parallel relay batches with shared README/eval surfaces, complete review fixes before rebasing the remaining branch onto the first merged PR. A later re-dispatch can restore the canonical remote branch and supersede an early local rebase.
- `implement` must remain materially lighter than relay: no durable manifest, worktree lifecycle, crash recovery, PR/MR lifecycle, tracker mutation, push, or implicit relay invocation.
- In `implement`, engines describe only current-session execution: `none`, `inline`, `serial_workers`, or `bounded_parallel`. Relay escalation uses `status: escalated` with `handoff.route: relay`, stops before the first unsafe mutation, and keeps `engine` reporting what this session actually ran (`none` when nothing ran).
- Single source of truth is scoped per skill: each skill is an independent distribution unit (installed without `docs/` or `evals/`), so a rule may repeat across skills but must appear only once within a skill, and `SKILL.md` must never point outside its own directory.

## Conventions

- Keep each `SKILL.md` short and self-contained; optional detail belongs under that skill's `references/` directory.
- Do not create a repository-root `references/` directory.
- Do not commit `.agents/` or `skills-lock.json`.
- Preserve compact replay evidence only; never commit raw transcripts, secrets, or machine-specific absolute paths.
