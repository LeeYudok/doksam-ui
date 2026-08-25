import { describe, expect, it } from "vitest";

import { LAYOUT_ARCHETYPES } from "@/archetypes";
import { PERSONALITY_PRESETS } from "@/personalities";

import {
  CONVERGENCE_ANTIPATTERNS_SECTION,
  DESIGN_BRIEF_SECTION,
  RULES_MARKDOWN,
  RULES_SECTIONS,
  RULE_KINDS,
} from "@/lib/rules-markdown";

describe("규칙의 두 층(#28)", () => {
  it("모든 절이 불변/선택 중 하나로 표시된다", () => {
    for (const section of RULES_SECTIONS) {
      expect(RULE_KINDS, `"${section.title}" 절의 kind 가 유효하지 않다`).toContain(section.kind);
    }
  });

  it("불변과 선택이 모두 존재한다", () => {
    expect(new Set(RULES_SECTIONS.map((s) => s.kind))).toEqual(new Set(RULE_KINDS));
  });

  it("디자인 브리프가 첫 절, 수렴 안티패턴이 둘째 절이다", () => {
    expect(RULES_SECTIONS[0].title).toContain("디자인 브리프");
    expect(RULES_SECTIONS[0].kind).toBe("invariant");
    expect(RULES_SECTIONS[1].title).toContain("수렴 안티패턴");
    expect(RULES_SECTIONS[1].kind).toBe("invariant");
  });

  it("DESIGN_BRIEF_SECTION 이 첫 절을 가리킨다 — gen-llms 가 이걸 llms.txt 앞에 싣는다", () => {
    expect(DESIGN_BRIEF_SECTION).toBe(RULES_SECTIONS[0]);
  });

  it("디자인 브리프는 원형·성격·배제 목록·이유 네 가지를 요구한다", () => {
    const text = DESIGN_BRIEF_SECTION.items.join("\n");
    expect(text).toContain("DESIGN.md");
    for (const required of ["원형(archetype)", "성격(personality)", "안 쓸 컴포넌트·패턴", "이유:"]) {
      expect(text).toContain(required);
    }
  });

  it("브리프의 원형 항목은 레지스트리 9종을 전부 이름으로 열거하고 자유 문자열을 금지한다 (#34)", () => {
    const archetypeItem = DESIGN_BRIEF_SECTION.items.find((item) => item.startsWith("원형(archetype)"));
    expect(archetypeItem).toBeDefined();
    for (const archetype of LAYOUT_ARCHETYPES) {
      expect(archetypeItem).toContain(archetype.name);
    }
    expect(archetypeItem).toContain("자유 문자열");
    expect(archetypeItem).toContain("불가");
    expect(archetypeItem).not.toMatch(/없으면 자유 문자열/);
  });

  it("브리프의 성격 항목은 personality 프리셋을 전부 이름으로 열거한다 (#34)", () => {
    const personalityItem = DESIGN_BRIEF_SECTION.items.find((item) => item.startsWith("성격(personality)"));
    expect(personalityItem).toBeDefined();
    for (const preset of PERSONALITY_PRESETS) {
      expect(personalityItem).toContain(preset.name);
    }
  });

  it("CONVERGENCE_ANTIPATTERNS_SECTION 이 둘째 절을 가리킨다 — gen-llms 가 전문을 싣는다", () => {
    expect(CONVERGENCE_ANTIPATTERNS_SECTION).toBe(RULES_SECTIONS[1]);
    expect(CONVERGENCE_ANTIPATTERNS_SECTION.title).toBe("수렴 안티패턴");
  });

  it("선택 절은 첫 항목이 선택지를 제시하고 나머지에 경계를 붙인다", () => {
    for (const section of RULES_SECTIONS.filter((s) => s.kind === "decision")) {
      // 첫 항목 = 무엇을 고르는가. 명령문("~한다")만 나열하면 선택 층이 아니다.
      expect(section.items[0], `"${section.title}" 절 첫 항목이 선택지를 제시하지 않는다`).toMatch(
        /고른다|고르는|정한다|적용한다|먼저 본다/,
      );
      expect(
        section.items.filter((item) => item.startsWith("경계 —")).length,
        `"${section.title}" 절에 경계 항목이 없다`,
      ).toBeGreaterThan(0);
    }
  });
});

describe("RULES_MARKDOWN", () => {
  it("절 제목 뒤에 층 마커를 붙인다", () => {
    for (const section of RULES_SECTIONS) {
      expect(RULES_MARKDOWN).toContain(`## ${section.title} [${section.kind}]`);
    }
  });

  it("두 층을 읽는 법을 본문 앞에서 설명한다", () => {
    const briefIndex = RULES_MARKDOWN.indexOf("## 디자인 브리프");
    expect(RULES_MARKDOWN.indexOf("[invariant] — 불변")).toBeLessThan(briefIndex);
    expect(RULES_MARKDOWN.indexOf("[decision] — 선택")).toBeLessThan(briefIndex);
  });

  it("디자인 브리프가 다른 어떤 절보다 앞에 온다", () => {
    const positions = RULES_SECTIONS.map((s) => RULES_MARKDOWN.indexOf(`## ${s.title} [`));
    expect(positions.every((p) => p >= 0)).toBe(true);
    expect(Math.min(...positions)).toBe(positions[0]);
  });
});
