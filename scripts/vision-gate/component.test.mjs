// scripts/vision-gate/component.test.mjs
//
// Unit tests for the component-level visual expression axis (issue #43) —
// pure scoring/aggregation only, no Anthropic API / Playwright dependency.

import { describe, expect, it } from "vitest";
import {
  COMPONENT_AXES,
  COMPONENT_DISTINCT_RATIO_FAIL_THRESHOLD,
  COMPONENT_MODE_SHARE_FAIL_THRESHOLD,
  CONTROL_DENSITY_DESCRIPTIONS,
  CONTROL_DENSITY_IDS,
  CORNER_IMPRESSION_DESCRIPTIONS,
  CORNER_IMPRESSION_IDS,
  SURFACE_IMPRESSION_DESCRIPTIONS,
  SURFACE_IMPRESSION_IDS,
  TYPE_CONTRAST_IMPRESSION_DESCRIPTIONS,
  TYPE_CONTRAST_IMPRESSION_IDS,
  densityIdsMatchProfiles,
  scoreComponentPage,
  summarizeComponentRun,
} from "./component.mjs";
import { BRAND_PROFILES } from "../../profiles/index.ts";
import { CORNER_PRESETS } from "../../corners/index.ts";
import { TYPE_CONTRAST_PRESETS } from "../../type-contrast/index.ts";

describe("vocabulary is derived from the registries, not hand-rolled (#43)", () => {
  it("CORNER_IMPRESSION_IDS matches corners/index.ts CORNER_PRESETS exactly", () => {
    expect(CORNER_IMPRESSION_IDS).toEqual(CORNER_PRESETS.map((c) => c.name));
  });

  it("TYPE_CONTRAST_IMPRESSION_IDS matches type-contrast/index.ts TYPE_CONTRAST_PRESETS exactly", () => {
    expect(TYPE_CONTRAST_IMPRESSION_IDS).toEqual(TYPE_CONTRAST_PRESETS.map((t) => t.name));
  });

  it("CONTROL_DENSITY_IDS covers every density value BRAND_PROFILES actually uses", () => {
    expect(densityIdsMatchProfiles(BRAND_PROFILES)).toBe(true);
  });

  it("every axis id has a non-trivial English, shape-only description", () => {
    for (const axis of COMPONENT_AXES) {
      for (const id of axis.ids) {
        const description = axis.descriptions[id];
        expect(description, `${axis.key}.${id} missing description`).toBeTruthy();
        expect(description.length).toBeGreaterThan(10);
      }
    }
  });

  it("descriptions dicts have no stray keys beyond their id list", () => {
    expect(Object.keys(CONTROL_DENSITY_DESCRIPTIONS).sort()).toEqual([...CONTROL_DENSITY_IDS].sort());
    expect(Object.keys(CORNER_IMPRESSION_DESCRIPTIONS).sort()).toEqual([...CORNER_IMPRESSION_IDS].sort());
    expect(Object.keys(SURFACE_IMPRESSION_DESCRIPTIONS).sort()).toEqual([...SURFACE_IMPRESSION_IDS].sort());
    expect(Object.keys(TYPE_CONTRAST_IMPRESSION_DESCRIPTIONS).sort()).toEqual(
      [...TYPE_CONTRAST_IMPRESSION_IDS].sort(),
    );
  });

  it("COMPONENT_AXES declares exactly the 4 required axes with distinct response fields", () => {
    expect(COMPONENT_AXES.map((a) => a.key).sort()).toEqual(["contrast", "corner", "density", "surface"]);
    const fields = COMPONENT_AXES.map((a) => a.field);
    expect(new Set(fields).size).toBe(fields.length);
  });
});

