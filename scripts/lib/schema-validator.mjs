// Minimal JSON Schema subset validator shared by the replay and delegate
// evaluation verifiers. This intentionally implements only the closed subset
// used by the committed schemas. Keeping the validator small preserves zero
// runtime dependencies while ensuring the committed schemas are the source of
// truth.

export function same(left, right) {
  return JSON.stringify(left) === JSON.stringify(right);
}

export function duplicates(values) {
  const seen = new Set();
  return values.filter((value) => (seen.has(value) ? true : !seen.add(value)));
}

function valueType(value) {
  if (value === null) return "null";
  if (Array.isArray(value)) return "array";
  if (Number.isInteger(value)) return "integer";
  if (typeof value === "number") return "number";
  return typeof value;
}

function matchesType(value, expected) {
  if (expected === "object") {
    return value !== null && typeof value === "object" && !Array.isArray(value);
  }
  if (expected === "array") return Array.isArray(value);
  if (expected === "integer") return Number.isInteger(value);
  if (expected === "number") return typeof value === "number" && Number.isFinite(value);
  if (expected === "null") return value === null;
  return typeof value === expected;
}

function validateComposition(value, schema, location) {
  const errors = [];
  if (schema.oneOf) {
    const alternatives = schema.oneOf.map((candidate) => validateSchema(value, candidate, location));
    const matches = alternatives.filter((candidateErrors) => candidateErrors.length === 0).length;
    if (matches !== 1) {
      const detail = alternatives.flat().slice(0, 3).join("; ");
      errors.push(`${location}: expected exactly one schema alternative${detail ? ` (${detail})` : ""}`);
    }
  }
  if (schema.anyOf) {
    const matches = schema.anyOf.some(
      (candidate) => validateSchema(value, candidate, location).length === 0,
    );
    if (!matches) errors.push(`${location}: did not match any schema alternative`);
  }
  return errors;
}

function validateString(value, schema, location) {
  const errors = [];
  if (schema.minLength !== undefined && value.length < schema.minLength) {
    errors.push(`${location}: must contain at least ${schema.minLength} character(s)`);
  }
  if (schema.pattern !== undefined && !new RegExp(schema.pattern).test(value)) {
    errors.push(`${location}: does not match ${schema.pattern}`);
  }
  return errors;
}

function validateNumber(value, schema, location) {
  const errors = [];
  if (schema.minimum !== undefined && value < schema.minimum) {
    errors.push(`${location}: must be at least ${schema.minimum}`);
  }
  if (schema.maximum !== undefined && value > schema.maximum) {
    errors.push(`${location}: must be at most ${schema.maximum}`);
  }
  return errors;
}

function validateArray(value, schema, location) {
  const errors = [];
  if (schema.minItems !== undefined && value.length < schema.minItems) {
    errors.push(`${location}: must contain at least ${schema.minItems} item(s)`);
  }
  if (schema.maxItems !== undefined && value.length > schema.maxItems) {
    errors.push(`${location}: must contain at most ${schema.maxItems} item(s)`);
  }
  if (schema.uniqueItems) {
    const serialized = value.map((item) => JSON.stringify(item));
    if (new Set(serialized).size !== serialized.length) {
      errors.push(`${location}: items must be unique`);
    }
  }
  if (schema.items) {
    value.forEach((item, index) => {
      errors.push(...validateSchema(item, schema.items, `${location}[${index}]`));
    });
  }
  return errors;
}

function validateObject(value, schema, location) {
  const errors = [];
  for (const required of schema.required ?? []) {
    if (!Object.hasOwn(value, required)) {
      errors.push(`${location}: missing required property ${JSON.stringify(required)}`);
    }
  }
  for (const [key, child] of Object.entries(value)) {
    if (schema.properties?.[key]) {
      errors.push(...validateSchema(child, schema.properties[key], `${location}.${key}`));
    } else if (schema.additionalProperties === false) {
      errors.push(`${location}: unexpected property ${JSON.stringify(key)}`);
    }
  }
  return errors;
}

export function validateSchema(value, schema, location = "$") {
  const errors = [];
  if (Object.hasOwn(schema, "const") && !same(value, schema.const)) {
    errors.push(`${location}: expected constant ${JSON.stringify(schema.const)}`);
  }
  if (schema.enum && !schema.enum.some((candidate) => same(value, candidate))) {
    errors.push(`${location}: expected one of ${schema.enum.map(JSON.stringify).join(", ")}`);
  }
  errors.push(...validateComposition(value, schema, location));
  if (schema.type) {
    const expectedTypes = Array.isArray(schema.type) ? schema.type : [schema.type];
    if (!expectedTypes.some((expected) => matchesType(value, expected))) {
      errors.push(`${location}: expected ${expectedTypes.join(" or ")}, got ${valueType(value)}`);
      return errors;
    }
  }
  if (typeof value === "string") errors.push(...validateString(value, schema, location));
  if (typeof value === "number") errors.push(...validateNumber(value, schema, location));
  if (Array.isArray(value)) errors.push(...validateArray(value, schema, location));
  if (value !== null && typeof value === "object" && !Array.isArray(value)) {
    errors.push(...validateObject(value, schema, location));
  }
  return errors;
}
