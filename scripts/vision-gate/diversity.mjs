// scripts/vision-gate/diversity.mjs
//
// Diversity axis (issue #92) — pure scoring + CLI parsing, no Anthropic SDK
// or Playwright import here on purpose: run.mjs supplies the detected
// skeleton (from the Claude vision response) and this module turns it into
// a score. Kept dependency-free so it's unit-testable without an API key.
//
// Rubric (issue #92 설계):
//   - 대상 화면의 뼈대가 기준 템플릿(admin 등)과 동일하면 감점
//     (표준 준수만 채점하면 채점 자체가 수렴을 강화하므로, 부당한 수렴을 잡는다).
//   - 선언된 원형(rubric.mjs의 PAGES[].archetype, 또는 --archetype 오버라이드)과
//     실제 뼈대가 일치하면 가점.
//   - 둘 다 동시에 해당할 수 있다(예: 선언과도 다르고 기준 템플릿에도 수렴한
//     경우) — 서로 다른 문제이므로 감점을 합산한다.

import { BASELINE_ARCHETYPE_ID, DIVERSITY_ARCHETYPES } from "./rubric.mjs";

export const DIVERSITY_ARCHETYPE_IDS = DIVERSITY_ARCHETYPES.map((a) => a.id);

/**
 * Parse a `--archetype <name>` flag out of an argv-style array (e.g.
 * `process.argv.slice(2)`). Pure — no process access — so it's testable
 * with plain arrays.
 *
 * @param {string[]} argv
 * @param {string[]} [validIds] known archetype ids to validate against
 * @returns {string|undefined}
 */
export function parseArchetypeArg(argv, validIds = DIVERSITY_ARCHETYPE_IDS) {
  const flagIndex = argv.indexOf("--archetype");
  if (flagIndex === -1) return undefined;

  const value = argv[flagIndex + 1];
  if (!value || value.startsWith("--")) {
    throw new Error("--archetype requires a value, e.g. --archetype admin-sidebar");
  }
  if (!validIds.includes(value)) {
    throw new Error(
      `Unknown --archetype "${value}". Known archetypes: ${validIds.join(", ")}`,
    );
  }
  return value;
}

/**
 * Parse a `--pages <path>` flag out of an argv-style array (issue #37 RC3).
 * Only extracts the flag value — actual file reading/JSON.parse stays in
 * run.mjs (I/O), keeping this module dependency-free/pure like
 * parseArchetypeArg above.
 *
 * @param {string[]} argv
 * @returns {string|undefined} the path following --pages, or undefined if
 *   the flag isn't present (callers fall back to rubric.mjs's PAGES).
 */
export function parsePagesArg(argv) {
  const flagIndex = argv.indexOf("--pages");
  if (flagIndex === -1) return undefined;

  const value = argv[flagIndex + 1];
  if (!value || value.startsWith("--")) {
    throw new Error("--pages requires a file path, e.g. --pages ./my-pages.json");
  }
  return value;
}

/**
 * Validate a loaded pages array (issue #37 RC3) — used after JSON-parsing a
 * `--pages` file so a malformed/consumer-project page list fails fast with a
 * clear error instead of silently grading garbage.
 *
 * @param {unknown} pages
 * @param {string[]} [validArchetypeIds]
 * @returns {{ path: string, name: string, intent: string, archetype?: string }[]}
 */
export function validatePages(pages, validArchetypeIds = DIVERSITY_ARCHETYPE_IDS) {
  if (!Array.isArray(pages) || pages.length === 0) {
    throw new Error("--pages file must contain a non-empty JSON array of page entries");
  }
  for (const [i, page] of pages.entries()) {
    if (!page || typeof page !== "object") {
      throw new Error(`--pages entry ${i} is not an object`);
    }
    for (const field of ["path", "name", "intent"]) {
      if (typeof page[field] !== "string" || !page[field]) {
        throw new Error(`--pages entry ${i} is missing required string field "${field}"`);
      }
    }
    if (page.archetype != null && !validArchetypeIds.includes(page.archetype)) {
      throw new Error(
        `--pages entry ${i} ("${page.name}") has unknown archetype "${page.archetype}". ` +
          `Known archetypes: ${validArchetypeIds.join(", ")}`,
      );
    }
  }
  return pages;
}

/**
 * Score one page's diversity axis.
 *
 * @param {{ name: string, archetype?: string }} page rubric.mjs PAGES entry
 * @param {string|undefined|null} detectedSkeleton the `skeleton` field the
 *   vision model returned for this page's screenshot (one of
 *   DIVERSITY_ARCHETYPE_IDS), or null/undefined if unavailable (dry run).
 * @param {{ cliArchetype?: string, baselineId?: string }} [opts]
 * @returns {{
 *   page: string,
 *   expected: string|undefined,
 *   detected: string|null|undefined,
 *   score: number,
 *   verdict: "bonus"|"neutral"|"penalty",
 *   reasons: string[],
 * }}
 */
