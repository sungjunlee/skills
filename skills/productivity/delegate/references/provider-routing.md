# Provider routing

모델 하나가 여러 provider 경로로 제공될 때, 어느 경로로 보낼지 결정하는 참조.
`cli-invocations.md`가 "CLI를 어떻게 부르는가"라면, 이 문서는 "**같은 모델이라면 어느 provider를 쓸 것인가**".

> 상태 스냅샷: 2026-08-05. 인증 상태는 수시로 바뀐다 — dispatch 전에 각 CLI의 인증을 가볍게 재확인한다.
> 모델 존재 여부는 이 문서의 행렬이 아니라 **실제 CLI 모델 목록**이 우선이다 (`opencode models`, `pi --list-models`, `agent models`). 이 행렬은 확인 시점의 스냅샷일 뿐이다.

## 1. CLI 성격 분류

### 단일 provider (경로 고정 — 선택지 없음)

| CLI | 고정 provider | 인증 방식 | 모델 |
|---|---|---|---|
| `codex/*` | OpenAI (ChatGPT OAuth) | `auth_mode: chatgpt` | gpt-5.6-sol / terra / luna |
| `claude/*` | Anthropic (claude.ai) | firstParty OAuth | claude-fable-5 / opus-5 / sonnet-5 |
| `reasonix/*` | DeepSeek 본체 API | DEEPSEEK_API_KEY | deepseek-v4-* |
| `cursor/*` | Cursor/xAI (Grok 계열) | Cursor OAuth | cursor-grok-4.5-* |
| `cline-pass/*` | Cline Pass (고정) | cline-pass provider | glm-5.2 등 |

단일 provider CLI는 route 선택이 곧 provider 선택이다. `codex`를 고르면 OpenAI, `claude`를 고르면 Anthropic, `reasonix`를 고르면 DeepSeek 본체, `cursor`를 고르면 Cursor/xAI, `cline-pass`를 고르면 Cline Pass다.

### 다중 provider (provider 지정이 의미 있음)

| CLI | 현재 인증된 provider | 인증 방식 |
|---|---|---|
| `opencode/*` | `opencode-go` (Go 구독), `opencode` (무료 모델) | api key (auth.json) |
| `pi/*` | `opencode-go` (api_key), `alibaba-plan` (OAuth, 2027-07-21 만료) | auth.json |

`opencode`와 `pi`는 provider를 명시적으로 지정할 수 있다 (`opencode-go/deepseek-v4-flash`, `pi --provider alibaba-plan ...`).

## 2. 모델 × route 매트릭스

같은 모델이 어느 경로로 갈 수 있는지. **굵은 경로 = 기본 추천**. 존재 여부는 dispatch 전 실제 모델 목록으로 재확인한다.

| 모델 | 가능한 route | 쿼터 성격 | 리스크/비용 메모 |
|---|---|---|---|
| `deepseek-v4-flash` | **`opencode-go`** · `pi/alibaba-plan` · `opencode`(free) · `reasonix`(본체) | 구독(free 포함) vs 선불 | 본체는 학습 리스크 + 피크 2배 → 기본은 구독제로 |
| `deepseek-v4-pro` | **`opencode-go`** · `pi/alibaba-plan` · `reasonix`(본체) | 구독 vs 선불 | 같은 이유 |
| `glm-5.2` | **`opencode-go`** · `pi/alibaba-plan` · `opencode` · `cline-pass` | 구독 | 장기 코딩/추론. opencode/cline-pass 경로는 README 예시에도 있음 |
| `qwen3.7-max` / `qwen3.8-max` | **`pi/alibaba-plan`** · `opencode-go` | 구독 (Alibaba Token Plan) | 오프피크 50% 할인 (KST 23:00–09:00) → 야간 배치 우선. catalog엔 qwen3.8-max만 서술 (qwen3.7-max는 pi 목록엔 있으나 catalog 미서술) |
| `gpt-5.6-luna` | **`codex`** · `opencode-go` | Pro 구독 vs Go 구독 | codex 0%일 때 opencode-go 폴백 |
| `grok-4.5` | **`cursor/*`** (xAI 인수 후) · `opencode-go` | 구독 | tool-heavy 작업 |
| `kimi-k3` / `kimi-k2.7-code` | **`opencode-go`** | Go 구독 | kimi-k2.7-code는 catalog에서 retired됐지만 opencode-go 목록엔 여전히 존재 (dispatch 전 재확인) |
| `mimo-v2.5` | **`opencode-go`** · `opencode`(free) | Go 구독 | 멀티모달 전용 (텍스트는 deepseek가 우위) |
| `mimo-v2.5-pro` | `opencode-go` | Go 구독 | catalog에서 pro는 평가 제외 (AA 42, 느림) — 기본 추천 아님 |
| `minimax-m3` | **`opencode-go`** | Go 구독 | 장문/멀티모달 |
| `hy3` | **`opencode-go`** | Go 구독 | 저환각. pi/openrouter 경로는 인증 없음 (2026-08-05) |
| `claude-*` | `claude/*` 단일 | Max 구독 (회사 지원) | 경로 고정 |
| `gpt-5.6-sol/terra` | `codex/*` 단일 | Pro 구독 | 경로 고정 |

