#!/usr/bin/env node

import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

import { duplicates, validateSchema } from "./lib/schema-validator.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const base = path.join(root, "evals/delegate");
const locations = {
  caseSchema: path.join(base, "schema/eval-case.schema.json"),
  resultSchema: path.join(base, "schema/eval-result.schema.json"),
  registrySchema: path.join(base, "schema/executors.schema.json"),
  registry: path.join(base, "executors.json"),
  cases: path.join(base, "cases"),
  results: path.join(base, "results"),
  valid: path.join(base, "fixtures/valid"),
  invalid: path.join(base, "fixtures/invalid"),
};

function repositoryPath(filename) {
  return path.relative(root, filename).split(path.sep).join("/");
}

async function readJson(filename) {
  try {
    return JSON.parse(await readFile(filename, "utf8"));
  } catch (error) {
    throw new Error(`${repositoryPath(filename)}: ${error.message}`);
  }
}

async function jsonFiles(target) {
  let entries;
  try {
    entries = await readdir(target, { withFileTypes: true });
  } catch {
    return [];
  }
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
  if (!filename.startsWith(locations.valid) && !filename.startsWith(locations.invalid)) {
    return filename.startsWith(locations.results) ? "result" : "case";
  }
  if (basename.startsWith("case.")) return "case";
  if (basename.startsWith("result.")) return "result";
  throw new Error(`${repositoryPath(filename)}: cannot infer delegate document kind`);
}

function validateCaseContract(evalCase) {
  const errors = [];
  const checkIds = duplicates(evalCase.acceptance_checks.map((check) => check.check_id));
  if (checkIds.length > 0) {
    errors.push(`duplicate check_id(s): ${[...new Set(checkIds)].join(", ")}`);
  }
  const profileIds = duplicates(evalCase.candidate_profiles.map((profile) => profile.profile_id));
  if (profileIds.length > 0) {
    errors.push(`duplicate profile_id(s): ${[...new Set(profileIds)].join(", ")}`);
  }
  const privacy = evalCase.privacy;
  if (["internal", "private"].includes(privacy.sensitivity) && privacy.approved_routes.length === 0) {
    errors.push(`${privacy.sensitivity} fixtures require an explicit approved_routes allowlist`);
  }
  if (
    evalCase.fixture.kind === "file" &&
    (path.isAbsolute(evalCase.fixture.value) ||
      evalCase.fixture.value.split(/[\\/]/).includes(".."))
  ) {
    errors.push("file fixture values must be repository-relative and cannot traverse upward");
  }
  return errors;
}

function validatePair(evalCase, result) {
  const errors = [];
  const profileIds = evalCase.candidate_profiles.map((profile) => profile.profile_id);
  if (!profileIds.includes(result.profile_id)) {
    errors.push(`profile_id ${JSON.stringify(result.profile_id)} is not a candidate profile of the case`);
  }
  const checkIds = evalCase.acceptance_checks.map((check) => check.check_id);
  for (const entry of result.acceptance_results) {
    if (!checkIds.includes(entry.check_id)) {
      errors.push(`unexpected acceptance result ${JSON.stringify(entry.check_id)}`);
    }
  }
  if (result.status === "completed") {
    const resultIds = result.acceptance_results.map((entry) => entry.check_id);
    for (const id of checkIds) {
      if (!resultIds.includes(id)) errors.push(`completed result is missing acceptance result ${JSON.stringify(id)}`);
    }
  }
  return errors;
}

async function loadDocument(filename, schemas) {
  const value = await readJson(filename);
  const kind = documentKind(filename);
  const schemaErrors = validateSchema(value, schemas[kind]);
  const contractErrors = schemaErrors.length === 0 && kind === "case" ? validateCaseContract(value) : [];
  return { filename, kind, value, errors: [...schemaErrors, ...contractErrors] };
}

function formatErrors(document) {
  return document.errors.map((error) => `${repositoryPath(document.filename)}: ${error}`);
}

