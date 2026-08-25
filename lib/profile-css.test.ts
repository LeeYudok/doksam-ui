import { describe, expect, it } from "vitest";

import { generateProfileCode } from "@/lib/profile-css";
import { BRAND_PROFILES, getBrandProfile } from "@/profiles";

describe("generateProfileCode", () => {
  it("includes the theme CSS variable block, the html tag and a profile comment", () => {
    const profile = getBrandProfile("admin")!;
    const code = generateProfileCode(profile);

    expect(code).toContain(`/* 프로필: ${profile.label}`);
    expect(code).toContain('[data-theme="slate"]');
    expect(code).toContain('[data-theme="slate"].dark');
    expect(code).toContain(
      '<html data-theme="slate" data-font="geist" data-density="compact" data-personality="regular" data-personality-surface="border" data-personality-motion="subtle" style="--radius: 6px">',
    );
  });

  it("marks the <html> tag with class=\"dark\" when the profile defaults to dark mode", () => {
    const profile = getBrandProfile("data")!;
    const code = generateProfileCode(profile);

    expect(code).toContain(
      '<html data-theme="violet" data-font="space-grotesk" data-density="compact" data-personality="regular" data-personality-surface="border" data-personality-motion="subtle" style="--radius: 6px" class="dark">',
    );
  });

  it("includes the density token layer so consumers can paste it as-is (#65)", () => {
    const profile = getBrandProfile("service")!;
    const code = generateProfileCode(profile);

    expect(code).toContain("[data-density] {");
    expect(code).toContain('[data-density="compact"] {');
    expect(code).toContain("--control-h");
    expect(code).toContain("--cell-py");
    expect(code).toContain("--stack-gap");
  });

  it("includes the personality token layer so consumers can paste it as-is (#90)", () => {
    const profile = getBrandProfile("service")!;
    const code = generateProfileCode(profile);

    expect(code).toContain("[data-personality] {");
    expect(code).toContain('[data-personality="compact"] {');
    expect(code).toContain('[data-personality-surface="shadow"]');
    expect(code).toContain('[data-personality-motion="none"]');
    expect(code).toContain("--personality-scale");
  });

  it("produces non-empty output for every registered profile", () => {
    for (const profile of BRAND_PROFILES) {
      expect(generateProfileCode(profile).length).toBeGreaterThan(0);
    }
  });
});
