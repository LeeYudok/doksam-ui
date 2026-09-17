import { describe, expect, it } from "vitest";

import { DEFAULT_TYPE_CONTRAST, TYPE_CONTRAST_PRESETS, getTypeContrastPreset } from "@/type-contrast";

describe("TYPE_CONTRAST_PRESETS", () => {
  it("설계에 명시된 3종 대비를 등록한다", () => {
    expect(TYPE_CONTRAST_PRESETS.map((t) => t.name)).toEqual(["flat", "moderate", "dramatic"]);
  });

  it("대비 이름은 중복되지 않는다", () => {
    const names = TYPE_CONTRAST_PRESETS.map((t) => t.name);
    expect(new Set(names).size).toBe(names.length);
  });

  it("모든 대비가 설명·적합 성격·반례를 갖는다", () => {
    for (const preset of TYPE_CONTRAST_PRESETS) {
      expect(preset.label.length).toBeGreaterThan(0);
      expect(preset.description.length).toBeGreaterThan(0);
      expect(preset.suitedFor.length, `${preset.name}.suitedFor`).toBeGreaterThan(0);
      expect(
        preset.avoidWhen.length,
        `${preset.name}.avoidWhen 이 비었다 — 후보를 잘라내는 항목이 없으면 에이전트는 기본값을 고른다(#37)`,
      ).toBeGreaterThan(0);
    }
  });

  /**
   * 이 축의 존재 이유는 **비례**를 바꾸는 것이다. 기존 personality scale 은
   * html font-size 를 움직이는 균등 배율이라 제목↔본문 대비가 모든 프로젝트에서
   * 동일했고, 그래서 "다른 디자인"이 아니라 "같은 디자인의 배율"만 나왔다.
   * headingScale 이 전부 같으면 이 축은 그 실패를 그대로 반복한다.
   */
  it("대비마다 제목 배율이 실제로 다르다", () => {
    const scales = TYPE_CONTRAST_PRESETS.map((t) => t.headingScale);
    expect(new Set(scales).size).toBe(scales.length);
  });

  it("제목 배율이 단조 증가한다 — flat < moderate < dramatic", () => {
    const [flat, moderate, dramatic] = TYPE_CONTRAST_PRESETS;
    expect(flat.headingScale).toBeLessThan(moderate.headingScale);
    expect(moderate.headingScale).toBeLessThan(dramatic.headingScale);
  });

  it("제목 굵기는 본문보다 굵은 범위다", () => {
    for (const preset of TYPE_CONTRAST_PRESETS) {
      expect(preset.headingWeight, `${preset.name}.headingWeight`).toBeGreaterThanOrEqual(500);
      expect(preset.headingWeight).toBeLessThanOrEqual(900);
    }
  });

  it("DEFAULT_TYPE_CONTRAST 가 등록된 대비를 가리킨다", () => {
    expect(getTypeContrastPreset(DEFAULT_TYPE_CONTRAST)).toBeDefined();
  });
});
