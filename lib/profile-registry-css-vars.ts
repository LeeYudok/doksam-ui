// 상대 경로 + 명시적 확장자 — `@/` 별칭은 tsc/Next 번들러 전용이라
// scripts/registry/sync-profile-vars.ts 가 plain `node --experimental-strip-types`
// 로 이 파일을 import 하면 해소되지 않는다(#36 작업 중 실측). tsconfig.json 의
// allowImportingTsExtensions 덕에 tsc·vitest 쪽 해석도 그대로 유지된다.
import { SIDEBAR_TOKEN_KEYS, SIDEBAR_TOKENS } from "./sidebar-tokens.ts";
import type { BrandProfile } from "../profiles/index.ts";
import { getThemePreset, THEME_TOKEN_KEYS } from "../themes/index.ts";

/**
 * `registry.json` 의 `profile-*` 항목이 실어야 할 `cssVars` 를 계산한다 (#36).
 *
 * 소비 프로젝트가 `npx shadcn add https://ui.doksam.com/r/profile-<name>.json`
 * 으로 프로필을 설치하면 shadcn CLI 가 이 `cssVars.light`/`dark` 를 그대로
 * `:root`/`.dark` 에 병합한다. 이전에는 이 값을 손으로 옮겨 적었는데
 * `themes/<name>.ts` 가 chart-1~5 를 추가한 뒤에도(#43) registry.json 은
 * 갱신되지 않아 소비 프로젝트가 회색 기본 chart·미정의 sidebar 를 받았다
 * (fruit-market 실측, GitHub #36).
 *
 * 이 함수가 그 손 옮김을 없앤다 — `themes/index.ts`(색상 토큰) +
 * `lib/sidebar-tokens.ts`(사이드바 chrome, 테마 무관) 를 조합해서 매번
 * 다시 계산한다. `scripts/registry/sync-profile-vars.ts` 가 결과를
 * `registry.json` 에 써넣고, `lib/profile-registry-css-vars.test.ts` 가
 * `registry.json` 의 실제 값과 이 계산 결과가 어긋나지 않는지 지킨다.
 */

/** `profile-*` 항목의 `cssVars.light`/`dark` 가 반드시 가져야 할 키 전체 — THEME_TOKEN_KEYS ∪ SIDEBAR_TOKEN_KEYS. */
export const PROFILE_CSS_VAR_KEYS: string[] = [...THEME_TOKEN_KEYS, ...SIDEBAR_TOKEN_KEYS];

export interface ProfileRegistryCssVars {
  theme: { radius: string };
  light: Record<string, string>;
  dark: Record<string, string>;
}

/**
 * 프로필 하나의 registry cssVars 를 계산한다.
 * `profile.theme` 가 `themes/index.ts` 에 없으면(레지스트리 불일치) undefined.
 */
export function computeProfileRegistryCssVars(profile: BrandProfile): ProfileRegistryCssVars | undefined {
  const theme = getThemePreset(profile.theme);
  if (!theme) return undefined;

  const light: Record<string, string> = { ...theme.light, ...SIDEBAR_TOKENS.light };
  const dark: Record<string, string> = { ...theme.dark, ...SIDEBAR_TOKENS.dark };

  return {
    theme: { radius: profile.radius },
    light,
    dark,
  };
}
