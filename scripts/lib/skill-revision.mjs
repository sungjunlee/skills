import { createHash } from "node:crypto";
import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";

function walk(current, files) {
  const entries = readdirSync(current, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name));
  for (const entry of entries) {
    const child = path.join(current, entry.name);
    if (entry.isDirectory()) walk(child, files);
    else if (entry.isFile()) files.push(child);
  }
  return files;
}

// sha256 over the skill directory: relative path and bytes of every file, in
// sorted order. This is the `skill_revision` a replay result binds to.
export function sha256Tree(dir) {
  const hash = createHash("sha256");
  for (const filename of walk(dir, [])) {
    hash.update(path.relative(dir, filename).split(path.sep).join("/"));
    hash.update("\0");
    hash.update(readFileSync(filename));
    hash.update("\0");
  }
  return hash.digest("hex");
}
