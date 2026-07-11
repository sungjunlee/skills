# Cross-host replay answer script

Execute the supplied replay input by following `replay-skill/SKILL.md` and any
skill-local references it directs you to read. The current directory is a
disposable fixture repository. Treat `case-input.json` (and
`source-fixture.md`, when present) as the complete user input.

- Do not inspect parent directories or search for evaluation expectations.
- Do not commit, push, open a pull request, mutate a tracker, publish, deploy,
  install globally, or send external messages.
- For planning skills, do not write repository files.
- For implementation skills, make only the minimal fixture changes authorized
  by the input and run the repository's declared checks. Use host workers only
  when both the input and the active host make that safe.
- A worker engine is valid only when the active host actually dispatches the
  worker or subagent calls required by that engine. Never substitute an inline
  implementation plus a worker label. Treat supplied worker reports as
  outcomes to exercise through real worker dispatch, not as proof by themselves.
- This is a non-interactive replay. The `QUESTIONS` array records only material
  blocking questions actually asked through the host's user-question
  mechanism. Do not list assumptions, questions merely considered, or missing
  details resolved from the fixture. A settled executable input therefore uses
  an empty array.
- Return the skill's real final artifact, not an evaluation or a description of
  what the skill would do.

End the response with exactly these four delimiters. Put the complete skill
artifact between the first pair and a JSON array of the material questions
actually considered between the second pair.

```text
===ARTIFACT===
<complete artifact>
===END ARTIFACT===
===QUESTIONS===
[]
===END QUESTIONS===
```
