import { describe, expect, it } from "vitest";

import { contrastRatio, parseOklch } from "@/lib/color-contrast";
import { THEME_PRESETS } from "@/themes";

/**
 * `--chart-1~5` 가 **범주형** 팔레트인지 지킨다 (#93).
 *
 * #79 까지 이 다섯 토큰은 브랜드 hue 주변을 밝기만 바꿔 도는 순차형(sequential)
 * 램프였다 — ocean 은 hue 200~290, forest 는 100~190 한 띠 안이라 계열이 셋만
 * 넘어도 색으로 구분되지 않았고, 라이트에서는 `text-primary-foreground` 대비가
 * 2.29:1 까지 내려가 AA 미달이었다. 값을 다시 고르는 것으로 두 문제를 함께
 * 풀었으므로, 되돌아가지 않도록 여기서 잠근다.
 *
 * 세 축을 강제한다.
 *  1. hue 분리 — 같은 모드의 어떤 두 계열도 색상환에서 55° 이상 떨어져 있다.
 *     실제 배치는 브랜드 hue + 72°×k 라 72° 가 나오지만, 판정은 요건인 55° 로 둔다.
 *  2. 명도 계단 — 색약(적녹)에서 hue 가 무너져도 남는 채널이다. 회색조로 떨어뜨린
 *     셈인 상대휘도가 두 계열 사이에서 항상 1.15배 이상 벌어져 있어야 한다.
 *  3. 라이트/다크 대비 — `bg-chart-N` 위에 `text-primary-foreground` 를 올리는
 *     용법(종목 로고 이니셜 등)이 AA 4.5:1 을 넘는다. `--chart-N-foreground` 짝을
 *     추가하는 대신 토큰 자체의 명도로 푼 결정이므로, 이 단언이 그 결정의 계약이다.
 */

const CHART_KEYS = ["chart-1", "chart-2", "chart-3", "chart-4", "chart-5"] as const;
const MODES = ["light", "dark"] as const;

/** 색상환 위 두 hue 의 최단 거리(0~180). */
function hueDistance(a: number, b: number): number {
  const diff = Math.abs(((a - b) % 360) + 360) % 360;
  return Math.min(diff, 360 - diff);
}

describe("chart 토큰은 범주형 팔레트다 (#93)", () => {
  it.each(THEME_PRESETS)("$name — chart-1 이 프리셋 브랜드 hue 를 유지한다", (preset) => {
    for (const mode of MODES) {
      expect(parseOklch(preset[mode]["chart-1"]).h, `${preset.name}.${mode}`).toBe(
        parseOklch(preset.light.primary).h,
      );
    }
  });

  it.each(THEME_PRESETS)("$name — 어떤 두 계열도 hue 가 55° 이상 떨어져 있다", (preset) => {
    for (const mode of MODES) {
      const hues = CHART_KEYS.map((key) => parseOklch(preset[mode][key]).h);
      for (let i = 0; i < hues.length; i += 1) {
        for (let j = i + 1; j < hues.length; j += 1) {
          expect(
            hueDistance(hues[i], hues[j]),
            `${preset.name}.${mode}: chart-${i + 1}(${hues[i]}) vs chart-${j + 1}(${hues[j]})`,
          ).toBeGreaterThanOrEqual(55);
        }
      }
    }
  });

  it.each(THEME_PRESETS)("$name — 어떤 두 계열도 명도가 1.15배 이상 벌어져 있다", (preset) => {
    for (const mode of MODES) {
      const values = CHART_KEYS.map((key) => preset[mode][key]);
      for (let i = 0; i < values.length; i += 1) {
        for (let j = i + 1; j < values.length; j += 1) {
          expect(
            contrastRatio(values[i], values[j]),
            `${preset.name}.${mode}: chart-${i + 1} vs chart-${j + 1}`,
          ).toBeGreaterThanOrEqual(1.15);
        }
      }
    }
  });

  it.each(THEME_PRESETS)("$name — chart 면 위 text-primary-foreground 가 AA 4.5:1 을 넘는다", (preset) => {
    for (const mode of MODES) {
      const foreground = preset[mode]["primary-foreground"];
      for (const key of CHART_KEYS) {
        expect(
          contrastRatio(preset[mode][key], foreground),
          `${preset.name}.${mode}.${key} on ${foreground}`,
        ).toBeGreaterThanOrEqual(4.5);
      }
    }
  });
});
