#!/usr/bin/env node

// Controlled fake provider CLI for delegate dispatch-contract replays.
// Records argv/cwd/stdin, then succeeds, returns empty, or prints a
// definitive stderr error and hangs. Never talks to a network.

import { appendFileSync, readFileSync, readlinkSync, writeFileSync } from "node:fs";
import path from "node:path";
import process from "node:process";

const FATAL_STDERR = "Error: 429 Monthly usage limit reached. Resets in 13 days.";
const SENTINEL = "DISPATCH_REPLAY_OK";

function loadConfig() {
  const filename = process.env.DISPATCH_REPLAY_CONFIG;
  if (!filename) throw new Error("DISPATCH_REPLAY_CONFIG is required");
  return JSON.parse(readFileSync(filename, "utf8"));
}

function classifyStdin() {
  try {
    const target = readlinkSync("/proc/self/fd/0");
    if (target === "/dev/null") return "devnull";
    if (target.startsWith("pipe:") || target.startsWith("socket:")) return "piped";
    if (process.stdin.isTTY) return "tty";
    return "other";
  } catch {
    if (process.stdin.isTTY) return "tty";
    return "other";
  }
}

function classifyCwd(expectedCwd) {
  return path.resolve(process.cwd()) === path.resolve(expectedCwd) ? "caller" : "other";
}

function receivedArgv(argv0) {
  return [argv0, ...process.argv.slice(2)];
}

function writeLog(filename, record) {
  writeFileSync(filename, `${JSON.stringify(record)}\n`);
}

function appendLog(filename, record) {
  appendFileSync(filename, `${JSON.stringify(record)}\n`);
}

function isMetaInvocation(argv) {
  const rest = argv.slice(1);
  if (rest.length === 0) return true;
  return rest.every((token) => token === "models" || token === "--help" || token === "-h");
}

async function hangUntilKilled() {
  await new Promise(() => {});
}

async function main() {
  const config = loadConfig();
  const argv0 = config.argv0 ?? "reasonix";
  const argv = receivedArgv(argv0);
  const startedAt = new Date().toISOString();
  const record = {
    argv,
    cwd: classifyCwd(config.expected_cwd),
    stdin: classifyStdin(),
    mode: config.mode,
    started_at: startedAt,
    ended_at: null,
    signal: null,
  };

  if (isMetaInvocation(argv)) {
    appendLog(config.log, { ...record, ended_at: new Date().toISOString(), meta: true });
    process.stdout.write("dispatch-replay-model\n");
    return;
  }

  writeLog(config.log, record);

  const finish = (signal = null) => {
    record.ended_at = new Date().toISOString();
    record.signal = signal;
    writeLog(config.log, record);
  };

  process.on("SIGTERM", () => {
    finish("SIGTERM");
    process.exit(143);
  });
  process.on("SIGINT", () => {
    finish("SIGINT");
    process.exit(130);
  });

  if (config.mode === "success") {
    process.stdout.write(`${SENTINEL}\n`);
    finish();
    return;
  }
  if (config.mode === "empty") {
    finish();
    return;
  }
  if (config.mode === "hang") {
    process.stderr.write(`${FATAL_STDERR}\n`);
    const heartbeat = setInterval(() => {
      record.last_seen = new Date().toISOString();
      writeLog(config.log, record);
    }, 100);
    try {
      await hangUntilKilled();
    } finally {
      clearInterval(heartbeat);
    }
    return;
  }
  throw new Error(`unknown dispatch replay mode ${JSON.stringify(config.mode)}`);
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
