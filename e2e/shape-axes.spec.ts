import { type Locator, expect, test } from "@playwright/test";

/**
 * 형태(shape) 축 실증 — #43.
 *
 * 이 스펙의 존재 이유: 직전 이슈(#37)에서 "축은 추가했는데 산출물이 또 비슷하다"가
 * 반복됐고, 원인은 축이 **렌더에 닿지 않는데도 테스트는 통과**하는 상태였다.
 * 레지스트리 단위 테스트는 "값이 선언됐다"까지만 보증한다. 여기서는 실제 브라우저의
 * 계산된 스타일(computed style)을 읽어 **눈에 보이는 결과가 실제로 갈리는지**를 잠근다.
 *
 * 축이 CSS 층에서 끊기면 이 스펙이 깨진다. 그게 목적이다.
 */

const px = (v: string) => Number.parseFloat(v);

/**
 * 버튼은 `transition-all` 을 갖고 있어 data 속성을 바꾼 직후 계산된 스타일을 읽으면
 * 전환 **중간값**이 나온다. 측정 전에 전환이 끝났는지 확인한다.
 */
async function settleTransition(locator: Locator) {
  await locator.evaluate(
    (el: Element) =>
      new Promise<void>((resolve) => {
        const done = () => requestAnimationFrame(() => resolve());
        const duration = Number.parseFloat(getComputedStyle(el).transitionDuration) || 0;
        if (duration === 0) return done();
        el.addEventListener("transitionend", done, { once: true });
        setTimeout(done, duration * 1000 + 120);
      }),
  );
}

test.describe("모서리(corner) 축", () => {
  test("계열마다 버튼 모서리가 실제로 다르게 렌더된다", async ({ page }) => {
    await page.goto("/corners");

    const radii = new Map<string, number>();
    for (const name of ["sharp", "soft", "rounded", "pill"]) {
      const button = page.locator(`[data-corner="${name}"] [data-slot="button"]`).first();
      await expect(button, `${name} 계열 미니어처에 버튼이 없다`).toBeVisible();
      radii.set(name, px(await button.evaluate((el) => getComputedStyle(el).borderTopLeftRadius)));
    }

    // 계열이 네 개인데 반경이 하나로 몰리면 축이 렌더에 닿지 않은 것이다.
    expect(new Set(radii.values()).size, `모서리 반경이 갈리지 않는다: ${JSON.stringify([...radii])}`).toBeGreaterThanOrEqual(3);
    expect(radii.get("sharp")!).toBeLessThan(radii.get("soft")!);
    expect(radii.get("soft")!).toBeLessThan(radii.get("rounded")!);
    // pill 은 컨트롤만 완전히 둥글다 — 높이의 절반 이상이면 알약으로 본다.
    expect(radii.get("pill")!).toBeGreaterThan(radii.get("rounded")!);
  });
});

test.describe("타입 대비(type-contrast) 축", () => {
  test("대비마다 제목 크기가 실제로 다르게 렌더된다", async ({ page }) => {
    await page.goto("/type-contrast");

    const sizes = new Map<string, number>();
    for (const name of ["flat", "moderate", "dramatic"]) {
      const heading = page.locator(`[data-type-contrast="${name}"] :is(h1, h2, h3, h4)`).first();
      await expect(heading, `${name} 대비 미니어처에 제목이 없다`).toBeVisible();
      sizes.set(name, px(await heading.evaluate((el) => getComputedStyle(el).fontSize)));
    }

    expect(new Set(sizes.values()).size, `제목 크기가 갈리지 않는다: ${JSON.stringify([...sizes])}`).toBe(3);
    expect(sizes.get("flat")!).toBeLessThan(sizes.get("moderate")!);
    expect(sizes.get("moderate")!).toBeLessThan(sizes.get("dramatic")!);
  });
});

