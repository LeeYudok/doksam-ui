import { describe, expect, it } from "vitest";

import { LAYOUT_ARCHETYPES } from "@/archetypes";
import { CORNER_PRESETS } from "@/corners";
import { PERSONALITY_PRESETS } from "@/personalities";
import { BRAND_PROFILES } from "@/profiles";

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

  it("브리프의 원형 항목은 레지스트리 원형을 전부 이름으로 열거하고 자유 문자열을 금지한다 (#34)", () => {
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

describe("레지스트리 파생 문장 (#110)", () => {
  const corners = RULES_SECTIONS.find((s) => s.title.includes("모서리"));

  it("모서리 절이 corner 프리셋과 프로필 고정값을 전부 이름으로 싣는다 (finding 4)", () => {
    // 손으로 적던 시절 finance(#91) 프로필이 목록에서 빠졌다 —
    // 문장은 corners/index.ts·profiles/index.ts 에서 파생돼야 한다.
    expect(corners).toBeDefined();
    const text = corners!.items.join("\n");
    for (const preset of CORNER_PRESETS) {
      expect(text, `corner 프리셋 ${preset.name} 이 규칙 문장에 없다`).toContain(preset.name);
    }
    for (const profile of BRAND_PROFILES) {
      expect(text, `프로필 ${profile.name} 의 corner 고정값이 규칙 문장에 없다`).toContain(
        `${profile.name}=${profile.corner}`,
      );
    }
  });

  it("모션 절의 소유자가 personality 하나로 정해져 있다 (finding 5)", () => {
    // 브리프 절은 "personality 가 모션 강도를 정한다"고 쓰는데 모션 절이
    // "프로젝트가 고른다"로 쓰면 소유권이 둘로 갈린다. 실제 강제자는
    // app/globals.css 의 data-personality-motion 층이므로 personality 쪽으로 통일한다.
    const motion = RULES_SECTIONS.find((s) => s.title.includes("모션"));
    expect(motion).toBeDefined();
    expect(motion!.items[0]).toContain("personality");
    expect(motion!.items[0]).toContain("data-personality-motion");
    for (const preset of PERSONALITY_PRESETS) {
      expect(motion!.items[0], `personality ${preset.name} 의 motion 값이 문장에 없다`).toContain(
        `${preset.name}=${preset.motion}`,
      );
    }
  });

  it("레지스트리 설치 절이 소비자가 볼 수 있는 주소로 프로필을 가리킨다 (finding 6)", () => {
    const text = RULES_SECTIONS.flatMap((s) => s.items).join("\n");
    const installItem = RULES_SECTIONS.flatMap((s) => s.items).find((item) =>
      item.includes("doksam-ui 고유 자산"),
    );
    expect(installItem).toBeDefined();
    expect(installItem, "소비자가 못 보는 내부 경로를 가리킨다").not.toContain("profiles/index.ts에 등록된");
    expect(installItem).toContain("ui.doksam.com/profiles");
    expect(installItem, "유틸리티 profile-scope 와의 구분이 없다").toContain("profile-scope");
    expect(text).toContain("ui.doksam.com/profiles");
  });

  it("브리프의 성격 항목이 density 의 실제 소유 범위를 적는다 (finding 1)", () => {
    const item = DESIGN_BRIEF_SECTION.items.find((i) => i.startsWith("성격(personality)"));
    expect(item).toBeDefined();
    for (const owned of ["--control-fs", "--stack-gap"]) {
      expect(item, `density 가 소유한 ${owned} 가 문장에 없다`).toContain(owned);
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
