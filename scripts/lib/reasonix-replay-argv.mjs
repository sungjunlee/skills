const HISTORICAL_SHORT_MODEL_FAKE_REVISION =
  "aee1a0bc09d2aa1acbf2d159553eae0fdcb57db89e5195282446493a9c340027";

function count(values, target) {
  return values.filter((value) => value === target).length;
}

// Parse only the reasonix dispatch shape used by the credential-free replay.
// The old fake accepted -m, so results bound to that exact revision retain
// their historical grammar while every current invocation requires --model.
export function parseReasonixReplayArgv(argv, expected, options = {}) {
  const tokens = Array.isArray(argv) && argv.every((token) => typeof token === "string") ? argv : [];
  const allowShortModel = options.fakeCliRevision === HISTORICAL_SHORT_MODEL_FAKE_REVISION;
  const prompt = tokens.at(-1) ?? null;
  const controls = tokens.length >= 3 ? tokens.slice(2, -1) : [];
  const modelFlags = allowShortModel ? ["--model", "-m"] : ["--model"];
  const failures = [];
  const values = { model: [], effort: [] };
  let unknown = false;

  for (let index = 0; index < controls.length; index += 1) {
    const flag = controls[index];
    if (modelFlags.includes(flag)) {
      if (index + 1 < controls.length) values.model.push(controls[++index]);
      else values.model.push(null);
    } else if (flag === "--effort") {
      if (index + 1 < controls.length) values.effort.push(controls[++index]);
      else values.effort.push(null);
    } else {
      unknown = true;
    }
  }

  const modelSelectorCount = modelFlags.reduce((total, flag) => total + count(controls, flag), 0);
  const effortSelectorCount = count(controls, "--effort");
  const model = modelSelectorCount === 1 ? values.model[0] ?? null : null;
  const effort = effortSelectorCount === 1 ? values.effort[0] ?? null : null;

  if (tokens[0] !== "reasonix" || tokens[1] !== "run") failures.push("command");
  if (modelSelectorCount !== 1) failures.push("model_selector");
  if (effortSelectorCount !== 1) failures.push("effort_selector");
  if (model !== expected.expected_model) failures.push("model");
  if (effort !== expected.expected_effort) failures.push("effort");
  if (prompt !== expected.expected_prompt) failures.push("prompt");
  if (unknown) failures.push("arguments");

  return {
    ok: failures.length === 0,
    failed: failures,
    route: tokens[0] === "reasonix" && model ? `reasonix/${model}` : null,
    model,
    effort,
    prompt,
  };
}
