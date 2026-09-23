import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { RISK_TOKENS, RISK_TOKEN_KEYS } from "@/lib/risk-tokens";
import { SIDEBAR_TOKEN_KEYS, SIDEBAR_TOKENS } from "@/lib/sidebar-tokens";
import { DEFAULT_THEME_PRESET, getThemePreset, THEME_PRESETS, THEME_TOKEN_KEYS } from "@/themes";
import type { ThemeTokens } from "@/themes/types";

/**
 * `app/globals.css` 의 손 미러링 블록이 실제 소스와 어긋나지 않는지 지킨다
 * (#36 어드버서리얼 리뷰 finding 2, #112 finding 2).
 *
 * `themes/*.ts` 는 프리셋별 시맨틱 토큰·사이드바 토큰의 단일 진실원천이라고
 * 주석에 적혀 있지만, `app/globals.css` 의 `[data-theme="<name>"]` 블록은 그
 * 값을 **손으로** 옮겨 적은 것이라 주석 말고는 어긋남을 막을 장치가 없었다.
 * 이 테스트는 CSS 텍스트에서 커스텀 프로퍼티를 실제로 파싱해 소스 파일의
 * 값과 정확히 같은지 비교한다.
 *
 * 처음엔 `ocean` 프리셋만 지켰다(#36) — 다른 프리셋(`ink-bulb` 등)은 미러
 * 드리프트 가드 밖이었다. 지금은 `THEME_PRESETS` 전체를 parametrize 한다
 * (#112 finding 2). 양쪽(CSS 파싱 결과·소스 객체) 모두 `pick()` 을 거친다 —
 * `ink-bulb` 처럼 `ThemeTokens` 의 opt-in 확장 필드(camelCase `bulb`/`shell`*)
 * 를 가진 프리셋을 그대로 `toEqual` 하면 확장 키 때문에 무관하게 깨진다.
 *
 * 실제 블록 구조(다른 형태로 바뀌면 이 테스트가 먼저 깨진다):
 * - `:root`  — 사이드바 라이트값 + ocean 라이트값(FOUC 방지 폴백, 파일 상단 주석)
 * - `.dark`  — 사이드바 다크값만(ocean 폴백, 모든 [data-theme] 가 공유하는 base)
 * - `[data-theme="<name>"]` / `[data-theme="<name>"].dark` — 프리셋별 시맨틱
 *   토큰 + (ocean 제외) 프리셋별 사이드바 토큰(#112) 미러 블록
 *
 * 기대 키 목록은 하드코딩하지 않고 `SIDEBAR_TOKEN_KEYS`/`THEME_TOKEN_KEYS`
 * (각각 소스의 단일 진실원천)에서 가져온다.
 */

const globalsCss = readFileSync(join(process.cwd(), "app/globals.css"), "utf-8");

/** 정규식 특수문자를 이스케이프한다(selector 를 리터럴로 다루기 위함). */
function escapeRegExp(literal: string): string {
  return literal.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * `<selector> { ... }` 블록 하나를 추출한다. `selector` 는 이스케이프 없는
 * 리터럴 문자열(`:root`, `.dark`, `[data-theme="ocean"].dark` 등)로 준다 —
 * 줄 시작에 정확히 그 selector 로 시작해야 매치한다(다른 selector 의 일부로
 * 오매칭되지 않게).
 */
function extractBlock(css: string, selector: string): string {
  const pattern = new RegExp(`^${escapeRegExp(selector)} \\{([^}]*)\\}`, "m");
  const match = css.match(pattern);
  if (!match) throw new Error(`app/globals.css 에서 "${selector} { ... }" 블록을 찾지 못했다`);
  return match[1];
}

/** CSS 커스텀 프로퍼티 선언(`--key: value;`)을 키→값 맵으로 파싱한다. */
function parseDeclarations(block: string): Record<string, string> {
  const out: Record<string, string> = {};
  const re = /--([a-zA-Z0-9-]+):\s*([^;]+);/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(block))) {
    out[m[1]] = m[2].trim();
  }
  return out;
}

