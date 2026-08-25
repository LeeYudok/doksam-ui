---
name: doksam-design-guide
description: >
  doksam-ui 디자인 시스템 카탈로그(ui.doksam.com)를 만들고 확장할 때 쓰는 가이드.
  컴포넌트·패턴·템플릿 추가/수정, 데모 작성, 토큰·테마·프로필·폰트 변경,
  아이콘 선택, 레지스트리(shadcn registry.json / llms.txt) 갱신, 카탈로그 페이지
  라우팅에 사용한다. 작성 규칙의 단일 진실원천은 lib/rules-markdown.ts 이며
  이 스킬은 그 규칙을 "어디를 어떤 순서로 고치는가"로 연결한다.
---

# doksam-ui Design Guide

doksam-ui 는 doksam 프로젝트 공통 UI 표준 카탈로그다. 개별 화면을 만드는 앱이 아니라
**다른 프로젝트가 가져다 쓰는 표준을 정의하는 레포**이므로, 여기의 모든 변경은
"한 화면이 예뻐지는가"가 아니라 "표준으로서 일관되고 재사용 가능한가"로 판단한다.

라이브: https://ui.doksam.com · 규칙 페이지: https://ui.doksam.com/rules

---

## 0. 작성 규칙의 단일 진실원천

**디자인 브리프·수렴 안티패턴·색·컴포넌트·테마 초기화·아이콘·라우팅·반응형·모션·
접근성·폐쇄망·TypeScript·의존성 규율의 실제 규칙 조항은 `lib/rules-markdown.ts` 의
`RULES_SECTIONS` 에 있다.**
UI 코드를 쓰기 전에 그 파일을 읽는다. 이 스킬은 규칙을 복제하지 않는다 —
복제하면 두 곳이 어긋나고, 어긋나면 이 스킬 쪽이 틀린 것이다.

규칙 자체를 바꿔야 하면 `lib/rules-markdown.ts` 만 고친다.
`/rules` 페이지 렌더링과 AI 프롬프트용 markdown(`RULES_MARKDOWN`) 이 거기서 파생된다.

**규칙은 불변(`kind: "invariant"`)과 선택(`kind: "decision"`) 두 층이다.** 불변은
프로젝트가 달라도 답이 같고, 선택은 프로젝트마다 정답이 다르다 — 선택 절은 명령이
아니라 선택지·고르는 기준·경계를 준다. 소비 프로젝트에서 화면을 만들기 전에
`RULES_SECTIONS` 의 첫 절("디자인 브리프")대로 원형·성격·안 쓸 컴포넌트/패턴·이유를
`DESIGN.md` 에 선언하고, 둘째 절("수렴 안티패턴")로 기본값 채택을 자가 점검한다.

절대 어기지 않는 것 4가지만 여기 요약해 둔다(나머지는 위 파일 참조):

- 하드코딩 색 0건 — 시맨틱 토큰만(`bg-background`, `text-destructive`, `text-chart-1`, `--gain`/`--loss`).
- `components/ui/` 의 shadcn 원본은 수정하지 않는다 — 조합은 `components/` 또는 `components/patterns/` 에.
- 아이콘은 Phosphor 기본(서버 컴포넌트는 `@phosphor-icons/react/dist/ssr`), 이모지 아이콘 금지.
- 폐쇄망 전제 — 외부 CDN·외부 URL fetch 0건, 폰트는 `next/font/local` + `assets/fonts/` 벤더링.

---

## 1. 3계층 카탈로그

| 계층 | 라우트 | 레지스트리(단일 진실원천) | 성격 |
|---|---|---|---|
| 컴포넌트 | `/components/<slug>` | `lib/showcase/registry.ts` | "무엇을 쓰는가" — 프리미티브 + 조합 |
| 패턴 | `/patterns/<slug>` | `lib/patterns/registry.ts` | "어떻게 조합하는가" — 화면 단위 규칙 |
| 템플릿 | `/templates/<slug>` | `lib/templates/registry.ts` | "화면 하나가 어떻게 완성되는가" |

그 외 파운데이션: `/tokens`, `/profiles`, `/icons`, `/rules`.

**레지스트리에 등록하지 않으면 페이지·사이드바에 나타나지 않는다.** 파일만 추가하고
끝내는 실수가 가장 흔하다.

---

## 2. 컴포넌트 계층 구분

