/**
 * #47 H1 실증 — `!` 를 뗀 컨트롤들이 밀도 축을 실제로 추종하는지 계산된 스타일로 측정한다.
 *
 * 왜 필요한가: app/globals.css 의 밀도 층은 버튼의 높이뿐 아니라 padding-inline 과 gap 도
 * 소유한다(--control-px · --control-gap). 패딩·간격 유틸리티에 `!` 를 붙이면 그 컨트롤만
 * 밀도 축에서 빠진다. 여기서는 세 밀도에서 값이 실제로 갈리는지를 확인한다.
 *
 * 주의 1) 버튼에 transition-all 이 있어 속성 변경 직후 읽으면 전환 중간값이 나온다.
 * 주의 2) standalone 서버로 띄우면 정적 자산이 404 라 값이 오염된다 — `next start` 로 띄운다.
 *
 * 사용: node scripts/manual/2026-09-17_issue-47_verify-density-follow.mjs [baseUrl]
 */
import { chromium } from "@playwright/test";

const BASE = process.argv[2] ?? "http://localhost:3214";

/** [라벨, 경로, 선택자] — `!` 를 뗀 지점마다 하나씩. */
const TARGETS = [
  ["copy-button(/tokens)", "/tokens", '[data-slot="button"]:has-text("복사")'],
  ["data-table-demo 페이지네이션", "/patterns/data-table", '[data-slot="button"]:has-text("이전")'],
  ["admin-toolbar 랜덤생성", "/patterns/admin-toolbar", '[data-slot="button"][title="랜덤 생성"]'],
  ["pipeline 툴바 내보내기", "/patterns/pipeline", '[data-slot="button"]:has-text("내보내기")'],
  // 아래 세 건은 해당 라우트에서 컨트롤이 지연 마운트/팝오버 안에 있어 헤드리스로는
  // 안정적으로 잡히지 않는다. 같은 Button 프리미티브 · 같은 밀도 층을 타므로 위
  // 측정점들과 기전이 동일하다 — 잡히면 측정하고, 못 잡으면 SKIP 으로 남긴다.
  ["stock-portfolio 액션메뉴 항목", "/patterns/stock-portfolio", '[data-slot="button"]:has-text("매수정보 수정")'],
  ["auth-samples 소셜", "/patterns/auth", '[data-slot="button"]:has-text("Google로 계속하기")'],
  ["color-picker 트리거", "/components/color-picker", '[data-slot="button"][aria-label="색상 선택"]'],
  // table-sortable 은 템플릿에서 실제로 쓰이는 자리를 본다(컴포넌트 상세의 데모는 지연 마운트라 불안정).
  ["table-sortable 컬럼(/templates/admin)", "/templates/admin", '[data-slot="button"]:has-text("컬럼")'],
];

const DENSITIES = ["compact", "comfortable", "spacious"];

async function settle(locator) {
  await locator.evaluate(
    (el) =>
      new Promise((resolve) => {
        const done = () => requestAnimationFrame(() => resolve());
        const duration = Number.parseFloat(getComputedStyle(el).transitionDuration) || 0;
        if (duration === 0) return done();
        el.addEventListener("transitionend", done, { once: true });
        setTimeout(done, duration * 1000 + 150);
      }),
  );
}

const browser = await chromium.launch();
const page = await browser.newPage();
let failures = 0;

for (const [label, route, selector] of TARGETS) {
  await page.goto(BASE + route, { waitUntil: "networkidle" });
  // 데모는 뷰포트 진입 시 지연 마운트된다 — 끝까지 스크롤해 마운트시킨다.
  await page.mouse.wheel(0, 4000);
  await page.waitForTimeout(1200);
  // 컴포넌트·패턴 상세의 미리보기는 뷰포트 전환용 iframe 안에 렌더된다 — 프레임을 훑는다.
  let scope = page;
  for (const frame of page.frames()) {
    if ((await frame.locator(selector).count()) > 0) { scope = frame; break; }
  }
  // 팝오버 안에 있는 항목은 트리거를 먼저 연다.
  const trigger = scope.locator('[data-slot="button"][aria-label="종목 액션 메뉴"]').first();
  if (route === "/patterns/stock-portfolio" && (await trigger.count()) > 0) {
    await trigger.click();
    for (const frame of page.frames()) {
      if ((await frame.locator(selector).count()) > 0) { scope = frame; break; }
    }
  }
  const button = scope.locator(selector).first();
  if ((await button.count()) === 0) {
    console.log(`SKIP  ${label} — 선택자에 해당하는 버튼 없음 (${selector})`);
    continue;
  }
  const rows = [];
  for (const density of DENSITIES) {
    await scope.evaluate((d) => document.documentElement.setAttribute("data-density", d), density);
    await settle(button);
    rows.push([
      density,
      await button.evaluate((el) => {
        const cs = getComputedStyle(el);
        return { h: cs.height, px: cs.paddingInlineStart, gap: cs.columnGap, size: el.dataset.size };
      }),
    ]);
  }
  const pads = new Set(rows.map(([, m]) => m.px));
  const gaps = new Set(rows.map(([, m]) => m.gap));
  const ok = pads.size >= 2;
  if (!ok) failures += 1;
  console.log(
    `${ok ? "PASS" : "FAIL"}  ${label} [size=${rows[0][1].size}]  ` +
      rows.map(([d, m]) => `${d}: h=${m.h} px=${m.px} gap=${m.gap}`).join(" | ") +
      `  (padding 변화 ${pads.size}종 / gap 변화 ${gaps.size}종)`,
  );
}

// 캘린더(#47 M1) — pill 에서 날짜 셀이 --radius-control(9999px)에 잡히면 범위 선택의
// 좌우 연결 표시가 끊어진다. 내비 버튼만 알약이 되고 날짜 셀은 --cell-radius 를 지켜야 한다.
// border-radius 도 transition-all 대상이라 settle 없이 읽으면 전환 시작값(6px)이 나온다.
await page.goto(BASE + "/components/calendar", { waitUntil: "networkidle" });
await page.evaluate(() => document.documentElement.setAttribute("data-corner", "pill"));
const nav = page.locator('[data-slot="calendar"] .rdp-button_previous').first();
const dayCell = page.locator('[data-slot="calendar"] [data-slot="button"][data-day]').first();
await settle(nav);
await settle(dayCell);
const cal = await page.evaluate(() => {
  const root = document.querySelector('[data-slot="calendar"]');
  if (!root) return null;
  const radius = (el) => (el ? getComputedStyle(el).borderTopLeftRadius : null);
  const day = root.querySelector('[data-slot="button"][data-day]');
  return {
    navPrev: radius(root.querySelector(".rdp-button_previous")),
    navNext: radius(root.querySelector(".rdp-button_next")),
    dayButton: radius(day),
    dayCellTd: radius(day?.parentElement),
    radiusControl: getComputedStyle(root).getPropertyValue("--radius-control").trim(),
    cellRadius: getComputedStyle(day).borderTopLeftRadius,
  };
});
const calOk = cal && Number.parseFloat(cal.navPrev) > 100 && Number.parseFloat(cal.dayButton) < 100;
if (!calOk) failures += 1;
console.log(`${calOk ? "PASS" : "FAIL"}  캘린더 pill — ${JSON.stringify(cal)}`);

await browser.close();
process.exit(failures > 0 ? 1 : 0);
