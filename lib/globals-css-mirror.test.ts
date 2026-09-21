import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { SIDEBAR_TOKEN_KEYS, SIDEBAR_TOKENS } from "@/lib/sidebar-tokens";
import { THEME_TOKEN_KEYS } from "@/themes";
import { ocean } from "@/themes/ocean";

/**
 * `app/globals.css` 의 손 미러링 블록이 실제 소스와 어긋나지 않는지 지킨다
 * (#36 어드버서리얼 리뷰 finding 2).
 *
 * `lib/sidebar-tokens.ts` 와 `themes/ocean.ts` 는 각각 사이드바 chrome 값과
 * ocean 프리셋의 단일 진실원천이라고 주석에 적혀 있지만, `app/globals.css`
 * 의 `:root`/`.dark`/`[data-theme="ocean"]`/`[data-theme="ocean"].dark` 블록은
 * 그 값을 **손으로** 옮겨 적은 것이라 주석 말고는 어긋남을 막을 장치가 없었다.
 * 이 테스트는 CSS 텍스트에서 커스텀 프로퍼티를 실제로 파싱해 소스 파일의
 * 값과 정확히 같은지 비교한다.
 *
 * 실제 블록 구조(다른 형태로 바뀌면 이 테스트가 먼저 깨진다):
 * - `:root`  — 사이드바 라이트값 + ocean 라이트값(FOUC 방지 폴백, 파일 상단 주석)
 * - `.dark`  — 사이드바 다크값만(모든 [data-theme] 가 공유하는 dark variant)
 * - `[data-theme="ocean"]` / `[data-theme="ocean"].dark` — ocean 라이트/다크값
 *   (다른 프리셋과 동일한 형태의 미러 블록)
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

/** `keys` 에 한해서만 `decls` 부분집합을 뽑는다 — 다른 축(radius 등)이 섞여 있어도 무관하게 비교하기 위함. */
function pick(decls: Record<string, string>, keys: readonly string[]): Record<string, string> {
  const out: Record<string, string> = {};
  for (const key of keys) out[key] = decls[key];
  return out;
}

describe("app/globals.css 미러 블록이 소스 파일과 일치한다 (#36)", () => {
  it(":root 의 사이드바 값이 lib/sidebar-tokens.ts SIDEBAR_TOKENS.light 와 같다", () => {
    const decls = parseDeclarations(extractBlock(globalsCss, ":root"));
    expect(pick(decls, SIDEBAR_TOKEN_KEYS)).toEqual(SIDEBAR_TOKENS.light);
  });

  it(".dark 의 사이드바 값이 lib/sidebar-tokens.ts SIDEBAR_TOKENS.dark 와 같다", () => {
    const decls = parseDeclarations(extractBlock(globalsCss, ".dark"));
    expect(pick(decls, SIDEBAR_TOKEN_KEYS)).toEqual(SIDEBAR_TOKENS.dark);
  });

  it(":root 의 ocean 폴백 시맨틱 토큰이 themes/ocean.ts ocean.light 와 같다", () => {
    const decls = parseDeclarations(extractBlock(globalsCss, ":root"));
    expect(pick(decls, THEME_TOKEN_KEYS)).toEqual(ocean.light);
  });

  it('[data-theme="ocean"] 의 시맨틱 토큰이 themes/ocean.ts ocean.light 와 같다', () => {
    const decls = parseDeclarations(extractBlock(globalsCss, '[data-theme="ocean"]'));
    expect(pick(decls, THEME_TOKEN_KEYS)).toEqual(ocean.light);
  });

  it('[data-theme="ocean"].dark 의 시맨틱 토큰이 themes/ocean.ts ocean.dark 와 같다', () => {
    const decls = parseDeclarations(extractBlock(globalsCss, '[data-theme="ocean"].dark'));
    expect(pick(decls, THEME_TOKEN_KEYS)).toEqual(ocean.dark);
  });
});
