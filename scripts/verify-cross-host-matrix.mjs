#!/usr/bin/env node

import { readFile, readdir, stat } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const args = process.argv.slice(2);
const requiredOnly = args.includes("--required");
const selfTest = args.includes("--selftest");
const unknownFlags = args.filter((argument) => argument !== "--required" && argument !== "--selftest");
if (unknownFlags.length > 0) throw new Error(`Unknown argument(s): ${unknownFlags.join(", ")}`);

const expectedHosts = ["Claude Code", "Codex", "OpenCode", "Cursor", "Pi"];
const requiredHosts = new Set(["Claude Code", "Codex"]);
const validStatuses = new Set(["pass", "fail", "unverified"]);
const canonicalCases = Object.freeze([
  { requirement: 1, case_id: "bs.vague-feature", path: "evals/cases/brainstorming.vague-feature.json" },
  { requirement: 2, case_id: "bs.clear-low-risk", path: "evals/cases/brainstorming.clear-low-risk.json" },
  { requirement: 3, case_id: "feature-spec.design-handoff", path: "evals/cases/feature-spec/design-handoff.json" },
  { requirement: 4, case_id: "feature-spec.tracker-task-ac-preservation", path: "evals/cases/feature-spec/tracker-task-ac-preservation.json" },
  { requirement: 5, case_id: "feature-spec.decomposition-shape-unavailable", path: "evals/cases/feature-spec/decomposition-shape-unavailable.json" },
  { requirement: 6, case_id: "implement.localized-safe", path: "evals/cases/implement/localized-safe.json" },
  { requirement: 7, case_id: "implement.dependent-units", path: "evals/cases/implement/dependent-units.json" },
  { requirement: 8, case_id: "implement.independent-isolated", path: "evals/cases/implement/independent-isolated.json" },
  { requirement: 9, case_id: "implement.shared-schema-serializes", path: "evals/cases/implement/shared-schema-serializes.json" },
  { requirement: 10, case_id: "implement.high-risk-relay", path: "evals/cases/implement/high-risk-relay.json" },
  { requirement: 11, case_id: "implement.worker-unavailable-degrades", path: "evals/cases/implement/worker-unavailable-degrades.json" },
  { requirement: 12, case_id: "implement.worker-partial-failure", path: "evals/cases/implement/worker-partial-failure.json" },
].map((entry) => Object.freeze(entry)));

// Hygiene patterns applied to every committed result field, the report, and fixtures.
const machinePathPattern = /(?:\/Users\/|\/home\/[A-Za-z]|\/private\/var\/folders\/|\/tmp\/[A-Za-z0-9]|[A-Za-z]:\\Users\\)/;
// Credential-like VALUES (long key runs / assigned tokens), not kebab-case identifiers.
const credentialPattern = /(?:sk-[A-Za-z0-9]{20,}|sk-(?:proj|svcacct|admin)-[A-Za-z0-9_-]{20,}|gh[pousr]_[A-Za-z0-9]{20,}|xox[baprs]-[A-Za-z0-9-]{12,}|AKIA[0-9A-Z]{16}|eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{6,}|Bearer\s+[A-Za-z0-9._~+/-]{16,}|-----BEGIN [A-Z ]*PRIVATE KEY-----|(?:access|refresh|api|secret)[_-]?(?:token|key)"?\s*[:=]\s*"?[A-Za-z0-9._-]{12,})/i;
// Host CLI transcript signals that must never appear in ANY committed file.
const hostTranscriptPattern = /(?:"type"\s*:\s*"tool_use"|"role"\s*:\s*"assistant"|\bstream-json\b|"stop_reason"\s*:|"num_turns"\s*:|"session_id"\s*:|"thread_id"\s*:|thread\.started|turn\.completed)/i;
// Raw artifact/question delimiters: leakage in a result or report, but the answer
// script fixture legitimately defines them as its response protocol.
const artifactDelimiterPattern = /(?:===\s*ARTIFACT\s*===|===\s*QUESTIONS\s*===)/i;

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

async function fileExists(absolute) {
  try {
    const info = await stat(absolute);
    return info.isFile() && info.size > 0;
  } catch {
    return false;
  }
}

