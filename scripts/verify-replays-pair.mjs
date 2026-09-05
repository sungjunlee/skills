import { duplicates, same } from "./lib/schema-validator.mjs";

export function dispatchDerived(replayCase, result) {
  const expected = replayCase.dispatch_contract;
  if (!expected) return { ok: true, failed: [] };
  const observed = result.dispatch_observation;
  if (!observed) return { ok: false, failed: ["missing_observation"] };

  const argv = observed.argv ?? [];
  const prompt = expected.expected_prompt;
  const checks = [
    ["host_dispatched", observed.host_dispatched === true],
    ["route", observed.resolved_route === replayCase.expected_route],
    ["model", observed.resolved_model === expected.expected_model],
    ["effort", observed.resolved_effort === expected.expected_effort],
    ["prompt", argv.length > 0 && argv[argv.length - 1] === prompt && argv.includes(prompt)],
    ["cwd", observed.cwd === expected.expected_cwd],
    ["stdin", observed.stdin === expected.expected_stdin],
    ["outcome", observed.outcome === expected.expected_outcome],
    [
      "output",
      expected.expected_outcome === "success"
        ? observed.output === expected.expected_output && Boolean(observed.output)
        : observed.output === null || observed.output === expected.expected_output,
    ],
    ["elapsed", Number.isInteger(observed.elapsed_ms) && observed.elapsed_ms >= 0],
  ];
  if (expected.expected_outcome === "dispatch_cli_error") {
    checks.push(["terminated_before_deadline", observed.terminated_before_deadline === true]);
    checks.push([
      "elapsed_before_deadline",
      Number.isInteger(observed.elapsed_ms) && observed.elapsed_ms < expected.deadline_seconds * 1000,
    ]);
  }
  return {
    ok: checks.every(([, passed]) => passed),
    failed: checks.filter(([, passed]) => !passed).map(([name]) => name),
  };
}

export function countInRange(observed, range) {
  return {
    observed,
    passed: Number.isInteger(observed) && observed >= range.min && observed <= range.max,
  };
}

export function assertionObservation(assertion, replayCase, result) {
  switch (assertion.type) {
    case "output_field_present": {
      const observed = result.observed_output_fields.includes(assertion.field);
      return { observed, passed: observed };
    }
    case "route_equals":
      return {
        observed: result.observed_route,
        passed: result.observed_route === replayCase.expected_route,
      };
    case "engine_equals":
      return {
        observed: result.observed_engine,
        passed: result.observed_engine === replayCase.expected_engine,
      };
    case "question_count_in_range":
      return countInRange(result.question_count, replayCase.question_count_range);
    case "host_subagent_dispatch_count_in_range":
      return countInRange(
        result.observed_host_subagent_dispatch_count,
        replayCase.host_subagent_dispatch_count_range,
      );
    case "evidence_citation_count_in_range":
      return countInRange(
        result.observed_evidence_citation_count,
        replayCase.evidence_citation_count_range,
      );
    case "zero_finding_panelist_count_in_range":
      return countInRange(
        result.observed_zero_finding_panelist_count,
        replayCase.zero_finding_panelist_count_range,
      );
    case "starved_seat_zero_finding_count_in_range":
      return countInRange(
        result.observed_starved_seat_zero_finding_count,
        replayCase.starved_seat_zero_finding_count_range,
      );
    case "control_seat_anchored_finding_count_in_range":
      return countInRange(
        result.observed_control_seat_anchored_finding_count,
        replayCase.control_seat_anchored_finding_count_range,
      );
    case "escalation_equals":
      return {
        observed: result.observed_escalation,
        passed: result.observed_escalation === replayCase.expected_escalation,
      };
    case "side_effect_absent": {
      const observed = !result.side_effects.includes(assertion.side_effect);
      return { observed, passed: observed };
    }
    default:
      throw new Error(`unreachable assertion type: ${assertion.type}`);
  }
}

export function validateReplayPair(replayCase, result) {
  const errors = [];
  if (result.case_id !== replayCase.case_id) {
    return [`result case_id ${JSON.stringify(result.case_id)} does not match ${JSON.stringify(replayCase.case_id)}`];
  }

  const caseIds = replayCase.semantic_assertions.map((assertion) => assertion.assertion_id);
  const resultIds = result.assertion_results.map((assertion) => assertion.assertion_id);
  const duplicateIds = duplicates(resultIds);
  if (duplicateIds.length > 0) {
    errors.push(`duplicate assertion result id(s): ${[...new Set(duplicateIds)].join(", ")}`);
  }
  for (const id of caseIds) {
    if (!resultIds.includes(id)) errors.push(`missing assertion result ${JSON.stringify(id)}`);
  }
  for (const id of resultIds) {
    if (!caseIds.includes(id)) errors.push(`unexpected assertion result ${JSON.stringify(id)}`);
  }

  if (result.status === "unverified") {
    for (const assertionResult of result.assertion_results) {
      if (assertionResult.status !== "unverified" || assertionResult.observed !== null) {
        errors.push(`unverified assertion ${JSON.stringify(assertionResult.assertion_id)} must have status unverified and observed null`);
      }
    }
    if (result.dispatch_observation?.host_dispatched) {
      errors.push("unverified dispatch result cannot record host_dispatched true");
    }
    return errors;
  }

  for (const assertion of replayCase.semantic_assertions) {
    const assertionResult = result.assertion_results.find(
      (candidate) => candidate.assertion_id === assertion.assertion_id,
    );
    if (!assertionResult) continue;
    if (assertionResult.status === "unverified") {
      errors.push(`executed result cannot contain unverified assertion ${JSON.stringify(assertion.assertion_id)}`);
      continue;
    }
    const derived = assertionObservation(assertion, replayCase, result);
    if (!same(assertionResult.observed, derived.observed)) {
      errors.push(
        `assertion ${JSON.stringify(assertion.assertion_id)} observed ${JSON.stringify(assertionResult.observed)}; derived ${JSON.stringify(derived.observed)}`,
      );
    }
    const expectedStatus = derived.passed ? "pass" : "fail";
    if (assertionResult.status !== expectedStatus) {
      errors.push(
        `assertion ${JSON.stringify(assertion.assertion_id)} status ${assertionResult.status}; derived ${expectedStatus}`,
      );
    }
  }

  if (replayCase.dispatch_contract && !result.dispatch_observation) {
    errors.push("executed dispatch result is missing dispatch_observation");
  } else if (!replayCase.dispatch_contract && result.dispatch_observation) {
    errors.push("dispatch_observation is only valid on a dispatch_contract case");
  }

  const dispatch = dispatchDerived(replayCase, result);
  if (result.status === "pass" && !dispatch.ok) {
    errors.push(`pass status requires dispatch contract checks to pass (failed: ${dispatch.failed.join(", ")})`);
  }

  const allPassed =
    result.assertion_results.every((assertion) => assertion.status === "pass") && dispatch.ok;
  const expectedOverall = allPassed ? "pass" : "fail";
  if (result.status !== expectedOverall) {
    errors.push(`overall status ${result.status}; assertion results require ${expectedOverall}`);
  }
  return errors;
}
