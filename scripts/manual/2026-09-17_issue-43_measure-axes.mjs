/**
 * #43 진단 — 형태 축이 실제 렌더에 닿는지 계산된 스타일로 확인한다.
 *
 * e2e 실증 스펙(e2e/shape-axes.spec.ts)이 실패했을 때 "왜 안 갈리는지"를 숫자로
 * 보기 위한 일회성 도구다. 서버를 먼저 띄우고 BASE 로 주소를 넘긴다.
 *   pnpm build && pnpm start -p 3143 &
 *   BASE=http://localhost:3143 node scripts/manual/2026-09-17_issue-43_measure-axes.mjs
 */
import { chromium } from "@playwright/test";

const base = process.env.BASE || "http://localhost:3143";
const browser = await chromium.launch();
const page = await browser.newPage();

await page.goto(`${base}/components/button`);
for (const density of ["compact", "comfortable", "spacious"]) {
  await page.evaluate((v) => document.documentElement.setAttribute("data-density", v), density);
  const m = await page.locator('[data-slot="button"][data-size="default"]').first().evaluate((el) => {
    const cs = getComputedStyle(el);
    const zoomed = el.closest("[style*='zoom'],[data-personality]");
    return {
      height: cs.height,
      paddingInline: cs.paddingInlineStart,
      fontSize: cs.fontSize,
      classes: el.className.slice(0, 70),
      insideScopedContainer: Boolean(zoomed),
      htmlDensity: document.documentElement.getAttribute("data-density"),
    };
  });
  console.log("density(page button)", density, JSON.stringify(m));

  // 페이지 래퍼 영향을 배제한 순수 프로브 — body 직속에 버튼을 심어 측정한다.
  const probe = await page.evaluate(() => {
    const el = document.createElement("button");
    el.setAttribute("data-slot", "button");
    el.setAttribute("data-size", "default");
    el.className = "h-8 px-2.5 text-sm";
    el.textContent = "probe";
    document.body.appendChild(el);
    const cs = getComputedStyle(el);
    const out = { height: cs.height, paddingInline: cs.paddingInlineStart, fontSize: cs.fontSize };
    el.remove();
    return out;
  });
  console.log("density(probe)     ", density, JSON.stringify(probe));
}

await page.goto(`${base}/corners`);
for (const corner of ["sharp", "soft", "rounded", "pill"]) {
  const el = page.locator(`[data-corner="${corner}"] [data-slot="button"]`).first();
  const count = await el.count();
  const r = count
    ? await el.evaluate((e) => {
        const cs = getComputedStyle(e);
        return {
          borderRadius: cs.borderTopLeftRadius,
          radiusVar: cs.getPropertyValue("--radius").trim(),
          radiusLgVar: cs.getPropertyValue("--radius-lg").trim(),
        };
      })
    : null;
  console.log("corner", corner, "matches:", count, JSON.stringify(r));
}

for (const width of [390, 768, 1280]) {
  await page.setViewportSize({ width, height: 900 });
  const o = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
  }));
  console.log("overflow@", width, JSON.stringify(o), o.scrollWidth > o.clientWidth ? "OVERFLOW" : "ok");
}

await browser.close();
