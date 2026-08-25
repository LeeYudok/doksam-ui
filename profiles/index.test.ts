import { describe, expect, it } from "vitest";

import { APP_SHELL_SAMPLES } from "@/components/patterns/app-shell-samples";
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
      expect(["compact", "comfortable"]).toContain(profile.density);
    }
  });

  it("matches the spec's radius/density assignment per profile (#65)", () => {
    expect(getBrandProfile("admin")).toMatchObject({ radius: "6px", density: "compact" });
    expect(getBrandProfile("service")).toMatchObject({ radius: "10px", density: "comfortable" });
    expect(getBrandProfile("data")).toMatchObject({ radius: "6px", density: "compact" });
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

  it("matches the spec's assignment for the docs/console profiles (#65)", () => {
    expect(getBrandProfile("docs")).toMatchObject({
      theme: "forest",
      font: "ibm-plex-kr",
      defaultMode: "light",
      radius: "8px",
      density: "comfortable",
    });
    expect(getBrandProfile("console")).toMatchObject({
      theme: "ember",
      font: "geist",
      defaultMode: "dark",
      radius: "4px",
      density: "compact",
    });
  });
});
