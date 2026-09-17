import { chromium } from "@playwright/test";
const base = process.env.BASE || "http://localhost:3143";
const browser = await chromium.launch();
const page = await browser.newPage();
await page.goto(`${base}/components/button`);
await page.evaluate(() => document.documentElement.setAttribute("data-density", "compact"));
const out = await page.evaluate(() => {
  const el = document.querySelector('[data-slot="button"][data-size="default"]');
  const chain = [];
  let n = el.parentElement;
  while (n) {
    const attrs = [...n.attributes].filter((a) => a.name.startsWith("data-") || a.name === "style").map((a) => `${a.name}=${a.value.slice(0, 30)}`);
    const cs = getComputedStyle(n);
    if (attrs.length || cs.zoom !== "1") chain.push({ tag: n.tagName, attrs, zoom: cs.zoom });
    n = n.parentElement;
  }
  const cs = getComputedStyle(el);
  return { height: cs.height, controlH: cs.getPropertyValue("--control-h").trim(), chain };
});
console.log(JSON.stringify(out, null, 1));
await browser.close();
