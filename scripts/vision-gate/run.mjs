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
import { writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
import { DIVERSITY_ARCHETYPES, PAGES, RUBRIC_CRITERIA } from "./rubric.mjs";
import { parseArchetypeArg, scoreDiversity, summarizeDiversity } from "./diversity.mjs";

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

function buildRubricText(page) {
  const criteriaLines = RUBRIC_CRITERIA.map(
    (c, i) => `${i + 1}. [${c.id}] ${c.label} — ${c.description}`,
  ).join("\n");
  const archetypeLines = DIVERSITY_ARCHETYPES.map((a) => `- ${a.id}: ${a.description}`).join("\n");

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

This skeleton classification feeds a separate "diversity" check — it is not
part of the pass/warn/fail verdict above, so classify honestly even if the
skeleton doesn't match what the page is "supposed" to look like.

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
  },
  required: ["page", "verdict", "issues", "skeleton"],
  additionalProperties: false,
};

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
    };
  }

  const textBlock = response.content.find((b) => b.type === "text");
  if (!textBlock) {
    return {
      page: page.name,
      verdict: "fail",
      issues: [{ criterion: "api", detail: "No text content in vision API response." }],
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

  console.log(`Vision gate — base URL: ${VISION_BASE_URL}`);
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
        results.push({
          page: page.name,
          verdict: "skipped",
          issues: [],
          url,
          consoleErrors,
          dryRun: true,
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

      results.push({ ...graded, url, consoleErrors, diversity });
    } catch (err) {
      console.log(`ERROR: ${err.message}`);
      results.push({
        page: page.name,
        verdict: "fail",
        issues: [{ criterion: "runner", detail: String(err.message || err) }],
      });
    }
  }

  await browser.close();

  // Diversity (issue #92) is informational — it never flips process.exitCode.
  // It's a soft "did the vision gate itself push everything toward the
  // baseline template" signal, meant to be read, not to hard-block a manual
  // gate on a heuristic classification.
  const diversitySummary = summarizeDiversity(results.map((r) => r.diversity).filter(Boolean));

  const summary = {
    baseUrl: VISION_BASE_URL,
    model: MODEL_ID,
    dryRun: DRY_RUN,
    generatedAt: new Date().toISOString(),
    results,
    diversitySummary,
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

  if (failed.length > 0) {
    console.error("\nFAIL — the following pages have vision-gate issues:");
    for (const r of failed) {
      console.error(`  - ${r.page}: ${r.issues.map((i) => i.detail).join("; ")}`);
    }
    process.exitCode = 1;
  }
}

main().catch((err) => {
  console.error("Vision gate crashed:", err);
  process.exitCode = 1;
});
