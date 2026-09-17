#!/usr/bin/env node
// scripts/vision-gate/run.mjs
//
// Vision gate (수동/온디맨드, CI 미포함) — issue #42, C영역.
//
// Flow:
//   1. Launch chromium (playwright), screenshot each page in rubric.mjs (full page).
//   2. Send each screenshot to the Claude Vision API with a per-page rubric.
//   3. Aggregate: console report + vision-report.json. Exit 1 if any page fails.
//
// Usage:
//   ANTHROPIC_API_KEY=sk-ant-... pnpm test:vision
//   VISION_BASE_URL=http://localhost:3000 ANTHROPIC_API_KEY=... pnpm test:vision
//
// Without ANTHROPIC_API_KEY, the script still launches chromium, takes
// screenshots, and prints the assembled prompt per page (dry run) — it stops
// before making any API call. This lets the screenshot/prompt-assembly path
// be verified without spending API credits.

import { chromium } from "playwright";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
import { DIVERSITY_ARCHETYPES, PAGES as DEFAULT_PAGES, RUBRIC_CRITERIA } from "./rubric.mjs";
import {
  DISTINCT_RATIO_FAIL_THRESHOLD,
  MODE_SHARE_FAIL_THRESHOLD,
  parseArchetypeArg,
  parsePagesArg,
  scoreDiversity,
  summarizeDiversity,
  validatePages,
} from "./diversity.mjs";
import { COMPONENT_AXES, scoreComponentPage, summarizeComponentRun } from "./component.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const VISION_BASE_URL = process.env.VISION_BASE_URL || "https://ui.doksam.com";
const MODEL_ID = "claude-opus-4-8"; // vision-capable, per claude-api skill default (2026-07 cache)
const OUTPUT_DIR = path.join(__dirname, "__screenshots__");
const REPORT_PATH = path.join(__dirname, "vision-report.json");

const DRY_RUN = !process.env.ANTHROPIC_API_KEY;
// --archetype <name> (issue #92): overrides every page's declared archetype
// for this run — useful when re-checking the whole batch against one
// expected skeleton. Throws (with a clear message) on an unknown id.
const CLI_ARCHETYPE = parseArchetypeArg(process.argv.slice(2));
// --pages <path> (issue #37 RC3): grade a consumer project's own page list
// instead of the catalog's own PAGES — lets doksam-ui's vision gate be
// pointed at, e.g., fruit-market's screens. File must be a JSON array of
// { path, name, intent, archetype? } entries (see validatePages).
const PAGES_ARG = parsePagesArg(process.argv.slice(2));

async function loadPages() {
  if (!PAGES_ARG) return DEFAULT_PAGES;
  const raw = await readFile(path.resolve(process.cwd(), PAGES_ARG), "utf-8");
  const parsed = JSON.parse(raw);
  return validatePages(parsed);
}

function buildRubricText(page) {
  const criteriaLines = RUBRIC_CRITERIA.map(
    (c, i) => `${i + 1}. [${c.id}] ${c.label} — ${c.description}`,
  ).join("\n");
  const archetypeLines = DIVERSITY_ARCHETYPES.map((a) => `- ${a.id}: ${a.description}`).join("\n");
  const componentAxisLines = COMPONENT_AXES.map(
    (axis) =>
      `- ${axis.key} (respond in "${axis.field}"):\n` +
      axis.ids.map((id) => `    - ${id}: ${axis.descriptions[id]}`).join("\n"),
  ).join("\n");

  return `You are a visual QA reviewer for a UI design system screenshot.

Page: ${page.name} (${page.path})
Intent: ${page.intent}

Grade this screenshot against the following rubric. For each criterion, decide
if it passes. Then give an overall verdict:
  - "pass": no criterion has a real, user-visible problem.
  - "warn": minor/cosmetic issues that don't break usability (e.g. slight
    visual imbalance, a debatable contrast choice).
  - "fail": a criterion is clearly violated in a way a user would notice
    (overlapping text, broken layout, missing nav/title, unreadable text).

Rubric:
${criteriaLines}

In addition, classify this screenshot's navigation + layout SKELETON only
(ignore color/content/copy) into exactly one of these archetypes:
${archetypeLines}

SCOPE: if the screenshot shows a template preview embedded in this catalog —
a bordered, labelled frame containing the template itself — classify the
skeleton of THAT TEMPLATE, and ignore the catalog's own documentation chrome
wrapped around it, even where that chrome sits inside the same bordered frame:
the site's top navigation bar, a small "doksam-ui 템플릿" label, an eyebrow
badge plus heading and explanatory paragraph describing the template, and any
dashed "demo controls" panel. If there is no such embedded template preview,
classify the page as a whole. This matters most for archetypes defined by the
ABSENCE of navigation: surrounding catalog chrome is not the template's own
navigation, and explanatory prose about the template is not a second task.

This skeleton classification feeds a separate "diversity" check — it is not
part of the pass/warn/fail verdict above, so classify honestly even if the
skeleton doesn't match what the page is "supposed" to look like.

Also classify these 4 COMPONENT-level visual impressions, judging shape only
(ignore color and copy) — how buttons/inputs/cards/table rows and headings
actually look, not what the page is about:
${componentAxisLines}

These component classifications feed a separate "component diversity" check,
also not part of the pass/warn/fail verdict — classify honestly even if it
doesn't match what the page is "supposed" to look like.

Respond only via the structured output schema — do not add prose outside it.
For "issues", list short, specific, evidence-based findings (empty array if
none). Reference the rubric criterion id in each issue when applicable.`;
}