`ComponentLayer` 는 출처가 아니라 **조립 수준**으로 나눈다 (`lib/showcase/types.ts`).

- `primitive` — shadcn CLI 가 `components/ui/` 에 설치한 저수준 빌딩블록. 수정 금지.
- `composition` — 프리미티브를 조합해 만든 상위 컴포넌트. `components/<name>.tsx` (kebab-case).

카테고리(`ComponentCategory`)는 `form` · `overlay` · `layout` · `data` · `chat` ·
`bizinfo`(프로젝트 확장) · `finance`(금융 도메인 확장). 도메인 색이 짙은 것을
공통 카테고리에 넣지 않는다 — 확장 카테고리가 그 용도다.

### 새 컴포넌트를 만들 기준

만든다:
- 같은 시각 패턴이 2곳 이상에서 반복될 때
- 도메인 규칙을 코드로 굳혀야 할 때(등락색, 사업자번호 포맷, 상태 뱃지 등)
- 다른 프로젝트가 `npx shadcn add` 로 가져갈 가치가 있을 때

만들지 않는다:
- 한 템플릿에서만 쓰는 일회성 레이아웃 (템플릿 안에 둔다)
- className 조합만 하는 얇은 래퍼
- 기존 프리미티브 + Tailwind 로 3줄이면 끝나는 것

---

## 3. 데모 모듈 컨벤션

`components/demos/<slug>.demo.tsx` 는 4개를 named export 한다
(`ComponentDemoModule`, `lib/showcase/types.ts`):

```tsx
export const demo = (/* 라이브 JSX — 현재 프리셋 토큰으로 렌더 */)
export const code = `/* demo 와 같은 내용의 복사용 코드 문자열 */`
export const dos = ["...", "..."]    // 2~3개 권장
export const donts = ["...", "..."]  // 2~3개 권장
```

- `demo` 와 `code` 는 **내용이 일치해야 한다** — 상세 페이지가 둘을 나란히 보여준다.
- `dos`/`donts` 는 취향이 아니라 **판단 기준**을 쓴다. "성공/경고/위험 3단계 상태를
  표현할 때만 쓴다" 처럼 언제 쓰고 언제 안 쓰는지가 드러나야 한다.
- 데모 안에서도 하드코딩 색·외부 이미지 URL 금지. 아바타는 `AvatarFallback`,
  이미지는 `public/` 로컬 placeholder.
- 데모는 라이트/다크 + 8종 테마 프리셋 위에서 전부 렌더된다 — 특정 배경색을 전제하지 않는다.

레퍼런스로 볼 파일: `components/demos/badge-extended.demo.tsx`.

---

## 4. 항목 추가 절차

**[references/catalog-workflow.md](references/catalog-workflow.md) 에 컴포넌트·패턴·
템플릿·프로필·테마 각각의 단계별 체크리스트가 있다.** 항목을 추가할 때는 그 파일을 편다.

컴포넌트 추가 요약 (자세한 건 위 파일):

1. `components/<name>.tsx` 구현 (프리미티브 조합, `cn()` 사용, CVA 로 variant)
2. `components/demos/<slug>.demo.tsx` 데모 작성
3. `lib/showcase/registry.ts` 에 항목 등록 (`status: "done"`)
4. `lib/showcase/demo-loaders.ts` 에 동적 로더 등록
5. `components/ui/` 밖의 커스텀이면 `lib/showcase/registry.test.ts` 의 `MANUAL_ENTRY_SLUGS` 에 slug 추가
6. i18n — `component.<slug>.description` 키를 `lib/i18n/messages/{en,ja,zh,es}.json` **4개 전부**에 추가
   (`node scripts/i18n/extract.mjs` 로 ko 원문 카탈로그 갱신)
7. 다른 프로젝트가 설치할 자산이면 `registry.json` 에 item 추가 후
   `pnpm registry:build && pnpm gen:llms`
8. 검증: `pnpm typecheck && pnpm lint && pnpm test && pnpm build`

---

## 5. 무엇이 자동으로 막히는가 (테스트 게이트)

수기 검토에 기대지 않고 테스트가 강제하는 것들 — 실패하면 규칙 위반이지 테스트 버그가 아니다.

