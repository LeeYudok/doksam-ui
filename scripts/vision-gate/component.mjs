// scripts/vision-gate/component.mjs
//
// Component-level visual expression axis (issue #43) — pure scoring, no
// Anthropic SDK / Playwright import here, same split as diversity.mjs.
//
// Why this exists: the diversity axis added in #92/#37 RC3 (diversity.mjs)
// only classifies a screenshot's page-level SKELETON (nav placement — sidebar
// vs top-nav vs split-pane, etc). It cannot tell "the skeletons differ but
// every button/card in every project still looks identical" — the exact
// complaint that reopened #43: consuming projects diverge at the page-shell
// level but still render visually-uniform *components* (same button height,
// same corner radius, same flat cards, same heading weight) because #43's
// new axes (corners/index.ts, type-contrast/index.ts, profiles/index.ts
// ProfileDensity) can be declared by a profile without ever being checked
// against what actually renders.
//
// Four screenshot-classifiable component impressions, one per new/underused
// axis:
//   - density  -> ProfileDensity (profiles/index.ts): compact/comfortable/spacious
//   - corner   -> CORNER_PRESETS (corners/index.ts): sharp/soft/rounded/pill
//   - surface  -> PERSONALITY_PRESETS.surface (personalities/index.ts),
//                 collapsed to a screenshot-classifiable binary: flat/elevated
//   - contrast -> TYPE_CONTRAST_PRESETS (type-contrast/index.ts): flat/moderate/dramatic
//
// Vocabulary + expected values are derived from those registries (same
// principle as rubric.mjs deriving DIVERSITY_ARCHETYPES from
// archetypes/index.ts instead of hand-rolling a parallel list that can drift)
// via the same "Node 22.18+ type-strips .ts on import" mechanism
// scripts/gen-llms.mjs and rubric.mjs already rely on.
//
// Two independent things get scored per run:
//   1. Convergence (same shape as diversity.mjs's run-level skeleton check,
//      applied per axis): do all screenshots collapse onto the same density/
//      corner/surface/contrast impression regardless of what each page
//      declares? This is orthogonal to skeleton convergence — a run can vary
//      its page skeletons while every component still looks the same, and
//      that's exactly the bug this axis exists to catch.
//   2. Pipeline fidelity: for pages that declare an expected `profile` (a
//      profiles/index.ts BRAND_PROFILES name), does the *detected* impression
//      match what that profile *declares*? A mismatch here is not a diversity
//      problem (the profile did pick a distinct value) — it's a plumbing
//      failure: the axis was declared but never reached the render. Reported
//      as `pipelineFaults`, never folded into the convergence counts.

const { CORNER_PRESETS } = await import("../../corners/index.ts");
const { TYPE_CONTRAST_PRESETS } = await import("../../type-contrast/index.ts");
const { BRAND_PROFILES, getBrandProfile } = await import("../../profiles/index.ts");
const { getPersonalityPreset } = await import("../../personalities/index.ts");

/** Density vocabulary — ProfileDensity is a type (erased at runtime), so the
 *  id list is the fixed 3-value order and a test asserts it exactly matches
 *  the set of `density` values actually used across BRAND_PROFILES. */
export const CONTROL_DENSITY_IDS = ["compact", "comfortable", "spacious"];

/** Corner vocabulary — derived directly from corners/index.ts. */
export const CORNER_IMPRESSION_IDS = CORNER_PRESETS.map((c) => c.name);

/** Type-contrast vocabulary — derived directly from type-contrast/index.ts. */
export const TYPE_CONTRAST_IMPRESSION_IDS = TYPE_CONTRAST_PRESETS.map((t) => t.name);

/**
 * Surface vocabulary is binary (screenshot-classifiable: flat vs floating),
 * but personalities/index.ts's PersonalitySurface has 3 values (border/
 * shadow/flat) because "border" is a real distinct CSS treatment. Visually
 * from a screenshot alone, a bordered-but-shadowless card reads as flush
 * with the page (no lift cue), same as a fully flat card — only "shadow"
 * reads as floating. So border+flat collapse to "flat", shadow -> "elevated".
 */
export const SURFACE_IMPRESSION_IDS = ["flat", "elevated"];

const SURFACE_ID_BY_PERSONALITY_SURFACE = {
  border: "flat",
  flat: "flat",
  shadow: "elevated",
};

