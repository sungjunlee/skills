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

Consumer issues add JSON files to `cases/` and `results/`. A result is matched
to its case by `case_id`. File names are free-form in those directories; all
`.json` files are discovered recursively.

The assertion vocabulary is closed and scalar: output-field presence, selected
route or engine, question-count range, host-observed subagent-dispatch-count
range, escalation value, and absence of a named side effect. The verifier
derives these outcomes from the result's observed fields. It does not execute
arbitrary expressions or compare prose.

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