| 테스트 | 강제하는 것 |
|---|---|
| `lib/i18n/messages.test.ts` | 4개 로케일 키 집합 동일 · 레지스트리 전 항목의 설명 번역 존재 · 고아 `component.*` 키 없음 · 플레이스홀더 일치 |
| `lib/showcase/registry.test.ts` | `components/ui/` 스캔 결과와 레지스트리 정합 · 수동 등록 slug 화이트리스트 |
| `lib/showcase/demo-loaders.test.ts` | `status: "done"` 항목만 로더 등록 |
| `test/closed-network.test.ts` | 프로덕션 산출물에 외부 `<script src>`/`<link href>`/CSS `url()`/CDN 힌트 0건 |
| `test/sourcemap.test.ts` | 프로덕션 청크에 sourcemap 부재 |
| `test/motion-rules.test.ts` | 소스에 `transition-all` 0건(`components/ui/` 제외) · `duration` 은 100/200/300 스케일만 · `@keyframes` 정의 파일은 `prefers-reduced-motion` 처리 |
| `profiles/index.test.ts` | 프로필이 참조하는 theme/font 가 실재하는지 |
| `lib/profile-css.test.ts` | 프로필 CSS 방출(`data-theme`/`data-font`/`data-density`/`--radius`) 형태 |

`pnpm test:vision` 은 **CI 에 없는 수동 게이트** — Playwright 스크린샷을 Claude 비전으로
채점한다(텍스트 겹침·레이아웃 깨짐·대비). 시각적 변화가 큰 작업 뒤에만 돌린다.

---

## 6. 파운데이션 층

### 토큰

`app/globals.css` 가 소유한다. 색은 OKLCH, `--radius` 기본 **6px**, radius 파생값은
`--radius-sm ~ --radius-4xl` 이 `calc()` 로 만든다 — 임의 radius 신설 금지.

시맨틱 색 토큰: `background`/`foreground`, `card`, `popover`, `primary`, `secondary`,
`muted`, `accent`, `destructive`, `success`, `warning`, `gain`/`loss`(한국식 등락 —
상승 빨강/하락 파랑), `border`, `input`, `ring`, `chart-1~5`, `sidebar-*`.

### 테마 · 폰트 · 프로필

- `themes/<name>.ts` — 색 프리셋 8종. 추가 시 `themes/index.ts` 레지스트리 등록,
  **기존 프리셋 파일이나 globals.css 의 다른 프리셋 블록은 건드리지 않는다.**
- `fonts/index.ts` — 폰트 프리셋 5종. 실 파일은 `assets/fonts/<name>/` 에 woff2 + LICENSE 커밋.
- `profiles/index.ts` — **프로젝트가 고르는 단위는 프로필 하나**다. 테마·폰트·
  `defaultMode`·`radius`·`density` 를 미리 고정해 둔 층 (admin/service/data 등).
  프로젝트가 프로필의 radius·density 를 임의 재정의하면 표준이 발산한다 —
  바꿀 필요가 생기면 doksam-ui 에 프로필을 추가/수정해서 반영한다.

### 밀도

`<html data-density="compact|comfortable">` 를 프로필이 지정하고 `app/globals.css` 의
밀도 층이 소비한다. `data-density` 가 없으면 아무 규칙도 걸리지 않는다(하위호환).

### 테마 초기화

기본 모드·프리셋을 프로필 고정으로 둘지, 사용자 토글로 둘지, 시스템 설정을 따를지는
프로젝트의 선택이다(선택 층). 어느 쪽을 고르든 경계는 같다 — 결정은 hydration 이전에
끝낸다. `app/layout.tsx` `<head>` 의 인라인 `THEME_INIT_SCRIPT` 가 localStorage 를 읽어
`<html>` 에 `data-theme`/`data-font`/`dark` 를 직접 세팅한다. `useEffect` 만으로 적용하면
FOUC(테마 깜빡임)가 난다. 자세한 조항은 `lib/rules-markdown.ts` "테마 초기화" 섹션.

---

## 7. 레이아웃 표준

- 콘텐츠 컨테이너 **`max-w-[1300px] mx-auto`**, 소유자는 **세그먼트 `layout.tsx`** —
  페이지 컴포넌트에서 max-width 를 하드코딩하지 않는다.
- `main` 랜드마크는 layout 이 렌더한다. 페이지·`loading.tsx`·`error.tsx` 에서
  `main` 중복 렌더 금지(중첩은 invalid HTML). 에러 UI 는 `div role="alert"`.
