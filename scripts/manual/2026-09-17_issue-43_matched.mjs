/** #43 진단 — 버튼의 height 를 실제로 결정하는 CSS 규칙을 CDP 로 뽑는다. */
import { chromium } from "@playwright/test";

const base = process.env.BASE || "http://localhost:3143";
const browser = await chromium.launch();
const page = await browser.newPage();
await page.goto(`${base}/components/button`);
await page.evaluate(() => document.documentElement.setAttribute("data-density", "compact"));

const client = await page.context().newCDPSession(page);
await client.send("DOM.enable");
await client.send("CSS.enable");
const { root } = await client.send("DOM.getDocument", { depth: -1 });
const { nodeId } = await client.send("DOM.querySelector", {
  nodeId: root.nodeId,
  selector: '[data-slot="button"][data-size="default"]',
});
const matched = await client.send("CSS.getMatchedStylesForNode", { nodeId });

const hits = [];
for (const entry of matched.matchedCSSRules ?? []) {
  const props = entry.rule.style?.cssProperties ?? [];
  const height = props.find((p) => p.name === "height" || p.name === "padding-inline");
  if (height) {
    hits.push({
      selector: entry.rule.selectorList.text,
      origin: entry.rule.origin,
      layer: entry.rule.layers?.map((l) => l.text).join(">") ?? "(unlayered)",
      decl: `${height.name}: ${height.value}`,
    });
  }
}
console.log(JSON.stringify(hits, null, 1));
await browser.close();
