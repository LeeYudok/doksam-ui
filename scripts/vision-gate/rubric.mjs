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
 * Diversity axis (issue #92) — skeleton archetypes the vision model can
 * classify a screenshot into. Kept small and mutually distinguishable by
 * navigation + layout shape only (not color/content), since that's what a
 * screenshot-level "same skeleton as the baseline template" judgment needs.
 */
export const DIVERSITY_ARCHETYPES = [
  {
    id: "landing",
    label: "랜딩/개요",
    description: "Hero-led marketing/overview page with minimal persistent chrome — no sidebar, no dense data grid.",
  },
  {
    id: "catalog-grid",
    label: "카탈로그 그리드",
    description: "Top nav + a browsable grid/list of items with search/filter (no persistent left sidebar).",
  },
  {
    id: "docs-prose",
    label: "문서/설명",
    description: "Top nav + long-form written content (headings + paragraphs), not a grid or dashboard.",
  },
  {
    id: "admin-sidebar",
    label: "관리자 사이드바",
    description: "Persistent left sidebar navigation + a main content area with tables/widgets — classic admin dashboard skeleton.",
  },
  {
    id: "brokerage-dashboard",
    label: "브로커리지 대시보드",
    description: "Dense multi-panel trading layout: watchlist + chart + order-entry panels visible together.",
  },
  {
    id: "shop-grid",
    label: "쇼핑 그리드",
    description: "Product grid/list with cart affordances (price, add-to-cart), storefront-style top nav.",
  },
  {
    id: "other",
    label: "기타",
    description: "None of the above skeletons fit.",
  },
];

/**
 * "기준 템플릿" (issue #92 설계) — 다른 화면의 뼈대가 여기로 수렴하면 감점 대상.
 * admin 템플릿을 기준으로 삼는다: 이 표준이 가장 먼저 만들어진 템플릿이자
 * 다른 doksam 프로젝트가 가장 많이 베끼는 뼈대이기 때문이다.
 */
export const BASELINE_ARCHETYPE_ID = "admin-sidebar";

/**
 * Pages to screenshot + grade. Paths are relative to VISION_BASE_URL.
 * Capped at ~10 entries: home, a few top-level sections, template samples,
 * and a couple of components/patterns pages.
 *
 * `archetype` (issue #92) declares each page's expected skeleton — the id
 * must be one of DIVERSITY_ARCHETYPES. Used by diversity.mjs to score
 * whether the detected skeleton matches what this page is supposed to be.
 */
export const PAGES = [
  { path: "/", name: "home", intent: "Landing/overview page introducing the doksam-ui design system.", archetype: "landing" },
  { path: "/tokens", name: "tokens", intent: "Design token reference (colors, spacing, typography) presented as a browsable catalog.", archetype: "catalog-grid" },
  { path: "/icons", name: "icons", intent: "Icon library browser — grid of icons with search/filter.", archetype: "catalog-grid" },
  { path: "/components", name: "components", intent: "Component catalog listing available UI components.", archetype: "catalog-grid" },
  { path: "/patterns", name: "patterns", intent: "Pattern catalog listing composed UI patterns.", archetype: "catalog-grid" },
  { path: "/rules", name: "rules", intent: "Design/usage rules documentation page.", archetype: "docs-prose" },
  { path: "/profiles", name: "profiles", intent: "Theme/profile picker showing available visual profiles.", archetype: "catalog-grid" },
  { path: "/templates/admin", name: "template-admin", intent: "Full admin dashboard template: sidebar nav, data tables/widgets.", archetype: "admin-sidebar" },
  { path: "/templates/brokerage", name: "template-brokerage", intent: "Brokerage/trading template: watchlist, screener, order entry.", archetype: "brokerage-dashboard" },
  { path: "/templates/shop", name: "template-shop", intent: "E-commerce shop template: product grid, cart affordances.", archetype: "shop-grid" },
];
