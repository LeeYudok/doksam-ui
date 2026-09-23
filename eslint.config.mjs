import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

import doksam from "./tools/eslint-doksam/index.mjs";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // 카탈로그 자신에게 표준 준수 규칙을 물린다 (#79) — 소비 프로젝트에 배포하는
  // 규칙(#40)을 정작 카탈로그가 어기면 배포물의 근거가 사라진다. scripts/lint-probe.mjs
  // 는 규칙을 고칠 때 오탐을 먼저 보는 개발용 보조 수단으로만 남는다.
  ...doksam.configs.recommended,
  {
    name: "doksam-ui/catalog-analytics",
    // 규칙 원문 "폐쇄망 대응" 절의 관측 로더 예외 — NEXT_PUBLIC_GA_ID 가 있는
    // 공개 배포(ui.doksam.com)에서만 렌더되고, 폐쇄망 배포는 변수를 주지 않아
    // 요청이 0건이다.
    //
    // 소스에 글자로 적히는 호스트는 gtag 로더 하나뿐이라 그 하나만 연다.
    // test/helpers/scan-build-output.ts 의 ANALYTICS_ALLOWED_HOSTS 는 빌드
    // 산출물을 훑으므로 로더가 런타임에 부르는 google-analytics.com 까지
    // 포함한다 — 두 목록은 검사 대상이 달라서 같을 이유가 없고, 여기서 쓰지도
    // 않는 호스트를 미리 열면 다음에 그 호스트로 뭘 붙여도 리뷰 없이 통과한다.
    files: ["app/layout.tsx"],
    rules: {
      "doksam-ui/no-external-url": ["error", { allow: ["https://www.googletagmanager.com/"] }],
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "coverage/**",
    "next-env.d.ts",
    // shadcn 프리미티브 — components.json 의 style(radix-nova)로 설치한 상류
    // 원본이며 우리가 고치지 않는다(AGENTS.md). 상류 포맷을 그대로 두므로 lint
    // 대상에서 제외한다. 설치본과의 대조는 pnpm check:shadcn (#62).
    "components/ui/**",
    "hooks/use-mobile.ts",
    // 서브에이전트 git worktree가 레포 안(.claude/worktrees/)에 생김 — lint 제외.
    ".claude/**",
    // 상류 드리프트 게이트(pnpm check:shadcn)가 만드는 프로브 프로젝트 (#62).
    // 남의 코드이며 우리 규칙의 대상이 아니다 — 대조용으로만 존재한다.
    ".shadcn-probe/**",
    // 이슈 #70 실측용 프로브 Next 앱 — 남의 코드(create-next-app 산출물)이며 커밋 대상도 아니다.
    "scratchpad/**",
  ]),
]);

export default eslintConfig;
