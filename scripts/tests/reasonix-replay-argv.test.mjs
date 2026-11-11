import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import { parseReasonixReplayArgv } from "../lib/reasonix-replay-argv.mjs";
import { dispatchDerived } from "../verify-replays-pair.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const successCaseFile = path.join(root, "evals/cases/dispatch/success.json");
const currentResultFile = path.join(root, "evals/results/dispatch/2026-09-29/success.codex.json");
const prompt = "Reply with exactly: DISPATCH_REPLAY_OK";
const oldFakeRevision = "aee1a0bc09d2aa1acbf2d159553eae0fdcb57db89e5195282446493a9c340027";
const replayCase = JSON.parse(readFileSync(successCaseFile, "utf8"));
const expected = replayCase.dispatch_contract;
const longArgv = [
  "reasonix",
  "run",
  "--model",
  "dispatch-replay-model",
  "--effort",
  "high",
  prompt,
];
const shortArgv = [
  "reasonix",
  "run",
  "-m",
  "dispatch-replay-model",
  "--effort",
  "high",
  prompt,
];

function clone(value) {
  return structuredClone(value);
}

test("reasonix replay parser accepts the current long-form command", () => {
  const parsed = parseReasonixReplayArgv(longArgv, expected);
  assert.deepEqual(parsed, {
    ok: true,
    failed: [],
    route: "reasonix/dispatch-replay-model",
    model: "dispatch-replay-model",
    effort: "high",
    prompt,
  });
});

test("reasonix replay parser rejects invalid current commands", () => {
  const withoutEffort = longArgv.filter((_, index) => index !== 4 && index !== 5);
  const cases = [
    ["bad subcommand", ["reasonix", "chat", ...longArgv.slice(2)]],
    ["missing model", longArgv.filter((_, index) => index !== 2 && index !== 3)],
    ["missing effort", withoutEffort],
    ["wrong model", longArgv.map((token) => token === "dispatch-replay-model" ? "wrong-model" : token)],
    ["wrong effort", longArgv.map((token) => token === "high" ? "max" : token)],
    ["changed prompt", [...longArgv.slice(0, -1), `${prompt} changed`]],
    ["duplicate model", [...longArgv.slice(0, -1), "--model", "dispatch-replay-model", prompt]],
    ["duplicate effort", [...longArgv.slice(0, -1), "--effort", "high", prompt]],
    ["unknown control", [...longArgv.slice(0, -1), "--json", prompt]],
    ["current short model flag", shortArgv],
  ];

  for (const [label, argv] of cases) {
    assert.equal(parseReasonixReplayArgv(argv, expected).ok, false, label);
  }

  const missingEffort = parseReasonixReplayArgv(withoutEffort, expected);
  assert.equal(missingEffort.model, "dispatch-replay-model");
  assert.equal(missingEffort.effort, null, "missing effort must not fall back to the expectation");
});

test("short model grammar is limited to the historical fake revision", () => {
  assert.equal(
    parseReasonixReplayArgv(shortArgv, expected, { fakeCliRevision: oldFakeRevision }).ok,
    true,
  );
  assert.equal(parseReasonixReplayArgv(shortArgv, expected).ok, false);
  assert.equal(
    parseReasonixReplayArgv(shortArgv, expected, { fakeCliRevision: "another-revision" }).ok,
    false,
  );
});

test("derived checks reject argv mutations even when recorded fields still claim expected values", () => {
  const current = JSON.parse(readFileSync(currentResultFile, "utf8"));
  assert.equal(dispatchDerived(replayCase, current).ok, true);

  const mutations = [
    ["bad subcommand", (argv) => { argv[1] = "chat"; }],
    ["missing effort", (argv) => { argv.splice(argv.indexOf("--effort"), 2); }],
    ["wrong model", (argv) => { argv[argv.indexOf("--model") + 1] = "wrong-model"; }],
    ["duplicate model", (argv) => { argv.splice(-1, 0, "--model", "dispatch-replay-model"); }],
    ["changed prompt", (argv) => { argv[argv.length - 1] = `${prompt} changed`; }],
  ];

  for (const [label, mutate] of mutations) {
    const result = clone(current);
    mutate(result.dispatch_observation.argv);
    const derived = dispatchDerived(replayCase, result);
    assert.equal(derived.ok, false, label);
    assert.equal(derived.failed.includes("argv"), true, label);
  }

  const absent = clone(current);
  absent.dispatch_observation.resolved_model = null;
  assert.equal(dispatchDerived(replayCase, absent).failed.includes("model"), true);
});

test("all six historical short-form observations remain valid", () => {
  const directory = path.join(root, "evals/results/dispatch/2026-08-16");
  const caseFiles = new Map([
    ["delegate.dispatch.success", "success.json"],
    ["delegate.dispatch.empty-output", "empty-output.json"],
    ["delegate.dispatch.fatal-stderr-then-hang", "fatal-stderr-then-hang.json"],
  ]);
  const results = readdirSync(directory).filter((name) => name.endsWith(".json"));
  assert.equal(results.length, 6);

  for (const name of results) {
    const result = JSON.parse(readFileSync(path.join(directory, name), "utf8"));
    const historicalCase = JSON.parse(
      readFileSync(path.join(root, "evals/cases/dispatch", caseFiles.get(result.case_id)), "utf8"),
    );
    assert.equal(result.dispatch_observation.fake_cli_revision, oldFakeRevision, name);
    assert.equal(dispatchDerived(historicalCase, result).ok, true, name);
  }
});
