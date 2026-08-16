#!/usr/bin/env node

import { createHash } from "node:crypto";
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

import { duplicates, same, validateSchema } from "./lib/schema-validator.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const locations = {
  caseSchema: path.join(root, "evals/schema/replay-case.schema.json"),
  resultSchema: path.join(root, "evals/schema/replay-result.schema.json"),
  legacyManifest: path.join(root, "evals/contracts/replay-v1.json"),
  valid: path.join(root, "evals/fixtures/valid"),
  invalid: path.join(root, "evals/fixtures/invalid"),
  cases: path.join(root, "evals/cases"),
  results: path.join(root, "evals/results"),
};

const currentContractVersion = "replay-v2";

function repositoryPath(filename) {
  return path.relative(root, filename).split(path.sep).join("/");
}

function normalizeNewlines(value) {
  return value.replaceAll("\r\n", "\n").replaceAll("\r", "\n");
}

function validateCaseContract(replayCase) {
  const errors = [];
  const assertions = replayCase.semantic_assertions;

  if (replayCase.expected_route === null && replayCase.expected_engine === null) {
    errors.push("at least one of expected_route or expected_engine must be non-null");
  }
  if (
    replayCase.question_count_range !== null &&
    replayCase.question_count_range.min > replayCase.question_count_range.max
  ) {
    errors.push("question_count_range.min must not exceed question_count_range.max");
  }
  const optionalRanges = [
    "host_subagent_dispatch_count_range",
    "evidence_citation_count_range",
    "zero_finding_panelist_count_range",
    "starved_seat_zero_finding_count_range",
    "control_seat_anchored_finding_count_range",
  ];
  for (const name of optionalRanges) {
    const range = replayCase[name];
    if (range !== undefined && range.min > range.max) {
      errors.push(`${name}.min must not exceed ${name}.max`);
    }
  }
  if (
    replayCase.input_fixture.kind === "file" &&
    (path.isAbsolute(replayCase.input_fixture.value) ||
      replayCase.input_fixture.value.split(/[\\/]/).includes(".."))
  ) {
    errors.push("file input_fixture values must be repository-relative and cannot traverse upward");
  }

  const duplicateIds = duplicates(assertions.map((assertion) => assertion.assertion_id));
  if (duplicateIds.length > 0) {
    errors.push(`duplicate semantic assertion id(s): ${[...new Set(duplicateIds)].join(", ")}`);
  }

  const outputAssertions = assertions.filter((assertion) => assertion.type === "output_field_present");
  for (const field of replayCase.required_output_fields) {
    if (!outputAssertions.some((assertion) => assertion.field === field)) {
      errors.push(`required output field ${JSON.stringify(field)} has no output_field_present assertion`);
    }
  }
  for (const assertion of outputAssertions) {
    if (!replayCase.required_output_fields.includes(assertion.field)) {
      errors.push(`output assertion ${JSON.stringify(assertion.assertion_id)} names a non-required field`);
    }
  }

  const singletonExpectations = [
    ["route_equals", replayCase.expected_route !== null],
    ["engine_equals", replayCase.expected_engine !== null],
    ["question_count_in_range", replayCase.question_count_range !== null],
    [
      "host_subagent_dispatch_count_in_range",
      replayCase.host_subagent_dispatch_count_range !== undefined,
    ],
    [
      "evidence_citation_count_in_range",
      replayCase.evidence_citation_count_range !== undefined,
    ],
    [
      "zero_finding_panelist_count_in_range",
      replayCase.zero_finding_panelist_count_range !== undefined,
    ],
    [
      "starved_seat_zero_finding_count_in_range",
      replayCase.starved_seat_zero_finding_count_range !== undefined,
    ],
    [
      "control_seat_anchored_finding_count_in_range",
      replayCase.control_seat_anchored_finding_count_range !== undefined,
    ],
    ["escalation_equals", true],
  ];
  for (const [type, expected] of singletonExpectations) {
    const count = assertions.filter((assertion) => assertion.type === type).length;
    const wanted = expected ? 1 : 0;
    if (count !== wanted) errors.push(`${type} must appear ${wanted} time(s), found ${count}`);
  }

  const sideEffectAssertions = assertions.filter((assertion) => assertion.type === "side_effect_absent");
  for (const sideEffect of replayCase.forbidden_side_effects) {
    if (!sideEffectAssertions.some((assertion) => assertion.side_effect === sideEffect)) {
      errors.push(`forbidden side effect ${JSON.stringify(sideEffect)} has no side_effect_absent assertion`);
    }
  }
  for (const assertion of sideEffectAssertions) {
    if (!replayCase.forbidden_side_effects.includes(assertion.side_effect)) {
      errors.push(`side-effect assertion ${JSON.stringify(assertion.assertion_id)} is not forbidden by the case`);
    }
  }

  const dispatch = replayCase.dispatch_contract;
  if (dispatch) {
    if (replayCase.expected_route === null) {
      errors.push("dispatch_contract requires a non-null expected_route");
    }
    if (dispatch.expected_outcome === "success" && dispatch.expected_output === null) {
      errors.push("success dispatch_contract requires a non-null expected_output");
    }
    if (dispatch.expected_outcome !== "success" && dispatch.expected_output !== null) {
      errors.push("failure dispatch_contract expected_output must be null");
    }
  }

  return errors;
}