/** English, screenshot-classifiable description per control-density id. */
export const CONTROL_DENSITY_DESCRIPTIONS = {
  compact:
    "Buttons, inputs and table rows are short with thin vertical padding, packed tightly with little gap between them.",
  comfortable:
    "Buttons, inputs and table rows have medium height and moderate gaps — a middle ground, neither packed nor sparse.",
  spacious:
    "Buttons, inputs and table rows are tall with generous vertical padding and wide gaps between them.",
};

/** English, screenshot-classifiable description per corner-impression id. */
export const CORNER_IMPRESSION_DESCRIPTIONS = {
  sharp:
    "Buttons, inputs and cards have square, sharp corners with virtually no visible curvature.",
  soft:
    "Buttons, inputs and cards have a faint, barely-perceptible corner curvature — not square, not clearly rounded.",
  rounded:
    "Buttons, inputs and cards have an obviously rounded, generous corner curvature.",
  pill:
    "Buttons and inputs are fully rounded into a capsule/pill shape with semicircular ends, while cards keep a more moderate rounded corner.",
};

/** English, screenshot-classifiable description per surface-impression id. */
export const SURFACE_IMPRESSION_DESCRIPTIONS = {
  flat:
    "Cards and panels sit flush against the page background with no visible drop shadow or lift separating them.",
  elevated:
    "Cards and panels appear lifted off the page background, with a visible drop shadow or halo separating them from what's behind.",
};

/** English, screenshot-classifiable description per type-contrast-impression id. */
export const TYPE_CONTRAST_IMPRESSION_DESCRIPTIONS = {
  flat:
    "Headings are only marginally larger or bolder than body text; the page reads as visually uniform in scale.",
  moderate:
    "Headings are clearly larger and bolder than body text, establishing a visible but not extreme hierarchy.",
  dramatic:
    "Headings are dramatically larger and bolder than body text, dominating the layout like a magazine cover line.",
};

/**
 * The 4 component axes, table-driven so scoring/summarizing/prompt-building
 * don't hand-roll 4 near-identical copies. `field` is the key the vision
 * model's structured response uses for this axis (see run.mjs RESPONSE_SCHEMA).
 * `expectedFromProfile` derives what a declared BRAND_PROFILES entry implies
 * for this axis — used only for pipeline-fidelity checks (a page opts in by
 * declaring `profile` in rubric.mjs's PAGES).
 */
export const COMPONENT_AXES = [
  {
    key: "density",
    label: "컨트롤 밀도 인상",
    field: "controlDensity",
    ids: CONTROL_DENSITY_IDS,
    descriptions: CONTROL_DENSITY_DESCRIPTIONS,
    expectedFromProfile: (profile) => profile.density,
  },
  {
    key: "corner",
    label: "모서리 계열",
    field: "cornerImpression",
    ids: CORNER_IMPRESSION_IDS,
    descriptions: CORNER_IMPRESSION_DESCRIPTIONS,
    expectedFromProfile: (profile) => profile.corner,
  },
  {
    key: "surface",
    label: "표면",
    field: "surfaceImpression",
    ids: SURFACE_IMPRESSION_IDS,
    descriptions: SURFACE_IMPRESSION_DESCRIPTIONS,
    expectedFromProfile: (profile) => {
      const personality = getPersonalityPreset(profile.personality);
      if (!personality) return undefined;
      return SURFACE_ID_BY_PERSONALITY_SURFACE[personality.surface];
    },
  },
  {
    key: "contrast",
    label: "제목-본문 대비",
    field: "typeContrastImpression",
    ids: TYPE_CONTRAST_IMPRESSION_IDS,
    descriptions: TYPE_CONTRAST_IMPRESSION_DESCRIPTIONS,
    expectedFromProfile: (profile) => profile.typeContrast,
  },
];

/** Run-level convergence thresholds — same benchmark diversity.mjs uses for
 *  skeleton convergence (see its doc comment for the rationale), applied
 *  here independently per component axis instead of to the page skeleton. */
export const COMPONENT_MODE_SHARE_FAIL_THRESHOLD = 0.5;
export const COMPONENT_DISTINCT_RATIO_FAIL_THRESHOLD = 1 / 3;
export const MIN_SAMPLES_FOR_COMPONENT_CONVERGENCE_CHECK = 2;