/** `keys` 에 한해서만 `decls` 부분집합을 뽑는다 — 다른 축(radius 등)이 섞여 있어도, 또는 `ink-bulb` 확장 키가 섞여 있어도 무관하게 비교하기 위함. */
function pick(decls: Record<string, string>, keys: readonly string[]): Record<string, string> {
  const out: Record<string, string> = {};
  for (const key of keys) out[key] = decls[key];
  return out;
}

/** `ThemeTokens`(라이트 또는 다크 한 쪽)에서 `THEME_TOKEN_KEYS` 만 pick 한다 — ink-bulb 의 opt-in 확장 필드(camelCase)를 제외하고 `pick(decls, ...)` 결과와 같은 형태로 비교하기 위함. 키가 비면 던진다(양쪽 `undefined` 로 통과하는 구멍 방지 — 리뷰 F17). */
function pickThemeTokens(tokens: ThemeTokens): Record<string, string> {
  const out: Record<string, string> = {};
  for (const key of THEME_TOKEN_KEYS) {
    const value = tokens[key] as string | undefined;
    if (typeof value !== "string") throw new Error(`프리셋에 시맨틱 토큰 "${key}" 가 없다`);
    out[key] = value;
  }
  return out;
}

const OCEAN = getThemePreset(DEFAULT_THEME_PRESET);

