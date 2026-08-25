import { test, expect, type Locator, type Page } from "@playwright/test";

/**
 * 레이아웃 불변식 E2E (#42 B영역).
 *
 * "겹침 없음" · "텍스트 잘림 없음" · "가로 스크롤 없음" 을 눈이 아니라
 * 측정값(boundingBox 교차 / scrollWidth vs clientWidth)으로 판정한다.
 * 진짜 시각 판정(색·정렬 미묘함 등)은 여기서 다루지 않고 비전 게이트(C영역,
 * `pnpm test:vision`, 수동)로 위임한다.
 */

type Box = { x: number; y: number; width: number; height: number };

const TOLERANCE_PX = 1;

/** 두 사각형이 겹치는지(포함/부분교차 포함) 판정 — TOLERANCE_PX 이내 접촉은 겹침으로 안 본다. */
function boxesOverlap(a: Box, b: Box, tolerance = TOLERANCE_PX): boolean {
  const noOverlap =
    a.x + a.width <= b.x + tolerance ||
    b.x + b.width <= a.x + tolerance ||
    a.y + a.height <= b.y + tolerance ||
    b.y + b.height <= a.y + tolerance;
  return !noOverlap;
}

/**
 * 주어진 로케이터들의 boundingBox 를 모두 구해 pairwise 교차를 검출한다.
 * 겹치면 안 되는 요소쌍(예: 헤더 vs 본문, 그리드 컬럼끼리)을 넘긴다.
 * 숨김 요소(boundingBox null)는 판정에서 제외한다.
 */
async function expectNoOverlap(locators: Locator[], label = "elements"): Promise<void> {
  const entries: { box: Box; index: number }[] = [];
  for (let i = 0; i < locators.length; i++) {
    const box = await locators[i].boundingBox();
    if (box && box.width > 0 && box.height > 0) entries.push({ box, index: i });
  }
  const collisions: string[] = [];
  for (let i = 0; i < entries.length; i++) {
    for (let j = i + 1; j < entries.length; j++) {
      if (boxesOverlap(entries[i].box, entries[j].box)) {
        collisions.push(`${label}[${entries[i].index}] × ${label}[${entries[j].index}]`);
      }
    }
  }
  expect(collisions, `overlapping ${label}: ${collisions.join(", ")}`).toEqual([]);
}

/**
 * 텍스트를 담은 리프 요소 중 scrollWidth > clientWidth(잘림)인 것을 찾는다.
 * `truncate`/`line-clamp`/`text-overflow:ellipsis` 처럼 의도적으로 자르는
 * 요소는 잘림이 아니라 설계이므로 제외한다.
 */
async function expectNoClipping(page: Page): Promise<void> {
  const clipped = await page.evaluate((tolerance) => {
    const selector = "h1,h2,h3,h4,h5,h6,p,span,a,button,label,dd,dt,li,td,th,caption,figcaption";
    const els = Array.from(document.querySelectorAll<HTMLElement>(selector));
    return els
      .filter((el) => (el.textContent ?? "").trim().length > 0)
      .filter((el) => {
        if (el.closest(".sr-only")) return false; // 스크린리더 전용(visually-hidden) — 시각적 잘림 아님
        const style = getComputedStyle(el);
        if (style.textOverflow === "ellipsis") return false; // 의도적 truncate
        if (style.display.includes("box") && style.getPropertyValue("-webkit-line-clamp")) return false; // line-clamp
        if (style.whiteSpace === "nowrap" && style.overflow === "hidden") return false; // 의도적 nowrap 잘림
        return el.scrollWidth > el.clientWidth + tolerance;
      })
      .map((el) => ({
        tag: el.tagName.toLowerCase(),
        text: (el.textContent ?? "").trim().slice(0, 40),
        scrollWidth: el.scrollWidth,
        clientWidth: el.clientWidth,
      }));
  }, TOLERANCE_PX);
  expect(clipped, `clipped text elements: ${JSON.stringify(clipped)}`).toEqual([]);
}

