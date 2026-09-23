/**
 * 사이드바 전용 시맨틱 토큰 — `SidebarTokens` 타입과 키 목록의 단일 진실원천 (#36).
 *
 * (#112 finding 3 이전) 사이드바 chrome 값 자체(hue 포함)는 선택된 테마
 * 프리셋과 무관하게 이 파일의 `SIDEBAR_TOKENS` 전역 상수 하나(ocean hue=262
 * 고정)를 모든 프리셋이 공유했다 — 어떤 `profile-*` 를 설치해도 사이드바만
 * 파란 chrome 으로 남는 회귀였다. 지금은 프리셋마다 다른 사이드바 값을 갖고
 * (`ThemePreset.sidebar`, `themes/<name>.ts` 가 단일 진실원천), 아래
 * `SIDEBAR_TOKENS` 는 **ocean 프리셋의 값**이자 `app/globals.css` 의
 * `:root`/`.dark`(테마 미확정 시 FOUC 방지 폴백) 사이드바 블록의 단일
 * 진실원천으로만 남는다 — 값을 고치면 `app/globals.css` 와
 * `themes/ocean.ts` 의 `sidebar` 필드도 같이 갱신한다.
 *
 * `scripts/registry/sync-profile-vars.ts` 가 `ThemePreset.sidebar` 를
 * `registry.json` 의 `profile-*` 항목 `cssVars` 에 합성한다(#36/#112) —
 * profile-* 를 설치한 소비 프로젝트도 사이드바 컴포넌트가 회색 기본값 대신
 * 해당 테마의 값을 받는다.
 */
export interface SidebarTokens {
  sidebar: string;
  "sidebar-foreground": string;
  "sidebar-primary": string;
  "sidebar-primary-foreground": string;
  "sidebar-accent": string;
  "sidebar-accent-foreground": string;
  "sidebar-border": string;
  "sidebar-ring": string;
}

/** SidebarTokens 의 키 목록 — 테스트에서 토큰 완전성 검증에 사용. */
export const SIDEBAR_TOKEN_KEYS: (keyof SidebarTokens)[] = [
  "sidebar",
  "sidebar-foreground",
  "sidebar-primary",
  "sidebar-primary-foreground",
  "sidebar-accent",
  "sidebar-accent-foreground",
  "sidebar-border",
  "sidebar-ring",
];

export const SIDEBAR_TOKENS: { light: SidebarTokens; dark: SidebarTokens } = {
  light: {
    sidebar: "oklch(0.985 0.004 262)",
    "sidebar-foreground": "oklch(0.21 0.02 262)",
    "sidebar-primary": "oklch(0.53 0.21 262)",
    "sidebar-primary-foreground": "oklch(0.98 0.01 262)",
    "sidebar-accent": "oklch(0.92 0.035 262)",
    "sidebar-accent-foreground": "oklch(0.28 0.03 262)",
    "sidebar-border": "oklch(0.9 0.015 262)",
    "sidebar-ring": "oklch(0.53 0.21 262)",
  },
  dark: {
    sidebar: "oklch(0.225 0.02 262)",
    "sidebar-foreground": "oklch(0.95 0.008 262)",
    "sidebar-primary": "oklch(0.68 0.18 262)",
    "sidebar-primary-foreground": "oklch(0.15 0.02 262)",
    "sidebar-accent": "oklch(0.31 0.03 262)",
    "sidebar-accent-foreground": "oklch(0.95 0.008 262)",
    "sidebar-border": "oklch(1 0 0 / 12%)",
    "sidebar-ring": "oklch(0.68 0.18 262)",
  },
};