export function scoreDiversity(page, detectedSkeleton, opts = {}) {
  const { cliArchetype, baselineId = BASELINE_ARCHETYPE_ID } = opts;
  const expected = cliArchetype ?? page.archetype;
  const reasons = [];
  let score = 0;

  if (!detectedSkeleton) {
    return { page: page.name, expected, detected: detectedSkeleton ?? null, score: 0, verdict: "neutral", reasons };
  }

  if (detectedSkeleton === baselineId && expected !== baselineId) {
    score -= 1;
    reasons.push(
      `converges-with-baseline: detected skeleton "${detectedSkeleton}" matches the baseline archetype ` +
        `("${baselineId}") even though this page is not declared as that archetype`,
    );
  }

  if (expected !== undefined && expected !== null) {
    if (detectedSkeleton === expected) {
      score += 1;
      reasons.push(`matches-declared-archetype: detected skeleton matches the declared archetype "${expected}"`);
    } else {
      score -= 1;
      reasons.push(`diverges-from-declared-archetype: expected "${expected}", detected "${detectedSkeleton}"`);
    }
  }

  const verdict = score > 0 ? "bonus" : score < 0 ? "penalty" : "neutral";
  return { page: page.name, expected, detected: detectedSkeleton, score, verdict, reasons };
}

/**
 * Run-level (pairwise/cross-page) convergence thresholds (issue #37 RC3).
 *
 * The per-page score above (scoreDiversity) only ever compares one page
 * against its own declaration + the baseline id — it never compares pages to
 * *each other*. That structurally can't catch "every screen came out with
 * the same skeleton" as long as each page's declared archetype happens to
 * match what was detected (e.g. 4 pages all declared+detected as
 * "sidebar-app" each score a per-page bonus, while the run as a whole has
 * zero skeleton diversity — this is exactly what happened in the "4/4 동일
 * 뼈대" real-world case this fix is closing).
 *
 * - MODE_SHARE_FAIL_THRESHOLD: if one archetype accounts for more than half
 *   of all scored screenshots in a run, that's a majority skeleton — treat
 *   it as convergence regardless of what each page individually declared.
 *   0.5 is chosen as "more than half" is the smallest threshold that can't
 *   also be true of two different archetypes simultaneously (avoids a
 *   double-fail on runs that are genuinely split 50/50 between two shapes).
 * - DISTINCT_RATIO_FAIL_THRESHOLD: if fewer than a third of the archetypes
 *   present are distinct relative to the number of screenshots, the run is
 *   skeleton-poor even without one single dominant mode (e.g. many pages,
 *   only 2 distinct skeletons among them). 1/3 is intentionally looser than
 *   the mode-share check — it's a secondary signal, not the primary gate.
 */
export const MODE_SHARE_FAIL_THRESHOLD = 0.5;
export const DISTINCT_RATIO_FAIL_THRESHOLD = 1 / 3;

/**
 * With fewer than this many detected screenshots, any mode share is
 * trivially 100% (n=1) or coarse (n=2), so convergence would be a false
 * positive from sample size alone rather than a real signal. 2 is the
 * minimum needed for "the same skeleton twice" to even be meaningful.
 */
export const MIN_SAMPLES_FOR_CONVERGENCE_CHECK = 2;

/**
 * Aggregate per-page diversity scores into a run-level summary, including
 * pairwise/run-level convergence metrics (issue #37 RC3) computed from the
 * *detected* skeletons across all scored pages — independent of what each
 * page declared.
 *
 * @param {ReturnType<typeof scoreDiversity>[]} scored
 */
export function summarizeDiversity(scored) {
  const withSignal = scored.filter((s) => s.reasons.length > 0);
  const totalScore = scored.reduce((sum, s) => sum + s.score, 0);
  const bonusPages = scored.filter((s) => s.verdict === "bonus").map((s) => s.page);
  const penaltyPages = scored.filter((s) => s.verdict === "penalty").map((s) => s.page);
  const convergentPages = scored
    .filter((s) => s.reasons.some((r) => r.startsWith("converges-with-baseline")))
    .map((s) => s.page);

  // Pairwise run-level metrics — only count pages with an actual detected
  // skeleton (skip null/undefined, e.g. dry-run or API-error pages).
  const detected = scored.map((s) => s.detected).filter((d) => d != null);
  const counts = new Map();
  for (const id of detected) counts.set(id, (counts.get(id) ?? 0) + 1);

  const distinctSkeletons = counts.size;
  const distinctRatio = detected.length > 0 ? distinctSkeletons / detected.length : 1;

  let modeSkeleton = null;
  let modeCount = 0;
  for (const [id, count] of counts) {
    if (count > modeCount) {
      modeSkeleton = id;
      modeCount = count;
    }
  }
  const modeShare = detected.length > 0 ? modeCount / detected.length : 0;

  const runConverged =
    detected.length >= MIN_SAMPLES_FOR_CONVERGENCE_CHECK &&
    (modeShare > MODE_SHARE_FAIL_THRESHOLD || distinctRatio < DISTINCT_RATIO_FAIL_THRESHOLD);

  return {
    totalScore,
    scoredPages: scored.length,
    signaledPages: withSignal.length,
    bonusPages,
    penaltyPages,
    convergentPages,
    // Run-level (pairwise) skeleton-diversity metrics (issue #37 RC3).
    distinctSkeletons,
    distinctRatio,
    modeSkeleton,
    modeShare,
    runConverged,
  };
}
