# doksam-ui

[![CI](https://github.com/leeyudok/doksam-ui/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/leeyudok/doksam-ui/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](./LICENSE)
[![Node](https://img.shields.io/badge/node-%3E%3D22-brightgreen.svg)](./package.json)

doksam 프로젝트 공통 UI 표준 — shadcn/ui 기반 컴포넌트·패턴·템플릿 카탈로그입니다.

라이브: **https://ui.doksam.com**

여러 프로젝트가 화면을 만들 때마다 버튼 하나, 빈 상태 하나를 매번 새로 정하지 않도록 **이미 결정된 것**을 한곳에 모아둡니다. 컴포넌트는 "무엇을 쓰는가", 패턴은 "어떻게 조합하는가", 템플릿은 "화면 하나가 어떻게 완성되는가"를 담당합니다.

## 3계층 카탈로그

| 계층 | 개수 | 성격 |
| --- | --- | --- |
| [컴포넌트](https://ui.doksam.com/components) | 104 | shadcn 프리미티브 + 조합 컴포넌트. 항목마다 데모·코드·Do/Don't |
| [패턴](https://ui.doksam.com/patterns) | 31 | 화면 단위 조합 규칙. 공통 22 · 금융 9 |
| [템플릿](https://ui.doksam.com/templates) | 16 | 대시보드·랜딩·콘솔 등 완성된 화면 |

그 외에 [토큰](https://ui.doksam.com/tokens)(색·간격·타이포), [테마·프로필](https://ui.doksam.com/profiles), [아이콘](https://ui.doksam.com/icons) 페이지가 있습니다. **작성 규칙의 단일 진실원천은 [/rules](https://ui.doksam.com/rules)** 이고, 새 화면을 만들기 전에 여기부터 읽으면 됩니다.

## shadcn 레지스트리로 가져다 쓰기

카탈로그의 컴포넌트·패턴은 shadcn CLI 로 바로 설치할 수 있습니다(현재 45개 항목 배포).

```bash
npx shadcn@latest add https://ui.doksam.com/r/badge-extended.json
npx shadcn@latest add https://ui.doksam.com/r/table-sortable.json
```

설치 가능한 항목은 [registry.json](./registry.json) 또는 각 컴포넌트 상세 페이지에서 확인합니다. 의존하는 `components/ui/*` 는 CLI 가 함께 설치합니다.

## 로컬 실행

Node 22 이상, pnpm 을 씁니다.

```bash
pnpm install
pnpm dev            # http://localhost:3000
```

검증 커맨드는 아래와 같고 CI 도 같은 순서로 돕니다.

```bash
pnpm typecheck      # tsc --noEmit
pnpm lint           # eslint
pnpm test           # vitest (단위·렌더)
pnpm test:e2e       # playwright
pnpm build          # 프로덕션 빌드
```

레지스트리 산출물(`public/r`, `llms.txt`)에 영향을 주는 변경이라면 재생성이 필요합니다.

```bash
pnpm registry:build && pnpm gen:llms
```

## 디렉터리 구조

```
app/            라우트 — components · patterns · templates · tokens · profiles · icons · rules
components/     ui/(shadcn 원본) · 조합 컴포넌트 · demos/(쇼케이스 데모) · patterns/
lib/            showcase·patterns·templates 레지스트리 · i18n · finance 유틸
themes/         테마 프리셋 8종 (ocean · forest · violet · ember · rose · slate · gold · ink-bulb)
profiles/       브랜드 프로필 3종 (admin · service · data) — 테마+폰트 고정 조합
fonts/          폰트 프리셋 5종. 실제 파일은 assets/fonts 에 로컬 벤더링
assets/fonts/   next/font/local 용 woff2 + 폰트별 LICENSE
public/r/       shadcn 레지스트리 배포 산출물(빌드 생성물)
```

카탈로그 인덱스와 사이드바는 **`lib/*/registry.ts`** 가 구동합니다. 항목을 추가할 때는 이 레지스트리에 등록해야 페이지에 나타납니다.

## 설계 원칙

**폐쇄망 우선.** 폰트를 포함한 리소스를 로컬에 벤더링해 외부 CDN 없이 동작합니다. 유일한 예외인 방문 분석용 GA 는 `NEXT_PUBLIC_GA_ID` 를 설정한 배포에서만 로드되므로, 기본 상태에서는 외부 요청이 0건입니다.

**시맨틱 토큰만.** 색은 `text-destructive`, `bg-success`, `text-chart-1` 같은 토큰으로만 씁니다. `bg-green-500` 식 팔레트 하드코딩은 리뷰에서 막습니다. 등락 색은 한국 관례(상승 빨강 `gain` / 하락 파랑 `loss`)를 토큰으로 표현합니다.

**아이콘은 Phosphor.** 이모지를 아이콘 대용으로 쓰지 않습니다.

**다국어.** 카탈로그 설명문은 한국어가 기본이고 en·ja·zh·es 번역을 `lib/i18n/messages` 에 둡니다. 네 로케일의 키 집합이 어긋나면 테스트가 실패합니다.

## 라이선스

코드는 [MIT](./LICENSE). 벤더링한 폰트와 서드파티 자산의 라이선스는 [THIRD_PARTY_LICENSES.md](./THIRD_PARTY_LICENSES.md) 에 정리돼 있습니다(폰트는 대부분 SIL OFL).