describe("scoreComponentPage — pipeline fidelity (declared profile vs detected)", () => {
  it("flags no mismatch when a page declares no profile at all (opt-in, informational only)", () => {
    const page = { name: "home" };
    const result = scoreComponentPage(page, {
      controlDensity: "spacious",
      cornerImpression: "pill",
      surfaceImpression: "elevated",
      typeContrastImpression: "dramatic",
    });
    for (const axis of Object.values(result.axes)) {
      expect(axis.expected).toBeUndefined();
      expect(axis.mismatch).toBe(false);
    }
  });

  it("flags no mismatch when the detected impressions match the declared 'admin' profile", () => {
    // admin: corner sharp, density compact, typeContrast flat, personality
    // "crisp" -> surface "border" -> collapsed impression "flat".
    const page = { name: "template-admin", profile: "admin" };
    const result = scoreComponentPage(page, {
      controlDensity: "compact",
      cornerImpression: "sharp",
      surfaceImpression: "flat",
      typeContrastImpression: "flat",
    });
    expect(result.axes.density).toMatchObject({ expected: "compact", detected: "compact", mismatch: false });
    expect(result.axes.corner).toMatchObject({ expected: "sharp", detected: "sharp", mismatch: false });
    expect(result.axes.surface).toMatchObject({ expected: "flat", detected: "flat", mismatch: false });
    expect(result.axes.contrast).toMatchObject({ expected: "flat", detected: "flat", mismatch: false });
  });

  it("derives the expected surface impression from the profile's personality (shadow -> elevated) for 'service'", () => {
    // service: personality "elevated" -> surface "shadow" -> collapsed impression "elevated".
    const page = { name: "template-shop", profile: "service" };
    const result = scoreComponentPage(page, { surfaceImpression: "elevated" });
    expect(result.axes.surface).toMatchObject({ expected: "elevated", detected: "elevated", mismatch: false });
  });

  it("is this issue's core regression: a profile declares 'pill' corners but the screen renders sharp — flagged as a pipeline fault", () => {
    // The scenario named explicitly in the spec: "프로필이 corner: 'pill' 을
    // 선언했는데 화면이 각져 보이면 축이 렌더에 안 닿은 것이다."
    const page = { name: "template-shop", profile: "service" }; // service declares corner: "pill"
    const result = scoreComponentPage(page, { cornerImpression: "sharp" });
    expect(result.axes.corner).toEqual({ expected: "pill", detected: "sharp", mismatch: true });
  });

  it("does not flag a mismatch when the axis was not detected at all (dry run / API error)", () => {
    const page = { name: "template-admin", profile: "admin" };
    const result = scoreComponentPage(page, {});
    for (const axis of Object.values(result.axes)) {
      expect(axis.detected).toBeNull();
      expect(axis.mismatch).toBe(false);
    }
  });

  it("throws no error and reports undefined expectations for an unknown profile name", () => {
    const page = { name: "mystery", profile: "does-not-exist" };
    const result = scoreComponentPage(page, { cornerImpression: "pill" });
    expect(result.axes.corner).toEqual({ expected: undefined, detected: "pill", mismatch: false });
  });
});

