/**
 * #93 — chart-1~5 를 범주형 팔레트로 다시 고르는 생성기.
 *
 * 실행: node --experimental-strip-types scripts/manual/2026-09-23_issue-93_gen-chart-palette.ts
 *
 * 규칙(이슈 #93 결정사항):
 *  1. hue — `--chart-1` 만 프리셋 브랜드 hue(= light primary 의 H)를 유지하고,
 *     나머지는 색상환을 72° 간격으로 돈다. 인덱스 순서는 0/144/288/72/216 로
 *     엇갈리게 배치해 계열이 둘·셋만 쓰이는 흔한 경우에 144° 가 벌어지게 한다.
 *     결과적으로 임의의 두 계열 사이 hue 거리는 항상 72° ≥ 55° 다.
 *  2. lightness — hue 만으로는 적녹 색약에서 무너지므로 상대휘도(Y)를 계단식으로
 *     둔다. 회색조로 떨어뜨려도 다섯 계열이 서로 다른 밝기가 된다.
 *  3. 라이트 대비 — 라이트값의 Y 상한이 곧 `text-primary-foreground`(프리셋마다
 *     거의 흰색) 대비 4.5:1 조건이다. `--chart-N-foreground` 짝을 추가하지 않고
 *     이 상한으로 푼다. 다크는 반대로 하한이 걸린다.
 *  4. chroma — 프리셋의 브랜드 채도를 따라간다(무채색 계열인 slate·ivory 는
 *     낮게). 목표 Y 에서 색역을 벗어나면 자동으로 낮춘다.
 */
import { contrastRatio, oklchToSrgb, parseOklch, relativeLuminance } from "../../lib/color-contrast.ts";
import { THEME_PRESETS } from "../../themes/index.ts";

/** chart-1..5 의 브랜드 hue 대비 오프셋(도). */
const HUE_OFFSETS = [0, 144, 288, 72, 216];
/**
 * 라이트 목표 상대휘도. (Y+0.05) 이 1.2275배씩 벌어지는 등비 계단이고, 가장 밝은
 * 0.1656 이 흰 `primary-foreground` 대비 4.5:1 상한(0.1833) 아래다.
 */
const LIGHT_Y = [0.1656, 0.0931, 0.045, 0.1257, 0.0666];
/**
 * 다크 목표 상대휘도. 같은 방식의 1.16배 등비 계단이고, 가장 어두운 0.32 가
 * 프리셋 중 가장 밝은 다크 `primary-foreground` 기준으로도 4.5:1 위에 있다.
 */
const DARK_Y = [0.448, 0.32, 0.62, 0.379, 0.528];

function unclampedSrgb(l: number, c: number, h: number): [number, number, number] {
  const rad = (h * Math.PI) / 180;
  const a = c * Math.cos(rad);
  const b = c * Math.sin(rad);
  const lms = [
    (l + 0.3963377774 * a + 0.2158037573 * b) ** 3,
    (l - 0.1055613458 * a - 0.0638541728 * b) ** 3,
    (l - 0.0894841775 * a - 1.291485548 * b) ** 3,
  ];
  return [
    4.0767416621 * lms[0] - 3.3077115913 * lms[1] + 0.2309699292 * lms[2],
    -1.2684380046 * lms[0] + 2.6097574011 * lms[1] - 0.3413193965 * lms[2],
    -0.0041960863 * lms[0] - 0.7034186147 * lms[1] + 1.707614701 * lms[2],
  ];
}

function inGamut(l: number, c: number, h: number): boolean {
  return unclampedSrgb(l, c, h).every((ch) => ch >= -0.002 && ch <= 1.002);
}

function luminance(l: number, c: number, h: number): number {
  return relativeLuminance(`oklch(${l} ${c} ${h})`);
}

/** 주어진 (C, H) 에서 목표 Y 를 내는 OKLCH L 을 이분탐색으로 찾는다. */
function solveL(targetY: number, c: number, h: number): number {
  let lo = 0;
  let hi = 1;
  for (let i = 0; i < 60; i += 1) {
    const mid = (lo + hi) / 2;
    if (luminance(mid, c, h) < targetY) lo = mid;
    else hi = mid;
  }
  return (lo + hi) / 2;
}

/** 목표 Y 를 만족하면서 색역 안에 드는 가장 진한 색을 고른다. */
function pick(targetY: number, hue: number, chromaCap: number): { l: number; c: number; h: number } {
  const h = ((hue % 360) + 360) % 360;
  for (let c = chromaCap; c >= 0; c -= 0.002) {
    const l = solveL(targetY, c, h);
    if (inGamut(l, c, h)) return { l, c, h };
  }
  return { l: solveL(targetY, 0, h), c: 0, h };
}