describe("app/globals.css 미러 블록이 소스 파일과 일치한다 (#36)", () => {
  it(":root 의 사이드바 값이 ocean 프리셋(themes/ocean.ts sidebar.light) 폴백과 같다", () => {
    const decls = parseDeclarations(extractBlock(globalsCss, ":root"));
    expect(pick(decls, SIDEBAR_TOKEN_KEYS)).toEqual(SIDEBAR_TOKENS.light);
  });

  it(".dark 의 사이드바 값이 ocean 프리셋(themes/ocean.ts sidebar.dark) 폴백과 같다", () => {
    const decls = parseDeclarations(extractBlock(globalsCss, ".dark"));
    expect(pick(decls, SIDEBAR_TOKEN_KEYS)).toEqual(SIDEBAR_TOKENS.dark);
  });

  // #112 finding 2 의 parametrize 는 [data-theme] 블록만 훑는다 — 테마가 확정되기
  // 전 첫 페인트에 실제로 쓰이는 `:root` 27키(ocean 폴백)는 그 밖이라 가드가
  // 사라졌었다(리뷰 F6). 전 프리셋 parametrize 와 공존하는 별도 단언으로 되살린다.
  it(":root 의 시맨틱 토큰이 themes/ocean.ts light 폴백과 같다 (#36)", () => {
    const decls = parseDeclarations(extractBlock(globalsCss, ":root"));
    expect(pick(decls, THEME_TOKEN_KEYS)).toEqual(pickThemeTokens(OCEAN.light));
  });

  // 미러 테스트는 "ocean 은 :root/.dark 폴백과 값이 같다" 를 근거로 ocean 을 아래
  // 사이드바 검사에서 제외한다. 그 전제 자체를 잠근다 — themes/ocean.ts 의 sidebar
  // 만 고치면 registry cssVars(새 값)와 :root 폴백(옛 값)이 조용히 갈라진다(리뷰 F7).
  it("SIDEBAR_TOKENS(:root/.dark 폴백 SSOT)가 ocean 프리셋의 sidebar 와 같다", () => {
    expect(OCEAN.sidebar).toEqual(SIDEBAR_TOKENS);
  });

  it(":root 의 위험등급 값이 lib/risk-tokens.ts RISK_TOKENS.light 와 같다 (#81)", () => {
    const decls = parseDeclarations(extractBlock(globalsCss, ":root"));
    expect(pick(decls, RISK_TOKEN_KEYS)).toEqual(RISK_TOKENS.light);
  });

  it(".dark 의 위험등급 값이 lib/risk-tokens.ts RISK_TOKENS.dark 와 같다 (#81)", () => {
    const decls = parseDeclarations(extractBlock(globalsCss, ".dark"));
    expect(pick(decls, RISK_TOKEN_KEYS)).toEqual(RISK_TOKENS.dark);
  });

  it("어떤 테마 프리셋 블록도 위험등급 토큰을 재정의하지 않는다 (#81)", () => {
    // 심각도는 브랜드가 아니라 관례가 정하는 층이다 — 프리셋이 덮으면
    // forest 에서 "경보" 가 초록이 되는 식으로 의미가 무너진다.
    const presetBlocks = globalsCss.match(/^\[data-theme="[^"]+"\][^{]*\{[^}]*\}/gm) ?? [];
    // 개수를 레지스트리에서 유도해 잠근다 — `> 0` 으로 두면 나중에 일부 블록을
    // @layer/@media 로 감싸 들여쓰는 순간 그 블록만 조용히 검사에서 빠진다.
    expect(presetBlocks.length, "프리셋 × 라이트/다크 블록을 전부 매치하지 못했다").toBe(
      THEME_PRESETS.length * 2,
    );
    for (const block of presetBlocks) {
      for (const key of RISK_TOKEN_KEYS) {
        expect(block, `${key} 를 재정의하는 프리셋 블록이 있다`).not.toContain(`--${key}:`);
      }
    }
  });

  it.each(THEME_PRESETS)(
    '[data-theme="$name"] 의 시맨틱 토큰이 themes/$name.ts light 와 같다',
    (preset) => {
      const decls = parseDeclarations(extractBlock(globalsCss, `[data-theme="${preset.name}"]`));
      expect(pick(decls, THEME_TOKEN_KEYS)).toEqual(pickThemeTokens(preset.light));
    },
  );

  it.each(THEME_PRESETS)(
    '[data-theme="$name"].dark 의 시맨틱 토큰이 themes/$name.ts dark 와 같다',
    (preset) => {
      const decls = parseDeclarations(extractBlock(globalsCss, `[data-theme="${preset.name}"].dark`));
      expect(pick(decls, THEME_TOKEN_KEYS)).toEqual(pickThemeTokens(preset.dark));
    },
  );

  // #112 finding 3: 사이드바 토큰이 ocean hue 로 고정돼 있어 어떤 프로필을
  // 설치해도 사이드바 chrome 이 파랗게 나갔다. 프리셋마다 명시값을 갖도록
  // 고친 뒤에는 [data-theme="<name>"] 블록이 그 값을 실제로 재정의하는지,
  // 특히 sidebar-primary 가 해당 테마의 primary 와 같은지 잠근다.
  //
  // ocean 은 :root/.dark 폴백과 값이 같아 [data-theme="ocean"] 블록이 별도로
  // sidebar-* 를 재정의하지 않는다(위 :root/.dark 테스트가 이미 지킨다) — 여기선
  // 제외한다.
  const nonOceanPresets = THEME_PRESETS.filter((preset) => preset.name !== DEFAULT_THEME_PRESET);

  it.each(nonOceanPresets)(
    '[data-theme="$name"] 의 사이드바 값이 themes/$name.ts sidebar.light 와 같다',
    (preset) => {
      const decls = parseDeclarations(extractBlock(globalsCss, `[data-theme="${preset.name}"]`));
      expect(pick(decls, SIDEBAR_TOKEN_KEYS)).toEqual(preset.sidebar.light);
      expect(decls["sidebar-primary"]).toBe(preset.light.primary);
    },
  );

  it.each(nonOceanPresets)(
    '[data-theme="$name"].dark 의 사이드바 값이 themes/$name.ts sidebar.dark 와 같다',
    (preset) => {
      const decls = parseDeclarations(extractBlock(globalsCss, `[data-theme="${preset.name}"].dark`));
      expect(pick(decls, SIDEBAR_TOKEN_KEYS)).toEqual(preset.sidebar.dark);
      expect(decls["sidebar-primary"]).toBe(preset.dark.primary);
    },
  );
});
