# Vision Gate (수동/온디맨드)

Vision gate — 결정론 게이트(E2E/불변식, A·B영역)로 잡을 수 없는
"진짜 시각 판정"만 Claude 비전 API에 위임하는 수동 게이트. **CI에는 포함되지 않는다.**

## 무엇을 하나

1. Playwright(chromium)로 `rubric.mjs`에 정의된 페이지들을 풀페이지 스크린샷.
2. 각 스크린샷을 페이지별 루브릭과 함께 Claude 비전 API로 전송해 구조화 출력(JSON)으로 채점.
3. 결과를 콘솔에 요약 출력 + `vision-report.json`으로 저장. `fail` 판정이 하나라도 있으면 `exit 1`.

## 루브릭

모든 페이지에 공통 적용 (`rubric.mjs`의 `RUBRIC_CRITERIA`):

- (a) 텍스트 겹침/잘림 없나
- (b) 주요 요소(내비·제목·CTA) 보이나
- (c) 레이아웃 깨짐/요소 이탈 없나
- (d) 색/대비 이상 없나
- (e) 페이지 의도에 부합하나 (`rubric.mjs`의 `PAGES[].intent`)

페이지별 verdict는 `pass` / `warn` / `fail` 세 단계. `fail`만 게이트를 막는다.

## 다양성(diversity) 축 (이슈 #92)

표준 준수만 채점하면 채점 자체가 수렴을 강화한다 — 모든 화면이 admin 템플릿
뼈대를 베끼는 쪽으로 점수가 쏠린다. 이를 보완하기 위해 각 스크린샷을 채점할
때 비전 모델에게 내비게이션·레이아웃 **뼈대(skeleton)** 도 함께 분류하게 하고
(`rubric.mjs`의 `DIVERSITY_ARCHETYPES`), 결과를 `scripts/vision-gate/diversity.mjs`
의 순수 함수로 채점한다.

- **감점**: 실제 뼈대가 기준 템플릿(`rubric.mjs`의 `BASELINE_ARCHETYPE_ID`,
  현재 `admin-sidebar`)과 같은데 그 페이지가 그 원형으로 선언되지 않았을 때.
- **가점**: 실제 뼈대가 그 페이지에 **선언된 원형**(`PAGES[].archetype`, 또는
  `--archetype` 옵션으로 오버라이드한 값)과 일치할 때.
- 두 조건은 동시에 성립할 수 있고(선언과도 다르고 기준 템플릿에도 수렴), 그
  경우 감점을 합산한다 — 서로 다른 문제이기 때문이다.

**페이지 단위** 다양성 점수는 게이트를 막지 않는다 — 정보성 신호로 콘솔 요약과
`vision-report.json`의 `diversitySummary`(그리고 각 페이지 결과의 `diversity`
필드)로 노출된다.

### 원형(archetype) 어휘 — `archetypes/index.ts`에서 파생 (이슈 #37 RC3)

`DIVERSITY_ARCHETYPES`(`rubric.mjs`)는 더 이상 자체 어휘를 하드코딩하지 않고
카탈로그의 레이아웃 원형 단일 진실원천인 `archetypes/index.ts`의
`LAYOUT_ARCHETYPES`(10종)에서 파생한다 — `id`는 그 10종의 `name` + `other`.
`scripts/gen-llms.mjs`가 이미 쓰는 패턴(Node 22.18+의 `.ts` 타입 스트리핑
`await import("../../archetypes/index.ts")`)을 그대로 따른다. 각 원형의
`description`은 비전 모델이 스크린샷만 보고 분류해야 하므로 색/콘텐츠가
아니라 내비게이션 구조·레이아웃 형태만으로 쓴 영문 설명이다.
`BASELINE_ARCHETYPE_ID`도 `sidebar-app`(옛 `admin-sidebar`)으로 맞췄다.

### run 단위(pairwise) 수렴 지표 (이슈 #37 RC3)

