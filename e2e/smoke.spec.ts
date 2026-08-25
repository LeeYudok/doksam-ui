import { test, expect } from "@playwright/test";

// 이슈 #42 A영역 — 결정론 스모크 게이트.
// 전 라우트를 순회하며 (1) 로드 성공 (2) 콘솔 error 0건 (3) 데스크톱 가로 오버플로우
// 없음 을 assert 한다. e2e/invariants.spec.ts(겹침·클리핑·3폭)와
// e2e/interactions.spec.ts(실 인터랙션)는 B영역 소유 — 여기서는 건드리지 않는다.

const ROUTES = [
  "/",
  "/tokens",
  "/icons",
  "/components",
  "/patterns",
  "/templates",
  "/rules",
  "/profiles",
  "/archetypes",
  "/wireframe",
  // 신규 상세 라우트 — 컴포넌트/패턴/템플릿 각 1개 이상 대표로 포함.
  "/components/date-picker",
  "/patterns/auth",
  "/templates/brokerage",
  "/templates/glossary",
  "/templates/market-report",
  "/templates/crawler-console",
  "/templates/elearning",
  "/templates/company-intel",
  "/templates/knowledge-base",
  "/templates/rag-search",
  "/templates/marketing-site",
  "/templates/mail-workspace",
  "/templates/activity-feed",
];

// 페이지 자체 결함이 아닌 것으로 알려진 콘솔 노이즈만 최소한으로 화이트리스트한다.
// (필요 시 문구를 넓히지 말고 정확한 원인을 찾아 화이트리스트를 좁게 유지할 것)
const CONSOLE_ERROR_WHITELIST: RegExp[] = [];

for (const route of ROUTES) {
  test(`smoke: ${route}`, async ({ page }) => {
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