function pairErrors(documents) {
  const errors = [];
  const cases = new Map();
  for (const document of documents.filter((candidate) => candidate.kind === "case")) {
    if (cases.has(document.value.case_id)) {
      errors.push(`duplicate delegate case_id ${JSON.stringify(document.value.case_id)}`);
    } else {
      cases.set(document.value.case_id, document.value);
    }
  }
  for (const document of documents.filter((candidate) => candidate.kind === "result")) {
    const evalCase = cases.get(document.value.case_id);
    const relative = repositoryPath(document.filename);
    if (!evalCase) {
      errors.push(`${relative}: no delegate case matches ${JSON.stringify(document.value.case_id)}`);
      continue;
    }
    for (const error of validatePair(evalCase, document.value)) {
      errors.push(`${relative}: ${error}`);
    }
  }
  return errors;
}

function resultPathErrors(documents) {
  const errors = [];
  for (const document of documents.filter((candidate) => candidate.kind === "result")) {
    const relative = path.relative(locations.results, document.filename).split(path.sep);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(relative[0] ?? "")) {
      errors.push(`${repositoryPath(document.filename)}: committed results must live under a YYYY-MM-DD directory`);
    } else if (relative[0] !== document.value.observation_date) {
      errors.push(`${repositoryPath(document.filename)}: path date must equal observation_date ${document.value.observation_date}`);
    }
  }
  return errors;
}

function registryCoverageErrors(registry, documents) {
  const errors = [];
  const matched = registry.executors.flatMap((executor) => executor.match_models);
  for (const model of new Set(duplicates(matched))) {
    errors.push(`evals/delegate/executors.json: model ${JSON.stringify(model)} is matched by multiple executors`);
  }
  const caseModels = new Set(
    documents
      .filter((candidate) => candidate.kind === "case")
      .flatMap((candidate) => candidate.value.candidate_profiles.map((profile) => profile.model)),
  );
  for (const model of [...caseModels].filter((candidate) => !matched.includes(candidate))) {
    errors.push(`evals/delegate/executors.json: no executor matches case model ${JSON.stringify(model)}`);
  }
  return errors;
}

function shapeCoverageErrors(documents, schemas) {
  const cases = documents.filter((candidate) => candidate.kind === "case");
  if (cases.length === 0) return [];
  const shapes = schemas.case.properties.work_shape.enum;
  const covered = new Set(cases.map((candidate) => candidate.value.work_shape));
  return shapes
    .filter((shape) => !covered.has(shape))
    .map((shape) => `committed delegate cases cover no ${shape} case`);
}

async function loadAll(target, schemas) {
  const files = await jsonFiles(target);
  return Promise.all(files.map((filename) => loadDocument(filename, schemas)));
}

async function main() {
  const schemas = {
    case: await readJson(locations.caseSchema),
    result: await readJson(locations.resultSchema),
  };

  const committed = [
    ...(await loadAll(locations.cases, schemas)),
    ...(await loadAll(locations.results, schemas)),
  ];
  const errors = committed.flatMap(formatErrors);
  if (errors.length === 0) {
    errors.push(...resultPathErrors(committed));
    errors.push(...pairErrors(committed));
    errors.push(...shapeCoverageErrors(committed, schemas));
  }

  const registry = await readJson(locations.registry);
  const registrySchema = await readJson(locations.registrySchema);
  const registryErrors = validateSchema(registry, registrySchema).map(
    (error) => `evals/delegate/executors.json: ${error}`,
  );
  errors.push(...registryErrors);
  if (errors.length === 0) errors.push(...registryCoverageErrors(registry, committed));

  const validDocuments = await loadAll(locations.valid, schemas);
  errors.push(...validDocuments.flatMap(formatErrors));
  if (errors.length === 0) errors.push(...pairErrors(validDocuments));

  const invalidDocuments = await loadAll(locations.invalid, schemas);
  for (const document of invalidDocuments) {
    const combined = [...document.errors, ...pairErrors([...validDocuments, document])];
    if (combined.length === 0) {
      errors.push(`${repositoryPath(document.filename)}: intentionally invalid fixture was accepted`);
    }
  }

  if (errors.length > 0) throw new Error(errors.join("\n"));
  console.log(
    `Verified ${validDocuments.length} valid fixture(s), rejected ${invalidDocuments.length} invalid fixture(s), and checked ${committed.length} committed delegate evaluation document(s).`,
  );
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
