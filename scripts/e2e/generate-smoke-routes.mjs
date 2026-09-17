import { register } from "node:module";
import fs from "node:fs";
import path from "node:path";

// 이슈 #39 — e2e/smoke.spec.ts 가 순회할 라우트 목록을 lib/e2e/routes.ts
// (레지스트리 파생 SSOT, lib/e2e/routes.test.ts 로 단위 테스트됨)에서 계산해
// e2e/.routes.generated.json 에 스냅샷으로 남긴다.
//
// 순수 `node` 프로세스로 실행해야 한다(Playwright 트랜스폼 경유 금지) — 이유는
// alias-loader.mjs 상단 주석 참고: lib/patterns·lib/templates 레지스트리가
// import 하는 @phosphor-icons/react 가 Playwright 의 CJS require() 경로에서
// 깨진다(패키지 자체의 ESM/CJS 선언 불일치 버그). Node 의 네이티브 import()는
// package.json "import" 조건으로 들어가 문제없이 로드된다.
register("./alias-loader.mjs", import.meta.url);

const { getAllSmokeRoutes } = await import("@/lib/e2e/routes");

const routes = getAllSmokeRoutes();

const outPath = path.resolve(import.meta.dirname, "..", "..", "e2e", ".routes.generated.json");
fs.writeFileSync(outPath, `${JSON.stringify(routes, null, 2)}\n`);

console.log(`[generate-smoke-routes] ${routes.length}개 라우트를 ${path.relative(process.cwd(), outPath)} 에 기록했습니다.`);