페이지 단위 점수는 "이 화면의 뼈대가 이 화면이 선언한 원형과 일치하는가"만
본다 — 여러 화면이 **서로** 같은 뼈대로 수렴했는지는 구조적으로 못 잡는다.
N개 화면이 전부 같은 원형으로 나와도 각자 선언과 일치하기만 하면 전원
가점이다(실제 "4/4 동일 뼈대" 사례가 이 방식으로 통과했다). 이를 잡기 위해
`summarizeDiversity()`가 매 실행마다 감지된(vision 모델이 실제로 분류한)
뼈대들만으로 run 단위 지표를 계산한다(`diversity.mjs`):

- `distinctSkeletons` / `distinctRatio` — 감지된 뼈대의 고유 개수 / 전체
  스크린샷 수.
- `modeSkeleton` / `modeShare` — 가장 많이 감지된 뼈대와 그 점유율.
- `runConverged` — `modeShare`가 `MODE_SHARE_FAIL_THRESHOLD`(0.5, "과반")를
  초과하거나 `distinctRatio`가 `DISTINCT_RATIO_FAIL_THRESHOLD`(1/3)보다
  낮으면 true. 감지된 스크린샷이 `MIN_SAMPLES_FOR_CONVERGENCE_CHECK`(2)
  미만이면(예: 1페이지만 채점) 표본이 너무 작아 판단하지 않는다.

**`runConverged`는 페이지 단위 다양성 점수와 달리 게이트를 막는다** —
`fail` 판정과 동일하게 `process.exitCode = 1`을 설정한다. 이 지표가 이번
수정의 핵심이다: 페이지 단위로는 잡을 수 없는 "여러 화면이 뼈대만 놓고 보면
서로 다 같다"는 문제를 막는 유일한 신호이기 때문이다.

### `--pages <json경로>` 옵션 (이슈 #37 RC3)

기본값(`rubric.mjs`의 `PAGES`, 카탈로그 자기 페이지)을 그대로 쓰지 않고 소비
프로젝트(예: fruit-market)의 산출물을 채점하고 싶을 때 쓴다. `{ path, name,
intent, archetype? }` 객체 배열을 담은 JSON 파일을 가리킨다. `archetype`을
넣으면 `DIVERSITY_ARCHETYPES`에 있는 id여야 하고(아니면 즉시 에러), 생략하면
그 페이지는 선언 원형 없이(수렴 감점만 적용되고 declared-archetype 매치
가점/감점은 없이) 채점된다.

```sh
ANTHROPIC_API_KEY=sk-ant-... pnpm test:vision -- --pages ./consumer-pages.json
```

### `--archetype <name>` 옵션

이번 실행에서 모든 페이지의 기대 원형을 `<name>`으로 오버라이드한다(개별
페이지의 `PAGES[].archetype` 대신 사용). `rubric.mjs`의 `DIVERSITY_ARCHETYPES`
에 없는 이름을 주면 에러로 즉시 중단한다.

```sh
ANTHROPIC_API_KEY=sk-ant-... pnpm test:vision -- --archetype admin-sidebar
```

### 기준 스크린샷

별도의 기준 스크린샷 파일 셋을 관리하지 않는다 — "기준 템플릿과 뼈대가
같은가"는 매 실행마다 비전 모델이 대상 스크린샷을 보고 뼈대를 분류한 뒤,
그 결과를 코드로(로컬에서, API 없이도) `BASELINE_ARCHETYPE_ID`와 비교하는
방식이라 기준 이미지 자체를 폐쇄망에 저장해 둘 필요가 없다. 루브릭 파싱과
점수 합산(`diversity.mjs`)은 `pnpm test`로 API 키 없이 단위 테스트된다.

## 대상 페이지

