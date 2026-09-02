#!/usr/bin/env node

// Explicit host runner for feature-spec successor-neutral replays. Never
// invoked by npm test. Writes drafts only; curated evidence is copied into
// evals/results/feature-spec/v2/<date>/ after observation.

import { spawn } from "node:child_process";
import { createHash } from "node:crypto";
import {
  cpSync,
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { execFileSync } from "node:child_process";
import os from "node:os";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const draftsRoot = path.join(root, "evals/fixtures/feature-spec/drafts");
const casesDir = path.join(root, "evals/cases/feature-spec/v2");
const skillDir = path.join(root, "skills/planning/feature-spec");
const HOST_TIMEOUT_MS = 15 * 60 * 1000;

const CASE_FILES = {
  "feature-spec.neutral-authorized-destination": "neutral-authorized-destination.json",
  "feature-spec.neutral-durable-ambiguous-authority": "neutral-durable-ambiguous-authority.json",
  "feature-spec.neutral-short-lived-no-edit-authority": "neutral-short-lived-no-edit-authority.json",
  "feature-spec.neutral-contract-contradiction": "neutral-contract-contradiction.json",
  "feature-spec.neutral-multi-leaf-decomposition": "neutral-multi-leaf-decomposition.json",
};

const HOSTS = {
  "claude-code": {
    label: "Claude Code",
    binary: "claude",
    model: "claude-opus-5",
  },
  codex: {
    label: "Codex",
    binary: "codex",
    model: "gpt-5.6-sol",
  },
};

const USAGE = `Usage: node scripts/run-feature-spec-replay.mjs --host <claude-code|codex> --case <id>

Runs one successor-neutral feature-spec replay in a disposable fixture
repository. Drafts land in evals/fixtures/feature-spec/drafts/.
`;

function parseArgs(argv) {
  const args = { host: null, caseId: null };
  for (let i = 0; i < argv.length; i += 1) {
    const flag = argv[i];
    if (flag === "--host") args.host = argv[++i];
    else if (flag === "--case") args.caseId = argv[++i];
    else throw new Error(`unknown option ${flag}\n${USAGE}`);
  }
  if (!HOSTS[args.host] || !CASE_FILES[args.caseId]) {
    throw new Error(`--host and --case are required and must be known\n${USAGE}`);
  }
  return args;
}

function readJson(filename) {
  return JSON.parse(readFileSync(filename, "utf8"));
}

function sha256Tree(dir) {
  const hash = createHash("sha256");
  const files = [];
  function walk(current) {
    for (const entry of readdirSync(current, { withFileTypes: true }).sort((a, b) =>
      a.name.localeCompare(b.name),
    )) {
      const child = path.join(current, entry.name);
      if (entry.isDirectory()) walk(child);
      else if (entry.isFile()) files.push(child);
    }
  }
  walk(dir);
  for (const filename of files) {
    hash.update(path.relative(dir, filename).split(path.sep).join("/"));
    hash.update("\0");
    hash.update(readFileSync(filename));
    hash.update("\0");
  }
  return hash.digest("hex");
}

function git(cwd, ...args) {
  return execFileSync("git", ["-C", cwd, ...args], { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
}

function trackedRelativePaths(cwd) {
  const out = git(cwd, "ls-files");
  return new Set(out.split("\n").filter(Boolean));
}

function copySkill(target) {
  const destinations = [
    path.join(target, "skills/planning/feature-spec"),
    path.join(target, ".claude/skills/feature-spec"),
    path.join(target, ".codex/skills/feature-spec"),
  ];
  for (const dest of destinations) {
    mkdirSync(path.dirname(dest), { recursive: true });
    cpSync(skillDir, dest, { recursive: true });
  }
}

function promptFor(replayCase) {
  const value = replayCase.input_fixture.value;
  return [
    "Explicit invocation: /feature-spec",
    "",
    "Read and follow skills/planning/feature-spec/SKILL.md and its references.",
    `Compile the settled source in ${value.source} into a Feature Spec.`,
    "",
    "This run is unattended. Do not ask questions. Record unresolved items in the spec.",
    "",
    "Invocation context:",
    `- Artifact lifetime intent: ${value.lifetime}`,
    `- Edit authority: ${value.edit_authority}`,
    `- Destination: ${value.destination}`,
    "",
    "Follow Artifact lifetime exactly. Write a repository file only when edit authority is granted and the destination is an exact path. Do not commit, push, create a pull request, mutate tracker state, or invoke another skill.",
    "",
    "Return the complete Feature Spec in the response even when a file is also written.",
  ].join("\n");
}

function runHost(hostId, cwd, prompt) {
  const host = HOSTS[hostId];
  const argv =
    hostId === "claude-code"
      ? [
          "-p",
          "--dangerously-skip-permissions",
          "--model",
          host.model,
          "--output-format",
          "text",
          prompt,
        ]
      : [
          "exec",
          "--dangerously-bypass-approvals-and-sandbox",
          "-m",
          host.model,
          "-C",
          cwd,
          "--skip-git-repo-check",
          prompt,
        ];
  return new Promise((resolve) => {
    const child = spawn(host.binary, argv, {
      cwd,
      env: process.env,
      stdio: ["ignore", "pipe", "pipe"],
    });
    let stdout = "";
    let stderr = "";
    const timer = setTimeout(() => {
      child.kill("SIGTERM");
    }, HOST_TIMEOUT_MS);
    child.stdout.on("data", (chunk) => {
      stdout += chunk.toString();
    });
    child.stderr.on("data", (chunk) => {
      stderr += chunk.toString();
    });
    child.on("close", (code, signal) => {
      clearTimeout(timer);
      resolve({ code, signal, stdout, stderr });
    });
  });
}

function hasHeading(text, heading) {
  const pattern = new RegExp(`^##\\s+${heading}\\s*$`, "im");
  return pattern.test(text);
}

function hasLabel(text, label) {
  const pattern = new RegExp(`^${label}\\s*:`, "im");
  return pattern.test(text);
}

function namedSuccessor(text) {
  const recommendation = /Recommendation:\s*(implement|relay|dev-backlog(?:\s+shape)?|shape unavailable)\b/i.exec(
    text,
  );
  if (recommendation) return recommendation[1].toLowerCase();
  const route = /(?:^|\n)\s*Route:\s*(implement|relay|dev-backlog(?:\s+shape)?|shape unavailable)\b/i.exec(text);
  if (route) return route[1].toLowerCase();
  return null;
}

function suggestedPath(text) {
  return /docs\/specs\/\d{4}-\d{2}-\d{2}-[A-Za-z0-9-]+\.md/.test(text);
}

function exactContractConflict(text) {
  return (
    /spec\/capabilities\.md/i.test(text) &&
    (/secret-storage/i.test(text) || /Hard Constraints/i.test(text) || /API tokens must remain/i.test(text))
  );
}

function questionCount(text) {
  if (hasHeading(text, "Execution Handoff") || hasHeading(text, "Decomposition Handoff") || hasHeading(text, "Human Decision Handoff")) {
    return 0;
  }
  const matches = text.match(/^\s*(?:\d+\.|[-*])\s+.+\?\s*$/gm) ?? [];
  return matches.length;
}

function observe(replayCase, stdout, fixture, seedHead, seedFiles) {
  const destination = replayCase.input_fixture.value.destination;
  const destPath =
    destination && destination !== "none" && destination !== "unspecified"
      ? path.join(fixture, destination)
      : null;
  const persisted = Boolean(destPath && existsSync(destPath) && statSync(destPath).isFile());
  const persistedText = persisted ? readFileSync(destPath, "utf8") : "";
  const combined = `${stdout}\n${persistedText}`;

  const porcelain = git(fixture, "status", "--porcelain");
  const head = git(fixture, "rev-parse", "HEAD").trim();
  const nowFiles = trackedRelativePaths(fixture);
  const untracked = porcelain
    .split("\n")
    .filter(Boolean)
    .map((line) => line.slice(3));
  const skillPrefixes = ["skills/", ".claude/", ".codex/"];
  const materialUntracked = untracked.filter(
    (rel) => !skillPrefixes.some((prefix) => rel === prefix.slice(0, -1) || rel.startsWith(prefix)),
  );
  const specTouched = materialUntracked.some((rel) => rel.startsWith("spec/")) ||
    porcelain.split("\n").some((line) => line.slice(3).startsWith("spec/"));

  const wroteTrackedChange = porcelain
    .split("\n")
    .filter(Boolean)
    .some((line) => {
      const rel = line.slice(3);
      return !skillPrefixes.some((prefix) => rel === prefix.slice(0, -1) || rel.startsWith(prefix));
    });
  const committed = head !== seedHead;
  const repositoryWrite = wroteTrackedChange || persisted;

  const successor = namedSuccessor(combined);
  let observedRoute = null;
  if (successor) observedRoute = successor;
  else if (hasHeading(combined, "Human Decision Handoff")) observedRoute = "human-decision";
  else if (hasHeading(combined, "Decomposition Handoff")) observedRoute = "decomposition";
  else if (hasHeading(combined, "Execution Handoff")) observedRoute = "execution";

  const fields = [];
  const mark = (name, present) => {
    if (present) fields.push(name);
  };
  mark("Artifact-lifetime", hasHeading(combined, "Artifact lifetime"));
  mark("Execution-Handoff", hasHeading(combined, "Execution Handoff"));
  mark("Decomposition-Handoff", hasHeading(combined, "Decomposition Handoff"));
  mark("Human-Decision-Handoff", hasHeading(combined, "Human Decision Handoff"));
  mark("Durability", hasLabel(combined, "Durability"));
  mark("Isolation", hasLabel(combined, "Isolation"));
  mark("Review", hasLabel(combined, "Review"));
  mark("Current-session-suitability", hasLabel(combined, "Current-session suitability"));
  mark("Suggested-path", suggestedPath(combined));
  mark("Response-body", /#\s*Feature Spec\b/i.test(stdout));
  mark(
    "Persisted-spec-file",
    persisted && /#\s*Feature Spec\b/i.test(persistedText) && hasHeading(persistedText, "Execution Handoff"),
  );
  mark("Unresolved-human-decisions", hasHeading(combined, "Unresolved human decisions"));
  mark("Exact-contract-conflict", exactContractConflict(combined));
  mark("Leaf-boundaries", hasLabel(combined, "Leaf boundaries"));
  mark("Dependency-edges", hasLabel(combined, "Dependency edges"));
  mark("Shared-acceptance-criteria", hasLabel(combined, "Shared acceptance criteria"));

  const sideEffects = [];
  if (repositoryWrite) sideEffects.push("repository_write");
  if (committed) sideEffects.push("commit");

  return {
    observed_output_fields: fields,
    observed_route: observedRoute,
    question_count: questionCount(combined),
    observed_escalation: observedRoute === "human-decision" ? "human-decision-recorded" : "none",
    side_effects: sideEffects,
    persisted,
    persisted_path: persisted ? destination : null,
    spec_touched: specTouched,
    head_unchanged: head === seedHead,
    seed_file_count: seedFiles.size,
    now_tracked_count: nowFiles.size,
    porcelain: porcelain.trim(),
    material_untracked: materialUntracked,
  };
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const replayCase = readJson(path.join(casesDir, CASE_FILES[args.caseId]));
  const fixtureTree = path.join(root, replayCase.input_fixture.value.fixture_tree);
  const stamp = new Date().toISOString().replaceAll(":", "-");
  const work = path.join(os.tmpdir(), `feature-spec-${args.host}-${replayCase.case_id}-${stamp}`);
  mkdirSync(work, { recursive: true });
  cpSync(fixtureTree, work, { recursive: true });
  copySkill(work);
  execFileSync("git", ["init", "-q"], { cwd: work });
  execFileSync("git", ["add", "-A"], { cwd: work });
  execFileSync("git", ["-c", "user.name=fixture", "-c", "user.email=fixture@local", "commit", "-qm", "seed fixture"], {
    cwd: work,
  });
  const seedHead = git(work, "rev-parse", "HEAD").trim();
  const seedFiles = trackedRelativePaths(work);
  const prompt = promptFor(replayCase);
  const started = Date.now();
  const run = await runHost(args.host, work, prompt);
  const elapsedMs = Date.now() - started;
  const observation = observe(replayCase, run.stdout, work, seedHead, seedFiles);

  mkdirSync(draftsRoot, { recursive: true });
  const draftDir = path.join(draftsRoot, `${args.host}-${replayCase.case_id}-${stamp}`);
  mkdirSync(draftDir, { recursive: true });
  writeFileSync(path.join(draftDir, "stdout.txt"), run.stdout);
  writeFileSync(path.join(draftDir, "stderr.txt"), run.stderr);
  const dest = replayCase.input_fixture.value.destination;
  if (dest && dest !== "none" && dest !== "unspecified") {
    const written = path.join(work, dest);
    if (existsSync(written)) {
      mkdirSync(path.join(draftDir, "persisted"), { recursive: true });
      writeFileSync(path.join(draftDir, "persisted", path.basename(dest)), readFileSync(written));
    }
  }
  const summary = {
    case_id: replayCase.case_id,
    host: HOSTS[args.host].label,
    host_id: args.host,
    model: HOSTS[args.host].model,
    skill_revision: sha256Tree(skillDir),
    fixture: work,
    elapsed_ms: elapsedMs,
    exit_code: run.code,
    signal: run.signal,
    ...observation,
  };
  writeFileSync(path.join(draftDir, "observation.json"), `${JSON.stringify(summary, null, 2)}\n`);
  console.log(JSON.stringify({ draft: path.relative(root, draftDir), ...summary, stdout: undefined }, null, 2));
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
