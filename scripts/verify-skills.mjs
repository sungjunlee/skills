#!/usr/bin/env node

// Checks the AGENTS.md authoring rules that can be checked. Every rule here
// exists because the tree drifted from the contract at least once.

import { readFile, readdir, stat } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const layoutHeading = "## Repo Layout";

async function skillDirectories() {
  const skillsRoot = path.join(root, "skills");
  const found = [];
  for (const category of await readdir(skillsRoot, { withFileTypes: true })) {
    if (!category.isDirectory()) continue;
    const categoryPath = path.join(skillsRoot, category.name);
    for (const skill of await readdir(categoryPath, { withFileTypes: true })) {
      if (!skill.isDirectory()) continue;
      found.push({ category: category.name, name: skill.name, dir: path.join(categoryPath, skill.name) });
    }
  }
  return found.sort((left, right) => left.name.localeCompare(right.name));
}

function parseFrontmatter(text) {
  if (!text.startsWith("---\n")) return null;
  const end = text.indexOf("\n---", 4);
  if (end === -1) return null;
  const fields = {};
  for (const line of text.slice(4, end).split("\n")) {
    const match = /^([A-Za-z0-9_-]+):\s*(.*)$/.exec(line);
    if (match) fields[match[1]] = match[2].trim();
  }
  return fields;
}

async function checkFrontmatter(skill) {
  const errors = [];
  const file = path.join(skill.dir, "SKILL.md");
  let text;
  try {
    text = await readFile(file, "utf8");
  } catch {
    return [`skills/${skill.category}/${skill.name}/SKILL.md is missing`];
  }
  const fields = parseFrontmatter(text);
  const where = `skills/${skill.category}/${skill.name}/SKILL.md`;
  if (!fields) return [`${where}: no YAML frontmatter; the skill will not be discoverable`];
  if (fields.name !== skill.name) {
    errors.push(`${where}: frontmatter name ${JSON.stringify(fields.name ?? null)} does not match its directory`);
  }
  if (!fields.description) errors.push(`${where}: frontmatter has no description`);
  return errors;
}

// A skill that opts out of implicit invocation must say so on every host it
// ships an adapter for; a half-applied opt-out is worse than none.
async function checkAdapterMirror(skill) {
  const adapter = path.join(skill.dir, "agents", "openai.yaml");
  let text;
  try {
    text = await readFile(adapter, "utf8");
  } catch {
    return [];
  }
  const skillText = await readFile(path.join(skill.dir, "SKILL.md"), "utf8");
  const explicitOnly = parseFrontmatter(skillText)?.["disable-model-invocation"] === "true";
  const adapterBlocks = /allow_implicit_invocation:\s*false/.test(text);
  if (explicitOnly === adapterBlocks) return [];
  return [
    `skills/${skill.category}/${skill.name}: disable-model-invocation is ${explicitOnly}` +
      ` but agents/openai.yaml allow_implicit_invocation: false is ${adapterBlocks}`,
  ];
}

async function checkReadme(skills) {
  const errors = [];
  const readme = await readFile(path.join(root, "README.md"), "utf8");
  for (const skill of skills) {
    if (!readme.includes(`skills/${skill.category}/${skill.name}/SKILL.md`)) {
      errors.push(`README.md: no Source entry for skills/${skill.category}/${skill.name}/SKILL.md`);
    }
  }

  const start = readme.indexOf(layoutHeading);
  if (start === -1) return [...errors, `README.md: no ${JSON.stringify(layoutHeading)} section`];
  const fenced = readme.slice(start).split("```")[1];
  if (!fenced) return [...errors, "README.md: Repo Layout section has no fenced block"];
  const block = fenced.slice(fenced.indexOf("\n") + 1); // drop the language tag

  for (const relative of layoutPaths(block)) {
    try {
      await stat(path.join(root, relative));
    } catch {
      errors.push(`README.md Repo Layout names a path that does not exist: ${relative}`);
    }
  }
  for (const skill of skills) {
    if (!block.includes(`${skill.name}/`)) {
      errors.push(`README.md Repo Layout omits skills/${skill.category}/${skill.name}/`);
    }
  }
  return errors;
}

// The block is an indented tree; rebuild each full path from indentation depth.
function layoutPaths(block) {
  const stack = [];
  const paths = [];
  for (const line of block.split("\n")) {
    const match = /^(\s*)([A-Za-z0-9._-]+\/?)\s*$/.exec(line);
    if (!match) continue;
    const depth = Math.floor(match[1].length / 2);
    stack.length = depth;
    stack.push(match[2].replace(/\/$/, ""));
    paths.push(stack.join("/"));
  }
  return paths;
}

async function main() {
  const skills = await skillDirectories();
  if (skills.length === 0) throw new Error("no skills found under skills/");

  const errors = [];
  for (const skill of skills) {
    errors.push(...(await checkFrontmatter(skill)));
    errors.push(...(await checkAdapterMirror(skill)));
  }
  errors.push(...(await checkReadme(skills)));

  if (errors.length > 0) throw new Error(errors.join("\n"));
  console.log(`Verified ${skills.length} skill(s): frontmatter, adapter mirrors, and README layout agree with the tree.`);
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