test.describe("밀도(density) 축", () => {
  /**
   * 이 이슈의 핵심 주장을 잠그는 테스트다.
   *
   * 기존 personality scale 은 html font-size 를 움직이는 **균등 배율**이라 화면 전체가
   * 같은 비율로 커지거나 작아졌다. 그래서 버튼높이 : 좌우패딩의 **비율이 모든
   * 프로젝트에서 동일**했고, 결과물이 "다른 디자인"이 아니라 "같은 디자인의 배율"로
   * 나왔다. 밀도 축이 그 실패를 반복하지 않으려면 크기가 아니라 **비례**가 달라져야 한다.
   */
  test("밀도마다 버튼의 높이·패딩 비례가 달라진다", async ({ page }) => {
    await page.goto("/components/button");

    const metrics = new Map<string, { height: number; padding: number; ratio: number }>();
    for (const density of ["compact", "comfortable", "spacious"]) {
      await page.evaluate((d) => document.documentElement.setAttribute("data-density", d), density);
      const button = page.locator('[data-slot="button"][data-size="default"]').first();
      await expect(button, "default 크기 버튼을 찾지 못했다").toBeVisible();
      // 버튼에 transition-all 이 걸려 있어 속성을 바꾼 직후에는 전환 중간값이 읽힌다.
      // 전환이 끝날 때까지 기다리지 않으면 "축이 안 먹는다"는 오진을 하게 된다.
      await settleTransition(button);
      const box = await button.evaluate((el) => {
        const cs = getComputedStyle(el);
        return { height: cs.height, padding: cs.paddingInlineStart };
      });
      const height = px(box.height);
      const padding = px(box.padding);
      metrics.set(density, { height, padding, ratio: padding / height });
    }

    const heights = [...metrics.values()].map((m) => m.height);
    const ratios = [...metrics.values()].map((m) => m.ratio);

    // 1) 크기가 갈린다.
    expect(new Set(heights).size, `버튼 높이가 갈리지 않는다: ${JSON.stringify([...metrics])}`).toBeGreaterThanOrEqual(2);

    // 2) 그리고 비례도 갈린다 — 균등 배율이면 이 단언이 깨진다.
    expect(
      new Set(ratios.map((r) => r.toFixed(3))).size,
      `높이 대비 패딩 비율이 모든 밀도에서 같다 — 균등 배율로 회귀했다: ${JSON.stringify([...metrics])}`,
    ).toBeGreaterThanOrEqual(2);

    expect(metrics.get("compact")!.height).toBeLessThan(metrics.get("spacious")!.height);
    expect(metrics.get("compact")!.ratio).toBeLessThan(metrics.get("spacious")!.ratio);
  });

  /**
   * 전역 오버라이드가 Tailwind 유틸리티를 이기므로, 개별 컨트롤 하나만 예외를 주려면
   * Tailwind v4 의 `!` 접미사가 필요하다. 규칙에 탈출구로 명시했으므로 실제로
   * 동작하는지 잠근다 — 동작하지 않으면 규칙 문장이 거짓이 된다.
   */
  test("`!` 접미사가 밀도 오버라이드를 이기는 탈출구로 동작한다", async ({ page }) => {
    await page.goto("/components/button");
    await page.evaluate(() => document.documentElement.setAttribute("data-density", "compact"));

    const escaped = await page.evaluate(() => {
      const source = document.querySelector('[data-slot="button"][data-size="default"]');
      if (!source) return null;
      const clone = source.cloneNode(true) as HTMLElement;
      clone.classList.add("h-12!");
      source.parentElement?.appendChild(clone);
      const height = getComputedStyle(clone).height;
      clone.remove();
      return height;
    });

    expect(escaped, "버튼을 복제하지 못했다").not.toBeNull();
    expect(px(escaped!), "`h-12!` 가 밀도 오버라이드를 이기지 못한다 — 규칙의 탈출구 문장이 거짓이다").toBeCloseTo(48, 0);
  });
});

/**
 * 소비 경로 실증 (#47 H1).
 *
 * 위 스펙들은 `/corners`·`/type-contrast` 의 **스코프 컨테이너 미니어처**만 본다.
 * 그래서 축이 레지스트리·CSS 층에는 있는데 정작 `<html>`·템플릿 서브트리에 붙는
 * 배관이 통째로 빠져 있어도 전부 통과했다 — 그게 #47 이 생긴 이유다. 여기서는
 * 실제 소비 경로 두 곳(프로필 미리보기 → `<html>`, 템플릿 레이아웃 → 서브트리)을
 * 잠근다.
 */
test.describe("축 소비 경로", () => {
  test("프로필을 적용하면 <html> 에 두 축 속성이 붙는다", async ({ page }) => {
    await page.goto("/profiles");

    const html = page.locator("html");
    // CardTitle 은 heading 롤이 아니므로 카드마다 유일한 설치 명령 문자열로 고른다.
    const previewButton = (name: string) =>
      page
        .locator('[data-slot="card"]')
        .filter({ hasText: `profile-${name}.json` })
        .getByRole("button", { name: /^(이 프로필 미리보기|적용됨)$/ });

    await previewButton("admin").click();
    await expect(html).toHaveAttribute("data-corner", "sharp");
    await expect(html).toHaveAttribute("data-type-contrast", "flat");

    await previewButton("service").click();
    await expect(html).toHaveAttribute("data-corner", "pill");
    await expect(html).toHaveAttribute("data-type-contrast", "dramatic");
  });

  test("템플릿 서브트리가 프로필 축 전량을 스코프한다", async ({ page }) => {
    // admin = sharp/flat/compact, service = pill/dramatic/comfortable —
    // 두 템플릿의 카드 반경과 제목 크기가 실제로 갈려야 한다.
    const measured: Record<string, { radius: number; heading: number }> = {};
    for (const [route, corner, contrast, density] of [
      ["/templates/admin", "sharp", "flat", "compact"],
      ["/templates/shop", "pill", "dramatic", "comfortable"],
    ] as const) {
      await page.goto(route);
      const scope = page.locator(`[data-corner="${corner}"]`).first();
      await expect(scope, `${route}: data-corner 스코프가 없다`).toBeVisible();
      await expect(scope).toHaveAttribute("data-type-contrast", contrast);
      await expect(scope).toHaveAttribute("data-density", density);

      const card = scope.locator('[data-slot="card"]').first();
      await expect(card).toBeVisible();
      const heading = scope.locator("h1, h2, h3").first();
      await expect(heading).toBeVisible();
      measured[route] = {
        radius: px(await card.evaluate((el) => getComputedStyle(el).borderTopLeftRadius)),
        heading: px(await heading.evaluate((el) => getComputedStyle(el).fontSize)),
      };
    }

    expect(measured["/templates/admin"].radius).not.toBeCloseTo(measured["/templates/shop"].radius, 1);
    expect(measured["/templates/admin"].heading).not.toBeCloseTo(measured["/templates/shop"].heading, 1);
  });
});
