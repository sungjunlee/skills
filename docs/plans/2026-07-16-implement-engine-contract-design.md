# Implement engine contract redesign

## Goal

Make `implement` execution engines represent only execution performed by the
current session. Relay escalation remains a handoff outcome, not an engine.

## Contract

- Current engine values are `none`, `inline`, `serial_workers`, and
  `bounded_parallel`.
- `engine: none` means no current-session execution occurred. It is valid for
  both pre-edit blocking and relay escalation.
- Relay escalation is identified by `status: escalated` and
  `handoff.route: relay`; no engine value carries relay semantics.
- The final YAML keeps the `engine` field so consumers retain one stable output
  shape.

## Replay evidence

Historical replay documents are immutable evidence of the contract observed at
their recorded revision. They must remain byte-for-byte unchanged and continue
to validate against a frozen legacy contract.

The active replay cases and schemas adopt the new engine contract. Fresh dated
Claude Code and Codex results cover both escalation scenarios and supersede the
legacy evidence without rewriting it. Verification must distinguish legacy and
current contracts explicitly instead of inferring a contract from observed
output values.

## Verification

- `npm test` validates current and frozen legacy replay evidence.
- `node scripts/verify-cross-host-matrix.mjs` continues to validate the frozen
  historical matrix.
- `node scripts/verify-cross-host-matrix.mjs --selftest` validates its negative
  checks.
- Cross-host report comparison normalizes line endings so the verifier behaves
  identically on Windows and Unix checkouts.

## Scope boundaries

- Do not rewrite historical result JSON or raw transcripts.
- Do not change routing thresholds, side-effect rules, or relay invocation
  authority.
- Do not merge the resulting pull request automatically.
