#!/usr/bin/env node
// Builds the delegate.invariants.cursor-pagination fixture: an activity
// feed where the implicit created_at ordering invariant spans three
// undocumented consumers — the cursor encodes the previous sort key, the
// client cache keys pages by cursor, and the nightly export job assumes
// append-only time ordering. Only the cross-component contract tests
// reveal the coupling.

import { buildFixture } from "./lib.mjs";

const files = {
  "package.json": `{
  "name": "activity-feed",
  "version": "1.4.0",
  "private": true,
  "type": "module",
  "scripts": {
    "test": "node --test"
  }
}
`,
  "README.md": `# activity-feed

Synthetic activity feed service used as a delegate evaluation fixture.

- \`src/feed.js\` — feed pagination
- \`src/cursor.js\` — cursor encoding
- \`src/client-cache.js\` — client-side page cache
- \`src/export-job.js\` — nightly incremental export

Run the suite with \`npm test\` (zero dependencies, Node 22, \`node --test\`).
The contract tests under \`test/contract/\` are the compatibility gate for
feed consumers.
`,
  "src/cursor.js": `export function encodeCursor(position) {
  return Buffer.from(JSON.stringify(position), "utf8").toString("base64url");
}

export function decodeCursor(value) {
  let position;
  try {
    position = JSON.parse(Buffer.from(value, "base64url").toString("utf8"));
  } catch {
    throw new Error("invalid feed cursor");
  }
  if (typeof position?.lastCreatedAt !== "string") {
    throw new Error("invalid feed cursor");
  }
  return position;
}
`,
  "src/feed.js": `import { encodeCursor, decodeCursor } from "./cursor.js";

export function listPage(store, cursorValue, limit) {
  const ordered = [...store.items].sort((a, b) =>
    b.created_at.localeCompare(a.created_at),
  );
  const after = cursorValue ? decodeCursor(cursorValue).lastCreatedAt : null;
  const remaining = after
    ? ordered.filter((item) => item.created_at < after)
    : ordered;
  const items = remaining.slice(0, limit);
  const nextCursor =
    remaining.length > limit
      ? encodeCursor({ lastCreatedAt: items[items.length - 1].created_at })
      : null;
  return { items, nextCursor };
}
`,
  "src/client-cache.js": `export function createPageCache() {
  return new Map();
}

export function pageCacheKey(cursorValue) {
  return \`feed:\${cursorValue ?? "first"}\`;
}

export function cachePage(cache, cursorValue, page) {
  cache.set(pageCacheKey(cursorValue), page);
}

export function cachedPage(cache, cursorValue) {
  return cache.get(pageCacheKey(cursorValue));
}
`,
  "src/export-job.js": `export function exportSince(store, watermark) {
  const items = store.items
    .filter((item) => item.created_at > watermark)
    .sort((a, b) => a.created_at.localeCompare(b.created_at));
  const nextWatermark =
    items.length > 0 ? items[items.length - 1].created_at : watermark;
  return { items, nextWatermark };
}
`,
  "test/fixture-data.js": `export function seededStore() {
  return {
    items: [
      { id: "a-1", pinned: false, created_at: "2026-07-01T09:00:00Z", body: "kickoff" },
      { id: "a-2", pinned: true, created_at: "2026-07-02T10:00:00Z", body: "policy update" },
      { id: "a-3", pinned: false, created_at: "2026-07-03T11:00:00Z", body: "retro notes" },
      { id: "a-4", pinned: false, created_at: "2026-07-04T12:00:00Z", body: "release 1.4" },
      { id: "a-5", pinned: true, created_at: "2026-07-05T13:00:00Z", body: "maintenance window" },
    ],
  };
}
`,
  "test/contract/pagination.test.js": `import test from "node:test";
import assert from "node:assert/strict";
import { listPage } from "../../src/feed.js";
import { decodeCursor } from "../../src/cursor.js";
import { seededStore } from "../fixture-data.js";

test("walking pages yields every item exactly once, newest first", () => {
  const store = seededStore();
  const seen = [];
  let cursor = null;
  do {
    const page = listPage(store, cursor, 2);
    seen.push(...page.items.map((item) => item.id));
    cursor = page.nextCursor;
  } while (cursor);
  assert.deepEqual(seen, ["a-5", "a-4", "a-3", "a-2", "a-1"]);
});

test("cursors round-trip through encode and decode", () => {
  const store = seededStore();
  const page = listPage(store, null, 2);
  const decoded = decodeCursor(page.nextCursor);
  assert.equal(decoded.lastCreatedAt, "2026-07-04T12:00:00Z");
});

test("malformed cursors are rejected with the domain error", () => {
  assert.throws(() => decodeCursor("not-a-cursor"), /invalid feed cursor/);
});
`,
  "test/contract/client-cache.test.js": `import test from "node:test";
import assert from "node:assert/strict";
import { listPage } from "../../src/feed.js";
import { createPageCache, cachePage, cachedPage, pageCacheKey } from "../../src/client-cache.js";
import { seededStore } from "../fixture-data.js";

test("identical cursors map to identical cache keys", () => {
  const store = seededStore();
  const page = listPage(store, null, 2);
  assert.equal(pageCacheKey(page.nextCursor), pageCacheKey(page.nextCursor));
  assert.notEqual(pageCacheKey(page.nextCursor), pageCacheKey(null));
});

test("pages cached under their cursor stay retrievable", () => {
  const store = seededStore();
  const cache = createPageCache();
  const first = listPage(store, null, 2);
  cachePage(cache, null, first);
  const second = listPage(store, first.nextCursor, 2);
  cachePage(cache, first.nextCursor, second);
  assert.deepEqual(cachedPage(cache, null), first);
  assert.deepEqual(cachedPage(cache, first.nextCursor), second);
});
`,
  "test/contract/export.test.js": `import test from "node:test";
import assert from "node:assert/strict";
import { exportSince } from "../../src/export-job.js";
import { seededStore } from "../fixture-data.js";

test("export returns exactly the rows created after the watermark, oldest first", () => {
  const store = seededStore();
  const run = exportSince(store, "2026-07-02T10:00:00Z");
  assert.deepEqual(
    run.items.map((item) => item.id),
    ["a-3", "a-4", "a-5"],
  );
  assert.equal(run.nextWatermark, "2026-07-05T13:00:00Z");
});

test("consecutive exports never miss or duplicate rows", () => {
  const store = seededStore();
  const first = exportSince(store, "");
  const second = exportSince(store, first.nextWatermark);
  assert.equal(first.items.length, 5);
  assert.deepEqual(second.items, []);
});
`,
};

buildFixture("delegate.invariants.cursor-pagination", files);
