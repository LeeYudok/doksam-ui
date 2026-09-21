import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "coverage/**",
    "next-env.d.ts",
    // shadcn 유래 프리미티브 — 하우스 스타일이 적용된 포크이며 상류 포맷을 따르므로
    // lint 대상에서 제외한다. 차이와 사유는 components/ui/upstream.manifest.json 참고.
    "components/ui/**",
    "hooks/use-mobile.ts",
    // 서브에이전트 git worktree가 레포 안(.claude/worktrees/)에 생김 — lint 제외.
    ".claude/**",
    // 상류 드리프트 게이트(pnpm check:shadcn)가 만드는 프로브 프로젝트 (#62).
    // 남의 코드이며 우리 규칙의 대상이 아니다 — 대조용으로만 존재한다.
    ".shadcn-probe/**",
  ]),
]);

export default eslintConfig;
