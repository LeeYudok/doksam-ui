import { describe, expect, it } from "vitest";

import { CORNER_PRESETS, DEFAULT_CORNER, getCornerPreset } from "@/corners";

describe("CORNER_PRESETS", () => {
  it("설계에 명시된 4종 계열을 등록한다", () => {
    expect(CORNER_PRESETS.map((c) => c.name)).toEqual(["sharp", "soft", "rounded", "pill"]);
  });

  it("계열 이름은 중복되지 않는다", () => {
    const names = CORNER_PRESETS.map((c) => c.name);
    expect(new Set(names).size).toBe(names.length);
  });

  it("모든 계열이 설명·적합 성격·반례를 갖는다", () => {
    for (const corner of CORNER_PRESETS) {
      expect(corner.label.length).toBeGreaterThan(0);
      expect(corner.description.length).toBeGreaterThan(0);
      expect(corner.suitedFor.length, `${corner.name}.suitedFor`).toBeGreaterThan(0);
      expect(
        corner.avoidWhen.length,
        `${corner.name}.avoidWhen 이 비었다 — 후보를 잘라내는 항목이 없으면 에이전트는 기본값을 고른다(#37)`,
      ).toBeGreaterThan(0);
    }
  });

  it("반경은 CSS 길이 문자열이다", () => {
    for (const corner of CORNER_PRESETS) {
      expect(corner.surface, `${corner.name}.surface`).toMatch(/^\d+px$/);
      expect(corner.control, `${corner.name}.control`).toMatch(/^\d+px$/);
    }
  });

  /**
   * 계열이 서로 다른 반경을 줘야 축으로서 의미가 있다. 전부 같은 값이면
   * "고를 수 있다"는 착각만 주고 결과물은 동일해진다 — #37 에서 성격 축이
   * 프로필 5종 전부 neutral 이라 no-op 이었던 것과 같은 실패다.
   */
  it("계열마다 컨트롤 반경이 실제로 다르다", () => {
    const controls = CORNER_PRESETS.map((c) => c.control);
    expect(new Set(controls).size).toBe(controls.length);
  });

  it("pill 은 컨트롤만 완전히 둥글고 표면은 그렇지 않다", () => {
    const pill = getCornerPreset("pill");
    expect(pill).toBeDefined();
    expect(Number.parseInt(pill!.control, 10)).toBeGreaterThan(1000);
    expect(Number.parseInt(pill!.surface, 10)).toBeLessThan(100);
  });

  it("DEFAULT_CORNER 가 등록된 계열을 가리킨다", () => {
    expect(getCornerPreset(DEFAULT_CORNER)).toBeDefined();
  });
});
