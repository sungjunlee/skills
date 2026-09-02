# token-fixture Capabilities

## Capability: secret-storage

**Goal:** Secrets used by this CLI stay out of the repository.

### Expected Behaviors

- Local commands load API tokens at runtime from the managed secret store.
- Repository configuration describes command flags and non-secret defaults only.

### Hard Constraints

- API tokens must remain in the managed secret store.
- Repository configuration files must not contain API tokens.
