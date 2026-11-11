import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import {
  invalidFixtureAcceptanceErrors as delegateAcceptanceErrors,
  loadAll as loadDelegateDocuments,
  negativeFixtureErrors as delegateNegativeErrors,
} from "../verify-delegate-evals.mjs";
import {
  invalidFixtureAcceptanceErrors as replayAcceptanceErrors,
  jsonFiles,
  loadContracts,
  loadDocument,
  negativeFixtureErrors as replayNegativeErrors,
} from "../verify-replays.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");

async function loadReplayFixtures() {
  const contracts = await loadContracts();
  const loadDirectory = async (directory) => {
    const files = await jsonFiles(directory);
    return Promise.all(files.map((filename) => loadDocument(filename, contracts)));
  };
  return {
    valid: await loadDirectory(path.join(root, "evals/fixtures/valid")),
    invalid: await loadDirectory(path.join(root, "evals/fixtures/invalid")),
  };
}

async function loadDelegateFixtures() {
  const schemaRoot = path.join(root, "evals/delegate/schema");
  const schemas = {
    case: JSON.parse(await readFile(path.join(schemaRoot, "eval-case.schema.json"), "utf8")),
    result: JSON.parse(await readFile(path.join(schemaRoot, "eval-result.schema.json"), "utf8")),
  };
  return {
    valid: await loadDelegateDocuments(path.join(root, "evals/delegate/fixtures/valid"), schemas),
    invalid: await loadDelegateDocuments(path.join(root, "evals/delegate/fixtures/invalid"), schemas),
  };
}

function documentsByName(documents) {
  return new Map(documents.map((document) => [path.basename(document.filename), document]));
}

function controlFrom(document, filename) {
  return { ...document, filename, errors: [] };
}

const replayExpectedErrors = new Map([
  ["case.assertion-id-empty.json", "must contain at least 1 character(s)"],
  ["case.assertion-id-with-whitespace.json", "contains whitespace"],
  ["case.current-relay-engine.json", "$.expected_engine: expected exactly one schema alternative"],
  ["case.dispatch-missing-deadline.json", "missing required property \"deadline_seconds\""],
  ["case.dispatch-success-without-output.json", "success dispatch_contract requires a non-null expected_output"],
  ["case.duplicate-assertion-ids.json", "duplicate semantic assertion id(s): summary-present"],
  ["case.evidence-citation-assertion-without-range.json", "evidence_citation_count_in_range must appear 0 time(s), found 1"],
  ["case.file-fixture-absolute-path.json", "file input_fixture values must be repository-relative and cannot traverse upward"],
  ["case.file-fixture-upward-traversal.json", "file input_fixture values must be repository-relative and cannot traverse upward"],
  ["case.host-dispatch-assertion-without-range.json", "host_subagent_dispatch_count_in_range must appear 0 time(s), found 1"],
  ["case.missing-semantic-assertions.json", "missing required property \"semantic_assertions\""],
  ["case.observed-fields-mismatch.json", "assertion \"summary-present\" observed true; derived false"],
  ["case.question-range-inverted.json", "question_count_range.min must not exceed question_count_range.max"],
  ["case.round-two-empty-routes.json", "allowed_routes: must contain at least 1 item(s)"],
  ["case.round-two-invalid-side-count.json", "required_side_count: expected constant 2"],
  ["case.zero-finding-range-inverted.json", "zero_finding_panelist_count_range.min must not exceed zero_finding_panelist_count_range.max"],
  ["result.current-relay-engine.json", "$.observed_engine: expected exactly one schema alternative"],
  ["result.dispatch-absolute-cwd.json", "$.dispatch_observation.cwd: expected one of \"caller\", \"other\""],
  ["result.label-skill-revision.json", "$.skill_revision: does not match"],
  ["result.missing-evidence-note.json", "missing required property \"evidence_note\""],
  ["result.observed-fields-mismatch.json", "assertion \"summary-present\" observed true; derived false"],
  ["result.unverified-with-observed-value.json", "unverified assertion \"summary-present\" must have status unverified and observed null"],
]);

