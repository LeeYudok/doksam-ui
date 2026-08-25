import { describe, expect, it } from "vitest";

import { DEFAULT_PERSONALITY_PRESET, getPersonalityPreset, PERSONALITY_PRESETS } from "@/personalities";

describe("PERSONALITY_PRESETS", () => {
  it("has no duplicate preset names", () => {
    const names = PERSONALITY_PRESETS.map((preset) => preset.name);
    expect(new Set(names).size).toBe(names.length);
  });

  it("every preset has a valid scale/surface/motion", () => {
    for (const preset of PERSONALITY_PRESETS) {
      expect(["compact", "regular", "bold"], `${preset.name}.scale`).toContain(preset.scale);
      expect(["border", "shadow", "flat"], `${preset.name}.surface`).toContain(preset.surface);
      expect(["none", "subtle", "expressive"], `${preset.name}.motion`).toContain(preset.motion);
    }
  });

  it("every preset has a non-empty label and description", () => {
    for (const preset of PERSONALITY_PRESETS) {
      expect(preset.label.length).toBeGreaterThan(0);
      expect(preset.description.length).toBeGreaterThan(0);
    }
  });

  it("DEFAULT_PERSONALITY_PRESET resolves to a registered preset", () => {
    expect(getPersonalityPreset(DEFAULT_PERSONALITY_PRESET)).toBeDefined();
  });

  it("getPersonalityPreset returns undefined for an unknown name", () => {
    expect(getPersonalityPreset("does-not-exist")).toBeUndefined();
  });

  it("the neutral preset keeps the pre-#90 look (regular/border/subtle)", () => {
    expect(getPersonalityPreset("neutral")).toMatchObject({
      scale: "regular",
      surface: "border",
      motion: "subtle",
    });
  });
});
