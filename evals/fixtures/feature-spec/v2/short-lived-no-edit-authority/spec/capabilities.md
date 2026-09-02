# phrasing-fixture Capabilities

## Capability: replay-evidence

**Goal:** Verifier messages stay accurate without a new persistence store.

### Hard Constraints

- Evidence files are append-only.
- The verifier remains a zero-dependency local process.