/** 값 문자열로 굳히기 — L 3자리·C 3자리·H 정수. 반올림이 목표 Y 를 넘기지 않게 L 은 내림 쪽으로 보정한다. */
function format(
  { l, c, h }: { l: number; c: number; h: number },
  mode: "light" | "dark",
  targetY: number,
): string {
  let ll = Math.round(l * 1000) / 1000;
  const cc = Math.round(c * 1000) / 1000;
  const hh = Math.round(h);
  // 라이트는 Y 상한, 다크는 Y 하한이 제약이다.
  for (let i = 0; i < 12; i += 1) {
    const y = luminance(ll, cc, hh);
    if (mode === "light" && y > targetY) ll = Math.round((ll - 0.001) * 1000) / 1000;
    else if (mode === "dark" && y < targetY) ll = Math.round((ll + 0.001) * 1000) / 1000;
    else break;
  }
  return `oklch(${ll} ${cc} ${hh})`;
}

const rows: string[] = [];
const snippets: string[] = [];
const computed = new Map<string, { light: string[]; dark: string[] }>();

for (const preset of THEME_PRESETS) {
  const brandHue = parseOklch(preset.light.primary).h;
  const brandChroma = parseOklch(preset.light.primary).c;
  const chromaCap = Math.min(0.19, Math.max(0.07, brandChroma));

  const light = HUE_OFFSETS.map((offset, i) =>
    format(pick(LIGHT_Y[i], brandHue + offset, chromaCap), "light", LIGHT_Y[i]),
  );
  const dark = HUE_OFFSETS.map((offset, i) =>
    format(pick(DARK_Y[i], brandHue + offset, chromaCap), "dark", DARK_Y[i]),
  );

  computed.set(preset.name, { light, dark });

  snippets.push(
    `--- ${preset.name} (brand hue ${Math.round(brandHue)}, chroma cap ${chromaCap.toFixed(3)})\nlight:\n` +
      light.map((v, i) => `    "chart-${i + 1}": "${v}",`).join("\n") +
      `\ndark:\n` +
      dark.map((v, i) => `    "chart-${i + 1}": "${v}",`).join("\n"),
  );

  for (const [mode, values, fg] of [
    ["light", light, preset.light["primary-foreground"]],
    ["dark", dark, preset.dark["primary-foreground"]],
  ] as const) {
    const ratios = values.map((v) => contrastRatio(v, fg).toFixed(2));
    rows.push(`| ${preset.name} | ${mode} | ${values.join(" · ")} | ${ratios.join(" / ")} |`);
  }
}

console.log(snippets.join("\n\n"));
console.log("\n| preset | mode | chart-1..5 | text-primary-foreground 대비 |");
console.log("| --- | --- | --- | --- |");
console.log(rows.join("\n"));

// 색역 밖으로 나가지 않았는지 한 번 더(클램프가 값을 조용히 바꿨는지) 확인한다.
for (const preset of THEME_PRESETS) {
  for (const mode of ["light", "dark"] as const) {
    for (let i = 1; i <= 5; i += 1) {
      const raw = preset[mode][`chart-${i}` as "chart-1"];
      oklchToSrgb(parseOklch(raw));
    }
  }
}

/* --- `--apply`: themes/<name>.ts 와 app/globals.css 의 chart 값 라인만 치환한다. --- */
if (process.argv.includes("--apply")) {
  const { readFileSync, writeFileSync } = await import("node:fs");

  /** 텍스트 안 `prefix` 로 시작하는 5줄(chart-1..5)을 순서대로 values 로 갈아끼운다. */
  function replaceRun(text: string, pattern: RegExp, values: string[]): string {
    let index = 0;
    const out = text.replace(pattern, (match, key: string) => {
      const value = values[index % values.length];
      index += 1;
      void key;
      return match.replace(/oklch\([^)]*\)/, value);
    });
    if (index === 0) throw new Error(`치환 대상이 없다: ${pattern}`);
    return out;
  }

  for (const preset of THEME_PRESETS) {
    const values = computed.get(preset.name)!;
    const path = `themes/${preset.name}.ts`;
    const source = readFileSync(path, "utf-8");
    // light 블록 5줄 → dark 블록 5줄 순으로 등장한다.
    const next = replaceRun(source, /( *"chart-[1-5]"): "oklch\([^)]*\)"/g, [...values.light, ...values.dark]);
    writeFileSync(path, next);
  }

  let css = readFileSync("app/globals.css", "utf-8");
  const cssBlocks: [string, string[]][] = [[":root", computed.get("ocean")!.light]];
  for (const preset of THEME_PRESETS) {
    const values = computed.get(preset.name)!;
    cssBlocks.push([`[data-theme="${preset.name}"]`, values.light]);
    cssBlocks.push([`[data-theme="${preset.name}"].dark`, values.dark]);
  }
  for (const [selector, values] of cssBlocks) {
    const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const blockRe = new RegExp(`(^${escaped} \\{)([^}]*)(\\})`, "m");
    const match = css.match(blockRe);
    if (!match) throw new Error(`app/globals.css 에서 블록을 찾지 못했다: ${selector}`);
    const replaced = replaceRun(match[2], /(--chart-[1-5]): oklch\([^)]*\)/g, values);
    css = css.replace(blockRe, `$1${replaced.replace(/\$/g, "$$$$")}$3`);
  }
  writeFileSync("app/globals.css", css);
  console.log("\napplied: themes/*.ts, app/globals.css");
}
