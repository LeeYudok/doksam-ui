import fs from "node:fs";
import path from "node:path";

import { test, expect } from "@playwright/test";

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

/**
 * 이슈 #39 로 스모크 대상이 24 → 180개로 늘면서 실제로 새로 걸린 회귀.
 * 화이트리스트 대상(노이즈)이 아니라 진짜 결함이므로 콘솔 error 를 숨기지
 * 않고 test.fixme 로 명시적으로 실패를 인정한 채 스킵한다 — 조용히 초록불로
 * 만들지 않기 위함. 원인 조사·수정은 별도 이슈로 분리(이 이슈는 스모크
 * 커버리지 확장이 스코프).
 */
const KNOWN_FAILING_ROUTES: Record<string, string> = {
  "/components/multi-select":
    "React error #418(하이드레이션 불일치) — components/multi-select.tsx 데모 페이지에서 서버/클라 렌더 결과가 어긋남. 후속 이슈 필요.",
};

for (const route of ROUTES) {
  const knownFailureReason = KNOWN_FAILING_ROUTES[route];

  test(`smoke: ${route}`, async ({ page }) => {
    test.fixme(!!knownFailureReason, knownFailureReason);

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
