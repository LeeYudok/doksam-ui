import { chromium } from "@playwright/test";
const base = process.env.BASE || "http://localhost:3143";
const browser = await chromium.launch();
const page = await browser.newPage();
await page.goto(`${base}/components/button`);
await page.evaluate(() => document.documentElement.setAttribute("data-density", "compact"));
const out = await page.evaluate(() => {
  const src = document.querySelector('[data-slot="button"][data-size="default"]');
  const mk = (parent) => {
    const el = src.cloneNode(true);
    parent.appendChild(el);
    const h = getComputedStyle(el).height;
    el.remove();
    return h;
  };
  return {
    inPlace: getComputedStyle(src).height,
    rect: src.getBoundingClientRect().height,
    cloneInSameParent: mk(src.parentElement),
    cloneInBody: mk(document.body),
    parentDisplay: getComputedStyle(src.parentElement).display,
    parentAlign: getComputedStyle(src.parentElement).alignItems,
    parentTag: src.parentElement.tagName + "." + src.parentElement.className.slice(0, 40),
  };
});
console.log(JSON.stringify(out, null, 1));
await browser.close();
