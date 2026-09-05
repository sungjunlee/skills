import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import * as loader from "./verify-replays-loader.mjs";
import * as original from "./verify-replays.mjs";

const dir = path.dirname(fileURLToPath(import.meta.url));
const names = [
  "loadContracts",
  "loadDocument",
  "jsonFiles",
  "documentKind",
  "verifyPairs",
  "validateContractBoundary",
  "main",
];

function hasFunctionDeclaration(source, name) {
  return new RegExp(String.raw`^(export\s+)?(async\s+)?function\s+${name}\s*\(`, "m").test(source);
}

test("unique structure for loader/main helpers", async () => {
  const originalText = await readFile(path.join(dir, "verify-replays.mjs"), "utf8");
  const loaderText = await readFile(path.join(dir, "verify-replays-loader.mjs"), "utf8");

  for (const name of names) {
    assert.ok(hasFunctionDeclaration(loaderText, name), `${name} must be declared in verify-replays-loader.mjs`);
    assert.ok(!hasFunctionDeclaration(originalText, name), `${name} must not be declared in verify-replays.mjs`);
    assert.equal(typeof loader[name], "function");
    assert.equal(original[name], loader[name], `${name} re-export must be the same function`);
  }

  assert.match(originalText, /from ["']\.\/verify-replays-loader\.mjs["']/);
  assert.match(
    originalText,
    /export\s*\{[^}]*loadContracts[^}]*loadDocument[^}]*jsonFiles[^}]*documentKind[^}]*verifyPairs[^}]*validateContractBoundary[^}]*main[^}]*\}/,
  );
});
