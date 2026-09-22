/**
 * OKLCH 토큰 값의 WCAG 대비비를 계산한다 (#81).
 *
 * 이 저장소의 색 토큰은 전부 `oklch(L C H)` 문자열이고(themes/*.ts ·
 * lib/sidebar-tokens.ts · lib/risk-tokens.ts), 브라우저 없이도 "이 토큰을 저
 * 배경 위에 글자로 올렸을 때 읽히는가" 를 판정할 수 있어야 테스트가 대비를
 * 지킬 수 있다. 의존성을 늘리지 않으려고(의존성 규율 절) 변환을 직접 구현한다.
 *
 * 변환 경로: OKLCH → OKLab → LMS → 선형 sRGB → (감마·클램프) → 상대휘도 →
 * WCAG 2.x 대비비. 색역을 벗어나는 값은 sRGB 채널에서 클램프한 뒤 다시
 * 선형화한다 — 실제 화면에 찍히는 색이 클램프된 값이기 때문이다.
 */

/** OKLCH 문자열 파싱 결과. 알파는 계산에 쓰지 않지만 파싱은 해 둔다. */
export interface Oklch {
  l: number;
  c: number;
  h: number;
  alpha: number;
}

/**
 * 크로마 자리에는 `%` 를 받지 않는다 — CSS Color 4 에서 oklch 의 C 퍼센트는
 * 100% = 0.4 기준이라 L·알파의 100% = 1 과 규칙이 다르다. 이 저장소의 토큰은
 * 251개 전부 C 를 수로 적으므로, 허용해서 조용히 2.5배 틀린 색을 계산하는 쪽보다
 * 던지는 쪽이 맞다(#81 리뷰 finding 3).
 */
const OKLCH_RE =
  /^oklch\(\s*([\d.]+%?)\s+([\d.]+)\s+([\d.]+)(?:deg)?\s*(?:\/\s*([\d.]+%?)\s*)?\)$/i;

/** `12%` → 0.12, `0.55` → 0.55. L·알파 전용(100% = 1). */
function toUnit(raw: string): number {
  return raw.endsWith("%") ? Number.parseFloat(raw) / 100 : Number.parseFloat(raw);
}

/**
 * `oklch(0.55 0.21 26)` · `oklch(1 0 0 / 12%)` 를 파싱한다.
 * 이 저장소가 쓰지 않는 표기(색상 함수 중첩, `none` 등)는 지원하지 않고 던진다 —
 * 조용히 0 으로 떨어지면 대비 테스트가 통과해 버린다.
 */
export function parseOklch(value: string): Oklch {
  const match = OKLCH_RE.exec(value.trim());
  if (!match) throw new Error(`OKLCH 문자열로 파싱할 수 없다: ${value}`);
  return {
    l: toUnit(match[1]),
    c: toUnit(match[2]),
    h: Number.parseFloat(match[3]),
    alpha: match[4] === undefined ? 1 : toUnit(match[4]),
  };
}

/** sRGB 채널 하나를 선형화한다(WCAG 2.x 정의). */
function linearize(channel: number): number {
  return channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
}

/** 선형 채널 하나를 sRGB 로 감마 인코딩한다. */
function gammaEncode(channel: number): number {
  return channel <= 0.0031308 ? channel * 12.92 : 1.055 * channel ** (1 / 2.4) - 0.055;
}

function clamp01(value: number): number {
  return Math.min(1, Math.max(0, value));
}

/** OKLCH → sRGB 채널 3개(각 0..1, 색역 밖은 클램프). */
export function oklchToSrgb({ l, c, h }: Oklch): [number, number, number] {
  const rad = (h * Math.PI) / 180;
  const a = c * Math.cos(rad);
  const b = c * Math.sin(rad);

  const lms = [
    (l + 0.3963377774 * a + 0.2158037573 * b) ** 3,
    (l - 0.1055613458 * a - 0.0638541728 * b) ** 3,
    (l - 0.0894841775 * a - 1.291485548 * b) ** 3,
  ];

  const linear: [number, number, number] = [
    4.0767416621 * lms[0] - 3.3077115913 * lms[1] + 0.2309699292 * lms[2],
    -1.2684380046 * lms[0] + 2.6097574011 * lms[1] - 0.3413193965 * lms[2],
    -0.0041960863 * lms[0] - 0.7034186147 * lms[1] + 1.707614701 * lms[2],
  ];

  return [clamp01(gammaEncode(linear[0])), clamp01(gammaEncode(linear[1])), clamp01(gammaEncode(linear[2]))];
}

