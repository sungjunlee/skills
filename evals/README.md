# Semantic replay harness

This directory contains compact, provider-neutral replay contracts and
evidence. It does not store prompts copied from private conversations, raw
model transcripts, credentials, or machine-specific absolute paths.

## Layout

```text
evals/
  schema/       replay case and result JSON Schemas
  fixtures/     verifier smoke fixtures (valid and intentionally invalid)
  cases/        consumer-skill replay cases
  results/      compact observed replay results
```

## Evidence policy

- A result binds to the skill text it observed through `skill_revision`: the
  sha256 tree hash of the skill directory. Print it with
  `node scripts/verify-replays.mjs --skill-revision <category>/<skill>`;
  `run-feature-spec-replay.mjs` writes it on its own.
- `npm test` prints, per skill, how many results carry the current revision
  (`current`) and how many do not (`historical`). Historical results stay
  committed as dated evidence but do not count as coverage: only a current
  result says what the skill does today.
- Keep one case per decision the skill text makes: a route, a refusal, an
  escalation, a required output field. A case that no longer maps to a
  sentence in `SKILL.md` or its references is removed together with its
  results.
- New observations run on Claude Code and Codex. The five-host matrix under
  `results/cross-host/` (2026-07-11) is frozen history: schema-checked, never
  re-observed, and no longer verified against its matrix fixture.

Consumer issues add JSON files to `cases/` and `results/`. A result is matched
to its case by `case_id`. File names are free-form in those directories; all
`.json` files are discovered recursively. Dated notes under `reports/` record
contract supersessions; read those before treating an old case as current
skill text.

The assertion vocabulary is closed and scalar: output-field presence, selected
route or engine, question-count range, host-observed subagent-dispatch-count
range, evidence-citation count range, zero-finding-panelist count range,
escalation value, and absence of a named side effect. The verifier derives these
outcomes from the result's observed fields. It does not execute arbitrary
expressions or compare prose.

Delegate dispatch-contract cases add an optional `dispatch_contract` block on
the case and a matching `dispatch_observation` on the result. That block is
the argv/cwd/stdin/outcome evidence for the three credential-free fake-CLI
replays; it is not a general process-event framework. Paid profile evaluation
stays in `evals/delegate/`. Re-run a host observation with
`node scripts/run-dispatch-replay.mjs --host <claude-code|codex> --case <id>`.

`gosu-review.cross-examined-tension` adds an optional `round_two_contract` on
the case and a matching `round_two_observation` on the result. That block is
the Round-two trace: route identity (`resume` or `fresh`), both sides'
delivery/reread/new-anchor/`hold|concede|refine`/resolved-fix, tension
derivation, and extra-round count. Aggregate host dispatch count is not a
substitute. A pass requires a same-element opposite-fix conflict, both sides
complete, no orchestrator-invented resolution, and no extra round. A
non-conflicting first panel is fixture-premise-invalid, not pass. Host or
tool failure is `unverified`, not pass.

`evidence_citation_count_in_range` and `zero_finding_panelist_count_in_range`
are the depth counters. The first counts findings carrying a concrete anchor —
a file:line reference, a quotation, or a named observed detail — which is the
closest scalar proxy for "the reviewer opened the artifact instead of
paraphrasing the brief". The second counts panelists who returned zero findings,
so a case can require that an honest empty answer stays possible; without it,
every panelist is pushed to manufacture a concern. Both are counted from the
run's own output, so they are weaker evidence than the host-observed dispatch
count below, and neither judges whether an anchor is accurate or a finding is
correct. They exist so that compaction passes have something to lose.

`host_subagent_dispatch_count_in_range` has a stricter evidence boundary than
model-output assertions. The observer must count host-native subagent tool-call
events in the run's tool stream; an orchestrator's own `requested`, `returned`,
or tool-name prose is not evidence for this field. Raw transcripts remain
outside the repository, and the replay result keeps only the observed scalar
plus a concise provenance note. Passing this assertion proves that real
dispatch events occurred. It does not prove that the returned voices were
independent, diverse, or high quality.

Run the full committed suite with:

```bash
npm test
```

The default suite proves that valid fixtures are accepted, intentionally
invalid fixtures are rejected, and committed case/result pairs are
semantically consistent. To inspect specific files, pass them explicitly:

```bash
node scripts/verify-replays.mjs evals/fixtures/valid/case.foundation.json evals/fixtures/valid/result.foundation.json
node scripts/verify-replays.mjs evals/fixtures/invalid/case.missing-semantic-assertions.json
```

The second command intentionally exits non-zero. Explicit case/result semantic
checking requires both matching files; schema-only invalid checks need only the
invalid file.
