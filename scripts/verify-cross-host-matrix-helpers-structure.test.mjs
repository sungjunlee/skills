import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import * as helpers from "./verify-cross-host-matrix-helpers.mjs";
import * as original from "./verify-cross-host-matrix.mjs";

const dir = path.dirname(fileURLToPath(import.meta.url));
const names = [
  "expectedReportStatusMatrix",
  "jsonFiles",
  "loadContext",
  "expectedAssertion",
  "scanHygiene",
  "collectErrors",
  "clone",
  "runSelfTests",
];

function hasFunctionDeclaration(source, name) {
  return new RegExp(String.raw`^(export\s+)?(async\s+)?function\s+${name}\s*\(`, "m").test(source);
}

test("unique structure for helper cluster", async () => {
  const originalText = await readFile(path.join(dir, "verify-cross-host-matrix.mjs"), "utf8");
  const helpersText = await readFile(path.join(dir, "verify-cross-host-matrix-helpers.mjs"), "utf8");

  for (const name of names) {
    assert.ok(hasFunctionDeclaration(helpersText, name), `${name} must be declared in verify-cross-host-matrix-helpers.mjs`);
    assert.ok(!hasFunctionDeclaration(originalText, name), `${name} must not be declared in verify-cross-host-matrix.mjs`);
    assert.equal(typeof helpers[name], "function");
    assert.equal(original[name], helpers[name], `${name} re-export must be the same function`);
  }

  assert.match(originalText, /from ["']\.\/verify-cross-host-matrix-helpers\.mjs["']/);
  assert.match(
    originalText,
    /export\s*\{[^}]*expectedReportStatusMatrix[^}]*jsonFiles[^}]*loadContext[^}]*expectedAssertion[^}]*scanHygiene[^}]*collectErrors[^}]*clone[^}]*runSelfTests[^}]*\}/,
  );
});