function dispatchDerived(replayCase, result) {
  const expected = replayCase.dispatch_contract;
  if (!expected) return { ok: true, failed: [] };
  const observed = result.dispatch_observation;
  if (!observed) return { ok: false, failed: ["missing_observation"] };

  const argv = observed.argv ?? [];
  const prompt = expected.expected_prompt;
  const checks = [
    ["host_dispatched", observed.host_dispatched === true],
    ["route", observed.resolved_route === replayCase.expected_route],
    ["model", observed.resolved_model === expected.expected_model],
    ["effort", observed.resolved_effort === expected.expected_effort],
    ["prompt", argv.length > 0 && argv[argv.length - 1] === prompt && argv.includes(prompt)],
    ["cwd", observed.cwd === expected.expected_cwd],
    ["stdin", observed.stdin === expected.expected_stdin],
    ["outcome", observed.outcome === expected.expected_outcome],
    [
      "output",
      expected.expected_outcome === "success"
        ? observed.output === expected.expected_output && Boolean(observed.output)
        : observed.output === null || observed.output === expected.expected_output,
    ],
    ["elapsed", Number.isInteger(observed.elapsed_ms) && observed.elapsed_ms >= 0],
  ];
  if (expected.expected_outcome === "dispatch_cli_error") {
    checks.push(["terminated_before_deadline", observed.terminated_before_deadline === true]);
    checks.push([
      "elapsed_before_deadline",
      Number.isInteger(observed.elapsed_ms) && observed.elapsed_ms < expected.deadline_seconds * 1000,
    ]);
  }
  return {
    ok: checks.every(([, passed]) => passed),
    failed: checks.filter(([, passed]) => !passed).map(([name]) => name),
  };
}

function countInRange(observed, range) {
  return {
    observed,
    passed: Number.isInteger(observed) && observed >= range.min && observed <= range.max,
  };
}

