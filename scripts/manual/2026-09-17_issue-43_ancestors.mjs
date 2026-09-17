/** #43 진단 — 데모 버튼이 밀도 축에 반응하지 않는 원인을 조상 체인에서 찾는다. */
import { chromium } from "@playwright/test";

const base = process.env.BASE || "http://localhost:3143";
const browser = await chromium.launch();
const page = await browser.newPage();
await page.goto(`${base}/components/button`);
await page.evaluate(() => document.documentElement.setAttribute("data-density", "compact"));

const info = await page.locator('[data-slot="button"][data-size="default"]').first().evaluate((el) => {
  const chain = [];
  let node = el;
  while (node && node !== document.documentElement) {
    const cs = getComputedStyle(node);
    chain.push({
      tag: node.tagName.toLowerCase(),
      slot: node.getAttribute("data-slot"),
      zoom: cs.zoom,
      transform: cs.transform.slice(0, 24),
      fontSize: cs.fontSize,
    });
    node = node.parentElement;
  }
  const cs = getComputedStyle(el);
  return {
    own: {
      height: cs.height,
      minHeight: cs.minHeight,
      paddingBlock: cs.paddingBlockStart,
      lineHeight: cs.lineHeight,
      dataSize: el.getAttribute("data-size"),
      classes: el.className,
      inlineStyle: el.getAttribute("style"),
    },
    chain: chain.slice(0, 3),
    diagnosis: {
      sameDocument: el.ownerDocument === document,
      closestDensity: el.closest("[data-density]")?.tagName ?? null,
      controlH: cs.getPropertyValue("--control-h").trim(),
      controlPx: cs.getPropertyValue("--control-px").trim(),
      matchesRule: el.matches('[data-slot="button"][data-size="default"]'),
      rootHasAttr: document.documentElement.hasAttribute("data-density"),
      inIframe: window.top !== window.self,
    },
  };
});
console.log(JSON.stringify(info, null, 1));
await browser.close();
