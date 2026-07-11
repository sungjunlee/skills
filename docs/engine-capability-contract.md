# Engine capability contract

This document is maintainer guidance for portable skills. It defines the shared
vocabulary used in host mappings and replay evidence. It is not a runtime
dependency: every skill must remain understandable from its own `SKILL.md` and
skill-local references.

## Capability vocabulary

A host mapping records one of four evidence states for each capability:

- `native`: the host exposes the capability directly and the mapping has been
  observed.
- `emulated`: the same semantics have been observed through a documented
  adapter or composition of weaker primitives.
- `unavailable`: an observed host cannot provide the required semantics.
- `unverified`: there is no current observation. This is the default for an
  unknown host or version.

These values describe individual capabilities, not a global host ranking.
`native` is not automatically preferable to a correct `emulated` mapping, and
no host or capability is marked supported without dated replay evidence.

| Capability | Required semantics |
| --- | --- |
| `inline_repository_work` | Inspect and edit the repository in the current agent context. |
| `blocking_user_question` | Pause progress for a decision whose answer can change the result, then resume with that answer. |
| `fresh_worker_dispatch` | Start a worker with a deliberately bounded or fresh context and a concrete task. |
| `bounded_parallel_dispatch` | Run no more than an explicit number of independent workers concurrently. |
| `isolated_workspace` | Give a worker a checkout or workspace whose writes cannot collide with another worker's writes. |
| `worker_messaging_status` | Send follow-up information and collect authoritative worker lifecycle status and results. |
| `external_executor_transport` | Deliver a task to an executor outside the current host process and receive its result. |
| `durable_task_state` | Persist task identity, status, and recovery information across process or context loss. |
| `authoritative_verification` | Run the repository's declared checks and retain their exit status as verification evidence. |
| `commit_authority` | Create a local commit that records the verified repository change. |
| `publish_authority` | Push branches or create pull requests or equivalent remote changes. |

Commit authority does not imply publish authority. A host mapping should note
the narrower authority actually observed, including approval boundaries.

## Host mapping rules

Host-specific mappings belong in a consumer skill's `references/` directory.
Each entry identifies the host and version, maps only the capabilities the
skill uses, assigns one of the four states above, and links to compact observed
evidence when the state is `native`, `emulated`, or `unavailable`. Unobserved
behavior stays `unverified`.

Mappings describe how a provider-neutral workflow is executed; they do not
change its artifacts, status vocabulary, verification rules, or escalation
meaning. Do not infer one capability from another or promote a whole host to
"supported" from a partial observation.

## Predictable degradation

Implementation work degrades through this ordered ladder:

```text
isolated bounded parallel
  -> safe bounded parallel in a shared checkout
  -> serial worker
  -> inline
```

A consumer may skip any level that is unsafe for the task or host. In a shared
checkout, parallel work is safe only when write scopes are disjoint and the
coordinator can detect failures. If neither condition holds, use a serial
worker or inline execution.

Degradation changes execution mechanics only. It must not change artifact
schemas, worker statuses, the meaning of authoritative verification, or when a
blocking escalation occurs. Missing commit or publish authority yields the
same verified handoff with that action left to an authorized actor. Missing a
blocking-question capability yields the same escalation as a durable handoff;
it does not permit guessing through the blocker.

## Replay evidence

Replay cases and results use the schemas under `evals/schema/`. Cases state
semantic expectations; results store compact observations. The verifier checks
schema validity and the relationship between those observations and a closed
assertion vocabulary. It never compares exact prose and does not require raw
model transcripts.

Allowed semantic assertion types are:

- `output_field_present`
- `route_equals`
- `engine_equals`
- `question_count_in_range`
- `escalation_equals`
- `side_effect_absent`

Assertions are deliberately observable scalars derived from result fields.
Adding an assertion type requires a schema, verifier, and documentation change;
case files cannot introduce executable expressions or an evaluation DSL.

`pass` means every declared assertion passed. `fail` means at least one
declared assertion failed. `unverified` means the observation was not executed
or is not authoritative; it is not a pass. Evidence notes summarize how an
observation was collected and must not contain secrets, raw transcripts, or
machine-specific absolute paths.

This foundation contains schema smoke fixtures only. Consumer skills add their
own replay cases and compact results later. A complete cross-host replay matrix
is explicitly outside this foundation.
