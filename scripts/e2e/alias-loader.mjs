import { pathToFileURL } from "node:url";
import path from "node:path";
import fs from "node:fs";

// 이슈 #39 — Playwright(e2e/smoke.spec.ts)는 자체 esbuild 기반 CJS 트랜스폼으로
// TS 를 컴파일하는데, 그 경로로 lib/patterns/registry.ts · lib/templates/registry.ts
// 를 (transitively) require() 하면 @phosphor-icons/react 가 깨진다:
// 그 패키지는 package.json "type":"module" 을 선언하면서도 main(=require 조건)이
// CJS 문법(`exports.foo=`)인 dist/index.cjs.js 를 가리켜, Node 가 그 파일을
// ESM 으로 파싱하다 "exports is not defined" 로 죽는다(패키지 쪽 실제 버그,
// require() 로 진입하면 항상 재현됨 — Playwright/esbuild 특정 문제가 아니다).
// vitest(Vite 의 SSR 모듈 로더, import 조건으로 진입)는 같은 모듈 그래프를
// 문제없이 로드한다(lib/e2e/routes.test.ts 로 실측 확인).
//
// 그래서 스모크 라우트 목록은 Playwright 트랜스폼을 거치지 않는 순수 Node
// ESM 프로세스(scripts/e2e/generate-smoke-routes.mjs, Node 네이티브 import(),
// "import" 조건으로 진입)에서 미리 계산해 JSON 스냅샷으로 남기고,
// smoke.spec.ts 는 그 JSON 만 읽는다. 이 로더는 그 생성 스크립트가
// tsconfig 의 "@/*" 별칭을 그대로 쓸 수 있게 해주는 최소 리졸버 훅이다.
const ROOT = path.resolve(import.meta.dirname, "..", "..");

const CANDIDATE_EXTENSIONS = ["", ".ts", ".tsx", "/index.ts"];

export async function resolve(specifier, context, nextResolve) {
  if (!specifier.startsWith("@/")) {
    return nextResolve(specifier, context);
  }

  const relative = specifier.slice(2);
  for (const ext of CANDIDATE_EXTENSIONS) {
    const candidate = path.join(ROOT, `${relative}${ext}`);
    if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) {
      return nextResolve(pathToFileURL(candidate).href, context);
    }
  }

  throw new Error(`[alias-loader] "@/${relative}" 를 ${ROOT} 아래에서 찾지 못했습니다.`);
}