/**
 * Score one page's component impressions against its declared profile (if
 * any). `page.profile`, when present, must reference a profiles/index.ts
 * BRAND_PROFILES name (rubric.mjs's PAGES opts in per page — undeclared
 * pages are scored for convergence only, no pipeline-fidelity check, same
 * opt-in principle the registries themselves use).
 *
 * @param {{ name: string, profile?: string }} page
 * @param {Record<string, string|null|undefined>} detected keyed by each
 *   COMPONENT_AXES[].field, e.g. { controlDensity, cornerImpression,
 *   surfaceImpression, typeContrastImpression }
 * @returns {{
 *   page: string,
 *   profile: string|undefined,
 *   axes: Record<string, { expected: string|undefined, detected: string|null|undefined, mismatch: boolean }>,
 * }}
 */
export function scoreComponentPage(page, detected = {}) {
  const profile = page.profile ? getBrandProfile(page.profile) : undefined;
  const axes = {};

  for (const axis of COMPONENT_AXES) {
    const detectedValue = detected[axis.field] ?? null;
    const expected = profile ? axis.expectedFromProfile(profile) : undefined;
    const mismatch =
      expected !== undefined && detectedValue != null && detectedValue !== expected;
    axes[axis.key] = { expected, detected: detectedValue, mismatch };
  }

  return { page: page.name, profile: page.profile, axes };
}

/**
 * Aggregate per-page component scores into a run-level summary: per-axis
 * convergence metrics (independent of the skeleton/diversity summary) plus
 * the pipeline-fidelity fault list (declared-vs-rendered mismatches).
 *
 * @param {ReturnType<typeof scoreComponentPage>[]} scored
 */
export function summarizeComponentRun(scored) {
  const axesSummary = {};

  for (const axis of COMPONENT_AXES) {
    const detected = scored
      .map((s) => s.axes[axis.key]?.detected)
      .filter((d) => d != null);

    const counts = new Map();
    for (const value of detected) counts.set(value, (counts.get(value) ?? 0) + 1);

    const distinctValues = counts.size;
    const distinctRatio = detected.length > 0 ? distinctValues / detected.length : 1;

    let modeValue = null;
    let modeCount = 0;
    for (const [value, count] of counts) {
      if (count > modeCount) {
        modeValue = value;
        modeCount = count;
      }
    }
    const modeShare = detected.length > 0 ? modeCount / detected.length : 0;

    const converged =
      detected.length >= MIN_SAMPLES_FOR_COMPONENT_CONVERGENCE_CHECK &&
      (modeShare > COMPONENT_MODE_SHARE_FAIL_THRESHOLD ||
        distinctRatio < COMPONENT_DISTINCT_RATIO_FAIL_THRESHOLD);

    axesSummary[axis.key] = {
      label: axis.label,
      sampledPages: detected.length,
      distinctValues,
      distinctRatio,
      modeValue,
      modeShare,
      converged,
    };
  }

  // Pipeline fidelity — declared-vs-rendered mismatches, independent of
  // convergence. A page can converge with everyone else AND still match its
  // own declared profile (not a plumbing bug), or it can be the only page
  // with this shape yet still mismatch its own declaration (a plumbing bug
  // even though the run overall isn't converged). The two signals must not
  // be merged into one number.
  const pipelineFaults = [];
  for (const page of scored) {
    for (const axis of COMPONENT_AXES) {
      const result = page.axes[axis.key];
      if (result?.mismatch) {
        pipelineFaults.push({
          page: page.page,
          profile: page.profile,
          axis: axis.key,
          expected: result.expected,
          detected: result.detected,
        });
      }
    }
  }

  const runConverged = Object.values(axesSummary).some((a) => a.converged);

  return { axes: axesSummary, pipelineFaults, runConverged, scoredPages: scored.length };
}

/** Sanity check used by tests/run.mjs to make sure BRAND_PROFILES still uses
 *  exactly the density vocabulary CONTROL_DENSITY_IDS assumes. */
export function densityIdsMatchProfiles(profiles = BRAND_PROFILES) {
  const used = new Set(profiles.map((p) => p.density));
  return [...used].every((d) => CONTROL_DENSITY_IDS.includes(d));
}
