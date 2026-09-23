/**
 * GH #41 실측 — 새로 편입한 패턴 항목이 빈 Next 앱에 실제로 설치되고 빌드되는지.
 *
 * 2026-09-23 실행 결과(요약):
 *   1. pnpm dlx create-next-app@latest probe-41 --ts --tailwind --eslint --app \
 *        --src-dir=false --import-alias "@/*" --no-turbopack --use-pnpm --yes
 *   2. npx shadcn@latest init -y -b radix -p nova
 *      → components.json 의 style 이 카탈로그와 같은 "radix-nova" 로 잡힌다.
 *        (-b neutral 은 shadcn 5.x 에서 거부된다 — base 는 radix|base|aria)
 *   3. npx shadcn@latest add -y -o <repo>/public/r/{pricing-table,kpi-card-grid,chip-input}.json
 *      → 12개 파일 생성(ui/badge·button·card·label·switch·input, lib/finance/*,
 *        patterns/{pricing,stats,verified}/*), package.json 에
 *        "@phosphor-icons/react": "^2.1.10" 자동 추가.
 *   4. app/probe/page.tsx 에서 KpiCardGrid·ChipInput·PricingTable 을 props 로 렌더 → pnpm build
 *      → ✓ Compiled successfully, 정적 3페이지 생성.
 *
 * 확인된 드리프트(이 브랜치 밖 문제):
 *   kpi-card-grid 의 registryDependencies 는 절대 URL 이라 sparkline 만 **라이브**
 *   ui.doksam.com 에서 내려온다. 그런데 라이브 sparkline.json 의 files[0].path 가
 *   아직 `components/patterns/dataviz/sparkline-demo.tsx` 다(#58 실물/데모 분리 이전 산출물).
 *   그래서 소비자는 `@/components/patterns/dataviz/sparkline` 을 못 찾는다.
 *   로컬 registry.json·public/r/sparkline.json 은 이미 sparkline.tsx 로 올바르므로
 *   **배포만 하면 해소**된다. 실측에서는 로컬 sparkline.json 을 추가로 설치해 확인했다.
 */
console.log("이 파일은 실행 스크립트가 아니라 실측 절차 기록이다. 위 주석의 명령을 순서대로 친다.")
