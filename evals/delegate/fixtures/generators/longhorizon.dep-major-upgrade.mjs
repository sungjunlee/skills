#!/usr/bin/env node
// Builds the delegate.longhorizon.dep-major-upgrade fixture: a synthetic
// orders web app on a vendored micro framework (vendor/microweb v1) whose
// major upgrade (vendor/microweb2) ships a codemod that migrates only the
// mechanical surface. The remaining migration steps — handler signatures,
// reply helpers, middleware contract, config shape, template syntax,
// lifecycle hooks, error contract, query access, and the tests themselves
// — surface progressively as earlier steps land, which is what makes the
// run long-horizon. Everything is offline and zero-dependency.

import { buildFixture } from "./lib.mjs";

const microwebV1 = `// microweb v1 — minimal synchronous web framework (vendored).
export function createApp(config = {}) {
  const app = {
    config: Object.assign({}, config),
    routes: [],
    middlewares: [],
    startHooks: [],
    errorHandler: null,
    started: false,
  };
  app.use = (fn) => app.middlewares.push(fn);
  app.route = (method, path, handler) => app.routes.push({ method, path, handler });
  app.onStart = (fn) => app.startHooks.push(fn);
  app.onError = (fn) => { app.errorHandler = fn; };
  app.start = () => {
    for (const hook of app.startHooks) hook(app);
    app.started = true;
  };
  app.handle = (request) => handle(app, request);
  return app;
}

function makeResponse() {
  const res = { statusCode: 200, body: "", ended: false };
  res.status = (code) => { res.statusCode = code; return res; };
  res.send = (text) => { res.body = String(text); res.ended = true; };
  res.json = (value) => { res.body = JSON.stringify(value); res.ended = true; };
  return res;
}

function handle(app, request) {
  const req = {
    method: request.method,
    path: request.path,
    query: request.query || {},
    body: request.body,
  };
  const res = makeResponse();
  try {
    runMiddlewares(app, req, res);
    if (!res.ended) runRoute(app, req, res);
  } catch (error) {
    if (!app.errorHandler) throw error;
    app.errorHandler(error, req, res);
  }
  return { status: res.statusCode, body: res.body };
}

function runMiddlewares(app, req, res) {
  let index = 0;
  const next = () => {
    if (index >= app.middlewares.length) return;
    const current = app.middlewares[index];
    index += 1;
    current(req, res, next);
  };
  next();
}

function runRoute(app, req, res) {
  const match = app.routes.find(
    (candidate) => candidate.method === req.method && candidate.path === req.path,
  );
  if (!match) {
    res.status(404).send("not found");
    return;
  }
  match.handler(req, res);
}

export function render(template, params = {}) {
  return template.replace(/\\$\\{(\\w+)\\}/g, (_, name) =>
    params[name] === undefined ? "" : String(params[name]),
  );
}
`;

