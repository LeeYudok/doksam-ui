# GH #41 설치 실측 — 신규 항목 12개 전수 (2026-09-23)

리뷰 finding F8("12항목 중 3개만 실측") 반영. `pricing-table`·`kpi-card-grid`·`chip-input`
3개만 확인했던 1차 실측(`2026-09-23_issue-41_probe-registry-install.mjs`)을 **12개 전부**로
넓히고, 12개를 모두 실제로 렌더하는 페이지까지 만들어 프로덕션 빌드를 한 번 통과시켰다.

## 절차

프로브 앱: `<scratchpad>/probe-41` (레포 밖 일회성).

```
pnpm dlx create-next-app@latest probe-41 --ts --tailwind --eslint --app \
  --src-dir=false --import-alias "@/*" --no-turbopack --use-pnpm --yes
npx shadcn@latest init -y -b radix -p nova      # components.json style = "radix-nova"
npx shadcn@latest add -y -o <repo>/public/r/{...23개}.json
```

설치 인자는 신규 12개 + 그 `registryDependencies` 전이 폐포 11개(= 23개)다. 폐포까지 로컬
`public/r` 파일로 지정한 이유는 항목의 `registryDependencies` 가 절대 URL(`https://ui.doksam.com/r/...`)
이라 지정하지 않으면 **아직 배포되지 않은 이 브랜치 대신 라이브 레지스트리**에서 내려오기
때문이다(1차 실측이 기록한 sparkline 드리프트와 같은 원인).

그다음 `app/probe/page.tsx` 에서 12개를 전부 import 해 필수 props 를 채워 렌더하고 `pnpm build`.

## 항목별 결과

| 항목 | 설치 파일 | registryDependencies | 설치 |
| --- | --- | --- | --- |
| `concept-card` | `components/patterns/concept-explainer/concept-card.tsx` | card | 생성됨 |
| `flow-diagram` | `components/patterns/concept-explainer/flow-diagram.tsx` | - | 생성됨 |
| `trouble-table` | `components/patterns/concept-explainer/trouble-table.tsx` | - | 생성됨 |
| `kpi-card-grid` | `components/patterns/stats/kpi-card-grid.tsx` | card, finance-format-won, finance-rate, sparkline | 생성됨 |
| `kpi-compact-row` | `components/patterns/stats/kpi-compact-row.tsx` | card, finance-rate | 생성됨 |
| `activity-timeline` | `components/patterns/timeline/activity-timeline.tsx` | - | 생성됨 |
| `compact-timeline` | `components/patterns/timeline/compact-timeline.tsx` | - | 생성됨 |
| `upload-dropzone` | `components/patterns/file-upload/upload-dropzone.tsx` | badge, button, progress | 생성됨 |
| `faceted-filter` | `components/patterns/faceted-filter/faceted-filter.tsx` | - | 생성됨 |
| `chip-input` | `components/patterns/verified/chip-input.tsx` | button, input | 생성됨 |
| `search-filter` | `components/patterns/form-input/search-filter.tsx` | button, input, select | 생성됨 |
| `pricing-table` | `components/patterns/pricing/pricing-table.tsx` | badge, button, card, label, switch | 생성됨 |

`shadcn add` 가 만든 파일은 총 24개(위 12개 + 프리미티브 `card`·`badge`·`button`·`progress`·
`input`·`select`·`label`·`switch`, `lib/finance/{format-won,rate}.ts`, `sparkline.tsx`,
그리고 라이브 레지스트리에서 함께 내려온 `sparkline-demo.tsx`). `package.json` 에
`@phosphor-icons/react` 가 자동 추가된다.

## 빌드

```
$ pnpm build
▲ Next.js 16.3.5 (Turbopack)
✓ Compiled successfully in 1881ms
  Running TypeScript ...
  Finished TypeScript in 1673ms ...
✓ Generating static pages using 6 workers (5/5) in 235ms

Route (app)
┌ ○ /
├ ○ /_not-found
└ ○ /probe
```

12개 전부 미해소 import·타입 오류 없이 빌드된다. 12개를 한 페이지에서 동시에 import 하므로
이름 충돌(같은 basename 의 다른 파일로 재작성되는 #52 류 사고)도 함께 배제된다.

## 남는 사실 하나

라이브 `https://ui.doksam.com/r/sparkline.json` 의 `files[0].path` 는 여전히 `sparkline-demo.tsx`
(#58 분리 이전 산출물)다. 로컬 `registry.json` 은 옳으므로 **배포하면 해소**된다. 이번 실측은
로컬 폐포를 명시 설치해 그 드리프트를 우회했다.
