import { mkdirSync, writeFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import path from "node:path";
import process from "node:process";

export function targetDirFromArgv(caseId) {
  const target = process.argv[2];
  if (!target) {
    throw new Error(`Usage: node <generator> <target-dir>  (builds the ${caseId} fixture)`);
  }
  return path.resolve(target);
}

export function claimTarget(root) {
  try {
    mkdirSync(root, { recursive: false });
  } catch (error) {
    if (error?.code === "EEXIST") {
      throw new Error(
        `Refusing to overwrite existing fixture target ${root}. Choose a target path that does not exist.`,
        { cause: error },
      );
    }
    throw error;
  }
}

export function writeTree(root, files) {
  for (const [relative, content] of Object.entries(files)) {
    const filename = path.join(root, relative);
    mkdirSync(path.dirname(filename), { recursive: true });
    writeFileSync(filename, content);
  }
}

export function assertSuiteGreen(root) {
  const env = { ...process.env };
  delete env.NODE_TEST_CONTEXT;
  execFileSync("node", ["--test"], { cwd: root, env, stdio: "pipe" });
}

export function seedGitRepo(root) {
  const git = (...args) => execFileSync("git", ["-C", root, ...args], { stdio: "pipe" });
  git("init", "-q");
  git("add", "-A");
  git("-c", "user.name=fixture", "-c", "user.email=fixture@local", "commit", "-qm", "seed fixture");
}

export function buildFixture(caseId, files) {
  const root = targetDirFromArgv(caseId);
  claimTarget(root);
  writeTree(root, files);
  assertSuiteGreen(root);
  seedGitRepo(root);
  console.log(`${caseId} fixture ready at ${root} (suite green, git seeded)`);
}