/** sRGB 채널 3개(0..1)의 WCAG 상대휘도. */
export function srgbLuminance([r, g, b]: readonly [number, number, number]): number {
  return 0.2126 * linearize(r) + 0.7152 * linearize(g) + 0.0722 * linearize(b);
}

/** WCAG 상대휘도. 입력은 불투명 OKLCH 문자열. */
export function relativeLuminance(color: string): number {
  return srgbLuminance(oklchToSrgb(parseOklch(color)));
}

/** 두 상대휘도의 WCAG 2.x 대비비(1 ~ 21). 순서는 무관하다. */
function ratioOf(la: number, lb: number): number {
  const [hi, lo] = la >= lb ? [la, lb] : [lb, la];
  return (hi + 0.05) / (lo + 0.05);
}

/** 이미 합성된 sRGB 채널 쌍의 대비비 — `compositeOver` 결과를 판정할 때 쓴다. */
export function srgbContrastRatio(
  a: readonly [number, number, number],
  b: readonly [number, number, number],
): number {
  return ratioOf(srgbLuminance(a), srgbLuminance(b));
}

/**
 * 색 하나를 알파로 backdrop 위에 합성한 sRGB 채널을 돌려준다 —
 * `color-mix(in oklch, var(--x) 14%, transparent)` 같은 tint 면의 **실제로
 * 화면에 찍히는 색**이다. 합성은 브라우저 합성기와 같이 sRGB 공간에서 한다.
 *
 * tint 배경은 backdrop 이 글자색 쪽으로 끌려오므로 대비가 반드시 내려간다 —
 * 불투명 토큰끼리의 대비를 통과했다는 사실이 tint 용법으로 전이되지 않는다
 * (#81 리뷰 finding 1). 그 용법을 약속하려면 이 함수로 따로 판정해야 한다.
 */
export function compositeOver(
  color: string,
  alpha: number,
  backdrop: string,
): [number, number, number] {
  if (alpha < 0 || alpha > 1) throw new Error(`알파가 0..1 밖이다: ${alpha}`);
  const fg = oklchToSrgb(parseOklch(color));
  const bd = oklchToSrgb(parseOklch(backdrop));
  return [0, 1, 2].map((i) => fg[i] * alpha + bd[i] * (1 - alpha)) as [number, number, number];
}

/**
 * 두 OKLCH 색의 WCAG 2.x 대비비(1 ~ 21). 순서는 무관하다.
 *
 * 반투명 값(`oklch(1 0 0 / 12%)` 같은 border·input 토큰)은 **던진다** — 알파를
 * 무시하고 불투명으로 계산하면 파싱은 되는데 의미가 다른 입력이 조용히 통과해
 * 실제 렌더링보다 낙관적인 숫자를 내놓는다(#81 리뷰 finding 2). 반투명 면이
 * 필요하면 `compositeOver` 로 backdrop 위에 합성한 뒤 `srgbContrastRatio` 를
 * 쓴다.
 */
export function contrastRatio(a: string, b: string): number {
  for (const value of [a, b]) {
    const { alpha } = parseOklch(value);
    if (alpha !== 1) {
      throw new Error(`반투명 색은 대비를 직접 판정할 수 없다(compositeOver 를 쓸 것): ${value}`);
    }
  }
  return ratioOf(relativeLuminance(a), relativeLuminance(b));
}

/** OKLCH 색을 `#rrggbb` 로. 대비 실패 메시지를 사람이 읽을 수 있게 하려고 쓴다. */
export function oklchToHex(color: string): string {
  const channels = oklchToSrgb(parseOklch(color));
  return `#${channels.map((ch) => Math.round(ch * 255).toString(16).padStart(2, "0")).join("")}`;
}