/** 문서 전체 가로 스크롤(오버플로우)이 없는지 확인한다. */
async function expectNoHorizontalOverflow(page: Page): Promise<void> {
  const { scrollWidth, clientWidth } = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
  }));
  expect(
    scrollWidth,
    `document.documentElement.scrollWidth(${scrollWidth}) > clientWidth(${clientWidth}) — 가로 오버플로우`,
  ).toBeLessThanOrEqual(clientWidth + TOLERANCE_PX);
}

const WIDTHS = [
  { label: "mobile", width: 390, height: 844 },
  { label: "tablet", width: 768, height: 1024 },
  { label: "desktop", width: 1280, height: 900 },
];

const PAGES = ["/", "/components", "/patterns", "/templates", "/archetypes", "/templates/brokerage", "/templates/admin", "/templates/mail-workspace"];

for (const viewport of WIDTHS) {
  test.describe(`레이아웃 불변식 @ ${viewport.label} (${viewport.width}px)`, () => {
    test.use({ viewport: { width: viewport.width, height: viewport.height } });

    for (const path of PAGES) {
      test(`${path} — 겹침·잘림·가로오버플로우 없음`, async ({ page }) => {
        await page.goto(path);
        await page.waitForLoadState("networkidle");

        await expectNoHorizontalOverflow(page);
        await expectNoClipping(page);

        // 헤더(상단 내비)와 본문(main)은 어떤 폭에서도 겹치면 안 된다 —
        // 사이드바→상단내비 전환(#41) 이후 sticky 헤더가 본문 위로
        // 떠서 콘텐츠를 가리는 회귀를 잡는다.
        // 일부 템플릿(admin)은 자체 <main> 을 중첩해 둬 getByRole("main")이 2개
        // 매칭될 수 있어 — 사이트 루트 <main>(가장 바깥쪽, 헤더 바로 아래) 하나만 본다.
        const header = page.getByRole("banner");
        const main = page.getByRole("main").first();
        await expectNoOverlap([header, main], "header/main");
      });
    }
  });
}

test.describe("모바일 상단 내비 — 햄버거·드로어 겹침", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test("햄버거 버튼은 로고·검색 트리거와 겹치지 않는다", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    const logo = page.getByRole("link", { name: "doksam-ui" });
    const hamburger = page.getByRole("button", { name: "메뉴 열기" });
    await expect(hamburger).toBeVisible();

    await expectNoOverlap([logo, hamburger], "topnav-mobile-controls");
    await expectNoHorizontalOverflow(page);
  });

  test("드로어를 열어도 가로 오버플로우가 생기지 않고, 드로어 내부에서 잘림이 없다", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    await page.getByRole("button", { name: "메뉴 열기" }).click();

    const drawerNav = page.getByRole("navigation", { name: "모바일 내비게이션" });
    await expect(drawerNav).toBeVisible();

    await expectNoHorizontalOverflow(page);
    await expectNoClipping(page);
  });
});

test.describe("증권 템플릿 — 그리드 컬럼 겹침 (데스크톱)", () => {
  test.use({ viewport: { width: 1280, height: 900 } });

  test("스크리너·종목상세·관심종목 3컬럼은 서로 겹치지 않는다", async ({ page }) => {
    await page.goto("/templates/brokerage");
    await page.waitForLoadState("networkidle");

    const screener = page.getByRole("table").first();
    const stockDetailTitle = page.getByText("누리전자", { exact: true }).first();
    const watchlistTitle = page.getByText("관심종목", { exact: true }).first();

    // 스크리너 테이블·종목상세·관심종목 3컬럼(양 끝 + 가운데)은 어떤 경우에도 겹치면 안 된다.
    await expectNoOverlap([screener, stockDetailTitle, watchlistTitle], "brokerage-columns");
  });
});
