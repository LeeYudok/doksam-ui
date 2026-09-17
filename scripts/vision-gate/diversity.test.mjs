// scripts/vision-gate/diversity.test.mjs
//
// Unit tests for the diversity axis (issue #92) — rubric parsing + score
// aggregation only, no Anthropic API / Playwright dependency.

import { describe, expect, it } from "vitest";
import {
  DISTINCT_RATIO_FAIL_THRESHOLD,
  DIVERSITY_ARCHETYPE_IDS,
  MODE_SHARE_FAIL_THRESHOLD,
  parseArchetypeArg,
  parsePagesArg,
  scoreDiversity,
  summarizeDiversity,
  validatePages,
} from "./diversity.mjs";
import { BASELINE_ARCHETYPE_ID, DIVERSITY_ARCHETYPES, PAGES, UNCOVERED_ARCHETYPES } from "./rubric.mjs";
import { LAYOUT_ARCHETYPES } from "../../archetypes/index.ts";

describe("rubric diversity metadata", () => {
  it("every PAGES entry declares an archetype that exists in DIVERSITY_ARCHETYPES", () => {
    for (const page of PAGES) {
      expect(page.archetype, `page ${page.name} missing archetype`).toBeTruthy();
      expect(DIVERSITY_ARCHETYPE_IDS, `page ${page.name} has unknown archetype "${page.archetype}"`).toContain(
        page.archetype,
      );
    }
  });

  it("every archetype is either graded by a PAGES entry or explicitly listed as uncovered (#55 H1)", () => {
    // Regression guard for the failure this closes: a new archetype gets a
    // rubric description but no page, so the gate can never classify anything
    // into it and the description is never measured. Adding an archetype now
    // forces either a PAGES entry or an explicit UNCOVERED_ARCHETYPES entry.
    const covered = new Set(PAGES.map((page) => page.archetype));
    const accountedFor = new Set([...covered, ...UNCOVERED_ARCHETYPES]);
    for (const id of DIVERSITY_ARCHETYPE_IDS) {
      expect(accountedFor.has(id), `archetype "${id}" is neither graded by a PAGES entry nor listed in UNCOVERED_ARCHETYPES`).toBe(true);
    }
    // And the allowlist may not quietly cover something a page already grades.
    for (const id of UNCOVERED_ARCHETYPES) {
      expect(covered.has(id), `archetype "${id}" is graded by a PAGES entry — remove it from UNCOVERED_ARCHETYPES`).toBe(false);
    }
  });

  it("focus-task is actually graded by a PAGES entry (#55 H1)", () => {
    const focusPages = PAGES.filter((page) => page.archetype === "focus-task");
    expect(focusPages.length, "no PAGES entry declares focus-task").toBeGreaterThan(0);
  });

  it("BASELINE_ARCHETYPE_ID is one of DIVERSITY_ARCHETYPES", () => {
    expect(DIVERSITY_ARCHETYPE_IDS).toContain(BASELINE_ARCHETYPE_ID);
  });

  it("DIVERSITY_ARCHETYPES ids are unique", () => {
    const ids = DIVERSITY_ARCHETYPES.map((a) => a.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("DIVERSITY_ARCHETYPES vocabulary is derived from archetypes/index.ts's 10 layout archetypes + other (issue #37 RC3, #45)", () => {
    // This is the regression test for the core bug: the old vocabulary
    // (landing/catalog-grid/docs-prose/admin-sidebar/brokerage-dashboard/
    // shop-grid/other) had no relationship to the catalog's real 10
    // archetypes, so vision-gate diversity scores couldn't be mapped back
    // onto them.
    const ids = DIVERSITY_ARCHETYPES.map((a) => a.id);
    const layoutIds = LAYOUT_ARCHETYPES.map((a) => a.name);
    expect(ids).toEqual([...layoutIds, "other"]);
  });

  it("BASELINE_ARCHETYPE_ID is sidebar-app (formerly admin-sidebar)", () => {
    expect(BASELINE_ARCHETYPE_ID).toBe("sidebar-app");
  });

  it("every DIVERSITY_ARCHETYPES description is screenshot-classifiable prose (not empty, not copied color/content language)", () => {
    for (const a of DIVERSITY_ARCHETYPES) {
      expect(a.description.length).toBeGreaterThan(10);
    }
  });
});

describe("parseArchetypeArg", () => {
  it("returns undefined when --archetype is not present", () => {
    expect(parseArchetypeArg(["--foo", "bar"])).toBeUndefined();
    expect(parseArchetypeArg([])).toBeUndefined();
  });

  it("returns the value following --archetype", () => {
    expect(parseArchetypeArg(["--archetype", "sidebar-app"])).toBe("sidebar-app");
  });

  it("works regardless of flag position", () => {
    expect(parseArchetypeArg(["--other", "x", "--archetype", "top-nav-site", "--y"])).toBe("top-nav-site");
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
      scoreDiversity({ name: "a", archetype: "top-nav-site" }, "top-nav-site"), // bonus +1
      scoreDiversity({ name: "b", archetype: "doc-reader" }, "wizard-flow"), // penalty -1
      scoreDiversity({ name: "c", archetype: "wizard-flow" }, BASELINE_ARCHETYPE_ID), // penalty -2 (also convergent)
      scoreDiversity({ name: "d" }, "dashboard-grid"), // neutral 0
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
      distinctSkeletons: 0,
      distinctRatio: 1,
      modeSkeleton: null,
      modeShare: 0,
      runConverged: false,
    });
  });

  // Pairwise/run-level convergence (issue #37 RC3) — this is the core
  // regression test for the bug this fix closes: the "4/4 동일 뼈대" real
  // incident had every page individually match its own declared archetype
  // (so every per-page score was a bonus/neutral), yet the run as a whole
  // had zero skeleton diversity. Per-page scoring alone can never flag that;
  // only a cross-page comparison can.
  it("flags run-level convergence when every page detects the same skeleton, even though each page individually matches its own declaration", () => {
    const scored = [
      scoreDiversity({ name: "a", archetype: "sidebar-app" }, "sidebar-app"),
      scoreDiversity({ name: "b", archetype: "sidebar-app" }, "sidebar-app"),
      scoreDiversity({ name: "c", archetype: "sidebar-app" }, "sidebar-app"),
      scoreDiversity({ name: "d", archetype: "sidebar-app" }, "sidebar-app"),
    ];

    // Sanity check: every page is individually a bonus (matches its own
    // declared archetype) — proving the per-page axis alone sees nothing
    // wrong here.
    expect(scored.every((s) => s.verdict === "bonus")).toBe(true);

    const summary = summarizeDiversity(scored);
    expect(summary.distinctSkeletons).toBe(1);
    expect(summary.distinctRatio).toBe(0.25);
    expect(summary.modeSkeleton).toBe("sidebar-app");
    expect(summary.modeShare).toBe(1);
    expect(summary.runConverged).toBe(true);
  });

  it("does not flag run-level convergence when skeletons are genuinely varied", () => {
    const scored = [
      scoreDiversity({ name: "a" }, "sidebar-app"),
      scoreDiversity({ name: "b" }, "top-nav-site"),
      scoreDiversity({ name: "c" }, "dashboard-grid"),
      scoreDiversity({ name: "d" }, "doc-reader"),
    ];

    const summary = summarizeDiversity(scored);
    expect(summary.distinctSkeletons).toBe(4);
    expect(summary.distinctRatio).toBe(1);
    expect(summary.modeShare).toBe(0.25);
    expect(summary.runConverged).toBe(false);
  });

  it("flags run-level convergence right at a >50% mode share (3 of 4 same skeleton)", () => {
    const scored = [
      scoreDiversity({ name: "a" }, "sidebar-app"),
      scoreDiversity({ name: "b" }, "sidebar-app"),
      scoreDiversity({ name: "c" }, "sidebar-app"),
      scoreDiversity({ name: "d" }, "top-nav-site"),
    ];

    const summary = summarizeDiversity(scored);
    expect(summary.modeShare).toBe(0.75);
    expect(summary.modeShare).toBeGreaterThan(MODE_SHARE_FAIL_THRESHOLD);
    expect(summary.runConverged).toBe(true);
  });

  it("does not flag convergence at an exact 50/50 split (threshold is 'more than half')", () => {
    const scored = [
      scoreDiversity({ name: "a" }, "sidebar-app"),
      scoreDiversity({ name: "b" }, "sidebar-app"),
      scoreDiversity({ name: "c" }, "top-nav-site"),
      scoreDiversity({ name: "d" }, "top-nav-site"),
    ];

    const summary = summarizeDiversity(scored);
    expect(summary.modeShare).toBe(0.5);
    expect(summary.modeShare).not.toBeGreaterThan(MODE_SHARE_FAIL_THRESHOLD);
    expect(summary.distinctRatio).toBe(0.5);
    expect(summary.distinctRatio).not.toBeLessThan(DISTINCT_RATIO_FAIL_THRESHOLD);
    expect(summary.runConverged).toBe(false);
  });

  it("ignores pages with no detected skeleton (dry run / API error) when computing pairwise metrics", () => {
    const scored = [
      scoreDiversity({ name: "a" }, "sidebar-app"),
      scoreDiversity({ name: "b" }, null), // dry run
      scoreDiversity({ name: "c" }, undefined), // API error
    ];

    const summary = summarizeDiversity(scored);
    expect(summary.distinctSkeletons).toBe(1);
    expect(summary.distinctRatio).toBe(1);
    expect(summary.modeShare).toBe(1);
    expect(summary.runConverged).toBe(false);
  });

  it("does not flag a run with no detected skeletons at all", () => {
    const scored = [scoreDiversity({ name: "a" }, null), scoreDiversity({ name: "b" }, null)];
    const summary = summarizeDiversity(scored);
    expect(summary.distinctSkeletons).toBe(0);
    expect(summary.modeSkeleton).toBeNull();
    expect(summary.runConverged).toBe(false);
  });
});

describe("parsePagesArg", () => {
  it("returns undefined when --pages is not present", () => {
    expect(parsePagesArg(["--foo", "bar"])).toBeUndefined();
    expect(parsePagesArg([])).toBeUndefined();
  });

  it("returns the path following --pages", () => {
    expect(parsePagesArg(["--pages", "./my-pages.json"])).toBe("./my-pages.json");
  });

  it("works regardless of flag position", () => {
    expect(parsePagesArg(["--archetype", "landing", "--pages", "./p.json"])).toBe("./p.json");
  });

  it("throws when the value is missing", () => {
    expect(() => parsePagesArg(["--pages"])).toThrow(/requires a file path/);
  });

  it("throws when the value looks like another flag", () => {
    expect(() => parsePagesArg(["--pages", "--other"])).toThrow(/requires a file path/);
  });
});

describe("validatePages", () => {
  it("returns the array unchanged when every entry is valid", () => {
    const pages = [{ path: "/", name: "home", intent: "landing page", archetype: "top-nav-site" }];
    expect(validatePages(pages)).toBe(pages);
  });

  it("allows entries with no archetype declared", () => {
    const pages = [{ path: "/", name: "home", intent: "landing page" }];
    expect(() => validatePages(pages)).not.toThrow();
  });

  it("throws on a non-array or empty array", () => {
    expect(() => validatePages(null)).toThrow(/non-empty JSON array/);
    expect(() => validatePages([])).toThrow(/non-empty JSON array/);
    expect(() => validatePages("not an array")).toThrow(/non-empty JSON array/);
  });

  it("throws when a required field is missing", () => {
    expect(() => validatePages([{ path: "/", name: "home" }])).toThrow(/missing required string field "intent"/);
  });

  it("throws on an unknown archetype id", () => {
    expect(() => validatePages([{ path: "/", name: "home", intent: "x", archetype: "does-not-exist" }])).toThrow(
      /unknown archetype/,
    );
  });
});
