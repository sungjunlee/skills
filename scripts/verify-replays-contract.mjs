import path from "node:path";

import { duplicates } from "./lib/schema-validator.mjs";

export function validateCaseContract(replayCase) {
  const errors = [];
  const assertions = replayCase.semantic_assertions;

  if (replayCase.expected_route === null && replayCase.expected_engine === null) {
    errors.push("at least one of expected_route or expected_engine must be non-null");
  }
  if (
    replayCase.question_count_range !== null &&
    replayCase.question_count_range.min > replayCase.question_count_range.max
  ) {
    errors.push("question_count_range.min must not exceed question_count_range.max");
  }
  const optionalRanges = [
    "host_subagent_dispatch_count_range",
    "evidence_citation_count_range",
    "zero_finding_panelist_count_range",
    "starved_seat_zero_finding_count_range",
    "control_seat_anchored_finding_count_range",
  ];
  for (const name of optionalRanges) {
    const range = replayCase[name];
    if (range !== undefined && range.min > range.max) {
      errors.push(`${name}.min must not exceed ${name}.max`);
    }
  }
  if (
    replayCase.input_fixture.kind === "file" &&
    (path.isAbsolute(replayCase.input_fixture.value) ||
      replayCase.input_fixture.value.split(/[\\/]/).includes(".."))
  ) {
    errors.push("file input_fixture values must be repository-relative and cannot traverse upward");
  }

  const duplicateIds = duplicates(assertions.map((assertion) => assertion.assertion_id));
  if (duplicateIds.length > 0) {
    errors.push(`duplicate semantic assertion id(s): ${[...new Set(duplicateIds)].join(", ")}`);
  }

  for (const assertion of assertions) {
    if (!assertion.assertion_id || assertion.assertion_id.trim() === "") {
      errors.push("assertion_id must be a non-empty string");
    }
    if (assertion.assertion_id && /\s/.test(assertion.assertion_id)) {
      errors.push(`assertion_id ${JSON.stringify(assertion.assertion_id)} contains whitespace`);
    }
  }

  const outputAssertions = assertions.filter((assertion) => assertion.type === "output_field_present");
  for (const field of replayCase.required_output_fields) {
    if (!outputAssertions.some((assertion) => assertion.field === field)) {
      errors.push(`required output field ${JSON.stringify(field)} has no output_field_present assertion`);
    }
  }
  for (const assertion of outputAssertions) {
    if (!replayCase.required_output_fields.includes(assertion.field)) {
      errors.push(`output assertion ${JSON.stringify(assertion.assertion_id)} names a non-required field`);
    }
  }

  const singletonExpectations = [
    ["route_equals", replayCase.expected_route !== null],
    ["engine_equals", replayCase.expected_engine !== null],
    ["question_count_in_range", replayCase.question_count_range !== null],
    [
      "host_subagent_dispatch_count_in_range",
      replayCase.host_subagent_dispatch_count_range !== undefined,
    ],
    [
      "evidence_citation_count_in_range",
      replayCase.evidence_citation_count_range !== undefined,
    ],
    [
      "zero_finding_panelist_count_in_range",
      replayCase.zero_finding_panelist_count_range !== undefined,
    ],
    [
      "starved_seat_zero_finding_count_in_range",
      replayCase.starved_seat_zero_finding_count_range !== undefined,
    ],
    [
      "control_seat_anchored_finding_count_in_range",
      replayCase.control_seat_anchored_finding_count_range !== undefined,
    ],
    ["escalation_equals", true],
  ];
  for (const [type, expected] of singletonExpectations) {
    const count = assertions.filter((assertion) => assertion.type === type).length;
    const wanted = expected ? 1 : 0;
    if (count !== wanted) errors.push(`${type} must appear ${wanted} time(s), found ${count}`);
  }

  const sideEffectAssertions = assertions.filter((assertion) => assertion.type === "side_effect_absent");
  for (const sideEffect of replayCase.forbidden_side_effects) {
    if (!sideEffectAssertions.some((assertion) => assertion.side_effect === sideEffect)) {
      errors.push(`forbidden side effect ${JSON.stringify(sideEffect)} has no side_effect_absent assertion`);
    }
  }
  for (const assertion of sideEffectAssertions) {
    if (!replayCase.forbidden_side_effects.includes(assertion.side_effect)) {
      errors.push(`side-effect assertion ${JSON.stringify(assertion.assertion_id)} is not forbidden by the case`);
    }
  }

  const dispatch = replayCase.dispatch_contract;
  if (dispatch) {
    if (replayCase.expected_route === null) {
      errors.push("dispatch_contract requires a non-null expected_route");
    }
    if (dispatch.expected_outcome === "success" && dispatch.expected_output === null) {
      errors.push("success dispatch_contract requires a non-null expected_output");
    }
    if (dispatch.expected_outcome !== "success" && dispatch.expected_output !== null) {
      errors.push("failure dispatch_contract expected_output must be null");
    }
    if (dispatch.deadline_seconds <= 0) {
      errors.push("dispatch_contract deadline_seconds must be positive");
    }
    if (!dispatch.expected_model || dispatch.expected_model.trim() === "") {
      errors.push("dispatch_contract expected_model must be non-empty");
    }
    if (!dispatch.expected_prompt || dispatch.expected_prompt.trim() === "") {
      errors.push("dispatch_contract expected_prompt must be non-empty");
    }
  }

  const roundTwo = replayCase.round_two_contract;
  if (roundTwo) {
    if (roundTwo.allowed_routes.length === 0) {
      errors.push("round_two_contract allowed_routes must not be empty");
    }
    if (roundTwo.required_side_count !== 2) {
      errors.push("round_two_contract required_side_count must be 2");
    }
    if (roundTwo.max_extra_rounds !== 0) {
      errors.push("round_two_contract max_extra_rounds must be 0");
    }
  }

  if (replayCase.skill && (replayCase.skill.startsWith("/") || replayCase.skill.includes(".."))) {
    errors.push("skill path must be relative and cannot traverse upward");
  }

  return errors;
}
