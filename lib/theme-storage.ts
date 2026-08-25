/**
 * 테마/폰트 프리셋 · 다크모드 영속에 쓰는 localStorage 키.
 * FOUC 방지 인라인 스크립트(app/layout.tsx)와 hooks/use-theme-preset.ts,
 * hooks/use-font-preset.ts 가 이 값을 공유한다 — 한쪽만 고치면 어긋나니
 * 상수로 단일화.
 */
export const THEME_PRESET_STORAGE_KEY = "doksam-ui-theme-preset";
export const THEME_MODE_STORAGE_KEY = "doksam-ui-theme-mode";
export const FONT_STORAGE_KEY = "doksam-ui-font-preset";

export const LOCALE_STORAGE_KEY = "doksam-ui-locale";

/**
 * 브랜드 프로필 미리보기(#65)가 쓰는 radius·density 영속 키.
 * FOUC 방지 인라인 스크립트(app/layout.tsx)와 profile-preview-button 이 공유.
 * 값이 없으면 <html> 에 아무것도 세팅하지 않는다(기존 렌더 무변화).
 */
export const DENSITY_STORAGE_KEY = "doksam-ui-density";
export const RADIUS_STORAGE_KEY = "doksam-ui-radius";

/**
 * 시각 성격(personality) 토큰 층(#90)이 쓰는 영속 키. personalities/index.ts
 * 레지스트리의 프리셋이 고정한 scale/surface/motion 3값을, 밀도(density)와
 * 동일한 패턴으로 preset 이름이 아니라 raw 값 그대로 저장한다 — FOUC 방지
 * 인라인 스크립트(app/layout.tsx)가 레지스트리를 몰라도 즉시 반영할 수 있게.
 * 값이 없으면 <html>에 아무것도 세팅하지 않는다(기존 렌더 무변화).
 */
export const PERSONALITY_SCALE_STORAGE_KEY = "doksam-ui-personality-scale";
export const PERSONALITY_SURFACE_STORAGE_KEY = "doksam-ui-personality-surface";
export const PERSONALITY_MOTION_STORAGE_KEY = "doksam-ui-personality-motion";

export type ThemeMode = "light" | "dark";