`rubric.mjs`의 `PAGES` 배열 참고. 비용 의식 때문에 **11개로 제한**했다 — 홈 +
주요 카탈로그 페이지(tokens/icons/components/patterns/rules/profiles) + 템플릿
샘플 4종(admin/brokerage/shop/passkey-auth). 전체 템플릿을 다 넣으면 예산 상한을
넘어가므로 대표성 있는 것만 커버하되, **어떤 원형이 빠졌는지는 명시한다** —
`rubric.mjs`의 `UNCOVERED_ARCHETYPES` 가 그 목록이고 `diversity.test.mjs` 가
`PAGES` 가 채점하는 원형 ∪ `UNCOVERED_ARCHETYPES` == 전체 원형임을 강제한다.
원형을 새로 추가하면 페이지를 넣거나 그 목록에 적어야 테스트가 통과한다(#55).
페이지 추가/변경은 `rubric.mjs` 편집만으로 가능.

템플릿 페이지는 카탈로그 크롬(사이트 상단 내비·페이지 머리말·점선 데모 패널)
안에 템플릿 프레임이 박힌 형태로 찍힌다. 그래서 프롬프트(`run.mjs`
`buildRubricText`)가 **뼈대 분류 범위를 그 템플릿 프레임 안으로 한정**한다 —
`focus-task` 처럼 "내비가 없다"는 부재로 정의되는 원형은 이 한정이 없으면
둘러싼 카탈로그 크롬이 템플릿 자신의 내비로 읽혀 오분류된다.

## 사용법

```sh
# ANTHROPIC_API_KEY 필요 (하드코딩 금지 — env로만 주입)
ANTHROPIC_API_KEY=sk-ant-... pnpm test:vision

# 로컬 dev 서버 대상으로 실행하고 싶으면
VISION_BASE_URL=http://localhost:3000 ANTHROPIC_API_KEY=sk-ant-... pnpm test:vision
```

`VISION_BASE_URL` 기본값은 `https://ui.doksam.com`.

### `ANTHROPIC_API_KEY` 없이 실행하면

스크립트는 에러 대신 **dry-run**으로 동작한다 — chromium을 띄워 스크린샷은
실제로 찍고 각 페이지에 대해 Claude로 보낼 프롬프트를 조립해 콘솔에
출력하지만, 실제 API 호출은 하지 않는다. 스크린샷/프롬프트 조립 경로를
API 비용 없이 검증할 때 사용.

## 출력

- 콘솔: 페이지별 verdict(PASS/WARN/FAIL) + 발견된 issue 개수, 마지막에
  pass/warn/fail 집계.
- `vision-report.json` (이 디렉터리에 생성, git 미추적): 페이지별 전체 결과
  (`{page, verdict, issues, skeleton, url, consoleErrors, diversity}`) +
  최상위 `diversitySummary`(`{totalScore, scoredPages, signaledPages,
  bonusPages, penaltyPages, convergentPages, distinctSkeletons, distinctRatio,
  modeSkeleton, modeShare, runConverged}`).
- `__screenshots__/*.jpg` (이 디렉터리에 생성, git 미추적): 실행 시 찍은
  스크린샷. jpeg quality 60으로 저장해 비전 토큰 비용을 낮춘다.

## 비용 소견

- 페이지 10개 × 이미지 1장(jpeg q60, 풀페이지 1280px 폭 기준 실측 54~323KB)
  + 루브릭 프롬프트(~250 토큰) + 구조화 출력(json_schema) 1회 호출.
- 모델: `claude-opus-4-8`, `output_config.effort: "low"`로 채점 비용을 낮춤.
- 이미지 토큰은 페이지 높이(풀페이지 캡처)에 비례해 커진다 — 스크린샷이
  유난히 크게 나오는 페이지가 있으면(현재 `rules.jpg` 274KB, `template-brokerage.jpg`
  219KB) 리사이즈/뷰포트 조정을 고려할 것.
- 대략 실행 1회당 미화 몇 센트 수준(정확한 금액은 이미지 크기·실제 토큰
  사용량에 따라 달라짐 — `pnpm test:vision` 실행 후 Anthropic 콘솔의 사용량으로
  확인 권장).
