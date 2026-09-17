/**
 * #47 실증 — 형태 변주 축(data-corner · data-type-contrast)이 실제 소비 경로에
 * 닿는지 계산된 스타일로 확인한다. "레지스트리·문서·CSS 는 있는데 속성을 세팅하는
 * 코드가 없다"가 이 이슈의 증상이었으므로, 통과 기준은 렌더된 숫자다.
 *
 *   pnpm build && pnpm start -p 3205 &
 *   BASE=http://localhost:3205 node scripts/manual/2026-09-17_issue-47_verify-axes-reach.mjs
 *
 * 주의: 버튼에 transition-all 이 걸려 있어 속성 변경 직후 계산 스타일을 읽으면
 * 전환 중간값이 나온다. 아래 measureScope 는 전환이 끝난 뒤 측정한다.
 */
import { chromium } from "@playwright/test";

const base = process.env.BASE || "http://localhost:3205";
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

/**
 * 스코프 안의 카드 반경·제목 크기와, 스코프 안에 심은 버튼의 반경·높이를 읽는다.
 * 템플릿에 따라 스코프 안에 버튼이 하나도 없을 수 있어(예: admin 은 카드·테이블만),
 * 사이트 헤더의 진짜 Button 을 그대로 복제해 심고 측정한다 — 클래스가 동일하므로
 * 달라지는 것은 스코프 CSS 뿐이다.
 */
function measureScope(scopeSelector) {
  return page.evaluate(async (selector) => {
    const scope = document.querySelector(selector);
    if (!scope) return { error: `스코프 없음: ${selector}` };
    const source = document.querySelector('[data-slot="button"][data-size]');
    const probe = source?.cloneNode(true);
    if (probe) {
      probe.removeAttribute("id");
      scope.append(probe);
    }
    await new Promise((resolve) => {
      if (!probe) return resolve();
      const duration = Number.parseFloat(getComputedStyle(probe).transitionDuration) || 0;
      if (duration === 0) return requestAnimationFrame(() => resolve());
      probe.addEventListener("transitionend", () => requestAnimationFrame(() => resolve()), { once: true });
      setTimeout(() => requestAnimationFrame(() => resolve()), duration * 1000 + 120);
    });
    const card = scope.querySelector('[data-slot="card"]');
    const heading = scope.querySelector("h1, h2, h3");
    const result = {
      corner: scope.getAttribute("data-corner"),
      typeContrast: scope.getAttribute("data-type-contrast"),
      density: scope.getAttribute("data-density"),
      cardRadius: card ? getComputedStyle(card).borderTopLeftRadius : null,
      headingSize: heading ? getComputedStyle(heading).fontSize : null,
      buttonRadius: probe ? getComputedStyle(probe).borderTopLeftRadius : null,
      buttonHeight: probe ? getComputedStyle(probe).height : null,
    };
    probe?.remove();
    return result;
  }, scopeSelector);
}

// 1. 프로필 미리보기 → <html> 소비 경로
await page.goto(`${base}/profiles`, { waitUntil: "networkidle" });
const htmlRows = [];
for (const name of ["admin", "service", "data", "docs", "console"]) {
  await page
    .locator('[data-slot="card"]')
    .filter({ hasText: `profile-${name}.json` })
    .getByRole("button", { name: /^(이 프로필 미리보기|적용됨)$/ })
    .click();
  htmlRows.push({ profile: name, ...(await measureScope("html")) });
}
console.log("=== <html> 소비 경로 (프로필 미리보기 클릭 후) ===");
console.table(htmlRows);

// 2. 템플릿 레이아웃 → 서브트리 소비 경로 (미리보기 잔여 상태를 비우고 시작)
await page.evaluate(() => globalThis.localStorage.clear());
const templateRows = [];
for (const route of ["/templates/admin", "/templates/shop", "/templates/trading", "/templates/glossary"]) {
  await page.goto(`${base}${route}`, { waitUntil: "networkidle" });
  // <html> 에도 data-corner 가 붙으므로(위 미리보기 경로) 반드시 body 하위의
  // 템플릿 래퍼를 집는다 — 그렇지 않으면 localStorage 에 남은 직전 프로필을 잰다.
  templateRows.push({ route, ...(await measureScope("body [data-corner]")) });
}
console.log("=== 템플릿 서브트리 소비 경로 ===");
console.table(templateRows);

await browser.close();
