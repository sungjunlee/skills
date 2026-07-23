# Delegate routing evaluation report — 2026-07-23 full shape coverage

Five runs dispatched 01:56–02:01 UTC close the last coverage gaps: with first
observations for `cross_component_invariants` and `long_horizon_autonomous`,
**all six work shapes now carry dated evidence**, every one from a
reproducible committed fixture.

## First observations

| Case | Profile | Acceptance | Wall clock | Tokens (unsplit) |
|---|---|---|---|---|
| invariants.cursor-pagination | sol-high | 3/3 pass | 119s | 31,049 |
| invariants.cursor-pagination | sol-xhigh | 3/3 pass | 162s | 39,422 |
| longhorizon.dep-major-upgrade | fable-high | 4/4 pass | 126s | n/a |
| longhorizon.dep-major-upgrade | fable-xhigh | 4/4 pass | 192s | n/a |

Both invariants runs found the undocumented third consumer (the export
watermark) and deliberately shielded it from the sort change, shipped a
versioned composite cursor with an explicit legacy-continuation path, and
kept every contract test green. Both longhorizon runs completed all twelve
migration steps in one dispatch with exemplary changelogs.

**The high-versus-xhigh pattern now repeats across three shapes**: on
invariants (+36% time, +27% tokens), longhorizon (+52% time), and the earlier
blastradius observations, xhigh matched high on every rubric while costing
more. Only blastradius' very first observation showed xhigh materially
richer. The emerging hypothesis — worth a dedicated future pairing — is that
xhigh's premium pays only when register breadth is itself the deliverable.

## Honesty notes

- Both longhorizon runs finished in ~2-3 minutes, far below the "sustained
  autonomous execution" the shape intends to measure. This fixture proved
  completion quality, not endurance; stressing endurance needs a heavier
  fixture (tracked as a candidate follow-up, not silently claimed).
- These were the first dispatches through the claude executor's scoped tool
  grant (PR #48); the grant proved sufficient for a full
  edit-test-changelog loop inside the disposable fixture.
- review × grok-high: the same-day retry after the empty-output failure
  delivered a full 3/3 report in 60s (results file timestamp-suffixed; the
  failure stands). The profile now has all-pass results on two distinct
  dates plus one dispatch failure — still short of promotion under the
  no-unresolved-contradiction clause; fable-high keeps the default.
- All single-observation cells above are hypotheses, not defaults, per the
  promotion rule.
