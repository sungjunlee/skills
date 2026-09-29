import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

import { validateSchema } from "./lib/schema-validator.mjs";
import { sha256Tree } from "./lib/skill-revision.mjs";
import { validateCaseContract } from "./verify-replays-contract.mjs";
import { validateReplayPair } from "./verify-replays-pair.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const locations = {
  caseSchema: path.join(root, "evals/schema/replay-case.schema.json"),
  resultSchema: path.join(root, "evals/schema/replay-result.schema.json"),
  valid: path.join(root, "evals/fixtures/valid"),
  invalid: path.join(root, "evals/fixtures/invalid"),
  cases: path.join(root, "evals/cases"),
  results: path.join(root, "evals/results"),
};

const skillsRoot = path.join(root, "skills");

function repositoryPath(filename) {
  return path.relative(root, filename).split(path.sep).join("/");
}

async function readJson(filename) {
  try {
    return JSON.parse(await readFile(filename, "utf8"));
  } catch (error) {
    throw new Error(`${path.relative(root, filename)}: ${error.message}`);
  }
}

export async function loadContracts() {
  return {
    case: await readJson(locations.caseSchema),
    result: await readJson(locations.resultSchema),
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
  const schemaErrors = validateSchema(value, contracts[kind]);
  const contractErrors = schemaErrors.length === 0 && kind === "case" ? validateCaseContract(value) : [];
  return {
    filename,
    kind,
    value,
    errors: [...schemaErrors, ...contractErrors],
  };
}

function formatErrors(document) {
  const relative = repositoryPath(document.filename);
  return document.errors.map((error) => `${relative}: ${error}`);
}

export function verifyPairs(documents) {
  const errors = [];
  const cases = new Map();
  for (const document of documents.filter((candidate) => candidate.kind === "case")) {
    const key = document.value.case_id;
    if (cases.has(key)) {
      errors.push(`duplicate replay case_id ${JSON.stringify(document.value.case_id)}`);
    } else {
      cases.set(key, document.value);
    }
  }
  for (const document of documents.filter((candidate) => candidate.kind === "result")) {
    const replayCase = cases.get(document.value.case_id);
    if (!replayCase) {
      errors.push(
        `${repositoryPath(document.filename)}: no matching case for ${JSON.stringify(document.value.case_id)}`,
      );
      continue;
    }
    for (const error of validateReplayPair(replayCase, document.value)) {
      errors.push(`${repositoryPath(document.filename)}: ${error}`);
    }
  }
  return errors;
}

function tallyEvidence(documents) {
  const skillByCase = new Map();
  for (const document of documents.filter((candidate) => candidate.kind === "case")) {
    skillByCase.set(document.value.case_id, document.value.skill);
  }
  const revisions = new Map();
  const tally = new Map();
  for (const document of documents.filter((candidate) => candidate.kind === "result")) {
    const skill = skillByCase.get(document.value.case_id);
    if (skill === undefined) continue;
    if (!revisions.has(skill)) revisions.set(skill, sha256Tree(path.join(skillsRoot, skill)));
    const bucket = tally.get(skill) ?? { current: 0, historical: 0 };
    bucket[document.value.skill_revision === revisions.get(skill) ? "current" : "historical"] += 1;
    tally.set(skill, bucket);
  }
  return { revisions, tally };
}

// A result counts as coverage of the current skill text only when its
// skill_revision equals the skill directory's tree hash right now.
export function evidenceSummary(documents) {
  const { revisions, tally } = tallyEvidence(documents);
  return [...tally]
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([skill, counts]) =>
      `evidence ${skill}: ${counts.current} current, ${counts.historical} historical (revision ${revisions.get(skill).slice(0, 12)})`,
    );
}

export async function main() {
  const contracts = await loadContracts();
  const explicit = process.argv.slice(2);

  if (explicit[0] === "--skill-revision") {
    if (explicit.length !== 2) throw new Error("usage: --skill-revision <category>/<skill>");
    console.log(sha256Tree(path.join(skillsRoot, explicit[1])));
    return;
  }

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
  if (errors.length === 0) errors.push(...verifyPairs(committedDocuments));

  if (errors.length > 0) throw new Error(errors.join("\n"));
  for (const line of evidenceSummary(committedDocuments)) console.log(line);
  console.log(
    `Verified ${validDocuments.length} valid fixture(s), rejected ${invalidDocuments.length} invalid fixture(s), and checked ${committedDocuments.length} committed replay document(s).`,
  );
}
