# Cross-host replay answer script

Execute the supplied replay input by following `replay-skill/SKILL.md` and any
skill-local references it directs you to read. The current directory is a
disposable fixture repository. Treat `case-input.json` (and `source-fixture.md`,
when present) as the complete user input.

- Do not inspect parent directories or search for evaluation expectations.
- Do not commit, push, open a pull request, mutate a tracker, publish, deploy,
  install globally, or send external messages.
- For planning skills, do not write repository files.
- For implementation skills, make only the minimal fixture changes authorized
  by the input and run the repository's declared checks. Use host workers only
  when both the input and the active host make that safe.
- A worker engine is valid only when the active host actually dispatches the
  worker or subagent calls required by that engine. Never substitute an inline
  implementation plus a worker label. Treat supplied worker reports as outcomes
  to exercise through real worker dispatch, not as proof by themselves.
- Return the skill's real final artifact, not an evaluation or a description of
  what the skill would do.

## Question accounting

`question_count` is always the number of material blocking questions the host
actually emitted through its own user-question mechanism — observed, never
inferred. A settled, executable input needs no questions, so it emits none and
`question_count` is `0`. Do not list assumptions, questions merely considered,
or details resolved from the fixture.

## Interactive discovery (two-phase, same session)

When the input is genuinely vague and the skill must ask before it can decide,
run the discovery as two turns of one persisted host session/thread — never a
single one-shot answer that merely lists questions it "would" ask.

- **Phase 1 — ask and stop.** Ground in the repository, then emit the host's
  real material blocking questions (audience, trigger, channel, success signal,
  scope boundary) through the host's user-question mechanism and stop. Do not
  invent answers or emit the final artifact. `question_count` is the number of
  questions emitted here.
- **Phase 2 — resume and settle.** Resume that exact session/thread (Claude
  Code `--resume <session-id>`, Codex `exec resume <thread-id>`, OpenCode
  `run -s <session-id>`) and supply this one fixed, host-neutral answer
  sequence, identical across every host:
  1. Audience: signed-in end users.
  2. Trigger: tracked item status changes.
  3. Channel: in-app notification center only.
  4. Success signal: an unread notification is visible within five seconds of
     the status change.
  5. Scope boundary: email, push, and admin-only audiences are out of scope.
  Then continue the skill to its settled artifact.

A host that cannot stop on real emitted questions and resume the same session
records the discovery row as `fail` or a justified `unverified` — never a pass.
Emitting a final artifact in one shot without a genuine phase-1 stop is not a
settled two-phase discovery and must not be recorded as one.

## Response delimiters

End the response with exactly these four delimiters. Put the complete skill
artifact between the first pair and, between the second pair, a JSON array of
the material blocking questions actually emitted (empty when none were emitted).

```text
===ARTIFACT===
<complete artifact>
===END ARTIFACT===
===QUESTIONS===
[]
===END QUESTIONS===
```
