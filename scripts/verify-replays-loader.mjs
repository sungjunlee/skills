import { createHash } from "node:crypto";
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

import { same, validateSchema } from "./lib/schema-validator.mjs";
import { validateCaseContract, validateLegacyManifest } from "./verify-replays-contract.mjs";
import { validateReplayPair } from "./verify-replays-pair.mjs";

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

export async function loadContracts() {
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

export async function jsonFiles(target) {
  const entries = await readdir(target, { withFileTypes: true });
  const files = [];
  for (const entry of entries.sort((left, right) => left.name.localeCompare(right.name))) {
    const child = path.join(target, entry.name);
    if (entry.isDirectory()) files.push(...(await jsonFiles(child)));
    else if (entry.isFile() && entry.name.endsWith(".json")) files.push(child);
  }
  return files;
}

export function documentKind(filename) {
  const basename = path.basename(filename);
  const caseRelative = path.relative(locations.cases, filename);
  const resultRelative = path.relative(locations.results, filename);
  if (!caseRelative.startsWith(`..${path.sep}`) && !path.isAbsolute(caseRelative)) return "case";
  if (!resultRelative.startsWith(`..${path.sep}`) && !path.isAbsolute(resultRelative)) return "result";
  if (basename.startsWith("case.")) return "case";
  if (basename.startsWith("result.")) return "result";
  throw new Error(`${path.relative(root, filename)}: cannot infer replay document kind`);
}

export async function loadDocument(filename, contracts) {
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

export function verifyPairs(documents) {
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

export async function validateContractBoundary(documents, contracts) {
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

export async function main() {
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
