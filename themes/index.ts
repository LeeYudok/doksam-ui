// 명시적 .ts 확장자 — tsconfig.json 의 allowImportingTsExtensions 로 tsc·Next
// 번들러 해석은 그대로고, scripts/registry/sync-profile-vars.ts 처럼 plain
// `node --experimental-strip-types` 로 이 파일을 직접 import 하는 경로도
// 확장자 없는 상대 import 를 해소하지 못해 깨진다(#36 작업 중 실측).
import { ember } from "./ember.ts";
import { forest } from "./forest.ts";
import { gold } from "./gold.ts";
import { inkBulb } from "./ink-bulb.ts";
import { ocean } from "./ocean.ts";
import { rose } from "./rose.ts";
import { slate } from "./slate.ts";
import type { ThemePreset } from "./types.ts";
import { violet } from "./violet.ts";

export type { ThemePreset, ThemeTokens } from "./types.ts";
export { THEME_TOKEN_KEYS } from "./types.ts";

/**
 * 테마 프리셋 레지스트리 — 단일 진실원천.
 * 여기에 항목을 추가/제거하면 스위처와 사이트 전체에 자동 반영된다.
 * (CSS 변수는 app/globals.css 에 별도로 동기화해야 함 — 파일 상단 주석 참고)
 */
export const THEME_PRESETS: ThemePreset[] = [ocean, forest, violet, ember, rose, slate, gold, inkBulb];

export const DEFAULT_THEME_PRESET = "ocean";

export function getThemePreset(name: string): ThemePreset | undefined {
  return THEME_PRESETS.find((preset) => preset.name === name);
}
