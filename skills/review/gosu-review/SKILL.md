---
name: gosu-review
description: 현재 산출물을 4-6명의 전문가 subagent 패널로 리뷰한다. /gosu-review 명시 호출 시 사용하며, 코드·플랜·스킬·설계 문서·repo 상태를 여러 관점에서 보고 싶을 때 쓴다. 실제 subagent를 띄우고 각자의 raw 의견을 숨기지 않는 것이 핵심이다.
---

# gosu-review

여러 고수에게 한 번에 리뷰받는 스킬.

핵심은 단순하다:

1. 4-6명의 서로 다른 전문가를 고른다.
2. 실제 subagent를 병렬로 띄운다.
3. 각자의 의견을 먼저 보여준다.
4. 마지막에 짧게 합성한다.

가짜 패널은 실패다. subagent를 실제로 띄우지 못했다면 패널 리뷰처럼 포장하지 않는다.

## Target

사용자가 `/gosu-review <target>`을 주면 그걸 리뷰한다.

명시 target이 없으면 최근 대화의 마지막 산출물을 고른다: 방금 수정한 코드, 작성한 플랜, 스킬 정의, 설계 결정, 문서 등.

선택한 target은 최종 출력 상단에 반드시 한 줄로 표시한다.

애매한 지시도 실용적으로 처리한다:

- "이거", "방금 것" -> 최근 산출물
- "이 repo", "전체적으로" -> 현재 저장소 전체 상태
- "스킬 서술" -> 관련 `SKILL.md`와 필요한 `references/*`

타겟이 너무 넓으면 멈추지 말고 한 줄로 경고한다:

> 범위가 넓어 캐스팅이 헐거울 수 있음. 더 날카롭게 보려면 `/gosu-review <파일/범위>`로 좁혀줘.

## Cast

타겟에 맞춰 4-6명을 고른다. 목표는 기본 직군을 고르는 것이 아니라, 이 산출물에 가장 날카로운 "고수"를 그때그때 만드는 것이다.

먼저 타겟에서 특화 축을 뽑는다:

- 대상 사용자: 누가 쓰나, 어떤 상황에서 실패하면 아픈가
- 도메인: 금융, 교육, 커뮤니티, 내부툴, 크리에이터, 법무, 데이터, 연구 등
- 산출물 종류: 코드, UX, 문서, 정책, 스킬, 전략, 운영 프로세스, 의사결정
- 실패 양상: 신뢰, 비용, 이해, 유지보수, 채택, 속도, 안전, 품질

그 다음 패널을 섞는다:

- 2-3명은 타겟에 특화된 ad-hoc 고수로 만든다.
  예: "B2B SaaS 온보딩 PM", "교육 콘텐츠 편집장", "업무 도구 운영자", "오픈소스 메인테이너", "규제 리스크 리뷰어", "초보 사용자 대변인".
- 1-2명은 기본 엔지니어링/품질 고수로 둔다.
  예: 아키텍트, 구현 고수, QA 고수, 보안 고수, 운영/SRE 고수.
- 1명은 일부러 다른 사람들이 놓칠 관점으로 둔다.
  예: 카피라이터, 비용 감시자, 반대파 사용자, 유지보수 인수자, 신규 입사자, 고객지원 담당자.

`references/personas.md`는 막힐 때만 seed로 읽는다. 목록에 있는 페르소나를 그대로 채우는 것이 목적이 아니다.

## Dispatch

현재 환경에서 가능한 subagent 도구를 사용한다.

- 먼저 현재 환경의 subagent/multi-agent 도구를 찾는다.
- 각 페르소나마다 하나씩 실제 subagent를 띄운다.
- 리뷰에는 가능한 경우 read-only/explorer 성격의 role을 쓴다.
- 특정 옵션 조합이 실패하면 옵션을 고집하지 말고, 필요한 context를 brief에 직접 넣어 다시 시도한다.
- 모든 agent가 끝날 때까지 기다리되 busy polling은 하지 않는다.

Examples: Claude Code는 `Agent` 계열 도구, Codex는 `tool_search`로 찾은 multi-agent spawn 도구를 쓴다.

subagent 도구를 찾지 못했거나 호출할 수 없으면 이 형식으로 끝낸다:

```text
subagent unavailable: <reason>
This is not a gosu-review result. I can do a single-agent critique if you ask.
```

각 subagent에게는 짧은 brief만 준다:

```text
You are reviewing as: <persona>

Target:
<path, diff, repo scope, or serialized conversation artifact>

Context:
<5-10 lines max: what this is, why it exists, relevant constraints>

Focus:
<persona-specific mandate>

Return this shape:
verdict: ship | fix | rethink
top_findings:
- [P1/P2/P3] <finding> (evidence: <file/line/section or concrete detail>)
surprising_angle: <one thing this persona is likely to notice>
```

## Output

패널의 목소리를 먼저 보여주고, 합성은 그 다음에 둔다.

```text
# gosu-review: <target>

target: <selected target>
casting: <2-3 specialized + 1-2 quality + 1 outsider, one line>

## Panel
- <persona>: <ship|fix|rethink> — <one-line reason>

## Consensus
- [P1] <action> — <persona names>
- [P2] <action> — <persona names>

## Disagreements
- <persona A> vs <persona B>: <issue>. Recommendation: <short call>

## Surprising Angles
- [<persona>] <angle>

## Raw Notes
<details>
<summary><persona></summary>

verdict: ...
top_findings:
- ...
surprising_angle: ...

</details>

## Meta
- requested: N agents
- returned: M agents
- tool: <tool name or "unavailable">
```

Rules:

- Include one `<details>` block for every returned subagent.
- Do not invent findings during synthesis. Every consensus item must name the persona(s) it came from.
- If fewer than 2 agents return, skip synthesis and show only raw notes plus a retry recommendation.
- Keep the final answer compact. This is a panel review, not a research report.

## Optional References

- `references/personas.md` — persona seeds. Use only when casting is not obvious.
- `references/synthesis.md` — tiny synthesis checklist.
