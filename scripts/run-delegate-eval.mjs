#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const base = path.join(root, "evals/delegate");
const locations = {
  cases: path.join(base, "cases"),
  registry: path.join(base, "executors.json"),
  drafts: path.join(base, "drafts"),
};

const USAGE = `Usage: node scripts/run-delegate-eval.mjs --cases <id,...> --profiles <id,...> [options]

Runs an explicitly selected subset of delegate evaluation cases. Never runs
everything implicitly, never fails on a missing provider CLI (it skips), and
never writes into evals/delegate/results/ — drafts land in evals/delegate/drafts/
for manual assessment and curation.

Options:
  --cases <id,...>       committed case ids to run (required)
  --profiles <id,...>    profile ids to run where a selected case declares them (required)
  --dry-run              print resolved dispatch argv without spawning anything
  --smoke                availability + live model list + effort support only; no dispatch
  --timeout-minutes <n>  hard deadline per dispatch (default 30)
`;

function parseArgs(argv) {
  const args = { cases: [], profiles: [], dryRun: false, smoke: false, timeoutMinutes: 30 };
  for (let i = 0; i < argv.length; i += 1) {
    const flag = argv[i];
    if (flag === "--cases") args.cases = (argv[++i] ?? "").split(",").filter(Boolean);
    else if (flag === "--profiles") args.profiles = (argv[++i] ?? "").split(",").filter(Boolean);
    else if (flag === "--dry-run") args.dryRun = true;
    else if (flag === "--smoke") args.smoke = true;
    else if (flag === "--timeout-minutes") args.timeoutMinutes = Number(argv[++i]);
    else throw new Error(`unknown option ${flag}\n${USAGE}`);
  }
  if (args.cases.length === 0 || args.profiles.length === 0) {
    throw new Error(`--cases and --profiles are both required and explicit\n${USAGE}`);
  }
  if (!Number.isFinite(args.timeoutMinutes) || args.timeoutMinutes <= 0) {
    throw new Error("--timeout-minutes must be a positive finite number");
  }
  return args;
}

async function readJson(filename) {
  return JSON.parse(await readFile(filename, "utf8"));
}

async function loadCases() {
  const entries = await readdir(locations.cases, { withFileTypes: true });
  const cases = [];
  for (const entry of entries) {
    if (entry.isFile() && entry.name.endsWith(".json")) {
      cases.push(await readJson(path.join(locations.cases, entry.name)));
    }
  }
  return cases;
}

function selectRuns(cases, args) {
  const byId = new Map(cases.map((candidate) => [candidate.case_id, candidate]));
  const unknown = args.cases.filter((id) => !byId.has(id));
  if (unknown.length > 0) throw new Error(`unknown case id(s): ${unknown.join(", ")}`);
  const runs = [];
  for (const caseId of args.cases) {
    const evalCase = byId.get(caseId);
    for (const profile of evalCase.candidate_profiles) {
      if (args.profiles.includes(profile.profile_id)) runs.push({ evalCase, profile });
    }
  }
  if (runs.length === 0) {
    throw new Error("selection matched no (case, profile) combination; check --profiles against the cases' candidate_profiles");
  }
  return runs;
}

function resolveExecutor(registry, model) {
  const matches = registry.executors.filter((executor) => executor.match_models.includes(model));
  if (matches.length !== 1) {
    throw new Error(`model ${JSON.stringify(model)} must match exactly one executor, matched ${matches.length}`);
  }
  return matches[0];
}

function privacyError(evalCase, executor) {
  const privacy = evalCase.privacy;
  if (!["internal", "private"].includes(privacy.sensitivity)) return null;
  if (privacy.approved_routes.includes(executor.executor_id)) return null;
  return `${evalCase.case_id}: route ${executor.executor_id} is not approved for ${privacy.sensitivity} fixtures`;
}

function buildPrompt(evalCase) {
  const fixture = evalCase.fixture;
  if (fixture.kind === "inline") {
    const context = fixture.value.context ? `\n\nContext: ${fixture.value.context}` : "";
    return `${fixture.value.request}${context}`;
  }
  return `Execute the task described in the repository file ${fixture.value}.`;
}

function buildArgv(executor, profile) {
  const argv = executor.dispatch.map((token) => token.replaceAll("{model}", profile.model));
  if (profile.effort !== null) {
    argv.push(...executor.effort_argv.map((token) => token.replaceAll("{effort}", profile.effort)));
  }
  return argv;
}

function probe(argv) {
  const result = spawnSync(argv[0], argv.slice(1), {
    encoding: "utf8",
    timeout: 30_000,
    stdio: ["ignore", "pipe", "pipe"],
  });
  if (result.error || result.status !== 0) return null;
  return result.stdout.trim();
}

