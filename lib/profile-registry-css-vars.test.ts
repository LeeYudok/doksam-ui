import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  computeProfileRegistryCssVars,
  extractDensityFromDescription,
  extractPersonalityFromDescription,
  extractProfileDataAttrsFromDescription,
  extractRadiusFromDescription,
  PROFILE_CSS_VAR_KEYS,
  withSyncedProfileAxesDescription,
} from "@/lib/profile-registry-css-vars";
import { getPersonalityPreset } from "@/personalities";
import { BRAND_PROFILES } from "@/profiles";

/**
 * `registry.json` 의 `profile-*` 항목이 카탈로그가 정의한 시맨틱 토큰을 전부
 * 싣는지 지킨다 (#36).
 *
 * fruit-market 소비 프로젝트에서 `profile-service` 를 설치했더니 `--chart-1~5`·
 * `--sidebar-*` 가 빠져 shadcn init 의 회색 기본값이 그대로 남았다 — registry
 * item 이 손으로 옮겨 적혀 `themes/<name>.ts` 가 chart 토큰을 추가한 뒤에도
 * 갱신되지 않았기 때문이다.
 *
 * 기대 키 집합은 하드코딩하지 않고 `PROFILE_CSS_VAR_KEYS`(=
 * `THEME_TOKEN_KEYS ∪ SIDEBAR_TOKEN_KEYS`, 둘 다 소스 파일에서 유도)에서
 * 가져온다 — 카탈로그가 새 시맨틱 토큰을 추가하면 이 테스트도 자동으로
 * 그 토큰을 요구하게 된다.
 */

interface RegistryItemCssVars {
  name: string;
  description?: string;
  cssVars?: {
    theme?: Record<string, string>;
    light?: Record<string, string>;
    dark?: Record<string, string>;
  };
}

function readRegistryItems(): RegistryItemCssVars[] {
  const raw = readFileSync(join(process.cwd(), "registry.json"), "utf8");
  return (JSON.parse(raw) as { items: RegistryItemCssVars[] }).items;
}

describe("registry.json profile-* cssVars (#36)", () => {
  const items = readRegistryItems();

  for (const profile of BRAND_PROFILES) {
    const itemName = `profile-${profile.name}`;

    it(`${itemName} 의 cssVars.light/dark 가 카탈로그 시맨틱 토큰을 전부 싣는다`, () => {
      const item = items.find((i) => i.name === itemName);
      expect(item, `registry.json 에 ${itemName} 항목이 없다`).toBeDefined();
      expect(item?.cssVars, `${itemName} 에 cssVars 가 없다`).toBeDefined();

      const lightKeys = Object.keys(item!.cssVars!.light ?? {}).sort();
      const darkKeys = Object.keys(item!.cssVars!.dark ?? {}).sort();
      const expectedKeys = [...PROFILE_CSS_VAR_KEYS].sort();

      for (const key of expectedKeys) {
        expect(lightKeys, `${itemName}.cssVars.light 에 --${key} 누락`).toContain(key);
        expect(darkKeys, `${itemName}.cssVars.dark 에 --${key} 누락`).toContain(key);
      }
    });

    it(`${itemName} 의 cssVars 가 themes/*.ts + lib/sidebar-tokens.ts 계산 결과와 일치한다`, () => {
      const item = items.find((i) => i.name === itemName);
      const expected = computeProfileRegistryCssVars(profile);
      expect(expected, `profile.theme "${profile.theme}" 이 themes/index.ts 에 없다`).toBeDefined();

      // 어긋나면 registry.json 이 themes/*.ts 를 반영하지 못했다는 뜻이다 —
      // scripts/registry/sync-profile-vars.ts 를 다시 돌려야 한다.
      expect(item?.cssVars?.theme).toEqual(expected!.theme);
      expect(item?.cssVars?.light).toEqual(expected!.light);
      expect(item?.cssVars?.dark).toEqual(expected!.dark);
    });

    it(`${itemName} 의 description 이 언급하는 radius 가 cssVars.theme.radius 와 같다`, () => {
      // 어드버서리얼 리뷰(#36 finding 1): description 은 손글씨라 radius= 부분이
      // profiles/index.ts 와 따로 놀 수 있다(실측 — 5개 중 4개가 어긋나 있었다).
      // 기대값은 하드코딩하지 않고 profile.radius(단일 진실원천)에서 가져온다.
      const item = items.find((i) => i.name === itemName);
      expect(item?.description, `${itemName} 에 description 이 없다`).toBeTruthy();

      const mentioned = extractRadiusFromDescription(item!.description!);
      expect(mentioned, `${itemName} description 에 "radius=" 패턴이 없다`).toBeDefined();
      expect(mentioned).toBe(profile.radius);
      expect(item?.cssVars?.theme?.radius).toBe(profile.radius);
    });

    it(`${itemName} 의 description 이 언급하는 density 가 profiles/index.ts 와 같다`, () => {
      // #110 finding 2: sync 가 radius 만 재계산하던 동안 profile-docs 의 설명은
      // density=comfortable 인데 실제 프로필은 spacious 였다. 기대값은
      // profile.density(단일 진실원천)에서 가져온다.
      const item = items.find((i) => i.name === itemName);
      const mentioned = extractDensityFromDescription(item!.description!);
      expect(mentioned, `${itemName} description 에 "density=" 패턴이 없다`).toBeDefined();
      expect(mentioned).toBe(profile.density);
      expect(extractProfileDataAttrsFromDescription(item!.description!).density).toBe(profile.density);
    });

    it(`${itemName} 의 description 이 data-personality 세 속성을 프로필 값으로 안내한다`, () => {
      // #110 finding 3: personality 층은 속성이 없으면 아무 규칙도 걸리지 않는
      // opt-in 이다 — 설명이 속성을 안내하지 않으면 설치만 한 소비 프로젝트가
      // 성격 미적용으로 돌아간다.
      const item = items.find((i) => i.name === itemName);
      const preset = getPersonalityPreset(profile.personality);
      expect(preset, `profile.personality "${profile.personality}" 이 personalities/index.ts 에 없다`).toBeDefined();

      expect(extractPersonalityFromDescription(item!.description!)).toBe(profile.personality);
      expect(extractProfileDataAttrsFromDescription(item!.description!)).toEqual({
        density: profile.density,
        personality: profile.personality,
        surface: preset!.surface,
        motion: preset!.motion,
      });
    });
  }
});

