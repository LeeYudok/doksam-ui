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

  if (expected) {
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
 * Aggregate per-page diversity scores into a run-level summary.
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

  return {
    totalScore,
    scoredPages: scored.length,
    signaledPages: withSignal.length,
    bonusPages,
    penaltyPages,
    convergentPages,
  };
}
