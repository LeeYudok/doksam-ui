import { describe, expect, it } from "vitest";

import { contrastRatio, oklchToHex, parseOklch, relativeLuminance } from "@/lib/color-contrast";

/**
 * 대비 계산 자체가 맞는지 — 이 함수가 틀리면 lib/risk-tokens.test.ts 의 4.5:1
 * 판정이 통째로 무의미해진다. 외부 기준값과 대조한다.
 */
describe("OKLCH → sRGB 변환", () => {
  it("흑백 양 끝을 알려진 값으로 되돌린다", () => {
    expect(oklchToHex("oklch(1 0 0)")).toBe("#ffffff");
    expect(oklchToHex("oklch(0 0 0)")).toBe("#000000");
  });

  it("sRGB 원색을 표준 OKLCH 좌표에서 되돌린다", () => {
    // 참조값은 CSS Color 4 명세의 sRGB 원색 OKLCH 좌표다(널리 인용되는 값).
    // 채널 반올림 오차 1 까지만 허용한다 — 계수가 어긋나면 여기서 먼저 깨진다.
    const near = (color: string, hex: string) => {
      const got = oklchToHex(color);
      for (let i = 1; i < 7; i += 2) {
        const a = Number.parseInt(got.slice(i, i + 2), 16);
        const b = Number.parseInt(hex.slice(i, i + 2), 16);
        expect(Math.abs(a - b), `${got} vs ${hex}`).toBeLessThanOrEqual(1);
      }
    };
    near("oklch(0.6279 0.2577 29.23)", "#ff0000");
    near("oklch(0.8664 0.2948 142.5)", "#00ff00");
    near("oklch(0.452 0.3132 264.05)", "#0000ff");
  });

  it("퍼센트 표기와 알파를 파싱한다", () => {
    expect(parseOklch("oklch(1 0 0 / 12%)")).toEqual({ l: 1, c: 0, h: 0, alpha: 0.12 });
  });

  it("파싱할 수 없는 값은 조용히 0 으로 떨어지지 않고 던진다", () => {
    expect(() => parseOklch("#ff0000")).toThrow();
    expect(() => parseOklch("var(--primary)")).toThrow();
  });
});

describe("WCAG 대비비", () => {
  it("흑백은 21:1 이다", () => {
    expect(contrastRatio("oklch(1 0 0)", "oklch(0 0 0)")).toBeCloseTo(21, 2);
  });

  it("같은 색은 1:1 이고 순서를 바꿔도 같다", () => {
    expect(contrastRatio("oklch(0.5 0.1 200)", "oklch(0.5 0.1 200)")).toBeCloseTo(1, 10);
    const a = "oklch(0.45 0.2 27)";
    const b = "oklch(0.95 0.01 262)";
    expect(contrastRatio(a, b)).toBeCloseTo(contrastRatio(b, a), 10);
  });

  it("상대휘도는 어두울수록 작다", () => {
    expect(relativeLuminance("oklch(0.2 0 0)")).toBeLessThan(relativeLuminance("oklch(0.8 0 0)"));
  });
});