function assertionObservation(assertion, replayCase, result) {
  switch (assertion.type) {
    case "output_field_present": {
      const observed = result.observed_output_fields.includes(assertion.field);
      return { observed, passed: observed };
    }
    case "route_equals":
      return {
        observed: result.observed_route,
        passed: result.observed_route === replayCase.expected_route,
      };
    case "engine_equals":
      return {
        observed: result.observed_engine,
        passed: result.observed_engine === replayCase.expected_engine,
      };
    case "question_count_in_range":
      return countInRange(result.question_count, replayCase.question_count_range);
    case "host_subagent_dispatch_count_in_range":
      return countInRange(
        result.observed_host_subagent_dispatch_count,
        replayCase.host_subagent_dispatch_count_range,
      );
    case "evidence_citation_count_in_range":
      return countInRange(
        result.observed_evidence_citation_count,
        replayCase.evidence_citation_count_range,
      );
    case "zero_finding_panelist_count_in_range":
      return countInRange(
        result.observed_zero_finding_panelist_count,
        replayCase.zero_finding_panelist_count_range,
      );
    case "starved_seat_zero_finding_count_in_range":
      return countInRange(
        result.observed_starved_seat_zero_finding_count,
        replayCase.starved_seat_zero_finding_count_range,
      );
    case "control_seat_anchored_finding_count_in_range":
      return countInRange(
        result.observed_control_seat_anchored_finding_count,
        replayCase.control_seat_anchored_finding_count_range,
      );
    case "escalation_equals":
      return {
        observed: result.observed_escalation,
        passed: result.observed_escalation === replayCase.expected_escalation,
      };
    case "side_effect_absent": {
      const observed = !result.side_effects.includes(assertion.side_effect);
      return { observed, passed: observed };
    }
    default:
      throw new Error(`unreachable assertion type: ${assertion.type}`);
  }
}

function validateReplayPair(replayCase, result) {
  const errors = [];
  if (result.case_id !== replayCase.case_id) {
    return [`result case_id ${JSON.stringify(result.case_id)} does not match ${JSON.stringify(replayCase.case_id)}`];
  }

  const caseIds = replayCase.semantic_assertions.map((assertion) => assertion.assertion_id);
  const resultIds = result.assertion_results.map((assertion) => assertion.assertion_id);
  const duplicateIds = duplicates(resultIds);
  if (duplicateIds.length > 0) {
    errors.push(`duplicate assertion result id(s): ${[...new Set(duplicateIds)].join(", ")}`);
  }
  for (const id of caseIds) {
    if (!resultIds.includes(id)) errors.push(`missing assertion result ${JSON.stringify(id)}`);
  }
  for (const id of resultIds) {
    if (!caseIds.includes(id)) errors.push(`unexpected assertion result ${JSON.stringify(id)}`);
  }

  if (result.status === "unverified") {
    for (const assertionResult of result.assertion_results) {
      if (assertionResult.status !== "unverified" || assertionResult.observed !== null) {
        errors.push(`unverified assertion ${JSON.stringify(assertionResult.assertion_id)} must have status unverified and observed null`);
      }
    }
    if (result.dispatch_observation?.host_dispatched) {
      errors.push("unverified dispatch result cannot record host_dispatched true");
    }
    return errors;
  }

  for (const assertion of replayCase.semantic_assertions) {
    const assertionResult = result.assertion_results.find(
      (candidate) => candidate.assertion_id === assertion.assertion_id,
    );
    if (!assertionResult) continue;
    if (assertionResult.status === "unverified") {
      errors.push(`executed result cannot contain unverified assertion ${JSON.stringify(assertion.assertion_id)}`);
      continue;
    }
    const derived = assertionObservation(assertion, replayCase, result);
    if (!same(assertionResult.observed, derived.observed)) {
      errors.push(
        `assertion ${JSON.stringify(assertion.assertion_id)} observed ${JSON.stringify(assertionResult.observed)}; derived ${JSON.stringify(derived.observed)}`,
      );
    }
    const expectedStatus = derived.passed ? "pass" : "fail";
    if (assertionResult.status !== expectedStatus) {
      errors.push(
        `assertion ${JSON.stringify(assertion.assertion_id)} status ${assertionResult.status}; derived ${expectedStatus}`,
      );
    }
  }

  if (replayCase.dispatch_contract && !result.dispatch_observation) {
    errors.push("executed dispatch result is missing dispatch_observation");
  } else if (!replayCase.dispatch_contract && result.dispatch_observation) {
    errors.push("dispatch_observation is only valid on a dispatch_contract case");
  }

  const dispatch = dispatchDerived(replayCase, result);
  if (result.status === "pass" && !dispatch.ok) {
    errors.push(`pass status requires dispatch contract checks to pass (failed: ${dispatch.failed.join(", ")})`);
  }

  const allPassed =
    result.assertion_results.every((assertion) => assertion.status === "pass") && dispatch.ok;
  const expectedOverall = allPassed ? "pass" : "fail";
  if (result.status !== expectedOverall) {
    errors.push(`overall status ${result.status}; assertion results require ${expectedOverall}`);
  }
  return errors;
}