describe("summarizeComponentRun — per-axis convergence, independent of skeleton diversity", () => {
  it("is this issue's core regression: N pages all render the same corner + density even though each page is otherwise fine", () => {
    // Mirrors the "4/4 동일 뼈대" regression test in diversity.test.mjs but
    // one layer down: here every page could have a *different* skeleton
    // (diversity.mjs would report no problem) while every component still
    // renders identically — that's exactly what per-axis convergence must
    // catch, and it must be reported separately from skeleton convergence.
    const scored = [
      scoreComponentPage({ name: "a" }, { cornerImpression: "sharp", controlDensity: "compact" }),
      scoreComponentPage({ name: "b" }, { cornerImpression: "sharp", controlDensity: "compact" }),
      scoreComponentPage({ name: "c" }, { cornerImpression: "sharp", controlDensity: "compact" }),
      scoreComponentPage({ name: "d" }, { cornerImpression: "sharp", controlDensity: "compact" }),
    ];

    const summary = summarizeComponentRun(scored);
    expect(summary.axes.corner.converged).toBe(true);
    expect(summary.axes.corner.modeValue).toBe("sharp");
    expect(summary.axes.corner.modeShare).toBe(1);
    expect(summary.axes.density.converged).toBe(true);
    expect(summary.runConverged).toBe(true);
    // No profile was declared on any page, so pipeline fidelity must stay
    // silent — convergence and pipeline faults are independent signals.
    expect(summary.pipelineFaults).toEqual([]);
  });

  it("does not flag convergence when a component axis is genuinely varied", () => {
    const scored = [
      scoreComponentPage({ name: "a" }, { cornerImpression: "sharp" }),
      scoreComponentPage({ name: "b" }, { cornerImpression: "soft" }),
      scoreComponentPage({ name: "c" }, { cornerImpression: "rounded" }),
      scoreComponentPage({ name: "d" }, { cornerImpression: "pill" }),
    ];

    const summary = summarizeComponentRun(scored);
    expect(summary.axes.corner.converged).toBe(false);
    expect(summary.axes.corner.distinctValues).toBe(4);
    expect(summary.axes.corner.distinctRatio).toBe(1);
  });

  it("flags convergence right at a >50% mode share, using the same threshold as skeleton convergence", () => {
    const scored = [
      scoreComponentPage({ name: "a" }, { cornerImpression: "sharp" }),
      scoreComponentPage({ name: "b" }, { cornerImpression: "sharp" }),
      scoreComponentPage({ name: "c" }, { cornerImpression: "sharp" }),
      scoreComponentPage({ name: "d" }, { cornerImpression: "pill" }),
    ];
    const summary = summarizeComponentRun(scored);
    expect(summary.axes.corner.modeShare).toBe(0.75);
    expect(summary.axes.corner.modeShare).toBeGreaterThan(COMPONENT_MODE_SHARE_FAIL_THRESHOLD);
    expect(summary.axes.corner.converged).toBe(true);
  });

  it("does not flag convergence at an exact 50/50 split", () => {
    const scored = [
      scoreComponentPage({ name: "a" }, { cornerImpression: "sharp" }),
      scoreComponentPage({ name: "b" }, { cornerImpression: "sharp" }),
      scoreComponentPage({ name: "c" }, { cornerImpression: "pill" }),
      scoreComponentPage({ name: "d" }, { cornerImpression: "pill" }),
    ];
    const summary = summarizeComponentRun(scored);
    expect(summary.axes.corner.modeShare).toBe(0.5);
    expect(summary.axes.corner.distinctRatio).not.toBeLessThan(COMPONENT_DISTINCT_RATIO_FAIL_THRESHOLD);
    expect(summary.axes.corner.converged).toBe(false);
  });

  it("is this issue's other core regression: declared vs rendered mismatch is reported as a pipeline fault, separate from convergence", () => {
    // Every page here has a genuinely DIFFERENT declared profile (so this is
    // not a convergence problem at all — each page is "supposed" to look
    // different) but each one renders sharp/flat regardless of what its own
    // profile promised. Convergence fires (they all look the same) AND
    // pipeline faults fire (each one individually broke its own promise) —
    // both must be visible, neither should swallow the other.
    const scored = [
      scoreComponentPage({ name: "template-admin", profile: "admin" }, { cornerImpression: "sharp" }), // admin declares sharp — matches
      scoreComponentPage({ name: "template-shop", profile: "service" }, { cornerImpression: "sharp" }), // service declares pill — mismatch
      scoreComponentPage({ name: "template-brokerage", profile: "service" }, { cornerImpression: "sharp" }), // service declares pill — mismatch
    ];

    const summary = summarizeComponentRun(scored);
    expect(summary.axes.corner.converged).toBe(true);
    expect(summary.pipelineFaults).toEqual([
      { page: "template-shop", profile: "service", axis: "corner", expected: "pill", detected: "sharp" },
      { page: "template-brokerage", profile: "service", axis: "corner", expected: "pill", detected: "sharp" },
    ]);
  });

  it("ignores pages with no detected value at all (dry run / API error) when computing per-axis metrics", () => {
    const scored = [
      scoreComponentPage({ name: "a" }, { cornerImpression: "sharp" }),
      scoreComponentPage({ name: "b" }, {}), // dry run
      scoreComponentPage({ name: "c" }, {}), // API error
    ];
    const summary = summarizeComponentRun(scored);
    expect(summary.axes.corner.sampledPages).toBe(1);
    expect(summary.axes.corner.converged).toBe(false);
  });

  it("returns a zeroed-out, non-converged summary for an empty run", () => {
    const summary = summarizeComponentRun([]);
    expect(summary.scoredPages).toBe(0);
    expect(summary.pipelineFaults).toEqual([]);
    expect(summary.runConverged).toBe(false);
    for (const axis of Object.values(summary.axes)) {
      expect(axis.sampledPages).toBe(0);
      expect(axis.modeValue).toBeNull();
      expect(axis.converged).toBe(false);
    }
  });
});
