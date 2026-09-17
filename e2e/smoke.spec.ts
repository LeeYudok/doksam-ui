import fs from "node:fs";
import path from "node:path";

import { test, expect } from "@playwright/test";

// 상대 경로로 import 한다 — 이 파일의 다른 import 전부가 "@/" 별칭을 안 쓰는
// 것과 동일한 이유(alias-loader.mjs 주석 참고: Playwright 의 자체 트랜스폼이
// tsconfig "@/*" paths 를 해석해줄지 검증되지 않았고, known-failing-routes.ts
// 자체는 registry/phosphor-icons 를 참조하지 않아 상대 경로로도 문제 없다).
import { KNOWN_FAILING_ROUTES } from "../lib/e2e/known-failing-routes";

// 이슈 #42 A영역 — 결정론 스모크 게이트.
// 전 라우트를 순회하며 (1) 로드 성공 (2) 콘솔 error 0건 (3) 데스크톱 가로 오버플로우
// 없음 을 assert 한다. e2e/invariants.spec.ts(겹침·클리핑·3폭)와
// e2e/interactions.spec.ts(실 인터랙션)는 B영역 소유 — 여기서는 건드리지 않는다.
//
// 이슈 #39 — 라우트는 더 이상 여기 하드코딩하지 않는다. 실제 파생 로직은
// lib/e2e/routes.ts(단위 테스트: lib/e2e/routes.test.ts)에 있고, 컴포넌트
// (107)·패턴(30)·템플릿(20 + 하위 라우트) 레지스트리에서 전량 계산한다.
//
// 여기서 그 함수를 직접 import 하지 않고 JSON 스냅샷(e2e/.routes.generated.json,
// `pnpm test:e2e` 가 실행 전에 scripts/e2e/generate-smoke-routes.mjs 로 생성)을
// 읽는 이유: 그 계산 과정이 lib/patterns/registry.ts·lib/templates/registry.ts 를
// 거쳐 @phosphor-icons/react 를 import 하는데, 이 패키지가 package.json
// "type":"module" 을 선언하면서도 require 조건이 CJS 문법 파일을 가리키는
// 자체 버그가 있어 Playwright 의 esbuild 기반 CJS 트랜스폼(require() 경유)에서
// "exports is not defined" 로 깨진다(vitest는 Vite SSR 로더의 import 조건
// 경로를 타 문제없이 통과 — lib/e2e/routes.test.ts 로 실측).
// scripts/e2e/generate-smoke-routes.mjs 가 Playwright 트랜스폼을 거치지 않는
// 순수 Node ESM 프로세스에서 미리 계산해 JSON 으로 남기고, 여기서는 그
// 결과만 읽는다.
const ROUTES_SNAPSHOT_PATH = path.join(__dirname, ".routes.generated.json");

if (!fs.existsSync(ROUTES_SNAPSHOT_PATH)) {
  throw new Error(
    `${ROUTES_SNAPSHOT_PATH} 가 없습니다. \`pnpm test:e2e\` 로 실행하거나, ` +
      "직접 `node scripts/e2e/generate-smoke-routes.mjs` 를 먼저 실행하세요.",
  );
}

const ROUTES: string[] = JSON.parse(fs.readFileSync(ROUTES_SNAPSHOT_PATH, "utf-8"));

// 페이지 자체 결함이 아닌 것으로 알려진 콘솔 노이즈만 최소한으로 화이트리스트한다.
// (필요 시 문구를 넓히지 말고 정확한 원인을 찾아 화이트리스트를 좁게 유지할 것)
const CONSOLE_ERROR_WHITELIST: RegExp[] = [];

// KNOWN_FAILING_ROUTES 정의·근거는 lib/e2e/known-failing-routes.ts(SSOT)로
// 옮겼다 — lib/e2e/routes.test.ts 가 같은 값을 읽어 "키가 실제 라우트에
// 존재하는지" · "사유에 이슈 번호가 있는지" · "목록 크기가 늘지 않았는지"
// 를 방어 테스트로 고정한다. 두 곳에 값을 흩어두면 그 보장이 깨진다.

for (const route of ROUTES) {
  const knownFailureReason = KNOWN_FAILING_ROUTES[route];

  test(`smoke: ${route}`, async ({ page }) => {
    // test.fixme() 대신 test.fail() — 몸체를 실제로 돌린다. 지금처럼 진짜로
    // 실패하면 "예상된 실패"로 초록색 처리되지만, #50 이 고쳐져 이 라우트가
    // 통과해버리면 Playwright 가 "예상과 다르게 통과함"으로 이 테스트 자체를
    // 빨간색 처리한다 — 고쳐지고도 KNOWN_FAILING_ROUTES 항목 삭제를 잊는
    // 상황(전수화 취지를 되돌리는 3번째 새는 구멍)을 CI 가 잡아낸다.
    test.fail(!!knownFailureReason, knownFailureReason);

    const consoleErrors: string[] = [];

    page.on("console", (msg) => {
      if (msg.type() !== "error") return;
      const text = msg.text();
      if (CONSOLE_ERROR_WHITELIST.some((re) => re.test(text))) return;
      consoleErrors.push(text);
    });

    page.on("pageerror", (err) => {
      consoleErrors.push(`pageerror: ${err.message}`);
    });

    const response = await page.goto(route, { waitUntil: "networkidle" });

    expect(response, `${route} 응답 없음`).not.toBeNull();
    expect(response!.status(), `${route} status`).toBeLessThan(400);

    expect(consoleErrors, `${route} 콘솔 error: ${consoleErrors.join("\n")}`).toHaveLength(0);

    const overflow = await page.evaluate(() => {
      const el = document.documentElement;
      return {
        scrollWidth: el.scrollWidth,
        clientWidth: el.clientWidth,
      };
    });

    expect(
      overflow.scrollWidth,
      `${route} 가로 오버플로우: scrollWidth=${overflow.scrollWidth} clientWidth=${overflow.clientWidth}`,
    ).toBeLessThanOrEqual(overflow.clientWidth);
  });
}
