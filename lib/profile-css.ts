import { getCornerPreset } from "@/corners";
import { getFontPreset } from "@/fonts";
import { generateThemeCss } from "@/lib/theme-css";
import { getPersonalityPreset } from "@/personalities";
import type { BrandProfile } from "@/profiles";
import { getThemePreset } from "@/themes";
import { getTypeContrastPreset } from "@/type-contrast";

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
  const corner = getCornerPreset(profile.corner);
  const typeContrast = getTypeContrastPreset(profile.typeContrast);
  if (!theme || !font || !personality || !corner || !typeContrast) return "";

  const comment = `/* 프로필: ${profile.label} (${profile.name}) — ${profile.description} */`;
  const themeCss = generateThemeCss(theme);
  // app/globals.css 의 밀도 토큰 층(#65, #43 에서 3단 + 버튼 연결)과 동일 값 —
  // 소비 프로젝트가 그대로 복사한다. 높이·패딩·폰트를 서로 다른 배율로 움직이는
  // 이유는 globals.css 의 같은 블록 주석에 적혀 있다.
  const densityCss = [
    "/* 밀도(density) 토큰 층 — <html data-density> 가 소비 */",
    "[data-density] {",
    "  --control-h-xs: 1.5rem;",
    "  --control-h-sm: 1.75rem;",
    "  --control-h: 2rem;",
    "  --control-h-lg: 2.25rem;",
    "  --control-px: 0.625rem;",
    "  --control-px-xs: 0.5rem;",
    "  --control-gap: 0.375rem;",
    "  --control-gap-sm: 0.25rem;",
    "  --control-fs: 0.875rem;",
    "  --cell-py: 0.5rem;",
    "  --stack-gap: 1.5rem;",
    "}",
    '[data-density="compact"] {',
    "  --control-h-xs: 1.375rem;",
    "  --control-h-sm: 1.5rem;",
    "  --control-h: 1.75rem;",
    "  --control-h-lg: 2rem;",
    "  --control-px: 0.5rem;",
    "  --control-px-xs: 0.375rem;",
    "  --control-gap: 0.25rem;",
    "  --control-gap-sm: 0.125rem;",
    "  --control-fs: 0.875rem;",
    "  --cell-py: 0.25rem;",
    "  --stack-gap: 1rem;",
    "}",
    '[data-density="spacious"] {',
    "  --control-h-xs: 1.75rem;",
    "  --control-h-sm: 2rem;",
    "  --control-h: 2.25rem;",
    "  --control-h-lg: 2.5rem;",
    "  --control-px: 1rem;",
    "  --control-px-xs: 0.75rem;",
    "  --control-gap: 0.5rem;",
    "  --control-gap-sm: 0.375rem;",
    "  --control-fs: 0.9375rem;",
    "  --cell-py: 0.75rem;",
    "  --stack-gap: 2.25rem;",
    "}",
    '[data-density] [data-slot="input"] {',
    "  height: var(--control-h);",
    "}",
    '[data-density] [data-slot="table-cell"] {',
    "  padding-block: var(--cell-py);",
    "}",
    '[data-density] [data-slot="button"][data-size="default"] {',
    "  height: var(--control-h);",
    "  padding-inline: var(--control-px);",
    "  gap: var(--control-gap);",
    "  font-size: var(--control-fs);",
    "}",
    '[data-density] [data-slot="button"][data-size="lg"] {',
    "  height: var(--control-h-lg);",
    "  padding-inline: var(--control-px);",
    "  gap: var(--control-gap);",
    "  font-size: var(--control-fs);",
    "}",
    '[data-density] [data-slot="button"][data-size="sm"] {',
    "  height: var(--control-h-sm);",
    "  padding-inline: var(--control-px);",
    "  gap: var(--control-gap-sm);",
    "}",
    '[data-density] [data-slot="button"][data-size="xs"] {',
    "  height: var(--control-h-xs);",
    "  padding-inline: var(--control-px-xs);",
    "  gap: var(--control-gap-sm);",
    "}",
    '[data-density] [data-slot="button"][data-size="icon"] {',
    "  width: var(--control-h);",
    "  height: var(--control-h);",
    "}",
    '[data-density] [data-slot="button"][data-size="icon-sm"] {',
    "  width: var(--control-h-sm);",
    "  height: var(--control-h-sm);",
    "}",
    '[data-density] [data-slot="button"][data-size="icon-lg"] {',
    "  width: var(--control-h-lg);",
    "  height: var(--control-h-lg);",
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
  // app/globals.css 의 모서리 계열 층(#43)과 동일 값 — 단일 진실원천은 corners/index.ts.
  // control === surface 인 계열은 --radius 배관이 이미 처리하므로 오버라이드하지 않는다.
  const cornerCss = [
    "/* 모서리(corner) 계열 층 — <html data-corner> 가 소비 */",
    `[data-corner="${corner.name}"] {`,
    `  --radius: ${corner.surface};`,
    ...(corner.control === corner.surface
      ? []
      : [`  --radius-control: ${corner.control};`]),
    "}",
    ...(corner.control === corner.surface
      ? []
      : [
          `[data-corner="${corner.name}"] :is([data-slot="button"], [data-slot="input"], [data-slot="select-trigger"], [data-slot="textarea"], [data-slot="toggle"]) {`,
          "  border-radius: var(--radius-control);",
          "}",
        ]),
  ].join("\n");
  // app/globals.css 의 타입 대비 층(#43)과 동일 값 — 단일 진실원천은 type-contrast/index.ts.
  // 제목에만 --text-* 를 재정의해 본문 비례는 건드리지 않는다.
  const typeContrastCss = [
    "/* 타입 대비(type contrast) 층 — <html data-type-contrast> 가 소비 */",
    `[data-type-contrast="${typeContrast.name}"] {`,
    `  --heading-scale: ${typeContrast.headingScale};`,
    `  --heading-weight: ${typeContrast.headingWeight};`,
    `  --heading-tracking: ${typeContrast.headingTracking};`,
    "}",
    "[data-type-contrast] :is(h1, h2, h3) {",
    "  --text-base: calc(1rem * var(--heading-scale));",
    "  --text-lg: calc(1.125rem * var(--heading-scale));",
    "  --text-xl: calc(1.25rem * var(--heading-scale));",
    "  --text-2xl: calc(1.5rem * var(--heading-scale));",
    "  --text-3xl: calc(1.875rem * var(--heading-scale));",
    "  --text-4xl: calc(2.25rem * var(--heading-scale));",
    "  --text-5xl: calc(3rem * var(--heading-scale));",
    "  font-weight: var(--heading-weight);",
    "  letter-spacing: var(--heading-tracking);",
    "}",
  ].join("\n");
  const htmlAttrs = [
    `data-theme="${profile.theme}"`,
    `data-font="${profile.font}"`,
    `data-corner="${corner.name}"`,
    `data-type-contrast="${typeContrast.name}"`,
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
    cornerCss,
    "",
    typeContrastCss,
    "",
    personalityCss,
    "",
    `<!-- app/layout.tsx 의 <html> 태그에 그대로 지정 -->`,
    htmlTag,
  ].join("\n");
}