const microwebV2 = `// microweb v2 — asynchronous rewrite (vendored). Breaking changes are
// listed in MIGRATION.md; the codemod migrates only the mechanical parts.
const CONFIG_SECTIONS = ["server", "render"];

export class App {
  constructor(config = {}) {
    validateConfig(config);
    this.config = config;
    this.router = { entries: [], add: (entry) => this.router.entries.push(entry) };
    this.middlewares = [];
    this.hooks = createHooks();
    this.started = false;
  }

  use(fn) {
    this.middlewares.push(fn);
  }

  async start() {
    for (const hook of this.hooks.handlers("start")) await hook(this);
    this.started = true;
  }

  async dispatch(request) {
    if (!this.started) throw new Error("dispatch before start(): call await app.start() first");
    const ctx = makeContext(this, request);
    try {
      const reply = await runChain(this, ctx);
      return finalize(reply);
    } catch (error) {
      return finalize(await handleError(this, error, ctx));
    }
  }
}

function createHooks() {
  const registry = new Map();
  return {
    on: (name, fn) => {
      if (!registry.has(name)) registry.set(name, []);
      registry.get(name).push(fn);
    },
    handlers: (name) => registry.get(name) || [],
  };
}

function validateConfig(config) {
  for (const key of Object.keys(config)) {
    if (!CONFIG_SECTIONS.includes(key)) {
      throw new Error(
        "unknown config section '" + key + "': v2 config is nested { server, render }",
      );
    }
  }
}

function makeContext(app, request) {
  return {
    request: { method: request.method, body: request.body },
    url: { path: request.path, query: request.query || "" },
    config: app.config,
  };
}

async function runChain(app, ctx) {
  let index = 0;
  const next = async () => {
    if (index < app.middlewares.length) {
      const current = app.middlewares[index];
      index += 1;
      return current(ctx, next);
    }
    return runRoute(app, ctx);
  };
  return next();
}

async function runRoute(app, ctx) {
  const match = app.router.entries.find(
    (candidate) => candidate.method === ctx.request.method && candidate.path === ctx.url.path,
  );
  if (!match) return reply.text("not found", 404);
  return match.handler(ctx);
}

async function handleError(app, error, ctx) {
  for (const hook of app.hooks.handlers("error")) {
    const handled = await hook(error, ctx);
    if (handled) return handled;
  }
  return reply.json({ error: error.message }, 500);
}

function finalize(result) {
  if (!result || typeof result.status !== "number") {
    throw new Error("handler must return a reply (use reply.text or reply.json)");
  }
  return { status: result.status, body: result.body };
}

export const reply = {
  text: (body, status = 200) => ({ status, body: String(body) }),
  json: (value, status = 200) => ({ status, body: JSON.stringify(value) }),
};

export function parseQuery(query) {
  const params = {};
  for (const pair of String(query).split("&")) {
    if (!pair) continue;
    const [key, value] = pair.split("=");
    params[decodeURIComponent(key)] = decodeURIComponent(value ?? "");
  }
  return params;
}

export function render(template, params = {}, options = {}) {
  return template.replace(/\\{\\{(\\w+)\\}\\}/g, (_, name) => {
    if (params[name] === undefined) {
      if (options.strict !== false) throw new Error("unknown template placeholder '" + name + "'");
      return "";
    }
    return String(params[name]);
  });
}
`;

const migrationGuide = `# microweb v1 -> v2 migration guide

Breaking changes. The codemod (\`node vendor/microweb2/codemod.mjs <src...>\`)
handles only items marked [codemod]; everything else is manual.

1. [codemod] \`import ... from "../vendor/microweb/index.js"\` -> \`"../vendor/microweb2/index.js"\`.
2. [codemod] \`createApp(config)\` -> \`new App(config)\` (named import \`App\`).
3. [codemod] \`app.route(method, path, handler)\` -> \`app.router.add({ method, path, handler })\`.
4. Config is nested: \`{ server: { port }, render: { strict } }\`. Unknown or flat
   top-level keys throw at construction.
5. Handlers are \`async (ctx)\` and must return a reply; \`(req, res)\` with
   \`res.send\`/\`res.json\` no longer exists. Use \`reply.text(...)\`/\`reply.json(...)\`.
6. Middleware is \`async (ctx, next)\`; call \`return next()\` (or await it) instead
   of the v1 \`(req, res, next)\` contract.
7. \`app.handle(request)\` -> \`await app.dispatch(request)\`; \`request.query\` is now
   a raw query string on \`ctx.url.query\` — use \`parseQuery\`.
8. \`app.onStart(fn)\` -> \`app.hooks.on("start", fn)\`; \`dispatch\` before
   \`await app.start()\` throws.
9. \`app.onError(fn)\` -> \`app.hooks.on("error", (error, ctx) => reply | undefined)\`.
10. Templates use \`{{name}}\` instead of \`\${name}\` and unknown placeholders
    throw in strict mode (the default).
11. Responses are plain \`{ status, body }\` — update assertions that read
    \`statusCode\` or rely on mutation-style responses.
12. Write an upgrade changelog entry recording each migrated API and any
    behavior-affecting decision.
`;

