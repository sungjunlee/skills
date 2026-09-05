#!/usr/bin/env node

import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

import {
  loadContracts,
  loadDocument,
  jsonFiles,
  documentKind,
  verifyPairs,
  validateContractBoundary,
  main,
} from "./verify-replays-loader.mjs";

export { validateCaseContract, validateLegacyManifest } from "./verify-replays-contract.mjs";

export {
  loadContracts,
  loadDocument,
  jsonFiles,
  documentKind,
  verifyPairs,
  validateContractBoundary,
  main,
};

const isDirectRun =
  process.argv[1] !== undefined && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isDirectRun) {
  main().catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
}
