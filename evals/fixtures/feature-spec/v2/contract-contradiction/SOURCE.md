# Settled source

Title: Repository-local API tokens

Problem: Developers cannot run the CLI on a fresh checkout because API tokens live only in a secret store they cannot reach offline.
User-visible outcome: After clone, a developer can run authenticated CLI commands without a secret-store session.
Chosen approach: Store API tokens in repository configuration so local development does not need a secret manager.
Why this approach: A checked-in config file is the fastest way to make a fresh clone work offline.
Important rejected alternatives: Documenting a manual secret-store bootstrap; shipping a placeholder token that must be replaced.
Scope: Where API tokens are stored for local CLI use and how a fresh clone authenticates.
Non-goals: Changing production authentication or rotating existing tokens.
Constraints: Keep the current CLI flag surface.
Acceptance criteria:
- A fresh clone can authenticate using repository configuration alone.
- Developers do not need a secret-store session to run authenticated commands locally.
Verification strategy: Clone the repository into a clean directory without secret-store access and run an authenticated CLI command.
Architecture-level decisions: Keep tokens next to the other local CLI defaults in repository configuration.
Unresolved human decisions: None.
