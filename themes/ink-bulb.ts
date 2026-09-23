import type { ThemePreset } from "./types";

/**
 * Ink & Bulb — brain(busan/brain, 한국어 지식저장고)의 검증된 브랜드 정체성을
 * 표준 preset으로 편입한 것(doksam-ui#16 Phase A). 잔잔한 잉크 표면 위에
 * 오션 청록(primary) 하나와 전구 앰버(--bulb, 확장 토큰) 시그니처 하나만 쓴다.
 *
 * 27키 값은 brain `web/app/globals.css`(:root / [data-dark]) 원본을 그대로
 * 옮겼다. brain에 없던 키는 다음 규칙으로 채웠다:
 *   - destructive/success/warning/gain/loss — 표준 전 프리셋 공통 상수(브랜드 무관, 7프리셋 전부 동일 값).
 *   - chart-1~5 — ink&bulb 팔레트에서 파생: chart-1=primary(청록), chart-2=--bulb(앰버),
 *     chart-3=brain --cat-research(인디고), chart-4/5=인접 청록·블루 톤으로 dataviz 구분성 확보.
 *   - input — brain globals.css에 --input 정의가 없어 다른 표준 프리셋과 동일하게 border 값 재사용.
 *
 * 확장 필드 bulb/shell/shellForeground/shellMuted는 brain --bulb/--shell*
 * 원본 값 그대로. OKLCH 값은 이 파일이 단일 진실원천 — app/globals.css 의
 * [data-theme="ink-bulb"] 블록은 이 값을 손으로 미러링한다.
 */
export const inkBulb: ThemePreset = {
  name: "ink-bulb",
  label: "Ink & Bulb",
  swatch: "oklch(0.72 0.13 75)",
  light: {
    background: "oklch(0.975 0.003 250)",
    foreground: "oklch(0.24 0.015 250)",
    card: "oklch(1 0 0)",
    "card-foreground": "oklch(0.24 0.015 250)",
    popover: "oklch(1 0 0)",
    "popover-foreground": "oklch(0.24 0.015 250)",
    primary: "oklch(0.5 0.11 155)",
    "primary-foreground": "oklch(0.985 0.002 250)",
    secondary: "oklch(0.945 0.005 250)",
    "secondary-foreground": "oklch(0.24 0.015 250)",
    muted: "oklch(0.945 0.005 250)",
    "muted-foreground": "oklch(0.53 0.02 252)",
    accent: "oklch(0.93 0.008 250)",
    "accent-foreground": "oklch(0.24 0.015 250)",
    destructive: "oklch(0.58 0.22 27)",
    success: "oklch(0.55 0.15 152)",
    warning: "oklch(0.75 0.16 80)",
    gain: "oklch(0.58 0.22 27)",
    loss: "oklch(0.55 0.2 258)",
    border: "oklch(0.91 0.008 250)",
    input: "oklch(0.91 0.008 250)",
    ring: "oklch(0.5 0.11 155)",
    "chart-1": "oklch(0.5 0.11 155)",
    "chart-2": "oklch(0.72 0.13 75)",
    "chart-3": "oklch(0.55 0.2 277)",
    "chart-4": "oklch(0.6 0.12 200)",
    "chart-5": "oklch(0.62 0.14 230)",
    bulb: "oklch(0.72 0.13 75)",
    shell: "oklch(0.21 0.02 255)",
    shellForeground: "oklch(0.93 0.008 250)",
    shellMuted: "oklch(0.68 0.02 252)",
  },
  dark: {
    background: "oklch(0.19 0.02 255)",
    foreground: "oklch(0.93 0.008 250)",
    card: "oklch(0.23 0.02 255)",
    "card-foreground": "oklch(0.93 0.008 250)",
    popover: "oklch(0.23 0.02 255)",
    "popover-foreground": "oklch(0.93 0.008 250)",
    primary: "oklch(0.75 0.11 155)",
    "primary-foreground": "oklch(0.19 0.02 255)",
    secondary: "oklch(0.27 0.02 255)",
    "secondary-foreground": "oklch(0.93 0.008 250)",
    muted: "oklch(0.27 0.02 255)",
    "muted-foreground": "oklch(0.7 0.015 252)",
    accent: "oklch(0.29 0.02 255)",
    "accent-foreground": "oklch(0.93 0.008 250)",
    destructive: "oklch(0.7 0.19 27)",
    success: "oklch(0.72 0.15 152)",
    warning: "oklch(0.8 0.15 80)",
    gain: "oklch(0.7 0.19 27)",
    loss: "oklch(0.72 0.16 254)",
    border: "oklch(0.31 0.02 255)",
    input: "oklch(0.31 0.02 255)",
    ring: "oklch(0.75 0.11 155)",
    "chart-1": "oklch(0.75 0.11 155)",
    "chart-2": "oklch(0.82 0.13 80)",
    "chart-3": "oklch(0.7 0.18 277)",
    "chart-4": "oklch(0.72 0.12 200)",
    "chart-5": "oklch(0.74 0.14 230)",
    bulb: "oklch(0.82 0.13 80)",
    shell: "oklch(0.165 0.018 255)",
    shellForeground: "oklch(0.93 0.008 250)",
    shellMuted: "oklch(0.66 0.02 252)",
  },
  sidebar: {
    light: {
      sidebar: "oklch(0.985 0.004 155)",
      "sidebar-foreground": "oklch(0.24 0.015 250)",
      "sidebar-primary": "oklch(0.5 0.11 155)",
      "sidebar-primary-foreground": "oklch(0.985 0.002 250)",
      "sidebar-accent": "oklch(0.92 0.035 155)",
      "sidebar-accent-foreground": "oklch(0.24 0.015 250)",
      "sidebar-border": "oklch(0.9 0.015 155)",
      "sidebar-ring": "oklch(0.5 0.11 155)",
    },
    dark: {
      sidebar: "oklch(0.23 0.02 255)",
      "sidebar-foreground": "oklch(0.93 0.008 250)",
      "sidebar-primary": "oklch(0.75 0.11 155)",
      "sidebar-primary-foreground": "oklch(0.19 0.02 255)",
      "sidebar-accent": "oklch(0.29 0.02 255)",
      "sidebar-accent-foreground": "oklch(0.93 0.008 250)",
      "sidebar-border": "oklch(0.31 0.02 255)",
      "sidebar-ring": "oklch(0.75 0.11 155)",
    },
  },
};
