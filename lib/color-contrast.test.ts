import { describe, expect, it } from "vitest";

import {
  compositeOver,
  contrastRatio,
  oklchToHex,
  oklchToSrgb,
  parseOklch,
  relativeLuminance,
  srgbContrastRatio,
} from "@/lib/color-contrast";

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

  it("퍼센트 L 과 알파를 파싱한다 — 둘 다 100% = 1 이다", () => {
    expect(parseOklch("oklch(1 0 0 / 12%)")).toEqual({ l: 1, c: 0, h: 0, alpha: 0.12 });
    expect(parseOklch("oklch(45% 0.13 152)").l).toBeCloseTo(0.45, 10);
  });

  it("크로마의 퍼센트 표기는 받지 않는다 — CSS 는 100% = 0.4 라 규칙이 다르다", () => {
    // 허용하면 2.5배 틀린 색을 조용히 계산한다(#81 리뷰 finding 3).
    expect(() => parseOklch("oklch(45% 50% 152)")).toThrow();
  });

  it("파싱할 수 없는 값은 조용히 0 으로 떨어지지 않고 던진다", () => {
    expect(() => parseOklch("#ff0000")).toThrow();
    expect(() => parseOklch("var(--primary)")).toThrow();
    expect(() => parseOklch("oklch(none 0 0)")).toThrow();
  });

  it("sRGB 색역을 벗어난 값은 채널에서 클램프된다", () => {
    // 클램프 경로는 이 파일의 핵심 주장이므로 단정으로 남긴다 — 채널이 1을
    // 넘거나 음수가 되는 색을 각각 확인한다.
    expect(oklchToHex("oklch(0.7 0.4 27)")).toMatch(/^#ff[0-9a-f]{4}$/);
    expect(oklchToSrgb(parseOklch("oklch(0.5 0.3 152)")).every((ch) => ch >= 0 && ch <= 1)).toBe(true);
    expect(oklchToSrgb(parseOklch("oklch(0.9 0.35 200)"))).toEqual(
      oklchToSrgb(parseOklch("oklch(0.9 0.35 200)")).map((ch) => Math.min(1, Math.max(0, ch))),
    );
  });

  it("중간 회색의 상대휘도를 알려진 값으로 되돌린다", () => {
    // #808080(sRGB 0.50196)의 WCAG 상대휘도는 0.2159 다.
    expect(relativeLuminance("oklch(0.5998 0 0)")).toBeCloseTo(0.2159, 3);
  });
});

describe("반투명 면 합성", () => {
  it("알파 0 은 backdrop 그대로, 1 은 전경 그대로다", () => {
    const backdrop = "oklch(0.95 0.01 262)";
    const fg = "oklch(0.45 0.13 152)";
    expect(compositeOver(fg, 0, backdrop)).toEqual(oklchToSrgb(parseOklch(backdrop)));
    expect(compositeOver(fg, 1, backdrop)).toEqual(oklchToSrgb(parseOklch(fg)));
  });

  it("tint 합성은 불투명 대비보다 항상 낮은 대비를 낸다", () => {
    const fg = "oklch(0.45 0.13 152)";
    const backdrop = "oklch(0.93 0.02 262)";
    const opaque = contrastRatio(fg, backdrop);
    const tinted = srgbContrastRatio(oklchToSrgb(parseOklch(fg)), compositeOver(fg, 0.14, backdrop));
    expect(tinted).toBeLessThan(opaque);
  });

  it("알파가 0..1 밖이면 던진다", () => {
    expect(() => compositeOver("oklch(0.5 0 0)", 1.5, "oklch(1 0 0)")).toThrow();
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

  it("반투명 값은 불투명으로 계산되지 않고 던진다", () => {
    // border/input 토큰(oklch(1 0 0 / 12%))을 그대로 넘기면 실제 렌더링보다
    // 낙관적인 숫자가 나오므로 막는다(#81 리뷰 finding 2).
    expect(() => contrastRatio("oklch(1 0 0 / 12%)", "oklch(0.2 0 0)")).toThrow();
    expect(() => contrastRatio("oklch(0.2 0 0)", "oklch(1 0 0 / 16%)")).toThrow();
  });

  it("상대휘도는 어두울수록 작다", () => {
    expect(relativeLuminance("oklch(0.2 0 0)")).toBeLessThan(relativeLuminance("oklch(0.8 0 0)"));
  });
});
