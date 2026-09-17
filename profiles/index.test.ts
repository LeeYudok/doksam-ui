import { describe, expect, it } from "vitest";

import { APP_SHELL_SAMPLES } from "@/components/patterns/app-shell-samples";
import { CORNER_PRESETS, getCornerPreset } from "@/corners";
import { TYPE_CONTRAST_PRESETS, getTypeContrastPreset } from "@/type-contrast";
import { FONT_PRESETS, getFontPreset } from "@/fonts";
import { getLayoutArchetype } from "@/archetypes";
import { PERSONALITY_PRESETS, getPersonalityPreset } from "@/personalities";
import { BRAND_PROFILES, DEFAULT_BRAND_PROFILE, getBrandProfile } from "@/profiles";
import { THEME_PRESETS, getThemePreset } from "@/themes";

describe("BRAND_PROFILES", () => {
  it("registers exactly the 5 documented profiles", () => {
    expect(BRAND_PROFILES.map((p) => p.name)).toEqual(["admin", "service", "data", "docs", "console"]);
  });

  it("every profile.theme references a real theme preset", () => {
    for (const profile of BRAND_PROFILES) {
      expect(getThemePreset(profile.theme), `${profile.name}.theme = ${profile.theme}`).toBeDefined();
      expect(THEME_PRESETS.some((t) => t.name === profile.theme)).toBe(true);
    }
  });

  it("every profile.font references a real font preset", () => {
    for (const profile of BRAND_PROFILES) {
      expect(getFontPreset(profile.font), `${profile.name}.font = ${profile.font}`).toBeDefined();
      expect(FONT_PRESETS.some((f) => f.name === profile.font)).toBe(true);
    }
  });

  it("every profile.personality references a real personality preset (#90)", () => {
    for (const profile of BRAND_PROFILES) {
      expect(getPersonalityPreset(profile.personality), `${profile.name}.personality = ${profile.personality}`).toBeDefined();
      expect(PERSONALITY_PRESETS.some((p) => p.name === profile.personality)).toBe(true);
    }
  });

  it("every profile has a valid defaultMode", () => {
    for (const profile of BRAND_PROFILES) {
      expect(["light", "dark"]).toContain(profile.defaultMode);
    }
  });

  it("every profile has a non-empty description and at least one example", () => {
    for (const profile of BRAND_PROFILES) {
      expect(profile.description.length).toBeGreaterThan(0);
      expect(profile.examples.length).toBeGreaterThan(0);
    }
  });

  it("every profile has a px radius and a valid density", () => {
    for (const profile of BRAND_PROFILES) {
      expect(profile.radius, `${profile.name}.radius`).toMatch(/^\d+px$/);
      expect(["compact", "comfortable", "spacious"]).toContain(profile.density);
    }
  });

  /**
   * #65 의 radius/density 배정은 #43 에서 재배정됐다 — radius 는 이제 corner 계열에서
   * 파생되고(자유 숫자 금지), 각 축의 값이 최소 한 프로필에서 실물로 렌더되도록 폈다.
   */
  it("matches the spec's shape-axis assignment per profile (#43)", () => {
    expect(getBrandProfile("admin")).toMatchObject({
      corner: "sharp",
      radius: "2px",
      density: "compact",
      typeContrast: "flat",
    });
    expect(getBrandProfile("service")).toMatchObject({
      corner: "pill",
      radius: "12px",
      density: "comfortable",
      typeContrast: "dramatic",
    });
    expect(getBrandProfile("data")).toMatchObject({
      corner: "soft",
      radius: "6px",
      density: "compact",
      typeContrast: "flat",
    });
  });

  it("every profile.archetype references a real layout archetype (#89)", () => {
    for (const profile of BRAND_PROFILES) {
      expect(profile.archetype, `${profile.name}.archetype 누락`).toBeDefined();
      expect(
        getLayoutArchetype(profile.archetype ?? ""),
        `${profile.name}.archetype = ${profile.archetype}`,
      ).toBeDefined();
    }
  });

  it("profile.shell 이 그 원형의 권장 셸과 일치한다 (#89)", () => {
    const shellTitles = new Set(APP_SHELL_SAMPLES.map((s) => s.title));
    for (const profile of BRAND_PROFILES) {
      if (!profile.shell) continue;
      expect(shellTitles.has(profile.shell), `${profile.name}.shell = ${profile.shell}`).toBe(true);
      const archetype = getLayoutArchetype(profile.archetype ?? "");
      expect(profile.shell, `${profile.name} 셸 ↔ 원형 불일치`).toBe(archetype?.shell);
    }
  });

  it("has no duplicate profile names", () => {
    const names = BRAND_PROFILES.map((p) => p.name);
    expect(new Set(names).size).toBe(names.length);
  });

  it("DEFAULT_BRAND_PROFILE resolves to a registered profile", () => {
    expect(getBrandProfile(DEFAULT_BRAND_PROFILE)).toBeDefined();
  });

  it("getBrandProfile returns undefined for an unknown name", () => {
    expect(getBrandProfile("does-not-exist")).toBeUndefined();
  });

  it("matches the spec's fixed theme/font/mode assignment per profile (#15)", () => {
    expect(getBrandProfile("admin")).toMatchObject({
      theme: "slate",
      font: "geist",
      defaultMode: "light",
    });
    expect(getBrandProfile("service")).toMatchObject({
      theme: "ocean",
      font: "noto-sans-kr",
      defaultMode: "light",
    });
    expect(getBrandProfile("data")).toMatchObject({
      theme: "violet",
      font: "space-grotesk",
      defaultMode: "dark",
    });
  });

  it("matches the spec's assignment for the docs/console profiles (#43)", () => {
    expect(getBrandProfile("docs")).toMatchObject({
      theme: "forest",
      font: "ibm-plex-kr",
      defaultMode: "light",
      corner: "rounded",
      radius: "12px",
      density: "spacious",
      typeContrast: "dramatic",
    });
    expect(getBrandProfile("console")).toMatchObject({
      theme: "ember",
      font: "geist",
      defaultMode: "dark",
      corner: "sharp",
      radius: "2px",
      density: "compact",
      typeContrast: "moderate",
    });
  });

  it("every profile.corner references a real corner preset (#43)", () => {
    for (const profile of BRAND_PROFILES) {
      expect(getCornerPreset(profile.corner), `${profile.name}.corner = ${profile.corner}`).toBeDefined();
    }
  });

  it("every profile.typeContrast references a real type-contrast preset (#43)", () => {
    for (const profile of BRAND_PROFILES) {
      expect(
        getTypeContrastPreset(profile.typeContrast),
        `${profile.name}.typeContrast = ${profile.typeContrast}`,
      ).toBeDefined();
    }
  });

  /**
   * radius 는 손으로 적는 값이 아니라 corner 계열에서 파생된 표면 반경이다.
   * 둘이 어긋나면 프로필이 선언한 모서리와 실제 렌더가 달라진다 — 축이 있는데
   * 닿지 않는 상태이고, 그게 #37 에서 확인된 수렴의 직접 원인이었다.
   */
  it("profile.radius 가 corner 계열의 표면 반경과 일치한다 (#43)", () => {
    for (const profile of BRAND_PROFILES) {
      const corner = getCornerPreset(profile.corner);
      expect(profile.radius, `${profile.name}: corner=${profile.corner}`).toBe(corner?.surface);
    }
  });

  /**
   * #37 의 교훈을 테스트로 고정한다. 그때 실패 원인은 "축은 추가했는데 그 축으로
   * 렌더된 실물이 카탈로그에 0개"였다 — 프로필 5종이 전부 personality neutral 이라
   * 전 축이 no-op 이었다. 축이 갈리지 않으면 에이전트는 모방할 대상이 없어
   * 기본값으로 회귀한다. 값이 하나로 몰리면 이 테스트가 깨져야 한다.
   */
  it("모든 변주 축이 프로필들 사이에서 실제로 갈린다 (#43)", () => {
    const axes = {
      corner: BRAND_PROFILES.map((p) => p.corner),
      typeContrast: BRAND_PROFILES.map((p) => p.typeContrast),
      density: BRAND_PROFILES.map((p) => p.density),
      personality: BRAND_PROFILES.map((p) => p.personality),
      theme: BRAND_PROFILES.map((p) => p.theme),
    };
    for (const [axis, values] of Object.entries(axes)) {
      expect(
        new Set(values).size,
        `${axis} 축이 프로필 전체에서 값 하나로 몰려 있다 — 카탈로그에 변주 실물이 없다`,
      ).toBeGreaterThanOrEqual(2);
    }
  });

  /**
   * 신설 축은 모든 값이 최소 한 프로필에서 실물로 렌더돼야 한다. 쓰이지 않는
   * 프리셋은 문서상 선택지로만 남고, 에이전트는 그 값을 골라도 참고할 화면이 없다.
   */
  it("신설 축(corner·typeContrast)의 모든 값이 최소 한 프로필에서 쓰인다 (#43)", () => {
    const usedCorners = new Set(BRAND_PROFILES.map((p) => p.corner));
    for (const corner of CORNER_PRESETS) {
      expect(usedCorners.has(corner.name), `corner "${corner.name}" 을 쓰는 프로필이 없다`).toBe(true);
    }
    const usedContrasts = new Set(BRAND_PROFILES.map((p) => p.typeContrast));
    for (const preset of TYPE_CONTRAST_PRESETS) {
      expect(usedContrasts.has(preset.name), `typeContrast "${preset.name}" 을 쓰는 프로필이 없다`).toBe(true);
    }
  });
});