- 모바일 우선 3모드(기본 / `sm:`·`md:` / `lg:`↑). 역방향 접두 금지.
- 넓은 콘텐츠(테이블·코드블록·차트)는 자체 `overflow-x-auto` 래퍼. body 가로 스크롤 0.
- 고정 px 폭(`w-[###px]`)은 아이콘·뱃지 등 소품 외 금지.
- **새 라우트에는 `loading.tsx` 와 `error.tsx` 를 함께 만든다.**

---

## 8. 다국어

카탈로그 설명문은 한국어가 기본, `en`·`ja`·`zh`·`es` 번역을 `lib/i18n/messages/` 에 둔다.

- 컴포넌트 안 문구: `<TranslatedText k="..." ko="..." />` 또는 `t("<ns>.<key>", "<ko원문>")`.
- `t()` 는 **처음 두 인자가 문자열 리터럴**이어야 추출기가 잡는다 — 변수 조립 금지.
- 키 추가 후 `node scripts/i18n/extract.mjs` 로 `scripts/i18n/ko-catalog.json` 갱신.
- 4개 로케일 키 집합이 어긋나면 테스트가 깨진다. 번역을 나중에 하겠다고 en 만 넣지 않는다.

---

## 9. 배포 산출물 동기화

`registry.json`(루트) 이 shadcn 레지스트리의 **단일 진실원천**이다.

```bash
pnpm registry:build   # registry.json → public/r/*.json
pnpm gen:llms         # registry.json → public/llms.txt (AI 발견용 카탈로그)
```

`public/r`, `public/llms.txt` 는 **빌드 생성물** — 손으로 편집하지 않는다.
`llms.txt` 를 수기 하드코딩하면 다음 생성에서 날아간다.

소비 프로젝트 관점: `npx shadcn add https://ui.doksam.com/r/<name>.json`,
또는 `components.json` 의 `registries` 에 `"@doksam-ui"` 를 등록해 `@doksam-ui/<name>`.

---

## 10. 파일 컨벤션

| 종류 | 위치 | 표기 |
|---|---|---|
| shadcn 프리미티브 | `components/ui/<name>.tsx` | kebab-case, **수정 금지** |
| 조합 컴포넌트 | `components/<name>.tsx` | kebab-case |
| 패턴 컴포넌트 | `components/patterns/<name>.tsx` | kebab-case |
| 쇼케이스 셸 | `components/showcase/<name>.tsx` | kebab-case |
| 데모 | `components/demos/<slug>.demo.tsx` | slug 는 레지스트리 slug 와 동일 |
| 라우트 | `app/<segment>/page.tsx` (+ `loading.tsx`, `error.tsx`) | |
| 레지스트리·유틸 | `lib/<domain>/registry.ts`, `lib/<name>.ts` | |
| 훅 | `hooks/use-<name>.ts` | |
| 테스트 | 대상 파일 옆 `<name>.test.ts(x)` | vitest |

className 병합은 항상 `cn()` (`@/lib/utils`). variant 가 여럿이면 CVA.

---

## 11. 자주 나오는 실수

- 컴포넌트 파일만 만들고 레지스트리·데모 로더 등록을 빼먹어 카탈로그에 안 뜸
- `status: "done"` 으로 등록했는데 데모 파일이 없음 (또는 반대)
- i18n 을 en 에만 추가해서 로케일 키 집합 테스트가 깨짐
- 데모에 하드코딩 색·외부 이미지 URL 사용 → 폐쇄망 테스트/리뷰에서 막힘
- `components/ui/` 원본을 직접 수정하거나 `components/ui/customs/` 같은 하위 폴더를 끼워 넣음
- 페이지 컴포넌트에서 `max-w-[1300px]` 를 직접 선언(컨테이너는 layout 소유)
- 새 라우트에 `loading.tsx`/`error.tsx` 누락
- `public/r`·`public/llms.txt` 를 손으로 수정
- 등락 표시에 `text-red-600`/`text-blue-600` 직접 사용 (→ `--gain`/`--loss`, `lib/finance/rate.ts`)
- 캔버스·차트 렌더러에 CSS 변수 문자열을 그대로 전달 (→ `lib/finance/normalize-color.ts`)
- 새 UI 라이브러리를 먼저 설치하고 나중에 정당화 (의존성 규율 4항목 선검토가 순서)
