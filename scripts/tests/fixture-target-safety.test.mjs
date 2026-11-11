import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import {
  chmodSync,
  copyFileSync,
  existsSync,
  lstatSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  readlinkSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const generatorsDir = path.join(root, "evals/delegate/fixtures/generators");
const representativeGenerator = path.join(generatorsDir, "mechanical.enum-rename.mjs");

function generatorFiles() {
  return readdirSync(generatorsDir)
    .filter((entry) => entry.endsWith(".mjs") && entry !== "lib.mjs")
    .sort();
}

function makeHarness(t) {
  const base = mkdtempSync(path.join(tmpdir(), "fixture-target-safety-"));
  const bin = path.join(base, "bin");
  const gitLog = path.join(base, "git-calls.jsonl");
  mkdirSync(bin);

  const stubSource = `const { appendFileSync } = require("node:fs");
appendFileSync(process.env.GIT_STUB_LOG, JSON.stringify(process.argv.slice(2)) + "\\n");
`;
  if (process.platform === "win32") {
    writeFileSync(path.join(bin, "git-stub.cjs"), stubSource);
    writeFileSync(
      path.join(bin, "git.cmd"),
      `@echo off\r\n"${process.execPath}" "%~dp0git-stub.cjs" %*\r\n`,
    );
  } else {
    const git = path.join(bin, "git");
    writeFileSync(git, `#!${process.execPath}\n${stubSource}`);
    chmodSync(git, 0o755);
  }

  t.after(() => rmSync(base, { recursive: true, force: true }));
  return {
    base,
    gitLog,
    env: {
      ...process.env,
      GIT_STUB_LOG: gitLog,
      PATH: `${bin}${path.delimiter}${process.env.PATH ?? ""}`,
    },
  };
}

function runGenerator(target, env) {
  return spawnSync(process.execPath, [representativeGenerator, target], {
    encoding: "utf8",
    env,
  });
}

function gitCalls(gitLog) {
  if (!existsSync(gitLog)) return [];
  return readFileSync(gitLog, "utf8")
    .trim()
    .split("\n")
    .filter(Boolean)
    .map((line) => JSON.parse(line));
}

function snapshotTree(rootPath) {
  const entries = [];

  function visit(current, relative) {
    const stat = lstatSync(current);
    if (stat.isSymbolicLink()) {
      entries.push([relative, "symlink", readlinkSync(current)]);
      return;
    }
    if (stat.isDirectory()) {
      entries.push([relative, "directory"]);
      for (const name of readdirSync(current).sort()) {
        visit(path.join(current, name), path.join(relative, name));
      }
      return;
    }
    entries.push([relative, "file", readFileSync(current).toString("base64")]);
  }

  visit(rootPath, ".");
  return entries;
}

function assertRejected(result, gitLog) {
  assert.notEqual(result.status, 0, `generator unexpectedly succeeded:\n${result.stdout}`);
  assert.match(
    `${result.stdout}\n${result.stderr}`,
    /Refusing to overwrite existing fixture target.*Choose a target path that does not exist/s,
  );
  assert.deepEqual(gitCalls(gitLog), [], "rejected target invoked Git");
}

function populateOwnedDirectory(target, sentinel) {
  mkdirSync(path.join(target, ".git"), { recursive: true });
  mkdirSync(path.join(target, "test"));
  writeFileSync(path.join(target, "README.md"), Buffer.from("owner README\n", "utf8"));
  writeFileSync(path.join(target, "notes.bin"), Buffer.from([0, 1, 2, 253, 254, 255]));
  writeFileSync(path.join(target, ".git/config"), Buffer.from("[owner]\n\tvalue = keep\n"));
  writeFileSync(path.join(target, ".git/index"), Buffer.from([68, 73, 82, 67, 0, 9, 8, 7]));
  writeFileSync(
    path.join(target, "test/must-not-run.test.cjs"),
    `const { writeFileSync } = require("node:fs");\nwriteFileSync(${JSON.stringify(sentinel)}, "ran");\n`,
  );
}

async function checkStalePremise(fixture) {
  const fixtureUrl = pathToFileURL(`${fixture}${path.sep}`).href;
  const { createStore } = await import(new URL("src/store.js", fixtureUrl));
  const { createSessionCache } = await import(new URL("src/session-cache.js", fixtureUrl));
  const { dashboardTotals } = await import(new URL("src/dashboard.js", fixtureUrl));
  const { importCsv } = await import(new URL("src/import.js", fixtureUrl));
  const { login, logout } = await import(new URL("src/auth.js", fixtureUrl));

  const store = createStore();
  const cache = createSessionCache();
  const session = login();
  const before = dashboardTotals(session, store, cache);
  importCsv(store, "id,amount\nr1,5");
  const stale = dashboardTotals(session, store, cache);
  assert.equal(stale.count, before.count, "premise broken: import invalidated the cache");
  logout(cache, session);
  const fresh = dashboardTotals(login(), store, cache);
  assert.equal(fresh.count, 1, "premise broken: totals wrong after logout/login");
}

function checkCodemod(fixture) {
  const copy = path.join(fixture, "codemod-check-copy.js");
  copyFileSync(path.join(fixture, "src/app.js"), copy);
  const result = spawnSync(
    process.execPath,
    [path.join(fixture, "vendor/microweb2/codemod.mjs"), copy],
    { encoding: "utf8" },
  );
  assert.equal(result.status, 0, `${result.stdout}\n${result.stderr}`);
  const migrated = readFileSync(copy, "utf8");
  for (const marker of ["new App(", "app.router.add({", "vendor/microweb2/index.js"]) {
    assert.ok(migrated.includes(marker), `codemod output is missing ${JSON.stringify(marker)}`);
  }
}

test("rejects an existing directory before writes, tests, or Git", (t) => {
  const harness = makeHarness(t);
  const target = path.join(harness.base, "owned-directory");
  const sentinel = path.join(harness.base, "test-ran");
  populateOwnedDirectory(target, sentinel);
  const before = snapshotTree(target);

  const result = runGenerator(target, harness.env);

  assertRejected(result, harness.gitLog);
  assert.deepEqual(snapshotTree(target), before);
  assert.equal(existsSync(sentinel), false, "rejected target ran its test suite");
});

test("rejects an existing file without changing it or invoking Git", (t) => {
  const harness = makeHarness(t);
  const target = path.join(harness.base, "owned-file");
  const before = Buffer.from([0, 82, 69, 65, 68, 77, 69, 255]);
  writeFileSync(target, before);

  const result = runGenerator(target, harness.env);

  assertRejected(result, harness.gitLog);
  assert.deepEqual(readFileSync(target), before);
});

test("rejects a symlink without changing the link destination or invoking Git", (t) => {
  const harness = makeHarness(t);
  const destination = path.join(harness.base, "owned-destination");
  const target = path.join(harness.base, "linked-target");
  const sentinel = path.join(harness.base, "linked-test-ran");
  populateOwnedDirectory(destination, sentinel);
  symlinkSync(destination, target, process.platform === "win32" ? "junction" : "dir");
  const destinationBefore = snapshotTree(destination);
  const linkBefore = snapshotTree(target);

  const result = runGenerator(target, harness.env);

  assertRejected(result, harness.gitLog);
  assert.deepEqual(snapshotTree(target), linkBefore);
  assert.deepEqual(snapshotTree(destination), destinationBefore);
  assert.equal(existsSync(sentinel), false, "rejected symlink destination ran its test suite");
});

test("fresh targets build all four fixtures and retain premise checks with Git stubbed", async (t) => {
  const harness = makeHarness(t);
  const originalArgvLength = process.argv.length;
  const originalArgv2 = process.argv[2];
  const originalPath = process.env.PATH;
  const originalGitLog = process.env.GIT_STUB_LOG;
  const built = new Map();

  process.env.PATH = harness.env.PATH;
  process.env.GIT_STUB_LOG = harness.gitLog;
  try {
    for (const name of generatorFiles()) {
      const target = path.join(harness.base, name.replace(/\.mjs$/, ""));
      process.argv[2] = target;
      await import(`${pathToFileURL(path.join(generatorsDir, name)).href}?target-safety-control`);
      built.set(name, target);
    }
  } finally {
    if (originalArgvLength > 2) process.argv[2] = originalArgv2;
    else process.argv.splice(2);
    if (originalPath === undefined) delete process.env.PATH;
    else process.env.PATH = originalPath;
    if (originalGitLog === undefined) delete process.env.GIT_STUB_LOG;
    else process.env.GIT_STUB_LOG = originalGitLog;
  }

  assert.equal(built.size, 4);
  await checkStalePremise(built.get("ambiguous.stale-cache-bug.mjs"));
  checkCodemod(built.get("longhorizon.dep-major-upgrade.mjs"));

  const calls = gitCalls(harness.gitLog);
  assert.equal(calls.length, 12, "each fixture should make the three expected Git calls");
  const targets = new Set(calls.map((args) => args[1]));
  assert.equal(targets.size, 4);
  for (const target of targets) {
    const targetCalls = calls.filter((args) => args[1] === target);
    assert.deepEqual(targetCalls, [
      ["-C", target, "init", "-q"],
      ["-C", target, "add", "-A"],
      [
        "-C",
        target,
        "-c",
        "user.name=fixture",
        "-c",
        "user.email=fixture@local",
        "commit",
        "-qm",
        "seed fixture",
      ],
    ]);
  }
});
