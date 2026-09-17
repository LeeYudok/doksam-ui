/** #43 진단 — 데모 버튼이 밀도 규칙에 지는 원인을 클래스 이분 탐색으로 찾는다. */
import { chromium } from "@playwright/test";

const base = process.env.BASE || "http://localhost:3143";
const browser = await chromium.launch();
const page = await browser.newPage();
await page.goto(`${base}/components/button`);
await page.evaluate(() => document.documentElement.setAttribute("data-density", "compact"));

const result = await page.evaluate(() => {
  const source = document.querySelector('[data-slot="button"][data-size="default"]');
  const classes = source.className.split(/\s+/).filter(Boolean);

  const measure = (list) => {
    const el = document.createElement("button");
    el.setAttribute("data-slot", "button");
    el.setAttribute("data-size", "default");
    el.className = list.join(" ");
    el.textContent = "x";
    document.body.appendChild(el);
    const h = getComputedStyle(el).height;
    el.remove();
    return h;
  };

  const full = measure(classes);
  const minimal = measure(["h-8", "px-2.5", "text-sm"]);

  // 어떤 클래스 하나를 빼면 결과가 바뀌는지 본다.
  const culprits = [];
  for (const c of classes) {
    const without = classes.filter((x) => x !== c);
    if (measure(without) !== full) culprits.push(c);
  }
  return { full, minimal, inPlace: getComputedStyle(source).height, culprits, total: classes.length };
});
console.log(JSON.stringify(result, null, 1));
await browser.close();
