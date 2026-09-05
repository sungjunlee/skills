#!/usr/bin/env node

import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

import {
  expectedReportStatusMatrix,
  jsonFiles,
  loadContext,
  expectedAssertion,
  scanHygiene,
  collectErrors,
  clone,
  runSelfTests,
} from "./verify-cross-host-matrix-helpers.mjs";

export {
  expectedReportStatusMatrix,
  jsonFiles,
  loadContext,
  expectedAssertion,
  scanHygiene,
  collectErrors,
  clone,
  runSelfTests,
};

const isDirectRun =
  process.argv[1] !== undefined && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isDirectRun) {
  const args = process.argv.slice(2);
  const requiredOnly = args.includes("--required");
  const selfTest = args.includes("--selftest");
  const unknownFlags = args.filter((argument) => argument !== "--required" && argument !== "--selftest");
  if (unknownFlags.length > 0) throw new Error(`Unknown argument(s): ${unknownFlags.join(", ")}`);

  const ctx = await loadContext();

  if (selfTest) {
    const failures = runSelfTests(ctx);
    if (failures.length > 0) {
      console.error(failures.join("\n"));
      process.exitCode = 1;
    } else {
      console.log("Self-tests passed: clean baseline plus 11 negative rejections, including report status drift and canonical case substitution, omission, and reordering drift.");
    }
  } else {
    const errors = collectErrors(ctx);
    if (errors.length > 0) {
      console.error(errors.join("\n"));
      process.exitCode = 1;
    } else if (requiredOnly) {
      console.log("Required matrix complete: Claude Code and Codex pass all 24 canonical host/case rows.");
    } else {
      console.log("Cross-host matrix complete: exactly 60 unique canonical rows; required hosts pass all 12 cases each.");
    }
  }
}
