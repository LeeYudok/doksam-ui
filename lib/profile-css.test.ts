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
      '<html data-theme="slate" data-font="geist" data-corner="sharp" data-type-contrast="flat" data-density="compact" data-personality="compact" data-personality-surface="border" data-personality-motion="none" style="--radius: 2px">',
    );
  });

  it("marks the <html> tag with class=\"dark\" when the profile defaults to dark mode", () => {
    const profile = getBrandProfile("data")!;
    const code = generateProfileCode(profile);

    expect(code).toContain(
      '<html data-theme="violet" data-font="space-grotesk" data-corner="soft" data-type-contrast="flat" data-density="compact" data-personality="compact" data-personality-surface="border" data-personality-motion="none" style="--radius: 6px" class="dark">',
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

  it("includes the three-step density layer wired to buttons (#43)", () => {
    const profile = getBrandProfile("service")!;
    const code = generateProfileCode(profile);

    expect(code).toContain('[data-density="compact"] {');
    expect(code).toContain('[data-density="spacious"] {');
    expect(code).toContain('[data-slot="button"][data-size="default"]');
    expect(code).toContain("--control-px");
    expect(code).toContain("--control-fs");
  });

  it("includes the corner layer and overrides control radius only when it differs (#43)", () => {
    const pill = generateProfileCode(getBrandProfile("service")!);
    expect(pill).toContain('[data-corner="pill"] {');
    expect(pill).toContain("--radius: 12px;");
    expect(pill).toContain("--radius-control: 9999px;");
    expect(pill).toContain("border-radius: var(--radius-control);");

    // control === surface 인 계열은 --radius 배관만으로 충분하므로 오버라이드하지 않는다.
    const sharp = generateProfileCode(getBrandProfile("admin")!);
    expect(sharp).toContain('[data-corner="sharp"] {');
    expect(sharp).not.toContain("--radius-control");
  });

  it("includes the type contrast layer scoped to headings only (#43)", () => {
    const code = generateProfileCode(getBrandProfile("admin")!);

    expect(code).toContain('[data-type-contrast="flat"] {');
    expect(code).toContain("--heading-scale: 0.85;");
    expect(code).toContain("--heading-weight: 600;");
    expect(code).toContain("[data-type-contrast] :is(h1, h2, h3) {");
    // 본문 배율이 없어야 이 축이 균등 배율과 구분된다.
    expect(code).not.toContain("--body-scale");
  });

  it("produces non-empty output for every registered profile", () => {
    for (const profile of BRAND_PROFILES) {
      expect(generateProfileCode(profile).length).toBeGreaterThan(0);
    }
  });
});
