## Design Handoff

Problem: Maintainers cannot tell which semantic replay cases lack primary-host evidence.
User-visible outcome: The verifier reports missing evidence before a planning skill is landed.
Chosen direction: Add a read-only coverage summary to verifier output.
Why this direction: It keeps the replay schemas authoritative and adds no tracker state.
Important alternatives rejected: A hosted dashboard adds unnecessary infrastructure; tracker labels duplicate replay evidence.
Constraints and compatibility requirements: Preserve the zero-dependency verifier and current JSON schemas; do not publish or mutate tracker items.
Unresolved human decisions: None.
Recommended next step: feature-spec.
Why: The direction is settled and needs observable acceptance criteria and verification intent.
