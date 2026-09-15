// scripts/vision-gate/rubric.mjs
//
// Page list + per-page expectations for the vision gate (issue #42, C영역).
// Kept small on purpose — every entry here is one screenshot + one Claude
// vision call, so the list is capped around 8-10 pages to bound API cost.

/**
 * Rubric criteria applied to every page (issue #42 spec):
 *  (a) 텍스트 겹침/잘림 없나       - no overlapping or clipped text
 *  (b) 주요 요소(내비·제목·CTA) 보이나 - key elements (nav/title/CTA) visible
 *  (c) 레이아웃 깨짐/요소 이탈 없나   - no broken layout / elements escaping their container
 *  (d) 색/대비 이상 없나           - no color/contrast anomalies
 *  (e) 페이지 의도에 부합하나        - page fulfills its intended purpose
 */
export const RUBRIC_CRITERIA = [
  {
    id: "no_overlap_or_clipping",
    label: "텍스트 겹침/잘림 없음",
    description:
      "No text overlaps other text/elements, and no text is clipped or truncated unexpectedly (ellipsis by design is fine; mid-word cutoff is not).",
  },
  {
    id: "key_elements_visible",
    label: "주요 요소 가시성",
    description:
      "Primary navigation, page title/heading, and any primary call-to-action are visible and legible.",
  },
  {
    id: "layout_integrity",
    label: "레이아웃 무결성",
    description:
      "No broken layout: no elements escaping their container, no obvious misalignment, no overlapping cards/panels.",
  },
  {
    id: "color_contrast",
    label: "색/대비 정상",
    description:
      "No color or contrast anomalies: text is readable against its background, no unstyled/raw HTML flashes, no broken theming.",
  },
  {
    id: "intent_fulfilled",
    label: "페이지 의도 부합",
    description:
      "The page visually fulfills its stated purpose (see the page's `intent` field below).",
  },
];

/**
 * Diversity axis (issue #92, revised issue #37 RC3) — skeleton archetypes the
 * vision model can classify a screenshot into.
 *
 * Derived from `archetypes/index.ts` (LAYOUT_ARCHETYPES, the catalog's single
 * source of truth for the 9 layout archetypes) instead of hardcoding a
 * separate 7-id vocabulary — the old list (landing/catalog-grid/docs-prose/
 * admin-sidebar/brokerage-dashboard/shop-grid/other) didn't correspond to any
 * of the 9 real archetypes, so vision-gate diversity scores couldn't be
 * mapped back onto them. Node 22.18+ type-strips `.ts` on import, same
 * pattern `scripts/gen-llms.mjs` already uses for this exact file.
 *
 * `archetypes/index.ts`'s own `skeleton` field is Korean prose meant for
 * catalog docs. Here we keep the vocabulary (the `name` ids) but write
 * fresh English, structure-only descriptions per archetype — matching the
 * screenshot-classification tone of the previous DIVERSITY_ARCHETYPES — since
 * the vision model must tell these apart from a screenshot alone, using
 * navigation placement and layout shape only, never color or copy.
 */
const { LAYOUT_ARCHETYPES } = await import("../../archetypes/index.ts");

/** English, screenshot-classifiable description per archetype `name`. */
const DIVERSITY_ARCHETYPE_DESCRIPTIONS = {
  "sidebar-app": "Persistent left sidebar listing destinations (drawer on mobile), with a single-column content area to its right topped by a page title. No bottom tab bar.",
  "top-nav-site": "Horizontal top nav bar with sections/content flowing vertically below it down to a footer. No persistent sidebar, no bottom tab bar.",
  "split-pane": "Screen split into two side-by-side panes visible at once: a list on the left and a detail view on the right (2-step list/detail on mobile).",
  "feed-timeline": "A single vertical scrolling stream of chronological items fills the screen, with at most a thin filter bar on top. No sidebar, no card grid, no bottom tab bar.",
  "dashboard-grid": "A 2-4 column grid of metric cards/charts fills the main area below a top filter bar.",
  "wizard-flow": "A single step indicator (stepper) at the top, one step/form shown at a time in a single column, with prev/next buttons at the bottom. No persistent nav menu.",
  "chat-workspace": "A conversation list on the left (drawer on mobile) plus a center message scroller with a fixed input composer pinned to the bottom.",
  "canvas": "An infinite pannable/zoomable canvas fills the center, with a tool palette on the left edge and a properties panel on the right edge. No page-style navigation.",
  "doc-reader": "A document tree on the left, a narrow reading-width column of prose in the center, and a scroll-synced table of contents on the right.",
};

export const DIVERSITY_ARCHETYPES = [
  ...LAYOUT_ARCHETYPES.map((archetype) => ({
    id: archetype.name,
    label: archetype.label,
    description: DIVERSITY_ARCHETYPE_DESCRIPTIONS[archetype.name] ?? archetype.skeleton,
  })),
  {
    id: "other",
    label: "Other",
    description: "None of the above skeletons fit.",
  },
];

/**
 * "기준 템플릿" (issue #92 설계) — 다른 화면의 뼈대가 여기로 수렴하면 감점 대상.
 * `sidebar-app`(옛 admin-sidebar)을 기준으로 삼는다: 이 표준이 가장 먼저 만들어진
 * 템플릿 뼈대이자 다른 doksam 프로젝트가 가장 많이 베끼는 뼈대이기 때문이다.
 */
export const BASELINE_ARCHETYPE_ID = "sidebar-app";

/**
 * Pages to screenshot + grade. Paths are relative to VISION_BASE_URL.
 * Capped at ~10 entries: home, a few top-level sections, template samples,
 * and a couple of components/patterns pages.
 *
 * `archetype` (issue #92, revised #37) declares each page's expected
 * skeleton — the id must be one of DIVERSITY_ARCHETYPES (the 9
 * archetypes/index.ts ids + "other"). Used by diversity.mjs to score whether
 * the detected skeleton matches what this page is supposed to be. Mapped
 * from the actual app layout (app/**\/layout.tsx — CatalogShell = sidebar,
 * root layout only = top nav) and, for templates, from LAYOUT_ARCHETYPES[].
 * templates in archetypes/index.ts (the SSOT for which template belongs to
 * which archetype).
 */
export const PAGES = [
  { path: "/", name: "home", intent: "Landing/overview page introducing the doksam-ui design system.", archetype: "top-nav-site" },
  { path: "/tokens", name: "tokens", intent: "Design token reference (colors, spacing, typography) presented as a browsable catalog.", archetype: "top-nav-site" },
  { path: "/icons", name: "icons", intent: "Icon library browser — grid of icons with search/filter.", archetype: "top-nav-site" },
  { path: "/components", name: "components", intent: "Component catalog listing available UI components.", archetype: "sidebar-app" },
  { path: "/patterns", name: "patterns", intent: "Pattern catalog listing composed UI patterns.", archetype: "sidebar-app" },
  { path: "/rules", name: "rules", intent: "Design/usage rules documentation page.", archetype: "doc-reader" },
  { path: "/profiles", name: "profiles", intent: "Theme/profile picker showing available visual profiles.", archetype: "top-nav-site" },
  { path: "/templates/admin", name: "template-admin", intent: "Full admin dashboard template: sidebar nav, data tables/widgets.", archetype: "sidebar-app" },
  { path: "/templates/brokerage", name: "template-brokerage", intent: "Brokerage/trading template: watchlist, screener, order entry.", archetype: "dashboard-grid" },
  { path: "/templates/shop", name: "template-shop", intent: "E-commerce shop template: product grid, cart affordances.", archetype: "wizard-flow" },
];
