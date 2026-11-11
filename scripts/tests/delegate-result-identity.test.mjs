import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import { validatePair } from "../verify-delegate-evals.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");

function jsonFiles(target) {
  const files = [];
  for (const entry of readdirSync(target, { withFileTypes: true })) {
    const child = path.join(target, entry.name);
    if (entry.isDirectory()) files.push(...jsonFiles(child));
    else if (entry.isFile() && entry.name.endsWith(".json")) files.push(child);
  }
  return files.sort();
}

function readJson(filename) {
  return JSON.parse(readFileSync(filename, "utf8"));
}

const caseFiles = jsonFiles(path.join(root, "evals/delegate/cases"));
const resultFiles = jsonFiles(path.join(root, "evals/delegate/results"));
const cases = new Map(
  caseFiles.map((filename) => {
    const evalCase = readJson(filename);
    return [evalCase.case_id, evalCase];
  }),
);
const historicalPairs = resultFiles.map((filename) => {
  const result = readJson(filename);
  const evalCase = cases.get(result.case_id);
  assert.ok(evalCase, `${filename} has no matching case`);
  return { filename, evalCase, result };
});

function selectedPair(predicate = () => true) {
  const pair = historicalPairs.find(({ result }) => predicate(result));
  assert.ok(pair, "No suitable historical delegate result found");
  return structuredClone(pair);
}

function selectedProfile(evalCase, result) {
  const profile = evalCase.candidate_profiles.find(
    (candidate) => candidate.profile_id === result.profile_id,
  );
  assert.ok(profile, `No profile ${JSON.stringify(result.profile_id)} in historical case`);
  return profile;
}

test("all committed delegate evaluation documents preserve their declared identities", () => {
  assert.equal(caseFiles.length + resultFiles.length, 37);
  for (const { filename, evalCase, result } of historicalPairs) {
    assert.deepEqual(validatePair(evalCase, result), [], filename);
  }
});

test("rejects a historical result whose model disagrees with its profile", () => {
  const { evalCase, result } = selectedPair();
  const profile = selectedProfile(evalCase, result);
  result.model = `${profile.model}-mismatch`;

  assert.deepEqual(validatePair(evalCase, result), [
    `profile_id ${JSON.stringify(result.profile_id)} requires model ${JSON.stringify(profile.model)}, got ${JSON.stringify(result.model)}`,
  ]);
});

test("rejects a historical result whose null effort disagrees with its profile", () => {
  const { evalCase, result } = selectedPair();
  const profile = selectedProfile(evalCase, result);
  result.effort = profile.effort === null ? "high" : null;

  assert.deepEqual(validatePair(evalCase, result), [
    `profile_id ${JSON.stringify(result.profile_id)} requires effort ${JSON.stringify(profile.effort)}, got ${JSON.stringify(result.effort)}`,
  ]);
});

test("rejects conflicting acceptance results with the same check identity", () => {
  const { evalCase, result } = selectedPair(
    (candidate) => candidate.acceptance_results.length > 0,
  );
  const original = result.acceptance_results[0];
  result.acceptance_results.push({
    ...original,
    status: original.status === "pass" ? "fail" : "pass",
    evidence: "Conflicting duplicate added by the regression control.",
  });

  assert.deepEqual(validatePair(evalCase, result), [
    `duplicate acceptance result check_id(s): ${JSON.stringify(original.check_id)}`,
  ]);
});

for (const status of ["failed", "skipped"]) {
  test(`${status} results may omit acceptance checks while retaining profile identity`, () => {
    const { evalCase, result } = selectedPair();
    result.status = status;
    result.acceptance_results = [];

    assert.deepEqual(validatePair(evalCase, result), []);
  });
}
