import type { ThemePreset } from "./types";

/**
 * Gold — 네이비 골드 (bizinfo enterprise 팔레트, hue ~86 골드 / hue ~267 네이비).
 * 라이트는 아이보리 배경에 네이비 텍스트 + 골드 accent, 다크는 딥 네이비 배경에
 * 라이트 골드 accent. 배경/전경/primary/accent 등 베이스 토큰은
 * bizinfo web/app/globals.css [data-preset="enterprise"] 블록의 OKLCH 값을
 * 그대로 가져왔다(변환 불필요). destructive/success/warning/gain/loss 는 다른
 * 프리셋과 동일한 공용 값을 쓰고, chart-2~5 는 골드 hue(86) 기준으로 명도/색상각을
 * 오프셋한 파생 톤이다.
 * OKLCH 값은 이 파일이 단일 진실원천 — app/globals.css 의
 * [data-theme="gold"] 블록은 이 값을 손으로 미러링한다.
 */
export const gold: ThemePreset = {
  name: "gold",
  label: "Gold",
  swatch: "oklch(0.637 0.111 86)",
  light: {
    background: "oklch(0.973 0.005 95)",
    foreground: "oklch(0.27 0.052 267)",
    card: "oklch(1 0 0)",
    "card-foreground": "oklch(0.27 0.052 267)",
    popover: "oklch(1 0 0)",
    "popover-foreground": "oklch(0.27 0.052 267)",
    primary: "oklch(0.637 0.111 86)",
    "primary-foreground": "oklch(0.99 0 0)",
    secondary: "oklch(0.953 0.005 95)",
    "secondary-foreground": "oklch(0.27 0.052 267)",
    muted: "oklch(0.953 0.005 95)",
    "muted-foreground": "oklch(0.503 0.024 82)",
    accent: "oklch(0.94 0.033 86)",
    "accent-foreground": "oklch(0.4 0.078 86)",
    destructive: "oklch(0.58 0.22 27)",
    success: "oklch(0.55 0.15 152)",
    warning: "oklch(0.75 0.16 80)",
    gain: "oklch(0.58 0.22 27)",
    loss: "oklch(0.55 0.2 258)",
    border: "oklch(0.883 0.023 90)",
    input: "oklch(0.883 0.023 90)",
    ring: "oklch(0.637 0.111 86 / 0.45)",
    "chart-1": "oklch(0.551 0.111 86)",
    "chart-2": "oklch(0.447 0.091 230)",
    "chart-3": "oklch(0.369 0.111 14)",
    "chart-4": "oklch(0.487 0.111 158)",
    "chart-5": "oklch(0.416 0.111 302)",
  },
  dark: {
    background: "oklch(0.195 0.033 270)",
    foreground: "oklch(0.939 0.009 100)",
    card: "oklch(0.236 0.044 269)",
    "card-foreground": "oklch(0.939 0.009 100)",
    popover: "oklch(0.236 0.044 269)",
    "popover-foreground": "oklch(0.939 0.009 100)",
    primary: "oklch(0.77 0.112 86)",
    "primary-foreground": "oklch(0.195 0.033 270)",
    secondary: "oklch(0.245 0.033 270)",
    "secondary-foreground": "oklch(0.939 0.009 100)",
    muted: "oklch(0.245 0.033 270)",
    "muted-foreground": "oklch(0.709 0.025 91)",
    accent: "oklch(0.3 0.039 86)",
    "accent-foreground": "oklch(0.87 0.062 86)",
    destructive: "oklch(0.7 0.19 27)",
    success: "oklch(0.72 0.15 152)",
    warning: "oklch(0.8 0.15 80)",
    gain: "oklch(0.7 0.19 27)",
    loss: "oklch(0.72 0.16 254)",
    border: "oklch(0.328 0.053 271)",
    input: "oklch(0.328 0.053 271)",
    ring: "oklch(0.77 0.112 86 / 0.45)",
    "chart-1": "oklch(0.767 0.111 86)",
    "chart-2": "oklch(0.678 0.111 230)",
    "chart-3": "oklch(0.862 0.075 14)",
    "chart-4": "oklch(0.711 0.111 158)",
    "chart-5": "oklch(0.819 0.109 302)",
  },
  sidebar: {
    light: {
      sidebar: "oklch(0.985 0.004 86)",
      "sidebar-foreground": "oklch(0.27 0.052 267)",
      "sidebar-primary": "oklch(0.637 0.111 86)",
      "sidebar-primary-foreground": "oklch(0.99 0 0)",
      "sidebar-accent": "oklch(0.92 0.035 86)",
      "sidebar-accent-foreground": "oklch(0.4 0.078 86)",
      "sidebar-border": "oklch(0.9 0.015 86)",
      "sidebar-ring": "oklch(0.637 0.111 86)",
    },
    dark: {
      sidebar: "oklch(0.236 0.044 269)",
      "sidebar-foreground": "oklch(0.939 0.009 100)",
      "sidebar-primary": "oklch(0.77 0.112 86)",
      "sidebar-primary-foreground": "oklch(0.195 0.033 270)",
      "sidebar-accent": "oklch(0.3 0.039 86)",
      "sidebar-accent-foreground": "oklch(0.87 0.062 86)",
      "sidebar-border": "oklch(0.328 0.053 271)",
      "sidebar-ring": "oklch(0.77 0.112 86)",
    },
  },
};
