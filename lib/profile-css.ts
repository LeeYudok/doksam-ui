import { getFontPreset } from "@/fonts";
import { generateThemeCss } from "@/lib/theme-css";
import { getPersonalityPreset } from "@/personalities";
import type { BrandProfile } from "@/profiles";
import { getThemePreset } from "@/themes";

/**
 * 프로필 하나를 소비 프로젝트에 그대로 적용할 수 있는 코드 블록으로 직렬화한다.
 * lib/theme-css.ts(generateThemeCss)가 만드는 프리셋 CSS 변수 블록에 프로필
 * 선언 주석과 <html data-theme data-font> 지정 스니펫을 덧붙인다.
 * theme/font 참조가 레지스트리에 없으면(레지스트리 불일치) 빈 문자열을 반환한다.
 */
export function generateProfileCode(profile: BrandProfile): string {
  const theme = getThemePreset(profile.theme);
  const font = getFontPreset(profile.font);
  const personality = getPersonalityPreset(profile.personality);
  if (!theme || !font || !personality) return "";

  const comment = `/* 프로필: ${profile.label} (${profile.name}) — ${profile.description} */`;
  const themeCss = generateThemeCss(theme);
  // app/globals.css 의 밀도 토큰 층(#65)과 동일 값 — 소비 프로젝트가 그대로 복사한다.
  const densityCss = [
    "/* 밀도(density) 토큰 층 — <html data-density> 가 소비 */",
    "[data-density] {",
    "  --control-h: 2rem;",
    "  --cell-py: 0.5rem;",
    "  --stack-gap: 1.5rem;",
    "}",
    '[data-density="compact"] {',
    "  --control-h: 1.75rem;",
    "  --cell-py: 0.25rem;",
    "  --stack-gap: 1rem;",
    "}",
    '[data-density] [data-slot="input"] {',
    "  height: var(--control-h);",
    "}",
    '[data-density] [data-slot="table-cell"] {',
    "  padding-block: var(--cell-py);",
    "}",
  ].join("\n");
  // app/globals.css 의 personality 토큰 층(#90)과 동일 값 — 소비 프로젝트가 그대로 복사한다.
  const personalityCss = [
    "/* 시각 성격(personality) 토큰 층 — <html data-personality data-personality-surface",
    "   data-personality-motion> 이 소비 */",
    "[data-personality] { --personality-scale: 1; }",
    '[data-personality="compact"] { --personality-scale: 0.9375; }',
    '[data-personality="bold"] { --personality-scale: 1.0625; }',
    "html[data-personality] { font-size: calc(1rem * var(--personality-scale)); }",
    "[data-personality]:not(html) { zoom: var(--personality-scale); }",
    '[data-personality="bold"] :is(h1, h2, h3) { font-weight: 600; }',
    '[data-personality-surface="shadow"] [data-slot="card"] {',
    "  box-shadow:",
    "    0 1px 2px color-mix(in oklch, var(--foreground) 8%, transparent),",
    "    0 2px 6px color-mix(in oklch, var(--foreground) 10%, transparent);",
    "}",
    '[data-personality-surface="flat"] [data-slot="card"] { box-shadow: none; }',
    '[data-personality-motion="none"] *, [data-personality-motion="none"] *::before, [data-personality-motion="none"] *::after {',
    "  transition-duration: 0.01ms !important;",
    "  animation-duration: 0.01ms !important;",
    "  animation-iteration-count: 1 !important;",
    "  scroll-behavior: auto !important;",
    "}",
    '[data-personality-motion="expressive"] * { transition-duration: 300ms; }',
  ].join("\n");
  const htmlAttrs = [
    `data-theme="${profile.theme}"`,
    `data-font="${profile.font}"`,
    `data-density="${profile.density}"`,
    `data-personality="${personality.scale}"`,
    `data-personality-surface="${personality.surface}"`,
    `data-personality-motion="${personality.motion}"`,
    `style="--radius: ${profile.radius}"`,
  ];
  const htmlTag =
    profile.defaultMode === "dark"
      ? `<html ${htmlAttrs.join(" ")} class="dark">`
      : `<html ${htmlAttrs.join(" ")}>`;

  return [
    comment,
    themeCss,
    "",
    densityCss,
    "",
    personalityCss,
    "",
    `<!-- app/layout.tsx 의 <html> 태그에 그대로 지정 -->`,
    htmlTag,
  ].join("\n");
}
