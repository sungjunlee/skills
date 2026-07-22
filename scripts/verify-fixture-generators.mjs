#!/usr/bin/env node
// Verifies the delegate fixture generators without provider credentials:
// every generator must build a green, git-seeded fixture in a temp dir,
// the ambiguous case's stale-read premise must actually reproduce, and
// the vendored v2 codemod must rewrite the mechanical surface it claims.

import { execFileSync } from "node:child_process";
import { copyFileSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const generatorsDir = path.join(root, "evals/delegate/fixtures/generators");

const PREMISE_CHECK = `import assert from "node:assert/strict";
import { createStore } from "./src/store.js";
import { createSessionCache } from "./src/session-cache.js";
import { dashboardTotals } from "./src/dashboard.js";
import { importCsv } from "./src/import.js";
import { login, logout } from "./src/auth.js";

const store = createStore();
const cache = createSessionCache();
const session = login();
const before = dashboardTotals(session, store, cache);
importCsv(store, "id,amount\\nr1,5");
const stale = dashboardTotals(session, store, cache);
assert.equal(stale.count, before.count, "premise broken: import invalidated the cache");
logout(cache, session);
const fresh = dashboardTotals(login(), store, cache);
assert.equal(fresh.count, 1, "premise broken: totals wrong after logout/login");
`;

function generatorFiles() {
  return readdirSync(generatorsDir)
    .filter((name) => name.endsWith(".mjs") && name !== "lib.mjs")
    .sort();
}

function buildAll(base) {
  const built = new Map();
  for (const name of generatorFiles()) {
    const target = path.join(base, name.replace(/\.mjs$/, ""));
    execFileSync("node", [path.join(generatorsDir, name), target], { stdio: "pipe" });
    built.set(name, target);
  }
  return built;
}

function checkStalePremise(fixture) {
  writeFileSync(path.join(fixture, "premise-check.mjs"), PREMISE_CHECK);
  execFileSync("node", ["premise-check.mjs"], { cwd: fixture, stdio: "pipe" });
}

function checkCodemod(fixture) {
  const copy = path.join(fixture, "codemod-check-copy.js");
  copyFileSync(path.join(fixture, "src/app.js"), copy);
  execFileSync("node", [path.join(fixture, "vendor/microweb2/codemod.mjs"), copy], { stdio: "pipe" });
  const migrated = readFileSync(copy, "utf8");
  for (const marker of ["new App(", "app.router.add({", "vendor/microweb2/index.js"]) {
    if (!migrated.includes(marker)) {
      throw new Error(`codemod output is missing expected rewrite ${JSON.stringify(marker)}`);
    }
  }
}

function main() {
  const base = mkdtempSync(path.join(tmpdir(), "delegate-fixtures-"));
  try {
    const built = buildAll(base);
    checkStalePremise(built.get("ambiguous.stale-cache-bug.mjs"));
    checkCodemod(built.get("longhorizon.dep-major-upgrade.mjs"));
    console.log(`Verified ${built.size} fixture generator(s): suites green, premises reproduce.`);
  } finally {
    rmSync(base, { recursive: true, force: true });
  }
}

main();
