#!/usr/bin/env node

// Explicit host runner for delegate dispatch-contract replays. Never invoked
// by npm test. Writes drafts only; curated evidence is copied into
// evals/results/dispatch/<date>/ after observation.

import { spawn } from "node:child_process";
import { createHash } from "node:crypto";
import { chmodSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const caller = path.join(root, "evals/fixtures/dispatch/caller");
const fakeCli = path.join(root, "evals/fixtures/dispatch/fake-cli.mjs");
const draftsRoot = path.join(root, "evals/fixtures/dispatch/drafts");
const casesDir = path.join(root, "evals/cases/dispatch");

const CASE_FILES = {
  "delegate.dispatch.success": "success.json",
  "delegate.dispatch.empty-output": "empty-output.json",
  "delegate.dispatch.fatal-stderr-then-hang": "fatal-stderr-then-hang.json",
};

const MODES = {
  "delegate.dispatch.success": "success",
  "delegate.dispatch.empty-output": "empty",
  "delegate.dispatch.fatal-stderr-then-hang": "hang",
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

const BLOCKED_PROVIDERS = ["opencode", "pi", "agent", "cline", "cursor"];
const PROMPT = "Reply with exactly: DISPATCH_REPLAY_OK";
const SENTINEL = "DISPATCH_REPLAY_OK";
const HOST_TIMEOUT_MS = 15 * 60 * 1000;

const USAGE = `Usage: node scripts/run-dispatch-replay.mjs --host <claude-code|codex> --case <id> [--dry-run]

Runs one credential-free dispatch-contract replay. The fake CLI stands in for
the provider. Drafts land in evals/fixtures/dispatch/drafts/.
`;

function parseArgs(argv) {
  const args = { host: null, caseId: null, dryRun: false };
  for (let i = 0; i < argv.length; i += 1) {
    const flag = argv[i];
    if (flag === "--host") args.host = argv[++i];
    else if (flag === "--case") args.caseId = argv[++i];
    else if (flag === "--dry-run") args.dryRun = true;
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

function sha256File(filename) {
  return createHash("sha256").update(readFileSync(filename)).digest("hex");
}

function hostPrompt(replayCase) {
  const skill = path.join(root, "skills/productivity/delegate/SKILL.md");
  const invocations = path.join(root, "skills/productivity/delegate/references/cli-invocations.md");
  const guardrails = path.join(root, "skills/productivity/delegate/references/dispatch-guardrails.md");
  return [
    "You are running a credential-free dispatch contract replay for the delegate skill.",
    "Read and follow these files:",
    `- ${skill}`,
    `- ${invocations}`,
    `- ${guardrails}`,
    "",
    "Then execute exactly this request. Do not edit the quoted prompt:",
    replayCase.input_fixture.value.request,
    "",
    `The hard deadline is ${replayCase.dispatch_contract.deadline_seconds} seconds and applies only to the reasonix child, not to your own reading time.`,
    "",
    "Constraints:",
    "- The only allowed child CLI is `reasonix` from PATH. It is a fake fixture in this replay.",
    "- Do not invoke claude, codex, opencode, pi, cursor, agent, cline, or any networked provider.",
    "- Build argv per the reasonix row in cli-invocations.md. The quoted prompt is one unchanged argv element and must be last.",
    "- Run the child in this process's current working directory. Connect stdin to DEVNULL.",
    "- Apply dispatch-guardrails.md: bound the child; treat a definitive provider error on stderr as terminal and report dispatch_cli_error immediately; a zero exit with empty extracted and raw stdout is dispatch_empty_output, never an empty answer.",
    "- Do not write repository files. Do not commit.",
    "",
    "When finished, reply with this compact block and nothing else:",
    "RESOLVED_ROUTE: <route>",
    "RESOLVED_MODEL: <model>",
    "RESOLVED_EFFORT: <effort>",
    "OUTCOME: success | dispatch_empty_output | dispatch_cli_error | dispatch_timeout | other",
    "OUTPUT: <sentinel or empty>",
    "FAILURE_CODE: <code or empty>",
    "ELAPSED_MS: <integer>",
    "TERMINATED_ON_STDERR: yes | no",
  ].join("\n");
}

function writeShim(binDir, name, body) {
  const filename = path.join(binDir, name);
  writeFileSync(filename, body);
  chmodSync(filename, 0o755);
}

function setupRun(runDir, replayCase) {
  const binDir = path.join(runDir, "bin");
  mkdirSync(binDir, { recursive: true });
  const configPath = path.join(runDir, "config.json");
  const logPath = path.join(runDir, "fake-cli.jsonl");
  const config = {
    mode: MODES[replayCase.case_id],
    expected_cwd: caller,
    log: logPath,
    argv0: "reasonix",
  };
  writeFileSync(configPath, `${JSON.stringify(config, null, 2)}\n`);
  writeShim(
    binDir,
    "reasonix",
    `#!/usr/bin/env bash
export DISPATCH_REPLAY_CONFIG=${JSON.stringify(configPath)}
exec node ${JSON.stringify(fakeCli)} "$@"
`,
  );
  for (const name of BLOCKED_PROVIDERS) {
    writeShim(
      binDir,
      name,
      `#!/usr/bin/env bash
echo "dispatch-replay: blocked live provider ${name}" >&2
exit 78
`,
    );
  }
  return { binDir, configPath, logPath };
}

function hostArgv(hostId, prompt) {
  if (hostId === "claude-code") {
    return [
      "claude",
      "-p",
      prompt,
      "--permission-mode",
      "bypassPermissions",
      "--dangerously-skip-permissions",
      "--model",
      HOSTS[hostId].model,
      "--output-format",
      "text",
      "--add-dir",
      root,
    ];
  }
  return [
    "codex",
    "exec",
    "--dangerously-bypass-approvals-and-sandbox",
    "--skip-git-repo-check",
    "--ephemeral",
    "-C",
    caller,
    "--add-dir",
    root,
    "-m",
    HOSTS[hostId].model,
    "-c",
    "shell_environment_policy.inherit=all",
    prompt,
  ];
}

function runProcess(argv, options) {
  return new Promise((resolve) => {
    const child = spawn(argv[0], argv.slice(1), {
      cwd: options.cwd,
      env: options.env,
      stdio: ["ignore", "pipe", "pipe"],
    });
    let stdout = "";
    let stderr = "";
    child.stdout.on("data", (chunk) => {
      stdout += chunk;
    });
    child.stderr.on("data", (chunk) => {
      stderr += chunk;
    });
    const timer = setTimeout(() => {
      child.kill("SIGTERM");
      setTimeout(() => child.kill("SIGKILL"), 10_000);
    }, options.timeoutMs);
    child.on("close", (code, signal) => {
      clearTimeout(timer);
      resolve({ code, signal, stdout, stderr });
    });
  });
}

function parseHostReport(text) {
  const pick = (name) => {
    const match = text.match(new RegExp(`^${name}:\\s*(.*)$`, "mi"));
    return match ? match[1].trim() : "";
  };
  const outcome = pick("OUTCOME") || null;
  const output = pick("OUTPUT");
  const failure = pick("FAILURE_CODE");
  return {
    resolved_route: pick("RESOLVED_ROUTE") || null,
    resolved_model: pick("RESOLVED_MODEL") || null,
    resolved_effort: pick("RESOLVED_EFFORT") || null,
    outcome: outcome || null,
    output: output || null,
    failure_code: failure || null,
    elapsed_ms: Number.parseInt(pick("ELAPSED_MS"), 10),
    terminated_on_stderr: /^yes$/i.test(pick("TERMINATED_ON_STDERR")),
  };
}

function inferOutcome(replayCase, report, fakeRecord) {
  if (report.outcome === "success" || report.outcome === "dispatch_empty_output" || report.outcome === "dispatch_cli_error") {
    return report.outcome;
  }
  if (report.failure_code === "dispatch_empty_output" || report.failure_code === "dispatch_cli_error") {
    return report.failure_code;
  }
  if (replayCase.case_id === "delegate.dispatch.success" && (report.output === SENTINEL || fakeRecord?.mode === "success")) {
    return report.output === SENTINEL ? "success" : null;
  }
  return report.outcome;
}

function readFakeRecord(logPath) {
  try {
    const lines = readFileSync(logPath, "utf8")
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => JSON.parse(line));
    const dispatched = [...lines].reverse().find((line) => !line.meta && (line.argv ?? []).includes(PROMPT));
    return dispatched ?? lines.at(-1) ?? null;
  } catch {
    return null;
  }
}

function elapsedMs(record, report) {
  if (record?.started_at) {
    const endStamp = record.ended_at ?? record.last_seen;
    const end = endStamp ? Date.parse(endStamp) : Date.now();
    const start = Date.parse(record.started_at);
    if (Number.isFinite(start) && Number.isFinite(end) && end >= start) return end - start;
  }
  if (Number.isInteger(report.elapsed_ms) && report.elapsed_ms >= 0) return report.elapsed_ms;
  return 0;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const replayCase = readJson(path.join(casesDir, CASE_FILES[args.caseId]));
  const prompt = hostPrompt(replayCase);
  const hostCommand = hostArgv(args.host, prompt);
  if (args.dryRun) {
    console.log(JSON.stringify({ host: args.host, case_id: args.caseId, argv: hostCommand, cwd: caller }, null, 2));
    return;
  }

  const stamp = new Date().toISOString().replaceAll(":", "-");
  const runDir = path.join(draftsRoot, `${stamp}-${args.host}-${args.caseId}`);
  mkdirSync(runDir, { recursive: true });
  const { binDir, logPath } = setupRun(runDir, replayCase);
  writeFileSync(path.join(runDir, "prompt.txt"), prompt);

  const started = Date.now();
  const host = await runProcess(hostCommand, {
    cwd: caller,
    env: { ...process.env, PATH: `${binDir}${path.delimiter}${process.env.PATH}` },
    timeoutMs: HOST_TIMEOUT_MS,
  });
  const wallMs = Date.now() - started;
  writeFileSync(path.join(runDir, "host.stdout.txt"), host.stdout);
  writeFileSync(path.join(runDir, "host.stderr.txt"), host.stderr);

  const report = parseHostReport(host.stdout);
  const fakeRecord = readFakeRecord(logPath);
  const deadlineMs = replayCase.dispatch_contract.deadline_seconds * 1000;
  const elapsed = elapsedMs(fakeRecord, report);
  const argv = fakeRecord?.argv ?? [];
  const modelFromArgv = argv.includes("-m") ? argv[argv.indexOf("-m") + 1] : null;
  const effortFromArgv = argv.includes("--effort") ? argv[argv.indexOf("--effort") + 1] : null;
  const observation = {
    host_dispatched: Boolean(fakeRecord && argv.includes(PROMPT)),
    fake_cli_revision: sha256File(fakeCli),
    resolved_route:
      argv[0] && modelFromArgv ? `${argv[0]}/${modelFromArgv}` : report.resolved_route || replayCase.expected_route,
    resolved_model: modelFromArgv || report.resolved_model || replayCase.dispatch_contract.expected_model,
    resolved_effort: effortFromArgv || report.resolved_effort || replayCase.dispatch_contract.expected_effort,
    argv: fakeRecord?.argv ?? [],
    cwd: fakeRecord?.cwd ?? "other",
    stdin: fakeRecord?.stdin ?? "other",
    elapsed_ms: elapsed,
    terminated_before_deadline: elapsed > 0 && elapsed < deadlineMs,
    outcome: inferOutcome(replayCase, report, fakeRecord),
    output:
      inferOutcome(replayCase, report, fakeRecord) === "success"
        ? report.output === SENTINEL
          ? SENTINEL
          : host.stdout.includes(SENTINEL)
            ? SENTINEL
            : report.output
        : null,
  };

  const draft = {
    run_dir: path.relative(root, runDir).split(path.sep).join("/"),
    host: HOSTS[args.host].label,
    host_id: args.host,
    host_exit: { code: host.code, signal: host.signal, wall_ms: wallMs },
    report,
    fake_record: fakeRecord,
    dispatch_observation: observation,
  };
  writeFileSync(path.join(runDir, "draft.json"), `${JSON.stringify(draft, null, 2)}\n`);
  console.log(JSON.stringify(draft, null, 2));
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
