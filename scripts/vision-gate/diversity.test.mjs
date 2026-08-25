// scripts/vision-gate/diversity.test.mjs
//
// Unit tests for the diversity axis (issue #92) — rubric parsing + score
// aggregation only, no Anthropic API / Playwright dependency.

import { describe, expect, it } from "vitest";
import { DIVERSITY_ARCHETYPE_IDS, parseArchetypeArg, scoreDiversity, summarizeDiversity } from "./diversity.mjs";
import { BASELINE_ARCHETYPE_ID, DIVERSITY_ARCHETYPES, PAGES } from "./rubric.mjs";

describe("rubric diversity metadata", () => {
  it("every PAGES entry declares an archetype that exists in DIVERSITY_ARCHETYPES", () => {
    for (const page of PAGES) {
      expect(page.archetype, `page ${page.name} missing archetype`).toBeTruthy();
      expect(DIVERSITY_ARCHETYPE_IDS, `page ${page.name} has unknown archetype "${page.archetype}"`).toContain(
        page.archetype,
      );
    }
  });

  it("BASELINE_ARCHETYPE_ID is one of DIVERSITY_ARCHETYPES", () => {
    expect(DIVERSITY_ARCHETYPE_IDS).toContain(BASELINE_ARCHETYPE_ID);
  });

  it("DIVERSITY_ARCHETYPES ids are unique", () => {
    const ids = DIVERSITY_ARCHETYPES.map((a) => a.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe("parseArchetypeArg", () => {
  it("returns undefined when --archetype is not present", () => {
    expect(parseArchetypeArg(["--foo", "bar"])).toBeUndefined();
    expect(parseArchetypeArg([])).toBeUndefined();
  });

  it("returns the value following --archetype", () => {
    expect(parseArchetypeArg(["--archetype", "admin-sidebar"])).toBe("admin-sidebar");
  });

  it("works regardless of flag position", () => {
    expect(parseArchetypeArg(["--other", "x", "--archetype", "landing", "--y"])).toBe("landing");
  });

  it("throws when the value is missing", () => {
    expect(() => parseArchetypeArg(["--archetype"])).toThrow(/requires a value/);
  });

  it("throws when the value looks like another flag", () => {
    expect(() => parseArchetypeArg(["--archetype", "--other"])).toThrow(/requires a value/);
  });

  it("throws on an unknown archetype id", () => {
    expect(() => parseArchetypeArg(["--archetype", "does-not-exist"])).toThrow(/Unknown --archetype/);
  });

  it("validates against a custom id list when provided", () => {
    expect(parseArchetypeArg(["--archetype", "custom-id"], ["custom-id"])).toBe("custom-id");
    expect(() => parseArchetypeArg(["--archetype", "landing"], ["custom-id"])).toThrow(/Unknown --archetype/);
  });
});

describe("scoreDiversity", () => {
  const page = { name: "rules", archetype: "docs-prose" };

  it("is neutral with no reasons when no skeleton was detected (dry run)", () => {
    const result = scoreDiversity(page, null);
    expect(result).toEqual({ page: "rules", expected: "docs-prose", detected: null, score: 0, verdict: "neutral", reasons: [] });
  });

  it("scores a bonus when the detected skeleton matches the declared archetype", () => {
    const result = scoreDiversity(page, "docs-prose");
    expect(result.score).toBe(1);
    expect(result.verdict).toBe("bonus");
    expect(result.reasons).toHaveLength(1);
    expect(result.reasons[0]).toMatch(/matches-declared-archetype/);
  });

  it("scores a penalty when the detected skeleton diverges from the declared archetype", () => {
    const result = scoreDiversity(page, "catalog-grid");
    expect(result.score).toBe(-1);
    expect(result.verdict).toBe("penalty");
    expect(result.reasons[0]).toMatch(/diverges-from-declared-archetype/);
  });

  it("penalizes unexpected convergence with the baseline archetype", () => {
    // "rules" is declared docs-prose, but the vision model detected the
    // baseline admin-sidebar skeleton — this should never happen unless the
    // page has quietly grown a sidebar clone of the admin template.
    const result = scoreDiversity(page, BASELINE_ARCHETYPE_ID);
    expect(result.verdict).toBe("penalty");
    // Two independent problems: converges with baseline AND diverges from
    // its own declared archetype — both should be flagged and summed.
    expect(result.score).toBe(-2);
    expect(result.reasons).toHaveLength(2);
    expect(result.reasons.some((r) => r.startsWith("converges-with-baseline"))).toBe(true);
    expect(result.reasons.some((r) => r.startsWith("diverges-from-declared-archetype"))).toBe(true);
  });

  it("does not penalize the page that legitimately declares the baseline archetype", () => {
    const adminPage = { name: "template-admin", archetype: BASELINE_ARCHETYPE_ID };
    const result = scoreDiversity(adminPage, BASELINE_ARCHETYPE_ID);
    expect(result.score).toBe(1);
    expect(result.verdict).toBe("bonus");
    expect(result.reasons).toHaveLength(1);
  });

  it("penalizes unexpected convergence even with no declared archetype at all", () => {
    const undeclaredPage = { name: "mystery" };
    const result = scoreDiversity(undeclaredPage, BASELINE_ARCHETYPE_ID);
    expect(result.score).toBe(-1);
    expect(result.verdict).toBe("penalty");
    expect(result.reasons).toHaveLength(1);
    expect(result.reasons[0]).toMatch(/converges-with-baseline/);
  });

  it("is neutral when there is no declared archetype and no convergence", () => {
    const undeclaredPage = { name: "mystery" };
    const result = scoreDiversity(undeclaredPage, "landing");
    expect(result.score).toBe(0);
    expect(result.verdict).toBe("neutral");
    expect(result.reasons).toHaveLength(0);
  });

  it("treats an explicit null archetype the same as undeclared (review-bot MR!54 P1)", () => {
    // page.archetype could theoretically be null (not just absent/undefined)
    // if a caller passes a nullable value through — must not be treated as
    // "declared" and must not trigger diverges-from-declared-archetype.
    const nullDeclaredPage = { name: "mystery", archetype: null };
    const result = scoreDiversity(nullDeclaredPage, "landing");
    expect(result.expected).toBeNull();
    expect(result.score).toBe(0);
    expect(result.verdict).toBe("neutral");
    expect(result.reasons).toHaveLength(0);
  });

  it("cliArchetype overrides the page's declared archetype", () => {
    const result = scoreDiversity(page, "shop-grid", { cliArchetype: "shop-grid" });
    expect(result.expected).toBe("shop-grid");
    expect(result.score).toBe(1);
    expect(result.verdict).toBe("bonus");
  });
});

describe("summarizeDiversity", () => {
  it("aggregates totals and buckets pages by verdict", () => {
    const scored = [
      scoreDiversity({ name: "a", archetype: "landing" }, "landing"), // bonus +1
      scoreDiversity({ name: "b", archetype: "docs-prose" }, "catalog-grid"), // penalty -1
      scoreDiversity({ name: "c", archetype: "catalog-grid" }, BASELINE_ARCHETYPE_ID), // penalty -2 (also convergent)
      scoreDiversity({ name: "d" }, "shop-grid"), // neutral 0
    ];

    const summary = summarizeDiversity(scored);
    expect(summary.totalScore).toBe(1 - 1 - 2 + 0);
    expect(summary.scoredPages).toBe(4);
    expect(summary.bonusPages).toEqual(["a"]);
    expect(summary.penaltyPages).toEqual(["b", "c"]);
    expect(summary.convergentPages).toEqual(["c"]);
    expect(summary.signaledPages).toBe(3);
  });

  it("returns zeroed-out summary for an empty run", () => {
    const summary = summarizeDiversity([]);
    expect(summary).toEqual({
      totalScore: 0,
      scoredPages: 0,
      signaledPages: 0,
      bonusPages: [],
      penaltyPages: [],
      convergentPages: [],
    });
  });
});
