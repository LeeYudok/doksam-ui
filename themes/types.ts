/**
 * 테마 프리셋 타입 정의.
 *
 * 새 프리셋을 추가하려면:
 *   1. themes/<name>.ts 에 ThemePreset 객체를 정의 (OKLCH 컬러만 사용, sidebar 축 포함)
 *   2. themes/index.ts 의 THEME_PRESETS 배열에 등록
 *   3. app/globals.css 에 [data-theme="<name>"] / [data-theme="<name>"].dark 블록 동기화
 *      (themes/*.ts 가 단일 진실원천 — CSS 는 동일 값을 손으로 미러링한다)
 *
 * 그러면 테마 스위처와 사이트 전체에 자동으로 반영된다.
 */
import type { SidebarTokens } from "../lib/sidebar-tokens.ts";

/** shadcn 시맨틱 토큰 세트 (라이트 또는 다크 한 쪽) — 값은 전부 OKLCH 문자열. */
export interface ThemeTokens {
  background: string;
  foreground: string;
  card: string;
  "card-foreground": string;
  popover: string;
  "popover-foreground": string;
  primary: string;
  "primary-foreground": string;
  secondary: string;
  "secondary-foreground": string;
  muted: string;
  "muted-foreground": string;
  accent: string;
  "accent-foreground": string;
  destructive: string;
  success: string;
  warning: string;
  /** 한국식 등락 색 — 이익/상승(빨강). 시세 등락률·수급 표시 등 금융 도메인 전용. */
  gain: string;
  /** 한국식 등락 색 — 손실/하락(파랑). 시세 등락률·수급 표시 등 금융 도메인 전용. */
  loss: string;
  border: string;
  input: string;
  ring: string;
  "chart-1": string;
  "chart-2": string;
  "chart-3": string;
  "chart-4": string;
  "chart-5": string;
  /**
   * 브랜드 확장 토큰(opt-in). 필수 27키(THEME_TOKEN_KEYS)에는 포함되지
   * 않으며, 표준 preset은 정의하지 않는다 — 정의한 프리셋에 한해 CSS
   * 변수(--bulb 등)로 방출된다. 특정 브랜드의 시그니처 표면 전용이며
   * (예: brain의 전구 앰버 포인트·잉크 셸), 표준 컴포넌트/primitive는
   * 이 토큰에 의존하지 않는다.
   */
  /** → --bulb */
  bulb?: string;
  /** → --shell */
  shell?: string;
  /** → --shell-foreground */
  shellForeground?: string;
  /** → --shell-muted */
  shellMuted?: string;
}

/** 테마 프리셋 하나 = 메타데이터 + 라이트/다크 토큰 쌍. */
export interface ThemePreset {
  /** 레지스트리 키 겸 data-theme 속성 값 (예: "ocean"). */
  name: string;
  /** 스위처 UI 에 노출할 표시명 (예: "Ocean"). */
  label: string;
  /** 스위처 칩의 대표색 dot (OKLCH). */
  swatch: string;
  light: ThemeTokens;
  dark: ThemeTokens;
  /**
   * 사이드바 chrome 토큰 — 프리셋별 명시값 (#112 finding 3).
   *
   * 이전에는 `lib/sidebar-tokens.ts` 의 전역 상수 하나를 모든 프리셋이
   * 공유해서(ocean hue=262 고정) 어떤 프로필을 설치해도 사이드바만 파란
   * chrome 으로 남았다. 런타임에 `primary` 에서 파생시키지 않고 프리셋마다
   * 여기에 명시값을 둔다 — `lib/globals-css-mirror.test.ts` 가 `app/globals.css`
   * 의 `[data-theme="<name>"]` 블록과 이 값이 어긋나지 않는지 잠근다.
   */
  sidebar: { light: SidebarTokens; dark: SidebarTokens };
}

/** ThemeTokens 의 키 목록 — 테스트에서 토큰 완전성 검증에 사용. */
export const THEME_TOKEN_KEYS: (keyof ThemeTokens)[] = [
  "background",
  "foreground",
  "card",
  "card-foreground",
  "popover",
  "popover-foreground",
  "primary",
  "primary-foreground",
  "secondary",
  "secondary-foreground",
  "muted",
  "muted-foreground",
  "accent",
  "accent-foreground",
  "destructive",
  "success",
  "warning",
  "gain",
  "loss",
  "border",
  "input",
  "ring",
  "chart-1",
  "chart-2",
  "chart-3",
  "chart-4",
  "chart-5",
];
