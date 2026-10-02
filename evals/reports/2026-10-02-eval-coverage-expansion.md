# Eval Coverage Expansion — 2026-10-02

## Summary

Expanded eval/fixture coverage with new replay and delegate eval cases, strengthened verify-script contract validation, and added comprehensive invalid fixture coverage. All changes run in CI without host-native observation requirements.

## Changes Made

### New Replay Cases

#### Delegate Skill (productivity/delegate)
- **explicit-route-dispatch**: Tests explicit route + effort parsing and CLI dispatch
- **route-lookup-fallback**: Tests home-route lookup and fallback to operator routing notes
- **timeout-enforced**: Tests 30-minute hard deadline enforcement and timeout reporting

#### Brainstorming Skill (planning/brainstorming)
- **widen-before-narrow**: Tests divergent option generation, attack phase, and question-asking
- **read-only-guarantee**: Tests full convergence workflow while maintaining read-only contract

### New Delegate Eval Fixtures

#### Valid Fixtures
- **timeout-handling**: Analysis-only fixture testing delegate timeout mechanism explanation
  - Work shape: `high_blast_radius_analysis`
  - Profiles: sol-low vs terra-low
  - Validates comprehension without repository mutation

#### Invalid Fixtures
- **missing-pairing-rationale**: Case without required pairing_rationale field
- **private-without-approved-routes**: Private fixture with empty approved_routes (contract violation)

### New Replay Fixtures

#### Valid Fixtures
- **delegate-route-lookup**: Full dispatch contract example with fake CLI observation
- **brainstorming-widen**: Widen-phase contract with questions and read-only guarantee

#### Invalid Fixtures
- **duplicate-assertion-ids**: Case with duplicate assertion_id values
- **file-fixture-absolute-path**: File fixture using absolute path (security contract)
- **file-fixture-upward-traversal**: File fixture with `..` traversal (security contract)
- **question-range-inverted**: question_count_range with min > max (range inversion)
- **dispatch-success-without-output**: Dispatch contract with success outcome but null output
- **unverified-with-observed-value**: Unverified result with non-null observed field (invalid state)

## Verify Script Strengthening

### replay-contract validation (verify-replays-contract.mjs)
- Added assertion_id whitespace check
- Added assertion_id non-empty validation
- Added dispatch_contract field validation:
  - deadline_seconds positivity check
  - expected_model non-empty check
  - expected_prompt non-empty check
- Added round_two_contract validation:
  - allowed_routes non-empty check
  - required_side_count must be 2
  - max_extra_rounds must be 0
- Added skill path validation (relative, no upward traversal)

### delegate-eval validation (verify-delegate-evals.mjs)
- Added pairing_rationale non-empty check
- Added acceptance_checks non-empty validation
- Added check_id non-empty validation
- Added check kind enum validation (command|rubric)
- Added candidate_profiles non-empty check
- Added profile_id and model non-empty validation

## Coverage Metrics

### Before
- Valid replay fixtures: 17
- Invalid replay fixtures: 10
- Valid delegate fixtures: 2
- Invalid delegate fixtures: 3
- Committed replay docs: 42
- Committed delegate docs: 37

### After
- Valid replay fixtures: **21** (+4)
- Invalid replay fixtures: **15** (+5)
- Valid delegate fixtures: **4** (+2)
- Invalid delegate fixtures: **5** (+2)
- Committed replay docs: **47** (+5)
- Committed delegate docs: **37** (unchanged; fixtures only)

## Verification Status

All tests pass:
```
npm test
✓ verify-skills: 3 skills
✓ verify-replays: 21 valid, 15 invalid, 47 committed
✓ verify-delegate-evals: 4 valid, 5 invalid, 37 committed
✓ verify-fixture-generators: 4 generators
```

## Evidence Quality Notes

- All new fixtures use synthetic scenarios; no live host observation required
- Dispatch contract fixtures use fake_cli_revision marker
- Invalid fixtures test contract boundaries that can be verified statically
- Security contracts (path traversal, absolute paths) now have explicit invalid cases
- Range inversion and duplicate-ID detection now covered

## Alignment with EDD / Agent Control-Plane

- Dispatch observation contract aligned with fake-CLI replay pattern
- Read-only guarantees explicitly tested for brainstorming skill
- Timeout enforcement contract now has explicit case coverage
- Route lookup and fallback logic covered with dispatch contracts

## Future Work (Stubbed)

Items deferred as requiring live host-native observation (issue #72 style):
- Real host dispatch observation for delegate skill (requires credentialed CLI)
- Brainstorming subagent dispatch depth measurement (requires native tool)
- gosu-review cross-examination tension derivation (host-observed traces)

Note: Stub entries left in case structure where host observation would go; marked with `"host": "fixture-host"` placeholder.
