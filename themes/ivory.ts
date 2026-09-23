import type { ThemePreset } from "./types";

/**
 * Ivory — 금융기관 업무 화면용 아이보리·네이비·골드 팔레트 (#91).
 * 라이트는 아이보리 종이톤 배경(hue ~95)에 네이비 잉크 primary(hue ~267) +
 * 골드 accent(hue ~86), 다크는 딥 네이비 배경에 페일 네이비 primary + 라이트 골드.
 *
 * 값의 실측 원천은 사내 여신 조기경보(EWS) 프로토타입의 시맨틱 토큰이며, 특정
 * 서비스가 아니라 사내 금융기관 업무 시스템에서 반복되는 톤이라 일반 프리셋으로
 * 올렸다. 원본이 hex 라 OKLCH 로 변환해 옮겼다:
 *   --bg → background, --panel → card/popover, --ink → foreground,
 *   --navy → primary, --muted(텍스트 색) → muted-foreground, --line → border/input,
 *   --accent(골드) → ring · chart-2, --safe/--watch/--danger → success/warning/destructive.
 *
 * 원본에 없거나 shadcn 의미와 어긋나 같은 팔레트에서 파생한 토큰:
 *   - secondary: 원본 --navy-soft(네이비 5% 알파)를 배경 위에 합성한 불투명 값.
 *   - muted(표면): 원본 --muted 는 텍스트 색이라 표면용으로 --line 과 배경을 섞어 만들었다.
 *   - accent: shadcn 의 accent 는 hover 표면이라 골드 원색 대신 골드 틴트를 쓴다
 *     (gold 프리셋과 같은 방식). 골드 원색은 ring 과 chart-2 가 나른다.
 *   - warning(라이트): 원본 --watch 원색은 아이보리 위 대비가 4.45:1 이라 명도만
 *     0.557→0.54 로 낮춰 4.5:1 을 넘겼다.
 *   - gain/loss: 한국식 등락(상승=빨강, 하락=파랑). gain 은 --danger, loss 는 같은 톤
 *     다운 계열의 블루(hue 258).
 *   - chart-1~5: 원본은 shadcn 기본 무채색이라 네이비·골드·슬레이트 블루·테라코타·그린으로 구성.
 *
 * OKLCH 값은 이 파일이 단일 진실원천 — app/globals.css 의
 * [data-theme="ivory"] 블록은 이 값을 손으로 미러링한다.
 */
export const ivory: ThemePreset = {
  name: "ivory",
  label: "Ivory",
  swatch: "oklch(0.27 0.052 267)",
  light: {
    background: "oklch(0.973 0.005 95)",
    foreground: "oklch(0.27 0.052 267)",
    card: "oklch(1 0 0)",
    "card-foreground": "oklch(0.27 0.052 267)",
    popover: "oklch(1 0 0)",
    "popover-foreground": "oklch(0.27 0.052 267)",
    primary: "oklch(0.27 0.052 267)",
    "primary-foreground": "oklch(1 0 0)",
    secondary: "oklch(0.929 0.002 101)",
    "secondary-foreground": "oklch(0.27 0.052 267)",
    muted: "oklch(0.932 0.013 91)",
    "muted-foreground": "oklch(0.503 0.024 82)",
    accent: "oklch(0.94 0.033 86)",
    "accent-foreground": "oklch(0.27 0.052 267)",
    destructive: "oklch(0.496 0.141 28)",
    success: "oklch(0.485 0.081 160)",
    warning: "oklch(0.54 0.114 72)",
    gain: "oklch(0.496 0.141 28)",
    loss: "oklch(0.48 0.13 258)",
    border: "oklch(0.883 0.023 90)",
    input: "oklch(0.883 0.023 90)",
    ring: "oklch(0.637 0.111 86)",
    "chart-1": "oklch(0.27 0.052 267)",
    "chart-2": "oklch(0.637 0.111 86)",
    "chart-3": "oklch(0.5 0.07 267)",
    "chart-4": "oklch(0.58 0.1 40)",
    "chart-5": "oklch(0.6 0.07 160)",
  },
  dark: {
    background: "oklch(0.195 0.033 270)",
    foreground: "oklch(0.939 0.009 100)",
    card: "oklch(0.236 0.044 269)",
    "card-foreground": "oklch(0.939 0.009 100)",
    popover: "oklch(0.236 0.044 269)",
    "popover-foreground": "oklch(0.939 0.009 100)",
    primary: "oklch(0.92 0.024 273)",
    "primary-foreground": "oklch(0.195 0.033 270)",
    secondary: "oklch(0.283 0.031 271)",
    "secondary-foreground": "oklch(0.939 0.009 100)",
    muted: "oklch(0.27 0.044 271)",
    "muted-foreground": "oklch(0.709 0.025 91)",
    accent: "oklch(0.3 0.039 86)",
    "accent-foreground": "oklch(0.939 0.009 100)",
    destructive: "oklch(0.679 0.133 28)",
    success: "oklch(0.689 0.098 161)",
    warning: "oklch(0.731 0.129 73)",
    gain: "oklch(0.679 0.133 28)",
    loss: "oklch(0.72 0.11 258)",
    border: "oklch(0.328 0.053 271)",
    input: "oklch(0.328 0.053 271)",
    ring: "oklch(0.77 0.112 86)",
    "chart-1": "oklch(0.82 0.05 270)",
    "chart-2": "oklch(0.77 0.112 86)",
    "chart-3": "oklch(0.62 0.08 267)",
    "chart-4": "oklch(0.7 0.1 40)",
    "chart-5": "oklch(0.689 0.098 161)",
  },
  sidebar: {
    light: {
      sidebar: "oklch(0.985 0.004 267)",
      "sidebar-foreground": "oklch(0.27 0.052 267)",
      "sidebar-primary": "oklch(0.27 0.052 267)",
      "sidebar-primary-foreground": "oklch(1 0 0)",
      "sidebar-accent": "oklch(0.92 0.035 267)",
      "sidebar-accent-foreground": "oklch(0.27 0.052 267)",
      "sidebar-border": "oklch(0.9 0.015 267)",
      "sidebar-ring": "oklch(0.27 0.052 267)",
    },
    dark: {
      sidebar: "oklch(0.236 0.044 269)",
      "sidebar-foreground": "oklch(0.939 0.009 100)",
      "sidebar-primary": "oklch(0.92 0.024 273)",
      "sidebar-primary-foreground": "oklch(0.195 0.033 270)",
      "sidebar-accent": "oklch(0.3 0.039 86)",
      "sidebar-accent-foreground": "oklch(0.939 0.009 100)",
      "sidebar-border": "oklch(0.328 0.053 271)",
      "sidebar-ring": "oklch(0.92 0.024 273)",
    },
  },
};
