import { execFileSync } from "node:child_process";
import path from "node:path";

// 이슈 #39 PR #51 적대적 리뷰 M2 — `pnpm test:e2e`(package.json 의 `&&` 체이닝으로
// generate-smoke-routes.mjs → playwright test 순서가 보장됨)가 아니라
// `pnpm exec playwright test` 를 직접 치면, e2e/smoke.spec.ts 는 스냅샷
// "존재 여부"만 보고 옛 e2e/.routes.generated.json 으로 조용히 통과했다.
//
// 타임스탬프/레지스트리 항목 수를 스냅샷에 얹어 스펙에서 재검증하는 대신,
// Playwright 자체의 globalSetup 훅으로 생성 스크립트를 물려 "Playwright 가
// 어떻게 호출되든 테스트 실행 직전에 항상 재생성됨"을 구조적으로 보장한다
// (재검증 방식은 "얼마나 stale 해야 실패로 볼지" 임계값이 또 필요해 근본
// 해결이 아니고, globalSetup 은 애초에 stale 해질 수 있는 경로를 없앤다).
//
// 이 파일 자체는 레지스트리/phosphor-icons 를 import 하지 않는다 — 그러면
// alias-loader.mjs 주석의 @phosphor-icons/react ESM/CJS 버그를 Playwright
// 트랜스폼 경로에서 그대로 재현하기 때문에, 생성은 별도의 순수 Node
// 프로세스(scripts/e2e/generate-smoke-routes.mjs, `--experimental-strip-types`)
// 로 그대로 위임한다.
export default function globalSetup() {
  const root = path.resolve(import.meta.dirname, "..");

  execFileSync(
    process.execPath,
    ["--experimental-strip-types", "scripts/e2e/generate-smoke-routes.mjs"],
    { cwd: root, stdio: "inherit" },
  );
}