async function readJson(filename) {
  try {
    return JSON.parse(await readFile(filename, "utf8"));
  } catch (error) {
    throw new Error(`${path.relative(root, filename)}: ${error.message}`);
  }
}

async function canonicalTreeDigest(filenames) {
  const hash = createHash("sha256");
  for (const relative of filenames) {
    const text = normalizeNewlines(await readFile(path.join(root, relative), "utf8"));
    hash.update(relative);
    hash.update("\0");
    hash.update(text);
    hash.update("\0");
  }
  return hash.digest("hex");
}

function validateLegacyManifest(manifest) {
  const errors = [];
  if (manifest.legacy_contract_version !== "replay-v1") {
    errors.push("legacy_contract_version must be replay-v1");
  }
  if (manifest.current_contract_version !== currentContractVersion) {
    errors.push(`current_contract_version must be ${currentContractVersion}`);
  }
  if (manifest.case_schema !== "evals/schema/legacy/replay-case.v1.schema.json") {
    errors.push("case_schema must name the frozen replay-v1 case schema");
  }
  if (manifest.result_schema !== "evals/schema/legacy/replay-result.v1.schema.json") {
    errors.push("result_schema must name the frozen replay-v1 result schema");
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(manifest.migration_date ?? "")) {
    errors.push("migration_date must be an ISO date");
  }
  if (!/^[0-9a-f]{64}$/.test(manifest.canonical_tree_sha256 ?? "")) {
    errors.push("canonical_tree_sha256 must be a SHA-256 digest");
  }
  if (!Array.isArray(manifest.documents) || manifest.documents.length === 0) {
    errors.push("documents must be a non-empty path inventory");
  } else {
    const sorted = [...manifest.documents].sort();
    if (!same(manifest.documents, sorted)) errors.push("documents must be sorted");
    if (new Set(manifest.documents).size !== manifest.documents.length) {
      errors.push("documents must not contain duplicate paths");
    }
    for (const relative of manifest.documents) {
      if (
        typeof relative !== "string" ||
        path.isAbsolute(relative) ||
        relative.split(/[\\/]/).includes("..") ||
        !/^evals\/(?:cases|results)\/.+\.json$/.test(relative)
      ) {
        errors.push(`invalid legacy document path ${JSON.stringify(relative)}`);
      }
    }
  }
  if (!Array.isArray(manifest.supersessions) || manifest.supersessions.length === 0) {
    errors.push("supersessions must be a non-empty list");
  }
  return errors;
}

async function loadContracts() {
  const manifest = await readJson(locations.legacyManifest);
  const manifestErrors = validateLegacyManifest(manifest);
  if (manifestErrors.length > 0) {
    throw new Error(manifestErrors.map((error) => `evals/contracts/replay-v1.json: ${error}`).join("\n"));
  }
  return {
    manifest,
    legacyPaths: new Set(manifest.documents),
    current: {
      case: await readJson(locations.caseSchema),
      result: await readJson(locations.resultSchema),
    },
    legacy: {
      case: await readJson(path.join(root, manifest.case_schema)),
      result: await readJson(path.join(root, manifest.result_schema)),
    },
  };
}

async function jsonFiles(target) {
  const entries = await readdir(target, { withFileTypes: true });
  const files = [];
  for (const entry of entries.sort((left, right) => left.name.localeCompare(right.name))) {
    const child = path.join(target, entry.name);
    if (entry.isDirectory()) files.push(...(await jsonFiles(child)));
    else if (entry.isFile() && entry.name.endsWith(".json")) files.push(child);
  }
  return files;
}