const codemod = `#!/usr/bin/env node
// microweb v1 -> v2 codemod. Migrates ONLY the mechanical surface:
// import paths, createApp -> new App, and app.route -> app.router.add.
// It does NOT migrate handler signatures, reply construction, middleware
// contracts, config shape, lifecycle hooks, error hooks, template syntax,
// or query access — see vendor/microweb2/MIGRATION.md items 4-12.
import { readFileSync, writeFileSync } from "node:fs";

const files = process.argv.slice(2);
if (files.length === 0) {
  console.error("Usage: node vendor/microweb2/codemod.mjs <file...>");
  process.exit(1);
}

for (const file of files) {
  let source = readFileSync(file, "utf8");
  source = source.replaceAll("/vendor/microweb/index.js", "/vendor/microweb2/index.js");
  source = source.replace(/\\bcreateApp\\(/g, "new App(");
  source = source.replace(/\\bimport \\{([^}]*)\\}/g, (whole, names) => {
    const cleaned = names
      .split(",")
      .map((name) => name.trim())
      .filter(Boolean)
      .map((name) => (name === "createApp" ? "App" : name));
    return "import { " + cleaned.join(", ") + " }";
  });
  source = source.replace(
    /app\\.route\\(\\s*("[A-Z]+"),\\s*("[^"]+"),\\s*([\\w.]+)\\s*\\)/g,
    "app.router.add({ method: $1, path: $2, handler: $3 })",
  );
  writeFileSync(file, source);
  console.log("codemod applied: " + file);
}
console.log("NOT migrated (manual, see MIGRATION.md): handler signatures, reply");
console.log("helpers, middleware contract, config shape, hooks, templates, query access.");
`;

const appSource = `import { createApp, render } from "../vendor/microweb/index.js";
import { seedOrders, listOrders, getOrder, addOrder, openOrderCount } from "./store.js";

const GREETING_TEMPLATE = "Hello \${name}, you have \${count} open orders.";

export function buildApp() {
  const app = createApp({ port: 8080, greetingTemplate: GREETING_TEMPLATE });

  app.use((req, res, next) => {
    if (req.path.startsWith("/admin") && req.query.token !== "letmein") {
      res.status(403).send("forbidden");
      return;
    }
    next();
  });

  app.onStart(() => seedOrders());

  app.route("GET", "/orders", handleListOrders);
  app.route("GET", "/order", handleGetOrder);
  app.route("POST", "/orders", handleCreateOrder);
  app.route("GET", "/greeting", handleGreeting);
  app.route("GET", "/admin/purge", handlePurge);

  app.onError((error, req, res) => {
    res.status(500).json({ error: error.message, path: req.path });
  });

  return app;
}

function handleListOrders(req, res) {
  res.json(listOrders());
}

function handleGetOrder(req, res) {
  const order = getOrder(req.query.id);
  if (!order) {
    res.status(404).json({ error: "no such order" });
    return;
  }
  res.json(order);
}

function handleCreateOrder(req, res) {
  const order = addOrder(req.body);
  res.status(201).json(order);
}

function handleGreeting(req, res) {
  const name = req.query.name;
  if (!name) throw new Error("name is required");
  res.send(render(GREETING_TEMPLATE, { name, count: openOrderCount() }));
}

function handlePurge(req, res) {
  seedOrders();
  res.json({ purged: true });
}
`;

const storeSource = `const state = { orders: [], nextId: 1 };

export function seedOrders() {
  state.orders = [
    { id: "o-1", item: "keyboard", open: true },
    { id: "o-2", item: "monitor", open: false },
    { id: "o-3", item: "desk mat", open: true },
  ];
  state.nextId = 4;
}

export function listOrders() {
  return state.orders;
}

export function getOrder(id) {
  return state.orders.find((order) => order.id === id);
}

export function addOrder(fields) {
  const order = { id: "o-" + state.nextId, open: true, ...fields };
  state.nextId += 1;
  state.orders.push(order);
  return order;
}

export function openOrderCount() {
  return state.orders.filter((order) => order.open).length;
}
`;

