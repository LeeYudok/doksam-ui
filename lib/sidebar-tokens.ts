/**
 * 사이드바 전용 시맨틱 토큰 — 단일 진실원천 (#36).
 *
 * `themes/*.ts` 의 `ThemeTokens` 과 달리 사이드바 chrome 은 선택된 테마 프리셋과
 * 무관하게 라이트/다크 각 한 쌍만 갖는다 — `app/globals.css` 를 봐도
 * `[data-theme="ocean"]` 등 프리셋별 블록은 이 값을 재정의하지 않고 `:root`/`.dark`
 * 의 값을 그대로 물려받는다. 이 파일이 그 두 값 쌍의 단일 진실원천이고,
 * `app/globals.css` 의 `:root`/`.dark` 사이드바 블록은 이 값을 손으로 그대로
 * 미러링한 것이다 — 여기를 고치면 반드시 거기도 같이 갱신한다.
 *
 * `scripts/registry/sync-profile-vars.ts` 가 이 값을 `registry.json` 의
 * `profile-*` 항목 `cssVars` 에 합성한다(#36) — profile-* 를 설치한 소비
 * 프로젝트도 사이드바 컴포넌트가 회색 기본값 대신 이 값을 받는다.
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