const RESPONSE_SCHEMA = {
  type: "object",
  properties: {
    page: { type: "string" },
    verdict: { type: "string", enum: ["pass", "warn", "fail"] },
    issues: {
      type: "array",
      items: {
        type: "object",
        properties: {
          criterion: { type: "string" },
          detail: { type: "string" },
        },
        required: ["criterion", "detail"],
        additionalProperties: false,
      },
    },
    skeleton: {
      type: "string",
      enum: DIVERSITY_ARCHETYPES.map((a) => a.id),
      description: "Navigation + layout skeleton archetype this screenshot most closely matches.",
    },
    ...Object.fromEntries(
      COMPONENT_AXES.map((axis) => [
        axis.field,
        {
          type: "string",
          enum: axis.ids,
          description: `Component-level ${axis.key} impression this screenshot most closely matches (shape only, ignore color/copy).`,
        },
      ]),
    ),
  },
  required: ["page", "verdict", "issues", "skeleton", ...COMPONENT_AXES.map((a) => a.field)],
  additionalProperties: false,
};

/** Fallback component-impression fields (all null) for error/refusal/dry-run
 *  responses, where the vision model never actually classified the screenshot. */
const NULL_COMPONENT_FIELDS = Object.fromEntries(COMPONENT_AXES.map((axis) => [axis.field, null]));

async function screenshotPage(browser, page) {
  const context = await browser.newContext({
    viewport: { width: 1280, height: 900 },
  });
  const tab = await context.newPage();
  const url = new URL(page.path, VISION_BASE_URL).toString();

  const consoleErrors = [];
  tab.on("console", (msg) => {
    if (msg.type() === "error") consoleErrors.push(msg.text());
  });

  await tab.goto(url, { waitUntil: "networkidle", timeout: 30_000 });
  // Give client-side rendering/animations a moment to settle.
  await tab.waitForTimeout(500);

  // jpeg + quality keeps image bytes (and vision tokens) down vs. full-res png.
  const buffer = await tab.screenshot({ fullPage: true, type: "jpeg", quality: 60 });

  await context.close();
  return { buffer, url, consoleErrors };
}

async function gradeScreenshot(anthropic, page, buffer) {
  const prompt = buildRubricText(page);
  const base64 = buffer.toString("base64");

  const response = await anthropic.messages.create({
    model: MODEL_ID,
    max_tokens: 1024,
    output_config: {
      effort: "low", // cost-conscious grading pass, not deep reasoning
      format: {
        type: "json_schema",
        schema: RESPONSE_SCHEMA,
      },
    },
    messages: [
      {
        role: "user",
        content: [
          {
            type: "image",
            source: { type: "base64", media_type: "image/jpeg", data: base64 },
          },
          { type: "text", text: prompt },
        ],
      },
    ],
  });

  if (response.stop_reason === "refusal") {
    return {
      page: page.name,
      verdict: "fail",
      issues: [{ criterion: "api", detail: "Vision API refused to grade this screenshot." }],
      skeleton: null,
      ...NULL_COMPONENT_FIELDS,
    };
  }

  const textBlock = response.content.find((b) => b.type === "text");
  if (!textBlock) {
    return {
      page: page.name,
      verdict: "fail",
      issues: [{ criterion: "api", detail: "No text content in vision API response." }],
      skeleton: null,
      ...NULL_COMPONENT_FIELDS,
    };
  }

  try {
    const parsed = JSON.parse(textBlock.text);
    return parsed;
  } catch {
    return {
      page: page.name,
      verdict: "fail",
      issues: [{ criterion: "api", detail: `Could not parse structured output: ${textBlock.text.slice(0, 200)}` }],
      skeleton: null,
      ...NULL_COMPONENT_FIELDS,
    };
  }
}