const appTests = `import test from "node:test";
import assert from "node:assert/strict";
import { buildApp } from "../src/app.js";

function startedApp() {
  const app = buildApp();
  app.start();
  return app;
}

test("orders list is seeded on start", () => {
  const response = startedApp().handle({ method: "GET", path: "/orders", query: {} });
  assert.equal(response.status, 200);
  assert.equal(JSON.parse(response.body).length, 3);
});

test("single order lookup by query id", () => {
  const response = startedApp().handle({ method: "GET", path: "/order", query: { id: "o-2" } });
  assert.equal(response.status, 200);
  assert.equal(JSON.parse(response.body).item, "monitor");
});

test("missing order returns 404 with the domain error", () => {
  const response = startedApp().handle({ method: "GET", path: "/order", query: { id: "nope" } });
  assert.equal(response.status, 404);
  assert.equal(JSON.parse(response.body).error, "no such order");
});

test("order creation returns 201 and persists", () => {
  const app = startedApp();
  const created = app.handle({
    method: "POST",
    path: "/orders",
    query: {},
    body: { item: "lamp" },
  });
  assert.equal(created.status, 201);
  const listed = app.handle({ method: "GET", path: "/orders", query: {} });
  assert.equal(JSON.parse(listed.body).length, 4);
});

test("greeting renders the template with open order count", () => {
  const response = startedApp().handle({
    method: "GET",
    path: "/greeting",
    query: { name: "Mo" },
  });
  assert.equal(response.body, "Hello Mo, you have 2 open orders.");
});

test("greeting without a name hits the error handler", () => {
  const response = startedApp().handle({ method: "GET", path: "/greeting", query: {} });
  assert.equal(response.status, 500);
  assert.equal(JSON.parse(response.body).error, "name is required");
  assert.equal(JSON.parse(response.body).path, "/greeting");
});

test("admin routes require the token middleware", () => {
  const app = startedApp();
  const denied = app.handle({ method: "GET", path: "/admin/purge", query: {} });
  assert.equal(denied.status, 403);
  const allowed = app.handle({
    method: "GET",
    path: "/admin/purge",
    query: { token: "letmein" },
  });
  assert.equal(JSON.parse(allowed.body).purged, true);
});

test("unknown paths fall through to 404", () => {
  const response = startedApp().handle({ method: "GET", path: "/nope", query: {} });
  assert.equal(response.status, 404);
});
`;

const files = {
  "package.json": `{
  "name": "orders-web",
  "version": "2.3.0",
  "private": true,
  "type": "module",
  "scripts": {
    "test": "node --test"
  }
}
`,
  "README.md": `# orders-web

Synthetic orders web app used as a delegate evaluation fixture. Runs on the
vendored \`vendor/microweb\` framework (v1). The v2 framework ships alongside
it in \`vendor/microweb2\` with a codemod and \`MIGRATION.md\`; the app has not
been migrated.

Run the suite with \`npm test\` (zero dependencies, Node 22, \`node --test\`).
`,
  "CHANGELOG.md": `# Changelog

## 2.3.0
- Admin purge endpoint behind the token middleware.

## 2.2.0
- Greeting endpoint with templated open-order counts.

## 2.0.0
- Rebuilt on microweb v1.
`,
  "vendor/microweb/index.js": microwebV1,
  "vendor/microweb2/index.js": microwebV2,
  "vendor/microweb2/MIGRATION.md": migrationGuide,
  "vendor/microweb2/codemod.mjs": codemod,
  "src/app.js": appSource,
  "src/store.js": storeSource,
  "test/app.test.js": appTests,
};

buildFixture("delegate.longhorizon.dep-major-upgrade", files);
