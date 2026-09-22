import { describe, expect, it } from "vitest";

import { oklchToSrgb, parseOklch, srgbContrastRatio } from "@/lib/color-contrast";
import {
  HEATMAP_TOKEN_KEYS,
  HEATMAP_TOKENS,
  MATRIX_HEATMAP_STEPS,
  matrixHeatmapCellBackground,
  matrixHeatmapCellForeground,
  matrixHeatmapStep,
  type MatrixHeatmapStepIndex,
} from "@/lib/heatmap-tokens";
import { THEME_PRESETS } from "@/themes";

/**
 * matrix-heatmap 강도 램프의 약속을 기계적으로 지킨다 (#103).
 *
 * 셀 배경은 `oklch(from var(--primary) <L> c h)` 로 런타임에 파생되므로, 실제
 * 렌더링과 같은 색을 여기서 재구성해(프리셋의 `--primary` 에서 c·h 를 가져오고
 * L 만 토큰값으로 교체) 텍스트 토큰과의 대비를 실측한다.
 */

const MODES = ["light", "dark"] as const;
const AA_TEXT = 4.5;
const STEP_INDEXES: MatrixHeatmapStepIndex[] = [0, 1, 2, 3, 4];

/** `matrixHeatmapCellBackground(step)` 이 브라우저에서 계산할 색을 JS 로 재구성한다. */
function resolveCellColor(mode: "light" | "dark", primary: string, step: MatrixHeatmapStepIndex): [number, number, number] {
  const { c, h } = parseOklch(primary);
  const l = Number.parseFloat(HEATMAP_TOKENS[mode][`heatmap-l-${step}`]);
  return oklchToSrgb({ l, c, h, alpha: 1 });
}

/** `matrixHeatmapCellForeground(step)` 이 가리키는 토큰의 실제 프리셋 값을 해소한다. */
function resolveTextColor(mode: "light" | "dark", preset: (typeof THEME_PRESETS)[number], step: MatrixHeatmapStepIndex): [number, number, number] {
  const token = HEATMAP_TOKENS[mode][`heatmap-text-${step}`];
  const match = /^var\(--(.+)\)$/.exec(token);
  if (!match) throw new Error(`토큰 참조 형식이 아니다: ${token}`);
  const key = match[1] as keyof (typeof preset)[typeof mode];
  const value = preset[mode][key] as string;
  return oklchToSrgb(parseOklch(value));
}

describe("heatmap-tokens 구조", () => {
  it("단계는 5단이다", () => {
    expect(MATRIX_HEATMAP_STEPS).toBe(5);
  });

  it("키는 명도 5개 + 텍스트 5개다", () => {
    expect(HEATMAP_TOKEN_KEYS).toEqual([
      "heatmap-l-0",
      "heatmap-l-1",
      "heatmap-l-2",
      "heatmap-l-3",
      "heatmap-l-4",
      "heatmap-text-0",
      "heatmap-text-1",
      "heatmap-text-2",
      "heatmap-text-3",
      "heatmap-text-4",
    ]);
  });

  it.each(MODES)("%s 가 키 전체를 정의한다", (mode) => {
    expect(Object.keys(HEATMAP_TOKENS[mode]).sort()).toEqual([...HEATMAP_TOKEN_KEYS].sort());
  });

  it("라이트 모드는 옅음→진함(명도 하강)이다", () => {
    const ls = STEP_INDEXES.map((s) => Number.parseFloat(HEATMAP_TOKENS.light[`heatmap-l-${s}`]));
    for (let i = 1; i < ls.length; i++) expect(ls[i]).toBeLessThan(ls[i - 1]);
  });

  it("다크 모드는 어두움→밝음(명도 상승)이다 — 배경보다 항상 밝아야 옅은 셀도 구분된다", () => {
    const ls = STEP_INDEXES.map((s) => Number.parseFloat(HEATMAP_TOKENS.dark[`heatmap-l-${s}`]));
    for (let i = 1; i < ls.length; i++) expect(ls[i]).toBeGreaterThan(ls[i - 1]);
    for (const preset of THEME_PRESETS) {
      const bgL = parseOklch(preset.dark.background).l;
      expect(ls[0], `${preset.name} 다크 배경(L=${bgL})보다 0단계가 밝아야 한다`).toBeGreaterThan(bgL);
    }
  });

  it("함수가 토큰 참조 문자열을 만든다", () => {
    expect(matrixHeatmapCellBackground(0)).toBe("oklch(from var(--primary) var(--heatmap-l-0) c h)");
    expect(matrixHeatmapCellForeground(3)).toBe("var(--heatmap-text-3)");
  });
});

describe("matrixHeatmapStep", () => {
  it("min..max 를 0..4 단계로 선형 정규화한다", () => {
    expect(matrixHeatmapStep(0, 0, 100)).toBe(0);
    expect(matrixHeatmapStep(100, 0, 100)).toBe(4);
    expect(matrixHeatmapStep(50, 0, 100)).toBe(2);
  });

  it("범위를 벗어난 값은 양 끝으로 클램프한다", () => {
    expect(matrixHeatmapStep(-10, 0, 100)).toBe(0);
    expect(matrixHeatmapStep(999, 0, 100)).toBe(4);
  });

  it("max <= min 이면 항상 0단계다(데이터 1개 또는 빈 데이터)", () => {
    expect(matrixHeatmapStep(5, 5, 5)).toBe(0);
    expect(matrixHeatmapStep(5, 10, 5)).toBe(0);
  });
});

describe("셀 대비 (프리셋 8종 × 라이트/다크 × 5단계)", () => {
  const cases = MODES.flatMap((mode) => STEP_INDEXES.map((step) => ({ mode, step })));

  it.each(cases)("$mode · 단계 $step 은 모든 프리셋에서 본문 대비 4.5:1 을 넘는다", ({ mode, step }) => {
    for (const preset of THEME_PRESETS) {
      const cell = resolveCellColor(mode, preset[mode].primary, step);
      const text = resolveTextColor(mode, preset, step);
      const ratio = srgbContrastRatio(cell, text);
      expect(ratio, `${preset.name}.${mode} 단계${step} = ${ratio.toFixed(2)}`).toBeGreaterThanOrEqual(AA_TEXT);
    }
  });
});