// 회귀(#111 finding 15b): 비전역 replace 는 첫 일치만 바꿔서, 같은 토큰을 두 번
// 언급하는 설명 문장의 뒤쪽이 옛 값으로 남았다.
describe("withSyncedProfileAxesDescription", () => {
  const profile = BRAND_PROFILES[0]!;
  const preset = getPersonalityPreset(profile.personality)!;

  it("한 문장 안에 토큰이 두 번 나와도 전부 동기화한다", () => {
    const description = [
      `요약: radius=WRONG · density=wrong · personality=wrong`,
      `설치: data-density="wrong" data-personality="wrong"`,
      `다시: radius=WRONG · density=wrong · personality=wrong`,
      `다시: data-density="wrong" data-personality="wrong"`,
      `속성: data-personality-surface="wrong" data-personality-motion="wrong"`,
      `속성: data-personality-surface="wrong" data-personality-motion="wrong"`,
    ].join("\n");

    const out = withSyncedProfileAxesDescription(description, profile);

    expect(out).not.toMatch(/WRONG|wrong/);
    expect(out.match(new RegExp(`radius=${profile.radius}`, "g"))).toHaveLength(2);
    expect(out.match(new RegExp(`(?<!-)density=${profile.density}`, "g"))).toHaveLength(2);
    expect(out.match(new RegExp(`data-density="${profile.density}"`, "g"))).toHaveLength(2);
    expect(out.match(new RegExp(`data-personality="${profile.personality}"`, "g"))).toHaveLength(2);
    expect(out.match(new RegExp(`data-personality-surface="${preset.surface}"`, "g"))).toHaveLength(2);
    expect(out.match(new RegExp(`data-personality-motion="${preset.motion}"`, "g"))).toHaveLength(2);
  });

  it("패턴이 없으면 원본을 그대로 돌려준다", () => {
    const description = "축 언급이 전혀 없는 설명";
    expect(withSyncedProfileAxesDescription(description, profile)).toBe(description);
  });
});

// 회귀(#112 finding 1): theme.light/dark 를 통째로 spread 하던 시절엔
// ink-bulb 처럼 ThemeTokens 의 opt-in 확장 필드(camelCase `bulb`/`shell`/
// `shellForeground`/`shellMuted`)를 가진 프리셋을 고른 프로필이 그 camelCase
// 이름 그대로를 cssVars 에 실어 `--shellForeground` 같은 잘못된 CSS 변수명
// (app/globals.css 는 `--shell-foreground`)으로 새어 나갔다. 필수 키
// 완전성 테스트(위)는 "있어야 할 키가 있는가"만 보므로 이 초과 유출을 못
// 잡는다 — 없어야 할 키가 없는지 따로 지킨다.
describe("computeProfileRegistryCssVars — ink-bulb 확장 토큰 유출 방지 (#112 finding 1)", () => {
  it("ink-bulb 테마를 고른 프로필도 camelCase 확장 키(bulb/shell*)를 cssVars 에 싣지 않는다", () => {
    const inkBulbProfile = { ...BRAND_PROFILES[0]!, theme: "ink-bulb" };
    const result = computeProfileRegistryCssVars(inkBulbProfile);
    expect(result).toBeDefined();

    const leakKeys = ["bulb", "shell", "shellForeground", "shellMuted"];
    for (const key of leakKeys) {
      expect(result!.light, `light 에 ${key} 가 새어 있다`).not.toHaveProperty(key);
      expect(result!.dark, `dark 에 ${key} 가 새어 있다`).not.toHaveProperty(key);
    }

    // 키 집합은 PROFILE_CSS_VAR_KEYS(계약)와 정확히 같아야 한다 — 확장 키가
    // 섞여도, 반대로 pick 이 과하게 걸러도 여기서 잡힌다.
    expect(Object.keys(result!.light).sort()).toEqual([...PROFILE_CSS_VAR_KEYS].sort());
    expect(Object.keys(result!.dark).sort()).toEqual([...PROFILE_CSS_VAR_KEYS].sort());
  });
});