const delegateExpectedErrors = new Map([
  ["case.check-id-uppercase.json", "$.acceptance_checks[0].check_id: does not match"],
  ["case.empty-acceptance-checks.json", "$.acceptance_checks: must contain at least 1 item(s)"],
  ["case.empty-pairing-rationale.json", "$.pairing_rationale: must contain at least 1 character(s)"],
  ["case.missing-pairing-rationale.json", "missing required property \"pairing_rationale\""],
  ["case.private-without-approved-routes.json", "private fixtures require an explicit approved_routes allowlist"],
  ["case.private-without-routes.json", "private fixtures require an explicit approved_routes allowlist"],
  ["case.unknown-work-shape.json", "$.work_shape: expected one of"],
  ["result.profile-not-in-case.json", "profile_id \"terra-high\" is not a candidate profile of the case"],
]);

test("every replay negative is rejected for its intended isolated reason", async () => {
  const fixtures = await loadReplayFixtures();
  const invalidByName = documentsByName(fixtures.invalid);

  assert.equal(fixtures.invalid.length, replayExpectedErrors.size);
  assert.deepEqual(replayAcceptanceErrors(fixtures.valid, fixtures.invalid), []);
  for (const [name, expected] of replayExpectedErrors) {
    const subject = invalidByName.get(name);
    assert.ok(subject, `${name} is missing`);
    const errors = replayNegativeErrors(fixtures.valid, fixtures.invalid, subject);
    assert.ok(errors.some((error) => error.includes(expected)), `${name}: ${errors.join("\n")}`);
    assert.equal(errors.some((error) => error.includes("duplicate replay case_id")), false, name);
    assert.equal(errors.some((error) => error.includes("no matching case")), false, name);
  }
});

test("a valid replay result in the negative directory is reported as accepted", async () => {
  const fixtures = await loadReplayFixtures();
  const valid = documentsByName(fixtures.valid).get("result.foundation.json");
  const filename = path.join(root, "evals/fixtures/invalid/result.valid-control.json");
  const control = controlFrom(valid, filename);
  const invalid = [...fixtures.invalid, control];

  assert.deepEqual(replayNegativeErrors(fixtures.valid, invalid, control), []);
  assert.deepEqual(replayAcceptanceErrors(fixtures.valid, invalid), [
    "evals/fixtures/invalid/result.valid-control.json: intentionally invalid fixture was accepted",
  ]);
});

test("every delegate negative is rejected for its intended isolated reason", async () => {
  const fixtures = await loadDelegateFixtures();
  const invalidByName = documentsByName(fixtures.invalid);

  assert.equal(fixtures.invalid.length, delegateExpectedErrors.size);
  assert.deepEqual(delegateAcceptanceErrors(fixtures.valid, fixtures.invalid), []);
  for (const [name, expected] of delegateExpectedErrors) {
    const subject = invalidByName.get(name);
    assert.ok(subject, `${name} is missing`);
    const errors = delegateNegativeErrors(fixtures.valid, fixtures.invalid, subject);
    assert.ok(errors.some((error) => error.includes(expected)), `${name}: ${errors.join("\n")}`);
    assert.equal(errors.some((error) => error.includes("duplicate delegate case_id")), false, name);
    assert.equal(errors.some((error) => error.includes("no delegate case matches")), false, name);
  }
});

test("a valid delegate case in the negative directory is reported as accepted", async () => {
  const fixtures = await loadDelegateFixtures();
  const valid = documentsByName(fixtures.valid).get("case.mechanical-rename.json");
  const filename = path.join(root, "evals/delegate/fixtures/invalid/case.valid-control.json");
  const control = controlFrom(valid, filename);
  const invalid = [...fixtures.invalid, control];

  assert.deepEqual(delegateNegativeErrors(fixtures.valid, invalid, control), []);
  assert.deepEqual(delegateAcceptanceErrors(fixtures.valid, invalid), [
    "evals/delegate/fixtures/invalid/case.valid-control.json: intentionally invalid fixture was accepted",
  ]);
});
