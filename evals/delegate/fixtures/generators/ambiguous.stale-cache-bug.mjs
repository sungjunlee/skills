#!/usr/bin/env node
// Builds the delegate.ambiguous.stale-cache-bug fixture: a synthetic
// dashboard service where CSV import writes bypass the per-session
// aggregate cache. The shipped suite is green and does not cover the
// stale path; the executor must localize the gap among the session
// cache, the edge cache, and the aggregation layer, then fix it
// proportionately with a regression test.

import { buildFixture } from "./lib.mjs";

const files = {
  "package.json": `{
  "name": "dashboard-service",
  "version": "0.9.2",
  "private": true,
  "type": "module",
  "scripts": {
    "test": "node --test"
  }
}
`,
  "README.md": `# dashboard-service

Synthetic dashboard backend used as a delegate evaluation fixture.

- \`src/store.js\` — row store
- \`src/aggregate.js\` — dashboard totals computation
- \`src/session-cache.js\` — per-session aggregate cache
- \`src/edge-cache.js\` — TTL response cache in front of rendered pages
- \`src/dashboard.js\` — totals endpoint logic
- \`src/import.js\` — CSV import path
- \`src/auth.js\` — login/logout session lifecycle

Run the suite with \`npm test\` (zero dependencies, Node 22, \`node --test\`).
`,
  "src/store.js": `export function createStore() {
  return { rows: [] };
}

export function addRows(store, rows) {
  store.rows.push(...rows);
}
`,
  "src/aggregate.js": `export function computeTotals(store) {
  const totals = { count: store.rows.length, amount: 0 };
  for (const row of store.rows) {
    totals.amount += row.amount;
  }
  return totals;
}
`,
  "src/session-cache.js": `export function createSessionCache() {
  return new Map();
}

export function cacheGet(cache, sessionId, key) {
  return cache.get(sessionId)?.get(key);
}

export function cacheSet(cache, sessionId, key, value) {
  if (!cache.has(sessionId)) cache.set(sessionId, new Map());
  cache.get(sessionId).set(key, value);
}

export function invalidateSession(cache, sessionId) {
  cache.delete(sessionId);
}

export function invalidateAll(cache) {
  cache.clear();
}
`,
  "src/edge-cache.js": `const DEFAULT_TTL_MS = 30_000;

export function createEdgeCache(ttlMs = DEFAULT_TTL_MS, now = Date.now) {
  return { entries: new Map(), ttlMs, now };
}

export function edgeGet(cache, key) {
  const entry = cache.entries.get(key);
  if (!entry) return undefined;
  if (cache.now() - entry.storedAt >= cache.ttlMs) {
    cache.entries.delete(key);
    return undefined;
  }
  return entry.value;
}

export function edgeSet(cache, key, value) {
  cache.entries.set(key, { value, storedAt: cache.now() });
}
`,
  "src/dashboard.js": `import { computeTotals } from "./aggregate.js";
import { cacheGet, cacheSet } from "./session-cache.js";

export function dashboardTotals(session, store, cache) {
  const cached = cacheGet(cache, session.id, "totals");
  if (cached) return cached;
  const totals = computeTotals(store);
  cacheSet(cache, session.id, "totals", totals);
  return totals;
}
`,
  "src/import.js": `import { addRows } from "./store.js";

export function parseCsv(text) {
  const lines = text.trim().split("\\n");
  return lines.slice(1).map((line) => {
    const [id, amount] = line.split(",");
    return { id: id.trim(), amount: Number(amount) };
  });
}

export function importCsv(store, text) {
  const rows = parseCsv(text);
  addRows(store, rows);
  return rows.length;
}
`,
  "src/auth.js": `import { invalidateSession } from "./session-cache.js";

let nextSessionId = 1;

export function login() {
  return { id: \`s-\${nextSessionId}\`, seq: nextSessionId++ };
}

export function logout(cache, session) {
  invalidateSession(cache, session.id);
}
`,
  "test/aggregate.test.js": `import test from "node:test";
import assert from "node:assert/strict";
import { createStore, addRows } from "../src/store.js";
import { computeTotals } from "../src/aggregate.js";

test("totals sum row amounts", () => {
  const store = createStore();
  addRows(store, [
    { id: "r1", amount: 10 },
    { id: "r2", amount: 32 },
  ]);
  assert.deepEqual(computeTotals(store), { count: 2, amount: 42 });
});

test("empty store totals are zero", () => {
  assert.deepEqual(computeTotals(createStore()), { count: 0, amount: 0 });
});
`,
  "test/import.test.js": `import test from "node:test";
import assert from "node:assert/strict";
import { createStore } from "../src/store.js";
import { parseCsv, importCsv } from "../src/import.js";

const CSV = \`id,amount
r10,5
r11,7\`;

test("csv rows parse with numeric amounts", () => {
  assert.deepEqual(parseCsv(CSV), [
    { id: "r10", amount: 5 },
    { id: "r11", amount: 7 },
  ]);
});

test("import appends parsed rows to the store", () => {
  const store = createStore();
  assert.equal(importCsv(store, CSV), 2);
  assert.equal(store.rows.length, 2);
});
`,
  "test/dashboard.test.js": `import test from "node:test";
import assert from "node:assert/strict";
import { createStore, addRows } from "../src/store.js";
import { createSessionCache } from "../src/session-cache.js";
import { dashboardTotals } from "../src/dashboard.js";
import { login, logout } from "../src/auth.js";

test("totals are cached per session", () => {
  const store = createStore();
  addRows(store, [{ id: "r1", amount: 3 }]);
  const cache = createSessionCache();
  const session = login();
  const first = dashboardTotals(session, store, cache);
  const second = dashboardTotals(session, store, cache);
  assert.equal(first, second);
});

test("sessions do not share cached totals", () => {
  const store = createStore();
  const cache = createSessionCache();
  const a = dashboardTotals(login(), store, cache);
  const b = dashboardTotals(login(), store, cache);
  assert.notEqual(a, b);
  assert.deepEqual(a, b);
});

test("logout clears the session's cached totals", () => {
  const store = createStore();
  addRows(store, [{ id: "r1", amount: 3 }]);
  const cache = createSessionCache();
  const session = login();
  dashboardTotals(session, store, cache);
  logout(cache, session);
  assert.equal(cache.has(session.id), false);
});
`,
  "test/edge-cache.test.js": `import test from "node:test";
import assert from "node:assert/strict";
import { createEdgeCache, edgeGet, edgeSet } from "../src/edge-cache.js";

test("edge cache serves within ttl and expires after", () => {
  let clock = 1_000;
  const cache = createEdgeCache(30_000, () => clock);
  edgeSet(cache, "/dashboard", "<html>42</html>");
  assert.equal(edgeGet(cache, "/dashboard"), "<html>42</html>");
  clock += 30_000;
  assert.equal(edgeGet(cache, "/dashboard"), undefined);
});
`,
};

buildFixture("delegate.ambiguous.stale-cache-bug", files);
