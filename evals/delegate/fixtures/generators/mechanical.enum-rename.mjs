#!/usr/bin/env node
// Rebuilds the delegate.mechanical.enum-rename fixture: the synthetic
// order-service used for the 2026-07-22 bounded run, byte-identical.

import { buildFixture } from "./lib.mjs";

const files = {
  "package.json": `{
  "name": "order-service",
  "version": "1.2.0",
  "private": true,
  "type": "module",
  "scripts": {
    "test": "node --test"
  }
}
`,
  "README.md": `# order-service

Synthetic order status service used as a delegate evaluation fixture.

- \`src/status.js\` — status enum and transition rules
- \`src/serialize.js\` — wire (integer) serialization
- \`src/api.js\` — public API response shape

Run the suite with \`npm test\` (zero dependencies, Node 22, \`node --test\`).
`,
  "CHANGELOG.md": `# Changelog

## 1.2.0
- Added the SHIPPED order status between PACKED and DELIVERED.

## 1.1.0
- Wire codes for order statuses are now stable integers.

## 1.0.0
- Initial order service extraction.
`,
  "src/status.js": `export const OrderStatus = {
  PENDING: "PENDING",
  PACKED: "PACKED",
  SHIPPED: "SHIPPED",
  DELIVERED: "DELIVERED",
  CANCELLED: "CANCELLED",
};

const TRANSITIONS = {
  [OrderStatus.PENDING]: [OrderStatus.PACKED, OrderStatus.CANCELLED],
  [OrderStatus.PACKED]: [OrderStatus.SHIPPED, OrderStatus.CANCELLED],
  [OrderStatus.SHIPPED]: [OrderStatus.DELIVERED],
  [OrderStatus.DELIVERED]: [],
  [OrderStatus.CANCELLED]: [],
};

export function canTransition(from, to) {
  return (TRANSITIONS[from] ?? []).includes(to);
}

export function assertTransition(from, to) {
  if (!canTransition(from, to)) {
    throw new Error(\`illegal transition \${from} -> \${to}\`);
  }
  return to;
}
`,
  "src/serialize.js": `import { OrderStatus } from "./status.js";

const STATUS_TO_CODE = {
  [OrderStatus.PENDING]: 0,
  [OrderStatus.PACKED]: 1,
  [OrderStatus.SHIPPED]: 2,
  [OrderStatus.DELIVERED]: 3,
  [OrderStatus.CANCELLED]: 4,
};

const CODE_TO_STATUS = Object.fromEntries(
  Object.entries(STATUS_TO_CODE).map(([status, code]) => [code, status]),
);

export function toWire(status) {
  const code = STATUS_TO_CODE[status];
  if (code === undefined) throw new Error(\`unknown status \${status}\`);
  return code;
}

export function fromWire(code) {
  const status = CODE_TO_STATUS[code];
  if (status === undefined) throw new Error(\`unknown wire code \${code}\`);
  return status;
}
`,
  "src/api.js": `import { OrderStatus } from "./status.js";
import { toWire } from "./serialize.js";

const DISPLAY_LABELS = {
  [OrderStatus.PENDING]: "Pending",
  [OrderStatus.PACKED]: "Packed",
  [OrderStatus.SHIPPED]: "Shipped",
  [OrderStatus.DELIVERED]: "Delivered",
  [OrderStatus.CANCELLED]: "Cancelled",
};

export function buildOrderResponse(order) {
  return {
    id: order.id,
    statusCode: toWire(order.status),
    statusLabel: DISPLAY_LABELS[order.status],
  };
}
`,
  "test/status.test.js": `import test from "node:test";
import assert from "node:assert/strict";
import { OrderStatus, canTransition, assertTransition } from "../src/status.js";

test("packed orders can be marked SHIPPED", () => {
  assert.equal(canTransition(OrderStatus.PACKED, OrderStatus.SHIPPED), true);
});

test("SHIPPED orders can only be delivered", () => {
  assert.equal(canTransition(OrderStatus.SHIPPED, OrderStatus.DELIVERED), true);
  assert.equal(canTransition(OrderStatus.SHIPPED, OrderStatus.CANCELLED), false);
  assert.equal(canTransition(OrderStatus.SHIPPED, OrderStatus.PACKED), false);
});

test("illegal transitions throw", () => {
  assert.throws(() => assertTransition(OrderStatus.DELIVERED, OrderStatus.SHIPPED));
});
`,
  "test/serialize.test.js": `import test from "node:test";
import assert from "node:assert/strict";
import { OrderStatus } from "../src/status.js";
import { toWire, fromWire } from "../src/serialize.js";

test("every status round-trips through the wire format", () => {
  for (const status of Object.values(OrderStatus)) {
    assert.equal(fromWire(toWire(status)), status);
  }
});

test("SHIPPED keeps its wire code", () => {
  assert.equal(toWire(OrderStatus.SHIPPED), 2);
  assert.equal(fromWire(2), OrderStatus.SHIPPED);
});

test("unknown values are rejected", () => {
  assert.throws(() => toWire("TELEPORTED"));
  assert.throws(() => fromWire(99));
});
`,
  "test/api.test.js": `import test from "node:test";
import assert from "node:assert/strict";
import { OrderStatus } from "../src/status.js";
import { buildOrderResponse } from "../src/api.js";

test("shipped orders keep their public label and wire code", () => {
  const response = buildOrderResponse({ id: "o-1", status: OrderStatus.SHIPPED });
  assert.deepEqual(response, { id: "o-1", statusCode: 2, statusLabel: "Shipped" });
});

test("every status has a display label", () => {
  for (const status of Object.values(OrderStatus)) {
    const response = buildOrderResponse({ id: "o-2", status });
    assert.equal(typeof response.statusLabel, "string");
    assert.ok(response.statusLabel.length > 0);
  }
});
`,
};

buildFixture("delegate.mechanical.enum-rename", files);
