# Settled source

Title: Verifier missing-evidence phrasing

Problem: When a replay case lacks primary-host evidence, the verifier prints a sentence that maintainers misread as a host outage.
User-visible outcome: The missing-evidence sentence names the case and says evidence is absent, not that a host failed.
Chosen approach: Change the existing missing-evidence sentence in the verifier summary.
Why this approach: The wording is the whole defect; no new storage or schema is required.
Important rejected alternatives: Adding a dashboard status page; attaching host health checks to the same line.
Scope: The missing-evidence sentence in the existing verifier summary.
Non-goals: New evidence files, schema changes, and tracker publication.
Constraints: Preserve the zero-dependency verifier and current JSON schemas.
Acceptance criteria:
- The missing-evidence sentence names the case that lacks primary-host evidence.
- The sentence does not claim that a host failed.
Verification strategy: Run the verifier on a fixture set with one missing evidence file and read the printed sentence.
Architecture-level decisions: Keep the sentence inside the existing summary printer.
Unresolved human decisions: None.
This is one settled, short-lived unit. Current-session execution is sufficient. Shared checkout is safe. Orchestrator verification of the printed sentence is enough.