// Load everything the validator needs into a plain in-memory context so the same
// pure validation runs against real inputs and against deliberately mutated clones.
async function loadContext() {
  const matrix = JSON.parse(await readFile(path.join(root, "evals/fixtures/cross-host/matrix.json"), "utf8"));
  const cases = [];
  for (const entry of matrix.required_cases) {
    const replayCase = JSON.parse(await readFile(path.join(root, entry.path), "utf8"));
    cases.push({ entry, replayCase });
  }
  const resultsRoot = path.join(root, "evals/results/cross-host");
  const results = [];
  for (const filename of await jsonFiles(resultsRoot)) {
    const text = await readFile(filename, "utf8");
    results.push({ relative: path.relative(root, filename), text, json: JSON.parse(text) });
  }
  const reportRelative = matrix.report ?? `evals/reports/${matrix.execution_date}-epic-8-cross-host.md`;
  const reportPresent = await fileExists(path.join(root, reportRelative));
  const reportText = reportPresent ? await readFile(path.join(root, reportRelative), "utf8") : "";
  const fixtures = [];
  for (const rel of ["evals/fixtures/cross-host/answer-script.md", "evals/fixtures/cross-host/matrix.json"]) {
    fixtures.push({ relative: rel, text: await readFile(path.join(root, rel), "utf8") });
  }
  return { matrix, cases, results, reportRelative, reportPresent, reportText, fixtures };
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

function scanHygiene(label, text, errors, { allowArtifactDelimiters = false } = {}) {
  if (machinePathPattern.test(text)) errors.push(`${label}: contains a machine-specific path`);
  if (credentialPattern.test(text)) errors.push(`${label}: contains credential-like material`);
  if (hostTranscriptPattern.test(text)) errors.push(`${label}: contains a raw transcript marker`);
  if (!allowArtifactDelimiters && artifactDelimiterPattern.test(text)) {
    errors.push(`${label}: contains a raw transcript marker`);
  }
}

function collectErrors(ctx) {
  const { matrix, cases: caseList, results, reportRelative, reportPresent } = ctx;
  const errors = [];

  // Frozen matrix shape.
  if (!/^[0-9a-f]{40}$/.test(matrix.base_sha)) errors.push("matrix base_sha must be an exact SHA");
  if (!same(matrix.required_hosts, expectedHosts)) errors.push("matrix hosts differ from the canonical five-host order");
  if (matrix.required_cases.length !== 12) errors.push(`expected 12 cases, found ${matrix.required_cases.length}`);
  if (!same(matrix.required_cases, canonicalCases)) {
    errors.push("matrix required_cases must exactly match the ordered canonical 12-case contract");
  }

  // Revision contract: an exact, documented value tied to base_sha (no unchecked suffix).
  if (matrix.expected_skill_revision !== matrix.base_sha) {
    errors.push("matrix expected_skill_revision must equal base_sha exactly");
  }

  // Required report must be the exact dated file tied to execution_date, and must exist.
  const datedReport = `evals/reports/${matrix.execution_date}-epic-8-cross-host.md`;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(matrix.execution_date ?? "")) errors.push("matrix execution_date must be an ISO date");
  if (reportRelative !== datedReport) errors.push(`matrix report must be the dated ${datedReport}, found ${reportRelative}`);
  if (!reportPresent) errors.push(`required report ${reportRelative} is missing or empty`);

  const cases = new Map();
  for (const [index, { entry, replayCase }] of caseList.entries()) {
    if (entry.requirement !== index + 1) errors.push(`case ${entry.case_id} has non-canonical requirement number`);
    if (cases.has(entry.case_id)) errors.push(`duplicate matrix case ${entry.case_id}`);
    if (replayCase.case_id !== entry.case_id) errors.push(`${entry.path} declares ${replayCase.case_id}`);
    cases.set(entry.case_id, replayCase);
  }

  const expectedCount = expectedHosts.length * cases.size;
  if (results.length !== expectedCount) errors.push(`expected exactly ${expectedCount} result files, found ${results.length}`);

  const pairs = new Map();
  for (const { relative, text, json: result } of results) {
    const key = `${result.host}\u0000${result.case_id}`;
    if (pairs.has(key)) errors.push(`duplicate result ${result.host} / ${result.case_id}`);
    pairs.set(key, result);
    if (!expectedHosts.includes(result.host)) errors.push(`${relative}: unexpected host ${result.host}`);
    if (!cases.has(result.case_id)) errors.push(`${relative}: unexpected case ${result.case_id}`);
    const expectedPath = path.join("evals/results/cross-host", slug(result.host), `${result.case_id}.json`);
    if (relative !== expectedPath) errors.push(`${relative}: expected path ${expectedPath}`);
    if (!validStatuses.has(result.status)) errors.push(`${relative}: invalid status ${JSON.stringify(result.status)}`);
    if (result.skill_revision !== matrix.expected_skill_revision) {
      errors.push(`${relative}: skill_revision must equal the frozen ${matrix.expected_skill_revision}`);
    }
    // Hygiene scan over every committed field of the result, not just evidence_note.
    scanHygiene(relative, text, errors);
  }

  // Hygiene scan of the report and committed fixtures. The answer script is the
  // one file allowed to contain the artifact/question delimiter templates it defines.
  scanHygiene(reportRelative, ctx.reportText, errors);
  for (const { relative, text } of ctx.fixtures) {
    scanHygiene(relative, text, errors, { allowArtifactDelimiters: relative.endsWith("answer-script.md") });
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

  return errors;
}

// Deterministic negative self-tests: clone the real context, apply one targeted
// mutation, and assert the validator rejects it with the expected message.
function clone(ctx) {
  return {
    matrix: JSON.parse(JSON.stringify(ctx.matrix)),
    cases: ctx.cases.map(({ entry, replayCase }) => ({ entry, replayCase })),
    results: ctx.results.map((r) => ({ relative: r.relative, text: r.text, json: JSON.parse(JSON.stringify(r.json)) })),
    reportRelative: ctx.reportRelative,
    reportPresent: ctx.reportPresent,
    reportText: ctx.reportText,
    fixtures: ctx.fixtures.map((f) => ({ ...f })),
  };
}

function runSelfTests(baseCtx) {
  const baseline = collectErrors(baseCtx);
  const failures = [];
  if (baseline.length > 0) failures.push(`baseline is not clean:\n  ${baseline.join("\n  ")}`);

  const checks = [
    {
      name: "missing report",
      mutate: (c) => { c.reportPresent = false; c.reportText = ""; },
      expect: /report .* is missing/,
    },
    {
      name: "revision mismatch",
      mutate: (c) => { c.results[0].json.skill_revision = `${c.matrix.base_sha}+drift`; },
      expect: /skill_revision must equal the frozen/,
    },
    {
      name: "invalid optional status",
      mutate: (c) => {
        const row = c.results.find((r) => !requiredHosts.has(r.json.host));
        row.json.status = "skipped";
      },
      expect: /invalid status/,
    },
    {
      name: "machine path leak",
      mutate: (c) => { c.results[0].text = c.results[0].text.replace("Raw artifacts", "/Users/leak/x Raw artifacts"); },
      expect: /machine-specific path/,
    },
    {
      name: "credential leak",
      mutate: (c) => { c.results[0].text = c.results[0].text.replace("Raw artifacts", "sk-abcdefghijklmno0123456789 Raw artifacts"); },
      expect: /credential-like material/,
    },
    {
      name: "raw artifact delimiter leak in a result",
      mutate: (c) => { c.results[0].text = c.results[0].text.replace("Raw artifacts", "===ARTIFACT=== Raw artifacts"); },
      expect: /raw transcript marker/,
    },
    {
      name: "host transcript signal leak in the report",
      mutate: (c) => { c.reportText = `${c.reportText}\n"stop_reason": "end_turn"\n`; },
      expect: /raw transcript marker/,
    },
    {
      name: "canonical case substitution",
      mutate: (c) => {
        c.matrix.required_cases[0] = {
          requirement: 1,
          case_id: "bs.substituted-case",
          path: "evals/cases/brainstorming.substituted-case.json",
        };
      },
      expect: /ordered canonical 12-case contract/,
    },
    {
      name: "canonical case omission",
      mutate: (c) => { c.matrix.required_cases.splice(4, 1); },
      expect: /ordered canonical 12-case contract/,
    },
    {
      name: "canonical case reordering",
      mutate: (c) => {
        [c.matrix.required_cases[7], c.matrix.required_cases[8]] =
          [c.matrix.required_cases[8], c.matrix.required_cases[7]];
      },
      expect: /ordered canonical 12-case contract/,
    },
  ];

  for (const check of checks) {
    const mutated = clone(baseCtx);
    check.mutate(mutated);
    const errors = collectErrors(mutated);
    if (!errors.some((message) => check.expect.test(message))) {
      failures.push(`self-test "${check.name}" did not trigger ${check.expect}; got: ${errors.join(" | ") || "(no errors)"}`);
    }
  }
  return failures;
}

const ctx = await loadContext();

if (selfTest) {
  const failures = runSelfTests(ctx);
  if (failures.length > 0) {
    console.error(failures.join("\n"));
    process.exitCode = 1;
  } else {
    console.log("Self-tests passed: clean baseline plus 10 negative rejections, including canonical case substitution, omission, and reordering drift.");
  }
} else {
  const errors = collectErrors(ctx);
  if (errors.length > 0) {
    console.error(errors.join("\n"));
    process.exitCode = 1;
  } else if (requiredOnly) {
    console.log("Required matrix complete: Claude Code and Codex pass all 24 canonical host/case rows.");
  } else {
    console.log("Cross-host matrix complete: exactly 60 unique canonical rows; required hosts pass all 12 cases each.");
  }
}
