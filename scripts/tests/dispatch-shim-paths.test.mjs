import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import {
  chmodSync,
  copyFileSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const runner = path.join(root, "scripts/run-dispatch-replay.mjs");
const fakeCli = path.join(root, "evals/fixtures/dispatch/fake-cli.mjs");
const successCase = path.join(root, "evals/cases/dispatch/success.json");
const prompt = "Reply with exactly: DISPATCH_REPLAY_OK";

const PATH_CASES = [
  {
    label: "spaces and quotes",
    checkoutName: `checkout with spaces 'single' "double"`,
  },
  {
    label: "dollars and command substitution",
    checkoutName:
      'checkout-$DISPATCH_SHIM_LITERAL-$(touch "$DISPATCH_SHIM_DOLLAR_MARKER")',
  },
  {
    label: "backtick substitution",
    checkoutName: 'checkout-`touch "$DISPATCH_SHIM_BACKTICK_MARKER"`',
  },
  {
    label: "newlines",
    checkoutName: "checkout-line-one\nline-two",
  },
];

function copyFixtureCheckout(checkout) {
  const files = [
    [runner, path.join(checkout, "scripts/run-dispatch-replay.mjs")],
    [fakeCli, path.join(checkout, "evals/fixtures/dispatch/fake-cli.mjs")],
    [successCase, path.join(checkout, "evals/cases/dispatch/success.json")],
  ];
  for (const [source, destination] of files) {
    mkdirSync(path.dirname(destination), { recursive: true });
    copyFileSync(source, destination);
  }
  mkdirSync(path.join(checkout, "evals/fixtures/dispatch/caller"), { recursive: true });
}

function writeFakeHost(binDir) {
  mkdirSync(binDir, { recursive: true });
  const filename = path.join(binDir, "claude");
  writeFileSync(
    filename,
    `#!/usr/bin/env bash
set -euo pipefail

meta=$(reasonix models)
if [[ "$meta" != "dispatch-replay-model" ]]; then
  echo "unexpected meta result: $meta" >&2
  exit 1
fi

dispatch=$(reasonix run --model dispatch-replay-model --effort high ${JSON.stringify(prompt)})
if [[ "$dispatch" != "DISPATCH_REPLAY_OK" ]]; then
  echo "unexpected dispatch result: $dispatch" >&2
  exit 1
fi

cat <<'REPORT'
RESOLVED_ROUTE: reasonix/dispatch-replay-model
RESOLVED_MODEL: dispatch-replay-model
RESOLVED_EFFORT: high
OUTCOME: success
OUTPUT: DISPATCH_REPLAY_OK
FAILURE_CODE:
ELAPSED_MS: 1
TERMINATED_ON_STDERR: no
REPORT
`,
  );
  chmodSync(filename, 0o755);
}

function readJsonLines(filename) {
  return readFileSync(filename, "utf8")
    .trim()
    .split("\n")
    .filter(Boolean)
    .map((line) => JSON.parse(line));
}

function runReplay(t, checkoutName) {
  const base = mkdtempSync(path.join(tmpdir(), "dispatch-shim-paths-"));
  const checkout = path.join(base, checkoutName);
  const hostBin = path.join(base, "host-bin");
  const dollarMarker = path.join(base, "dollar-substitution-ran");
  const backtickMarker = path.join(base, "backtick-substitution-ran");
  t.after(() => rmSync(base, { recursive: true, force: true }));

  copyFixtureCheckout(checkout);
  writeFakeHost(hostBin);

  const result = spawnSync(
    process.execPath,
    [
      path.join(checkout, "scripts/run-dispatch-replay.mjs"),
      "--host",
      "claude-code",
      "--case",
      "delegate.dispatch.success",
    ],
    {
      encoding: "utf8",
      env: {
        ...process.env,
        DISPATCH_SHIM_LITERAL: "expanded-value",
        DISPATCH_SHIM_DOLLAR_MARKER: dollarMarker,
        DISPATCH_SHIM_BACKTICK_MARKER: backtickMarker,
        PATH: `${hostBin}${path.delimiter}${process.env.PATH ?? ""}`,
      },
    },
  );

  assert.equal(result.status, 0, `${result.stdout}\n${result.stderr}`);
  const draftsRoot = path.join(checkout, "evals/fixtures/dispatch/drafts");
  const runDirs = readdirSync(draftsRoot);
  assert.equal(runDirs.length, 1, "runner should create exactly one draft directory");
  const runDir = path.join(draftsRoot, runDirs[0]);
  const draft = JSON.parse(readFileSync(path.join(runDir, "draft.json"), "utf8"));
  const calls = readJsonLines(path.join(runDir, "fake-cli.jsonl"));

  assert.equal(
    draft.host_exit.code,
    0,
    `fake host failed:\n${readFileSync(path.join(runDir, "host.stderr.txt"), "utf8")}`,
  );
  assert.equal(draft.host_exit.signal, null);
  assert.equal(draft.dispatch_observation.outcome, "success");
  assert.equal(draft.dispatch_observation.output, "DISPATCH_REPLAY_OK");
  assert.deepEqual(draft.fake_record.argv, [
    "reasonix",
    "run",
    "--model",
    "dispatch-replay-model",
    "--effort",
    "high",
    prompt,
  ]);
  assert.equal(draft.fake_record.argv.at(-1), prompt, "prompt argv changed");

  const metaCalls = calls.filter((call) => call.meta);
  assert.equal(metaCalls.length, 1, "fake CLI meta call did not complete");
  assert.deepEqual(metaCalls[0].argv, ["reasonix", "models"]);
  assert.equal(calls.filter((call) => !call.meta).length, 1, "fake CLI success call did not complete once");
  assert.equal(existsSync(dollarMarker), false, "dollar substitution marker was created");
  assert.equal(existsSync(backtickMarker), false, "backtick substitution marker was created");
}

for (const pathCase of PATH_CASES) {
  test(
    `${pathCase.label}: normal control and unusual checkout both replay`,
    { skip: process.platform === "win32" },
    async (t) => {
      await t.test("normal checkout path", (t) => runReplay(t, "checkout-normal"));
      await t.test("unusual checkout path", (t) => runReplay(t, pathCase.checkoutName));
    },
  );
}
