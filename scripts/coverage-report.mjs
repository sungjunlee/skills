#!/usr/bin/env node

// Coverage report generator: shows which skills have current evidence,
// which cases lack committed results, and fixture coverage by category.

import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

async function jsonFiles(dir) {
  let entries;
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch {
    return [];
  }
  const files = [];
  for (const entry of entries) {
    const child = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...(await jsonFiles(child)));
    else if (entry.isFile() && entry.name.endsWith(".json")) files.push(child);
  }
  return files;
}

async function readJson(filename) {
  return JSON.parse(await readFile(filename, "utf8"));
}

async function replayCoverage() {
  const casesDir = path.join(root, "evals/cases");
  const resultsDir = path.join(root, "evals/results");
  const validDir = path.join(root, "evals/fixtures/valid");
  const invalidDir = path.join(root, "evals/fixtures/invalid");

  const caseFiles = await jsonFiles(casesDir);
  const resultFiles = await jsonFiles(resultsDir);
  const validFiles = await jsonFiles(validDir);
  const invalidFiles = await jsonFiles(invalidDir);

  const cases = await Promise.all(caseFiles.map(readJson));
  const results = await Promise.all(resultFiles.map(readJson));

  const caseIds = new Set(cases.map((c) => c.case_id));
  const resultCaseIds = new Set(results.map((r) => r.case_id));
  const uncovered = [...caseIds].filter((id) => !resultCaseIds.has(id));

  console.log("## Replay Coverage\n");
  console.log(`Total cases: ${cases.length}`);
  console.log(`Total results: ${results.length}`);
  console.log(`Cases without results: ${uncovered.length}`);
  if (uncovered.length > 0) {
    console.log(`  Uncovered: ${uncovered.join(", ")}`);
  }
  console.log(`Valid fixtures: ${validFiles.length}`);
  console.log(`Invalid fixtures: ${invalidFiles.length}`);
  console.log();
}

async function delegateCoverage() {
  const casesDir = path.join(root, "evals/delegate/cases");
  const resultsDir = path.join(root, "evals/delegate/results");
  const validDir = path.join(root, "evals/delegate/fixtures/valid");
  const invalidDir = path.join(root, "evals/delegate/fixtures/invalid");

  const caseFiles = await jsonFiles(casesDir);
  const resultFiles = await jsonFiles(resultsDir);
  const validFiles = await jsonFiles(validDir);
  const invalidFiles = await jsonFiles(invalidDir);

  const cases = await Promise.all(caseFiles.map(readJson));
  const results = await Promise.all(resultFiles.map(readJson));

  const shapes = [...new Set(cases.map((c) => c.work_shape))];
  const shapeResults = new Map();
  for (const shape of shapes) {
    const shapeCases = cases.filter((c) => c.work_shape === shape);
    const shapeCaseIds = new Set(shapeCases.map((c) => c.case_id));
    const shapeResultCount = results.filter((r) => shapeCaseIds.has(r.case_id)).length;
    shapeResults.set(shape, { cases: shapeCases.length, results: shapeResultCount });
  }

  console.log("## Delegate Eval Coverage\n");
  console.log(`Total cases: ${cases.length}`);
  console.log(`Total results: ${results.length}`);
  console.log(`Valid fixtures: ${validFiles.length}`);
  console.log(`Invalid fixtures: ${invalidFiles.length}`);
  console.log("\nBy work shape:");
  for (const [shape, counts] of [...shapeResults].sort()) {
    console.log(`  ${shape}: ${counts.cases} case(s), ${counts.results} result(s)`);
  }
  console.log();
}

async function skillRevisionCoverage() {
  const resultsDir = path.join(root, "evals/results");
  const skillsRoot = path.join(root, "skills");

  const resultFiles = await jsonFiles(resultsDir);
  const results = await Promise.all(resultFiles.map(readJson));

  const skillResults = new Map();
  for (const result of results) {
    const skill = result.case_id.split(".")[0];
    if (!skillResults.has(skill)) skillResults.set(skill, []);
    skillResults.get(skill).push(result);
  }

  console.log("## Skill Evidence Currency\n");
  for (const [skill, skillResultSet] of [...skillResults].sort()) {
    const revisions = new Set(skillResultSet.map((r) => r.skill_revision));
    console.log(`${skill}:`);
    console.log(`  Results: ${skillResultSet.length}`);
    console.log(`  Distinct revisions: ${revisions.size}`);
    console.log(`  Most recent: ${[...revisions][0]?.slice(0, 12) ?? "none"}`);
  }
  console.log();
}

async function main() {
  console.log("# Coverage Report\n");
  await replayCoverage();
  await delegateCoverage();
  await skillRevisionCoverage();
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