function documentKind(filename) {
  const basename = path.basename(filename);
  const caseRelative = path.relative(locations.cases, filename);
  const resultRelative = path.relative(locations.results, filename);
  if (!caseRelative.startsWith(`..${path.sep}`) && !path.isAbsolute(caseRelative)) return "case";
  if (!resultRelative.startsWith(`..${path.sep}`) && !path.isAbsolute(resultRelative)) return "result";
  if (basename.startsWith("case.")) return "case";
  if (basename.startsWith("result.")) return "result";
  throw new Error(`${path.relative(root, filename)}: cannot infer replay document kind`);
}

async function loadDocument(filename, contracts) {
  const value = await readJson(filename);
  const kind = documentKind(filename);
  const relative = repositoryPath(filename);
  const legacy = contracts.legacyPaths.has(relative);
  const schemas = legacy ? contracts.legacy : contracts.current;
  const schemaErrors = validateSchema(value, schemas[kind]);
  const contractErrors = schemaErrors.length === 0 && kind === "case" ? validateCaseContract(value) : [];
  return {
    filename,
    kind,
    contractVersion: legacy ? contracts.manifest.legacy_contract_version : currentContractVersion,
    value,
    errors: [...schemaErrors, ...contractErrors],
  };
}

function formatErrors(document) {
  const relative = repositoryPath(document.filename);
  return document.errors.map((error) => `${relative}: ${error}`);
}

function replayKey(document) {
  return `${document.contractVersion}\0${document.value.case_id}`;
}

function verifyPairs(documents) {
  const errors = [];
  const cases = new Map();
  for (const document of documents.filter((candidate) => candidate.kind === "case")) {
    const key = replayKey(document);
    if (cases.has(key)) {
      errors.push(
        `duplicate replay case_id ${JSON.stringify(document.value.case_id)} in ${document.contractVersion}`,
      );
    } else {
      cases.set(key, document.value);
    }
  }
  for (const document of documents.filter((candidate) => candidate.kind === "result")) {
    const replayCase = cases.get(replayKey(document));
    if (!replayCase) {
      errors.push(
        `${repositoryPath(document.filename)}: no matching ${document.contractVersion} case for ${JSON.stringify(document.value.case_id)}`,
      );
      continue;
    }
    for (const error of validateReplayPair(replayCase, document.value)) {
      errors.push(`${repositoryPath(document.filename)}: ${error}`);
    }
  }
  return errors;
}