async function main() {
  if (!DRY_RUN && !process.env.ANTHROPIC_API_KEY) {
    console.error(
      "ANTHROPIC_API_KEY is not set. Set it to run the vision gate for real:\n" +
        "  ANTHROPIC_API_KEY=sk-ant-... pnpm test:vision\n" +
        "Running in dry-run mode instead (screenshots + prompt assembly only, no API calls).",
    );
  }

  const PAGES = await loadPages();

  console.log(`Vision gate — base URL: ${VISION_BASE_URL}`);
  if (PAGES_ARG) console.log(`Pages source: ${PAGES_ARG} (--pages override)`);
  console.log(`Pages: ${PAGES.length}${DRY_RUN ? " (DRY RUN — no ANTHROPIC_API_KEY set)" : ""}\n`);

  await mkdir(OUTPUT_DIR, { recursive: true });

  const browser = await chromium.launch();
  let anthropic = null;
  if (!DRY_RUN) {
    const { default: Anthropic } = await import("@anthropic-ai/sdk");
    anthropic = new Anthropic();
  }

  const results = [];

  for (const page of PAGES) {
    process.stdout.write(`  ${page.name.padEnd(22)} `);
    try {
      const { buffer, url, consoleErrors } = await screenshotPage(browser, page);
      const shotPath = path.join(OUTPUT_DIR, `${page.name}.jpg`);
      await writeFile(shotPath, buffer);

      if (DRY_RUN) {
        const prompt = buildRubricText(page);
        console.log(`screenshot ok (${(buffer.length / 1024).toFixed(0)}KB) -> ${shotPath}`);
        console.log(`    [dry-run] would send to ${MODEL_ID} with prompt:\n` +
          prompt.split("\n").map((l) => `      ${l}`).join("\n") + "\n");
        const dryRunDiversity = scoreDiversity(page, null, { cliArchetype: CLI_ARCHETYPE });
        results.push({
          page: page.name,
          verdict: "skipped",
          issues: [],
          skeleton: null,
          ...NULL_COMPONENT_FIELDS,
          url,
          consoleErrors,
          dryRun: true,
          diversity: dryRunDiversity,
          component: scoreComponentPage(page, {}),
        });
        continue;
      }

      const graded = await gradeScreenshot(anthropic, page, buffer);
      const verdictLabel = { pass: "PASS", warn: "WARN", fail: "FAIL" }[graded.verdict] || "FAIL";
      console.log(`${verdictLabel}${graded.issues?.length ? ` (${graded.issues.length} issue(s))` : ""}`);
      if (consoleErrors.length) {
        console.log(`    console errors: ${consoleErrors.length}`);
      }

      const diversity = scoreDiversity(page, graded.skeleton, { cliArchetype: CLI_ARCHETYPE });
      if (diversity.reasons.length > 0) {
        console.log(`    diversity: ${diversity.verdict} (score ${diversity.score})`);
        for (const reason of diversity.reasons) {
          console.log(`      - ${reason}`);
        }
      }

      const component = scoreComponentPage(page, graded);
      const componentFaults = Object.values(component.axes).filter((a) => a.mismatch);
      if (componentFaults.length > 0) {
        console.log(`    component pipeline fault(s): ${componentFaults.length}`);
      }

      results.push({ ...graded, url, consoleErrors, diversity, component });
    } catch (err) {
      console.log(`ERROR: ${err.message}`);
      results.push({
        page: page.name,
        verdict: "fail",
        issues: [{ criterion: "runner", detail: String(err.message || err) }],
        skeleton: null,
        ...NULL_COMPONENT_FIELDS,
        diversity: scoreDiversity(page, null, { cliArchetype: CLI_ARCHETYPE }),
        component: scoreComponentPage(page, {}),
      });
    }
  }

  await browser.close();

  // Per-page diversity (issue #92) stays informational. Run-level
  // (pairwise/cross-page) convergence (issue #37 RC3) is different: it's the
  // one signal that actually catches "every screenshot came out with the
  // same skeleton" — a per-page score can't, since N pages that each match
  // their own declared archetype all score a per-page bonus even when the
  // whole run is skeleton-identical. So `runConverged` DOES flip
  // process.exitCode below, same as a rubric `fail`.
  const diversitySummary = summarizeDiversity(results.map((r) => r.diversity).filter(Boolean));

  // Component-level (issue #43) run summary — deliberately a SEPARATE object
  // from diversitySummary above. It answers a different question ("do
  // buttons/cards/headings look the same across screens, and does what
  // renders match what each page's declared profile promised") that the
  // skeleton summary structurally cannot answer — a run can vary its page
  // skeletons while every component still renders identically, or vice versa.
  const componentSummary = summarizeComponentRun(results.map((r) => r.component).filter(Boolean));

  const summary = {
    baseUrl: VISION_BASE_URL,
    model: MODEL_ID,
    dryRun: DRY_RUN,
    generatedAt: new Date().toISOString(),
    results,
    diversitySummary,
    componentSummary,
  };
  await writeFile(REPORT_PATH, JSON.stringify(summary, null, 2));

  console.log(`\nReport written to ${REPORT_PATH}`);

  if (DRY_RUN) {
    console.log("Dry run complete (no verdicts). Set ANTHROPIC_API_KEY to grade for real.");
    return;
  }

  const failed = results.filter((r) => r.verdict === "fail");
  const warned = results.filter((r) => r.verdict === "warn");
  console.log(`\nSummary: ${results.length - failed.length - warned.length} pass, ${warned.length} warn, ${failed.length} fail`);
  console.log(
    `Diversity: total score ${diversitySummary.totalScore} ` +
      `(${diversitySummary.bonusPages.length} bonus, ${diversitySummary.penaltyPages.length} penalty)` +
      (diversitySummary.convergentPages.length
        ? ` — converges with baseline: ${diversitySummary.convergentPages.join(", ")}`
        : ""),
  );
  console.log(
    `Diversity (run-level): ${diversitySummary.distinctSkeletons} distinct skeleton(s) across ` +
      `${results.length} page(s) (distinctRatio ${diversitySummary.distinctRatio.toFixed(2)}), ` +
      `mode "${diversitySummary.modeSkeleton}" at ${(diversitySummary.modeShare * 100).toFixed(0)}% share` +
      (diversitySummary.runConverged ? " — CONVERGED" : ""),
  );

  if (failed.length > 0) {
    console.error("\nFAIL — the following pages have vision-gate issues:");
    for (const r of failed) {
      console.error(`  - ${r.page}: ${r.issues.map((i) => i.detail).join("; ")}`);
    }
    process.exitCode = 1;
  }

  if (diversitySummary.runConverged) {
    console.error(
      `\nFAIL — run-level skeleton convergence: mode "${diversitySummary.modeSkeleton}" ` +
        `covers ${(diversitySummary.modeShare * 100).toFixed(0)}% of pages ` +
        `(threshold ${(MODE_SHARE_FAIL_THRESHOLD * 100).toFixed(0)}%) or distinctRatio ` +
        `${diversitySummary.distinctRatio.toFixed(2)} is below ${DISTINCT_RATIO_FAIL_THRESHOLD.toFixed(2)} — ` +
        "screens are converging onto the same skeleton regardless of what each page declared.",
    );
    process.exitCode = 1;
  }

  console.log("\nComponent axes (run-level, issue #43):");
  for (const [key, axis] of Object.entries(componentSummary.axes)) {
    console.log(
      `  ${axis.label} (${key}): ${axis.distinctValues} distinct value(s) across ${axis.sampledPages} page(s) ` +
        `(distinctRatio ${axis.distinctRatio.toFixed(2)}), mode "${axis.modeValue}" at ` +
        `${(axis.modeShare * 100).toFixed(0)}% share${axis.converged ? " — CONVERGED" : ""}`,
    );
  }

  if (componentSummary.runConverged) {
    const convergedAxes = Object.entries(componentSummary.axes)
      .filter(([, a]) => a.converged)
      .map(([key]) => key);
    console.error(
      `\nFAIL — run-level component convergence on: ${convergedAxes.join(", ")} — ` +
        "every screen renders the same button/card/heading impression on this axis regardless of skeleton diversity.",
    );
    process.exitCode = 1;
  }

  if (componentSummary.pipelineFaults.length > 0) {
    console.error(
      `\nFAIL — component pipeline fidelity: ${componentSummary.pipelineFaults.length} page(s) render a different ` +
        "impression than their declared profile promises (the axis was declared but never reached the render):",
    );
    for (const fault of componentSummary.pipelineFaults) {
      console.error(
        `  - ${fault.page} (profile "${fault.profile}"): ${fault.axis} expected "${fault.expected}", detected "${fault.detected}"`,
      );
    }
    process.exitCode = 1;
  }
}

main().catch((err) => {
  console.error("Vision gate crashed:", err);
  process.exitCode = 1;
});
