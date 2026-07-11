#!/usr/bin/env node

import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const matrix = JSON.parse(await readFile(
  path.join(root, "evals/fixtures/cross-host/matrix.json"),
  "utf8",
));
const resultsRoot = path.join(root, "evals/results/cross-host");
const requiredOnly = process.argv.slice(2).includes("--required");
const unknownFlags = process.argv.slice(2).filter((argument) => argument !== "--required");
if (unknownFlags.length > 0) throw new Error(`Unknown argument(s): ${unknownFlags.join(", ")}`);

const expectedHosts = ["Claude Code", "Codex", "OpenCode", "Cursor", "Pi"];
const requiredHosts = new Set(["Claude Code", "Codex"]);
const errors = [];

function same(left, right) {
  return JSON.stringify(left) === JSON.stringify(right);
}

function slug(value) {
  return value.toLowerCase().replaceAll(/[^a-z0-9]+/g, "-").replaceAll(/^-|-$/g, "");
}

async function jsonFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries.sort((left, right) => left.name.localeCompare(right.name))) {
    const child = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...(await jsonFiles(child)));
    else if (entry.isFile() && entry.name.endsWith(".json")) files.push(child);
  }
  return files;
}

function expectedAssertion(assertion, replayCase, result) {
  switch (assertion.type) {
    case "output_field_present": {
      const observed = result.observed_output_fields.includes(assertion.field);
      return { observed, status: observed ? "pass" : "fail" };
    }
    case "route_equals": {
      const observed = result.observed_route;
      return { observed, status: observed === replayCase.expected_route ? "pass" : "fail" };
    }
    case "engine_equals": {
      const observed = result.observed_engine;
      return { observed, status: observed === replayCase.expected_engine ? "pass" : "fail" };
    }
    case "question_count_in_range": {
      const observed = result.question_count;
      const { min, max } = replayCase.question_count_range;
      const passed = Number.isInteger(observed) && observed >= min && observed <= max;
      return { observed, status: passed ? "pass" : "fail" };
    }
    case "escalation_equals": {
      const observed = result.observed_escalation;
      return { observed, status: observed === replayCase.expected_escalation ? "pass" : "fail" };
    }
    case "side_effect_absent": {
      const observed = !result.side_effects.includes(assertion.side_effect);
      return { observed, status: observed ? "pass" : "fail" };
    }
    default:
      throw new Error(`Unsupported assertion type ${assertion.type}`);
  }
}

if (!/^[0-9a-f]{40}$/.test(matrix.base_sha)) errors.push("matrix base_sha must be an exact SHA");
if (!same(matrix.required_hosts, expectedHosts)) errors.push("matrix hosts differ from the canonical five-host order");
if (matrix.required_cases.length !== 12) errors.push(`expected 12 cases, found ${matrix.required_cases.length}`);

const cases = new Map();
for (const [index, entry] of matrix.required_cases.entries()) {
  if (entry.requirement !== index + 1) errors.push(`case ${entry.case_id} has non-canonical requirement number`);
  if (cases.has(entry.case_id)) errors.push(`duplicate matrix case ${entry.case_id}`);
  const replayCase = JSON.parse(await readFile(path.join(root, entry.path), "utf8"));
  if (replayCase.case_id !== entry.case_id) errors.push(`${entry.path} declares ${replayCase.case_id}`);
  cases.set(entry.case_id, replayCase);
}

const files = await jsonFiles(resultsRoot);
const expectedCount = expectedHosts.length * cases.size;
if (files.length !== expectedCount) errors.push(`expected exactly ${expectedCount} result files, found ${files.length}`);

const pairs = new Map();
for (const filename of files) {
  const result = JSON.parse(await readFile(filename, "utf8"));
  const relative = path.relative(root, filename);
  const key = `${result.host}\u0000${result.case_id}`;
  if (pairs.has(key)) errors.push(`duplicate result ${result.host} / ${result.case_id}`);
  pairs.set(key, result);
  if (!expectedHosts.includes(result.host)) errors.push(`${relative}: unexpected host ${result.host}`);
  if (!cases.has(result.case_id)) errors.push(`${relative}: unexpected case ${result.case_id}`);
  const expectedPath = path.join("evals/results/cross-host", slug(result.host), `${result.case_id}.json`);
  if (relative !== expectedPath) errors.push(`${relative}: expected path ${expectedPath}`);
  if (/(?:\/Users\/|\/home\/|\/private\/var\/folders\/|[A-Za-z]:\\Users\\)/.test(result.evidence_note)) {
    errors.push(`${relative}: evidence note contains a machine-specific path`);
  }
  if (/(?:accessToken|refreshToken|sk-[A-Za-z0-9_-]{8,}|Bearer\s+[A-Za-z0-9._-]{8,})/i.test(result.evidence_note)) {
    errors.push(`${relative}: evidence note contains credential-like material`);
  }
}

for (const host of expectedHosts) {
  for (const [caseId, replayCase] of cases) {
    const result = pairs.get(`${host}\u0000${caseId}`);
    if (!result) {
      errors.push(`missing result ${host} / ${caseId}`);
      continue;
    }
    const assertionIds = replayCase.semantic_assertions.map((assertion) => assertion.assertion_id);
    const resultIds = result.assertion_results.map((assertion) => assertion.assertion_id);
    if (!same([...resultIds].sort(), [...assertionIds].sort())) {
      errors.push(`${host} / ${caseId}: assertion id set differs from the case`);
      continue;
    }
    if (result.status === "unverified") {
      for (const assertion of result.assertion_results) {
        if (assertion.status !== "unverified" || assertion.observed !== null) {
          errors.push(`${host} / ${caseId}: unverified row has executed assertion evidence`);
        }
      }
    } else {
      for (const assertion of replayCase.semantic_assertions) {
        const observed = result.assertion_results.find((candidate) => candidate.assertion_id === assertion.assertion_id);
        const expected = expectedAssertion(assertion, replayCase, result);
        if (observed.status !== expected.status || !same(observed.observed, expected.observed)) {
          errors.push(`${host} / ${caseId}: assertion ${assertion.assertion_id} does not match observed fields`);
        }
      }
      const expectedStatus = result.assertion_results.every((assertion) => assertion.status === "pass") ? "pass" : "fail";
      if (result.status !== expectedStatus) errors.push(`${host} / ${caseId}: overall status must be ${expectedStatus}`);
    }
    if (requiredHosts.has(host)) {
      if (result.status !== "pass") errors.push(`required host ${host} must pass ${caseId}; found ${result.status}`);
      if (!result.assertion_results.every((assertion) => assertion.status === "pass")) {
        errors.push(`required host ${host} has a non-pass assertion for ${caseId}`);
      }
    }
  }
}

if (errors.length > 0) {
  console.error(errors.join("\n"));
  process.exitCode = 1;
} else if (requiredOnly) {
  console.log("Required matrix complete: Claude Code and Codex pass all 24 canonical host/case rows.");
} else {
  console.log("Cross-host matrix complete: exactly 60 unique canonical rows; required hosts pass all 12 cases each.");
}