async function validateContractBoundary(documents, contracts) {
  const errors = [];
  const byPath = new Map(documents.map((document) => [repositoryPath(document.filename), document]));
  const manifest = contracts.manifest;

  for (const relative of manifest.documents) {
    const document = byPath.get(relative);
    if (!document) {
      errors.push(`legacy inventory document is missing: ${relative}`);
    } else if (document.contractVersion !== manifest.legacy_contract_version) {
      errors.push(`${relative}: legacy inventory document used ${document.contractVersion}`);
    }
  }

  try {
    const digest = await canonicalTreeDigest([
      ...manifest.documents,
      manifest.case_schema,
      manifest.result_schema,
    ]);
    if (digest !== manifest.canonical_tree_sha256) {
      errors.push(
        `frozen replay-v1 contract changed: expected ${manifest.canonical_tree_sha256}, found ${digest}`,
      );
    }
  } catch (error) {
    errors.push(`frozen replay-v1 contract could not be hashed: ${error.message}`);
  }

  const seenCaseIds = new Set();
  for (const supersession of manifest.supersessions) {
    if (seenCaseIds.has(supersession.case_id)) {
      errors.push(`duplicate supersession for ${JSON.stringify(supersession.case_id)}`);
      continue;
    }
    seenCaseIds.add(supersession.case_id);

    if (!manifest.documents.includes(supersession.legacy_case)) {
      errors.push(`${supersession.case_id}: legacy_case is outside the frozen inventory`);
    }
    if (manifest.documents.includes(supersession.current_case)) {
      errors.push(`${supersession.case_id}: current_case must not be a replay-v1 path`);
    }
    if (!Array.isArray(supersession.current_results) || supersession.current_results.length !== 2) {
      errors.push(`${supersession.case_id}: current_results must contain Claude Code and Codex evidence`);
      continue;
    }

    const legacyCase = byPath.get(supersession.legacy_case);
    const currentCase = byPath.get(supersession.current_case);
    if (
      legacyCase?.kind !== "case" ||
      legacyCase.errors.length > 0 ||
      legacyCase.value.case_id !== supersession.case_id
    ) {
      errors.push(`${supersession.case_id}: legacy_case does not identify the expected replay-v1 case`);
    }
    if (
      currentCase?.kind !== "case" ||
      currentCase.errors.length > 0 ||
      currentCase.contractVersion !== currentContractVersion ||
      currentCase.value.case_id !== supersession.case_id
    ) {
      errors.push(`${supersession.case_id}: current_case does not identify the expected replay-v2 case`);
    }

    const hosts = [];
    for (const relative of supersession.current_results) {
      if (manifest.documents.includes(relative)) {
        errors.push(`${supersession.case_id}: current result ${relative} must not be a replay-v1 path`);
      }
      const result = byPath.get(relative);
      if (
        result?.kind !== "result" ||
        result.errors.length > 0 ||
        result.contractVersion !== currentContractVersion ||
        result.value.case_id !== supersession.case_id
      ) {
        errors.push(`${supersession.case_id}: ${relative} is not matching replay-v2 evidence`);
        continue;
      }
      hosts.push(result.value.host);
      if (result.value.observation_date !== manifest.migration_date) {
        errors.push(`${relative}: observation_date must equal migration_date ${manifest.migration_date}`);
      }
      if (!relative.split("/").includes(result.value.observation_date)) {
        errors.push(`${relative}: path must include its observation_date`);
      }
      if (result.value.status !== "pass") {
        errors.push(`${relative}: superseding evidence must pass`);
      }
    }
    if (!same(hosts.sort(), ["Claude Code", "Codex"])) {
      errors.push(`${supersession.case_id}: current evidence hosts must be Claude Code and Codex`);
    }
  }

  return errors;
}

async function main() {
  const contracts = await loadContracts();
  const explicit = process.argv.slice(2);

  if (explicit.length > 0) {
    const filenames = explicit.map((filename) => path.resolve(process.cwd(), filename));
    const documents = await Promise.all(filenames.map((filename) => loadDocument(filename, contracts)));
    const errors = documents.flatMap(formatErrors);
    if (errors.length === 0 && documents.some((document) => document.kind === "case")) {
      errors.push(...verifyPairs(documents));
    }
    if (errors.length > 0) throw new Error(errors.join("\n"));
    console.log(`Verified ${documents.length} replay document(s).`);
    return;
  }

  const validFiles = await jsonFiles(locations.valid);
  const validDocuments = await Promise.all(validFiles.map((filename) => loadDocument(filename, contracts)));
  const errors = validDocuments.flatMap(formatErrors);
  if (errors.length === 0) errors.push(...verifyPairs(validDocuments));

  const invalidFiles = await jsonFiles(locations.invalid);
  const invalidDocuments = await Promise.all(invalidFiles.map((filename) => loadDocument(filename, contracts)));
  for (const document of invalidDocuments) {
    if (document.errors.length === 0) {
      errors.push(`${path.relative(root, document.filename)}: intentionally invalid fixture was accepted`);
    }
  }

  const committedFiles = [
    ...(await jsonFiles(locations.cases)),
    ...(await jsonFiles(locations.results)),
  ];
  const committedDocuments = await Promise.all(
    committedFiles.map((filename) => loadDocument(filename, contracts)),
  );
  errors.push(...committedDocuments.flatMap(formatErrors));
  errors.push(...(await validateContractBoundary(committedDocuments, contracts)));
  if (errors.length === 0) errors.push(...verifyPairs(committedDocuments));

  if (errors.length > 0) throw new Error(errors.join("\n"));
  console.log(
    `Verified ${validDocuments.length} valid fixture(s), rejected ${invalidDocuments.length} invalid fixture(s), and checked ${committedDocuments.length} committed replay document(s).`,
  );
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
