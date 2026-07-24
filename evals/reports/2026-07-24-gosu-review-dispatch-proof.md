# gosu-review dispatch-proof observation

Issue #62 narrowed what the original
`gosu-review.clear-target-panel` evidence can claim. Its output-field and Meta
assertions prove the response shape, but an orchestrator that dispatched
nothing could fabricate those same fields and counts.

The new `gosu-review.clear-target-panel-host-dispatch` case keeps that shape
coverage and adds `host_subagent_dispatch_count_in_range`. The observer counts
host-native subagent tool-call events outside the final response; the model's
own Meta prose is never the source.

Two 2026-07-24 observations passed:

- Codex: four `collaboration.spawn_agent` calls and four distinct child threads
  in the persisted host session.
- Claude Code: five root `Agent` tool-use events, five task starts, and five
  task completion notifications in the host stream.

The other candidate predicates were not adopted. Content divergence is easy
for a single author to imitate. Planted persona-only knowledge needs a new
hidden fixture-injection channel, while host events already provide the
required non-self-reported signal.

This closes one claim only: a passing dispatch-count assertion proves that real
subagent dispatch events occurred. It does not prove that the voices were
independent, that the orchestrator used their returns verbatim, or that the
panel was diverse or high quality. The original 2026-07-23 results remain
untouched and retain their narrower shape and degradation-path meaning.
