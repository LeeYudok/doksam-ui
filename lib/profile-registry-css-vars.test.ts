import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  computeProfileRegistryCssVars,
  extractRadiusFromDescription,
  PROFILE_CSS_VAR_KEYS,
} from "@/lib/profile-registry-css-vars";
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
  }
});
