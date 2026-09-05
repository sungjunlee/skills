import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import * as contract from "./verify-replays-contract.mjs";
import * as original from "./verify-replays.mjs";

const dir = path.dirname(fileURLToPath(import.meta.url));
const names = ["validateCaseContract", "validateLegacyManifest"];

function hasFunctionDeclaration(source, name) {
  return new RegExp(String.raw`^(export\s+)?(async\s+)?function\s+${name}\s*\(`, "m").test(source);
}

test("unique structure for contract validators", async () => {
  const originalText = await readFile(path.join(dir, "verify-replays.mjs"), "utf8");
  const contractText = await readFile(path.join(dir, "verify-replays-contract.mjs"), "utf8");

  for (const name of names) {
    assert.ok(hasFunctionDeclaration(contractText, name), `${name} must be declared in verify-replays-contract.mjs`);
    assert.ok(!hasFunctionDeclaration(originalText, name), `${name} must not be declared in verify-replays.mjs`);
    assert.equal(typeof contract[name], "function");
    assert.equal(original[name], contract[name], `${name} re-export must be the same function`);
  }

  assert.match(originalText, /from ["']\.\/verify-replays-contract\.mjs["']/);
  assert.match(
    originalText,
    /export\s*\{[^}]*validateCaseContract[^}]*validateLegacyManifest[^}]*\}/,
  );
});
