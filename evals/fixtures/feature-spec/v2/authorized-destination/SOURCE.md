# Settled source

Title: Replay coverage summary

Problem: Maintainers cannot tell which semantic replay cases lack primary-host evidence.
User-visible outcome: The verifier reports missing evidence before a planning skill is landed.
Chosen approach: Add a read-only coverage summary to verifier output.
Why this approach: It keeps the replay schemas authoritative and adds no tracker state.
Important rejected alternatives: A hosted dashboard adds unnecessary infrastructure; tracker labels duplicate replay evidence.
Scope: A read-only summary of which replay cases lack primary-host evidence, printed by the existing verifier.
Non-goals: A hosted dashboard, tracker labels, schema changes, and publishing tracker items.
Constraints: Preserve the zero-dependency verifier and current JSON schemas; do not publish or mutate tracker items.
Acceptance criteria:
- The verifier names every replay case that lacks primary-host evidence.
- The summary is read-only and does not change case or result files.
Verification strategy: Run the verifier on a fixture set with one missing evidence file and confirm the missing case is named; run it on a complete set and confirm the summary reports none missing.
Architecture-level decisions: Keep the summary inside the existing verifier process; do not introduce a new persistence store.
Unresolved human decisions: None.
This is one settled unit. Current-session execution is sufficient. Shared checkout is safe. Orchestrator verification of the verifier output is enough.
