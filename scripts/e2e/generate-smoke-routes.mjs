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
//
// (L1) 이 경로는 `node --experimental-strip-types` 로 실행된다(package.json
// "test:e2e") — 타입만 벗겨낼 뿐 트랜스파일은 안 하므로 `enum`·`namespace`
// 처럼 런타임 표현이 필요한 TS 문법을 이 스크립트가 (import 체인을 통해서든)
// 거치는 코드에서 쓸 수 없다. 지금(lib/e2e/routes.ts → 레지스트리 3종)은
// 안 쓰지만, 나중에 레지스트리·routes.ts 어딘가에 enum/namespace 가 들어오면
// `ERR_UNSUPPORTED_TYPESCRIPT_SYNTAX` 로 이 스크립트가, 곧 e2e 전체가 깨진다.
register("./alias-loader.mjs", import.meta.url);

const { getAllSmokeRoutes } = await import("@/lib/e2e/routes");

const routes = getAllSmokeRoutes();

const outPath = path.resolve(import.meta.dirname, "..", "..", "e2e", ".routes.generated.json");
fs.writeFileSync(outPath, `${JSON.stringify(routes, null, 2)}\n`);

console.log(`[generate-smoke-routes] ${routes.length}개 라우트를 ${path.relative(process.cwd(), outPath)} 에 기록했습니다.`);
