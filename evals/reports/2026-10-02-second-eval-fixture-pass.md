# Second Eval/Fixture Expansion Pass

**Date:** 2026-10-02  
**Follows:** PR #153 (first expansion pass)

This report documents the second eval/fixture expansion pass, adding more replay/delegate cases and strengthening verify scripts further while maintaining green npm test status.

## Summary

This pass adds 17 new fixtures (11 replay, 6 delegate) and strengthens verify scripts with additional validation checks. All changes run without host-native observation requirements.

## Coverage Changes

| Metric | Before (#153) | After | Change |
|--------|---------------|-------|--------|
| Valid replay fixtures | 17 | **23** | +6 |
| Invalid replay fixtures | 10 | **17** | +7 |
| Valid delegate fixtures | 2 | **4** | +2 |
| Invalid delegate fixtures | 3 | **6** | +3 |
| Committed replay docs | 42 | 42 | — |
| Committed delegate docs | 37 | 37 | — |

## New Replay Fixtures

### Valid Fixtures (+6)

**`case.starved-control-seats.json` + `result.starved-control-seats.json`**
- Tests `starved_seat_zero_finding_count_range` and `control_seat_anchored_finding_count_range`
- Validates gosu-review depth counters for panel quality metrics
- Coverage: Starved seat and control seat tracking

**`case.delegate-route-fallback.json` + `result.delegate-route-fallback.json`**
- Tests multi-provider home-route fallback logic
- Validates ambiguous model routing with operator notes
- Coverage: Delegate routing fallback mechanism

**`case.brainstorming-read-only.json` + `result.brainstorming-read-only.json`**
- Tests brainstorming skill full workflow
- Validates read-only contract with widen-attack-converge pattern
- Coverage: Serial workers engine, divergent thinking, read-only guarantee

### Invalid Fixtures (+7)

**`case.assertion-id-with-whitespace.json`**
- Tests assertion_id whitespace validation
- Caught by: New whitespace check in verify-replays-contract.mjs

**`case.assertion-id-empty.json`**
- Tests empty assertion_id rejection
- Caught by: New non-empty check in verify-replays-contract.mjs

**`case.zero-finding-range-inverted.json`**
- Tests inverted zero_finding_panelist_count_range (min > max)
- Caught by: Existing range validation (already covered, adds explicit test)

**`case.dispatch-missing-deadline.json`**
- Tests dispatch_contract without required deadline_seconds
- Caught by: New deadline_seconds validation in verify-replays-contract.mjs

**`case.round-two-invalid-side-count.json`**
- Tests round_two_contract with invalid required_side_count (must be exactly 2)
- Caught by: New round_two_contract validation in verify-replays-contract.mjs

**`case.observed-fields-mismatch.json` + `result.observed-fields-mismatch.json`**
- Tests inconsistency between assertion results and observed_output_fields
- Caught by: New pair validation in verify-replays-pair.mjs

## New Delegate Eval Fixtures

### Valid Fixtures (+2)

**`case.cross-component-invariants.json` + `result.cross-component-invariants.json`**
- Tests `cross_component_invariants` work shape
- Validates multi-component state consistency requirements
- Coverage: High-effort coordination scenarios

### Invalid Fixtures (+3)

**`case.empty-pairing-rationale.json`**
- Tests empty pairing_rationale rejection
- Caught by: New non-empty check in verify-delegate-evals.mjs

**`case.empty-acceptance-checks.json`**
- Tests empty acceptance_checks array rejection (already caught by schema minItems)
- Explicit test case for documentation

**`case.check-id-uppercase.json`**
- Tests check_id pattern validation (must be lowercase kebab-case)
- Caught by: New pattern check in verify-delegate-evals.mjs

## Verify Script Enhancements

### `verify-replays-contract.mjs`

**Assertion ID validation:**
- Non-empty assertion_id check
- Leading/trailing whitespace check
- Internal whitespace check

**Dispatch contract validation:**
- deadline_seconds positive integer check
- expected_model non-empty check
- expected_prompt non-empty check

**Round-two contract validation:**
- allowed_routes non-empty check
- required_side_count exactly 2 check
- max_extra_rounds exactly 0 check

### `verify-delegate-evals.mjs`

**Case contract validation:**
- pairing_rationale non-empty check
- acceptance_checks non-empty check (explicit, schema already enforces)
- check_id non-empty and pattern validation
- check spec non-empty validation
- check kind enum validation (command|rubric)
- profile_id non-empty and pattern validation
- profile model non-empty validation
- profile effort enum validation

### `verify-replays-pair.mjs`

**Output field consistency validation:**
- Checks that observed_output_fields contains all fields from passed output_field_present assertions
- Catches inconsistencies between assertion results and observed state

### `verify-replays-loader.mjs`

**Invalid fixture validation:**
- Enhanced to check both individual errors and pair validation errors
- Invalid fixtures now fail if they pass both schema/contract AND pair validation

## Test Status

```
npm test
✓ verify-skills: 3 skills
✓ verify-replays: 23 valid, 17 invalid, 42 committed
✓ verify-delegate-evals: 4 valid, 6 invalid, 37 committed
✓ verify-fixture-generators: 4 generators
```

All tests pass. No host-native observation required.

## Alignment with Requirements

✅ **More replay/delegate cases:** Added 17 new fixtures across both categories  
✅ **Strengthen verify scripts:** Added 15+ new validation checks  
✅ **Keep npm test green:** All tests pass  
✅ **No host-native observation:** All fixtures are synthetic or observation-free  

## Future Work

Consider adding:
- More work_shape coverage for delegate evals (currently covers 2 of 6 shapes in fixtures)
- Invalid fixtures for result-side schema violations beyond pair mismatches
- Explicit coverage for all side_effect enum values
- More engine coverage (serial_workers and bounded_parallel paths)
- Round-two contract fixtures with different allowed_routes combinations

## Files Changed

**Added replay fixtures:**
- `evals/fixtures/valid/case.starved-control-seats.json`
- `evals/fixtures/valid/result.starved-control-seats.json`
- `evals/fixtures/valid/case.delegate-route-fallback.json`
- `evals/fixtures/valid/result.delegate-route-fallback.json`
- `evals/fixtures/valid/case.brainstorming-read-only.json`
- `evals/fixtures/valid/result.brainstorming-read-only.json`
- `evals/fixtures/invalid/case.assertion-id-with-whitespace.json`
- `evals/fixtures/invalid/case.assertion-id-empty.json`
- `evals/fixtures/invalid/case.zero-finding-range-inverted.json`
- `evals/fixtures/invalid/case.dispatch-missing-deadline.json`
- `evals/fixtures/invalid/case.round-two-invalid-side-count.json`
- `evals/fixtures/invalid/case.observed-fields-mismatch.json`
- `evals/fixtures/invalid/result.observed-fields-mismatch.json`

**Added delegate eval fixtures:**
- `evals/delegate/fixtures/valid/case.cross-component-invariants.json`
- `evals/delegate/fixtures/valid/result.cross-component-invariants.json`
- `evals/delegate/fixtures/invalid/case.empty-pairing-rationale.json`
- `evals/delegate/fixtures/invalid/case.empty-acceptance-checks.json`
- `evals/delegate/fixtures/invalid/case.check-id-uppercase.json`

**Modified verify scripts:**
- `scripts/verify-replays-contract.mjs`
- `scripts/verify-delegate-evals.mjs`
- `scripts/verify-replays-pair.mjs`
- `scripts/verify-replays-loader.mjs`