## 3. 선택 규칙 (우선순위)

같은 모델이 여러 경로에 있을 때:

1. **단일 provider 모델** → 그 경로 그대로. 고민 생략.
2. **학습 리스크 회피** — 민감/독점 코드는 `reasonix`(DeepSeek 본체, 학습됨)를 피하고 구독제(OpenCode Go, Alibaba)로. 학습에 동의한 일반 작업만 본체 사용.
3. **쿼터 소진 전략** — 선불 잔액(DeepSeek/OpenRouter)이 있으면 그걸 우선 소진, 구독(Go/Alibaba)은 상시 유지분으로.
4. **오프피크 할인** — Alibaba Token Plan은 KST 23:00–09:00 50% 할인 → 지연 가능한 무거운 작업은 이 창에.
5. **피크 요금 회피** — DeepSeek 본체는 KST 10:00–13:00, 15:00–19:00 피크 2배 → 이 시간엔 구독제로.
6. **codex 0% 대비** — codex 주간 쿼터가 0%면 `gpt-5.6-luna`는 `opencode-go`로 폴백 가능.

결정 순서: 리스크 → 쿼터 소진 → 비용(피크/할인) → 성능. 사용자가 명시한 provider가 있으면 그게 최우선. 이 문서의 굵은 기본 추천은 사용자가 provider를 지정하지 않았을 때의 기본값이다 — `cli-invocations.md`에서 "ask the user" 조건이 발동하는 family들(glm/deepseek/kimi/minimax/mimo/hy3/qwen)도 이 기본 추천으로 바로 진행하고, 사용자가 provider를 지정했으면 그 지정이 최우선이다.

## 4. 인증 상태 스냅샷 (2026-08-05)

| CLI/provider | 상태 |
|---|---|
| codex (ChatGPT) | ✅ 로그인 |
| claude (claude.ai) | ✅ 로그인 (max) |
| cursor (agent CLI) | ✅ 로그인 |
| opencode-go | ✅ key 있음 |
| pi/alibaba-plan | ✅ OAuth (2027-07-21까지) |
| pi/nous-portal | ⚠️ 카탈로그 노출, 인증 확인 필요 |
| reasonix (DeepSeek) | ✅ 키 있음 (심링크) |
| openrouter | ❌ Hermes .env에 없음 — OpenRouter 모델은 현재 미경유 (pi/openrouter 인증도 없음) |

> 참고: `model-catalog.md`의 evidence-backed 기본값은 모델 *성능* 기준이고, 이 문서는 *경로 선택* 기준이다. 성능과 경로를 함께 보려면 두 문서를 같이 읽는다. catalog에서 retired/미서술된 모델이 실제 CLI 목록엔 존재할 수 있으므로, dispatch 직전 실제 목록을 최종 기준으로 삼는다.