function smokeProfile(executor, profile) {
  const version = probe(executor.availability);
  if (version === null) return `unavailable — ${executor.availability[0]} did not answer`;
  const findings = [`available (${version.split("\n")[0]})`];
  if (executor.list_models === null) {
    findings.push("model id unverified — CLI exposes no model list");
  } else {
    const listing = probe(executor.list_models);
    if (listing === null) findings.push("model list command failed — model id unverified");
    else if (listing.includes(profile.model)) findings.push("model id present in live list");
    else findings.push(`model id NOT in live list — verify before paid runs`);
  }
  if (profile.effort === null) findings.push("effort: CLI default");
  else if (executor.supported_efforts === null) findings.push(`effort ${profile.effort} unverified — no static support data`);
  else if (executor.supported_efforts.includes(profile.effort)) findings.push(`effort ${profile.effort} supported`);
  else findings.push(`effort ${profile.effort} NOT supported by ${executor.executor_id}`);
  return findings.join("; ");
}

function draftResult(run, executor, outcome) {
  return {
    contract_version: "delegate-eval-v1",
    case_id: run.evalCase.case_id,
    profile_id: run.profile.profile_id,
    model: run.profile.model,
    effort: run.profile.effort,
    observation_date: new Date().toISOString().slice(0, 10),
    executor: { name: executor.executor_id, version: outcome.version ?? "unknown" },
    status: outcome.status,
    acceptance_results: run.evalCase.acceptance_checks.map((check) => ({
      check_id: check.check_id,
      status: "not_run",
      evidence: "Pending manual assessment against the recorded output.",
    })),
    measurements: {
      wall_clock_seconds: outcome.wallClockSeconds ?? null,
      tokens: { input: null, output: null, reasoning: null },
      cost: { api_usd: null, quota_note: null },
      reviewer_defects: null,
      followup_corrections: null,
    },
    evidence_note: outcome.note,
  };
}

function dispatch(run, executor, timeoutMinutes) {
  const version = probe(executor.availability);
  if (version === null) {
    return { status: "skipped", version: null, note: `Skipped: ${executor.availability[0]} unavailable or unauthenticated.` };
  }
  const argv = [...buildArgv(executor, run.profile), buildPrompt(run.evalCase)];
  const started = Date.now();
  const result = spawnSync(argv[0], argv.slice(1), {
    encoding: "utf8",
    timeout: timeoutMinutes * 60_000,
    killSignal: "SIGTERM",
    stdio: ["ignore", "pipe", "pipe"],
    maxBuffer: 16 * 1024 * 1024,
  });
  const wallClockSeconds = Math.round((Date.now() - started) / 1000);
  if (result.error?.code === "ETIMEDOUT") {
    return { status: "failed", version, wallClockSeconds, note: `dispatch_timeout after ${timeoutMinutes} minute(s); a timed-out run may already have spent provider credits — do not auto-retry.`, stdout: result.stdout, stderr: result.stderr };
  }
  if (result.status !== 0) {
    return { status: "failed", version, wallClockSeconds, note: `Dispatch exited ${result.status}.`, stdout: result.stdout, stderr: result.stderr };
  }
  return { status: "completed", version, wallClockSeconds, note: `Dispatch exited 0 in ${wallClockSeconds}s; output captured for manual assessment.`, stdout: result.stdout, stderr: result.stderr };
}

function writeDraft(run, executor, outcome) {
  const stamp = new Date().toISOString().replaceAll(":", "-").slice(0, 19);
  const dir = path.join(locations.drafts, stamp.slice(0, 10));
  mkdirSync(dir, { recursive: true });
  const slug = `${run.evalCase.case_id}.${run.profile.profile_id}.${stamp}`;
  writeFileSync(path.join(dir, `${slug}.json`), `${JSON.stringify(draftResult(run, executor, outcome), null, 2)}\n`);
  if (outcome.stdout !== undefined) {
    writeFileSync(path.join(dir, `${slug}.stdout.txt`), outcome.stdout ?? "");
    writeFileSync(path.join(dir, `${slug}.stderr.txt`), outcome.stderr ?? "");
  }
  return path.relative(root, path.join(dir, `${slug}.json`));
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const registry = await readJson(locations.registry);
  const runs = selectRuns(await loadCases(), args);

  for (const run of runs) {
    const executor = resolveExecutor(registry, run.profile.model);
    const violation = privacyError(run.evalCase, executor);
    if (violation) throw new Error(violation);
    const label = `${run.evalCase.case_id} × ${run.profile.profile_id} [${executor.executor_id}]`;
    if (args.dryRun) {
      console.log(`DRY ${label}: ${[...buildArgv(executor, run.profile), "<prompt>"].join(" ")}`);
    } else if (args.smoke) {
      console.log(`SMOKE ${label}: ${smokeProfile(executor, run.profile)}`);
    } else {
      console.log(`RUN ${label} (deadline ${args.timeoutMinutes}m)...`);
      const outcome = dispatch(run, executor, args.timeoutMinutes);
      const draft = writeDraft(run, executor, outcome);
      console.log(`  ${outcome.status}: ${outcome.note}`);
      console.log(`  draft: ${draft}`);
    }
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
