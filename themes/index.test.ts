import { describe, expect, it } from "vitest";

import { DEFAULT_THEME_PRESET, getThemePreset, THEME_PRESETS } from "@/themes";
import { THEME_TOKEN_KEYS } from "@/themes/types";

describe("theme registry", () => {
  it("has exactly the nine presets", () => {
    const names = THEME_PRESETS.map((preset) => preset.name).sort();
    expect(names).toEqual(["ember", "forest", "gold", "ink-bulb", "ivory", "ocean", "rose", "slate", "violet"]);
  });

  it("registers the default preset in the registry", () => {
    expect(THEME_PRESETS.some((preset) => preset.name === DEFAULT_THEME_PRESET)).toBe(true);
  });

  it("resolves a preset by name via getThemePreset", () => {
    expect(getThemePreset("ocean")?.label).toBe("Ocean");
    expect(getThemePreset("unknown")).toBeUndefined();
  });

  it.each(THEME_PRESETS)(
    "$name preset has a complete light and dark token set",
    (preset) => {
      for (const key of THEME_TOKEN_KEYS) {
        expect(preset.light[key], `light.${key} missing for ${preset.name}`).toBeTruthy();
        expect(preset.dark[key], `dark.${key} missing for ${preset.name}`).toBeTruthy();
      }
    },
  );

  it.each(THEME_PRESETS)("$name preset tokens are OKLCH values", (preset) => {
    for (const key of THEME_TOKEN_KEYS) {
      expect(preset.light[key]).toMatch(/^oklch\(/);
      expect(preset.dark[key]).toMatch(/^oklch\(/);
    }
  });

  it.each(THEME_PRESETS)("$name preset has a name, label and swatch", (preset) => {
    expect(preset.name).toBeTruthy();
    expect(preset.label).toBeTruthy();
    expect(preset.swatch).toMatch(/^oklch\(/);
  });

  it("only ink-bulb defines the opt-in brand extension tokens (bulb/shell*)", () => {
    const extensionKeys = ["bulb", "shell", "shellForeground", "shellMuted"] as const;
    const inkBulb = getThemePreset("ink-bulb");
    expect(inkBulb).toBeDefined();
    for (const key of extensionKeys) {
      expect(inkBulb!.light[key], `light.${key} missing for ink-bulb`).toMatch(/^oklch\(/);
      expect(inkBulb!.dark[key], `dark.${key} missing for ink-bulb`).toMatch(/^oklch\(/);
    }

    const standardPresets = THEME_PRESETS.filter((preset) => preset.name !== "ink-bulb");
    for (const preset of standardPresets) {
      for (const key of extensionKeys) {
        expect(preset.light[key], `${preset.name} light.${key} should be undefined`).toBeUndefined();
        expect(preset.dark[key], `${preset.name} dark.${key} should be undefined`).toBeUndefined();
      }
    }
  });
});
