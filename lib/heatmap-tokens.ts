// 상대 경로 + 명시적 확장자 — `@/` 별칭은 tsc/Next 번들러 전용이라
// scripts/registry/sync-profile-vars.ts 가 plain `node --experimental-strip-types`
// 로 (lib/profile-registry-css-vars.ts 를 거쳐) 이 파일을 import 하면 해소되지
// 않는다. lib/risk-tokens.ts 와 같은 이유다(#36).

/**
 * matrix-heatmap 셀 강도 램프 — 단일 진실원천 (#103).
 *
 * `--chart-1~5`(범주 팔레트, #93)나 `--risk-*`(순서 있는 심각도, #81)를 재사용하지
 * 않는다 — 이 컴포넌트는 "범주 대 범주" 격자의 **연속 값 강도**를 표현해야 하고,
 * 그건 위 두 토큰 다 감당하지 못하는 세 번째 성격이다(범주 팔레트는 순서가 없고,
 * risk-* 는 딱 4단으로 고정돼 있다).
 *
 * 그래서 여기서는 값 자체(hue·chroma)가 아니라 **명도(L)와 텍스트 채널만** 토큰화
 * 한다 — 셀 배경 색상 자체는 `oklch(from var(--primary) <L> c h)` 로 실행 시점에
 * 프로필의 `--primary` 에서 파생시킨다(브랜드마다 hue/chroma 가 다르므로 여기서
 * 고정하면 프로필과 어긋난다). 이 파일이 정하는 것은:
 *
 *   1. 단계별 목표 명도(L) — 라이트 모드는 옅음→진함(0.94→0.38), 다크 모드는
 *      어두움→밝음(0.24→0.76)으로 반대 방향이다. 값이 같은 방향이면 다크 모드에서
 *      배경(`--background`, L 대략 0.15~0.22)과 옅은 셀의 구분이 사라진다.
 *   2. 단계별 텍스트 토큰 — 옅은 셀(0~2단)은 `--foreground`, 진한 셀(3~4단)은
 *      라이트에서 `--primary-foreground`, 다크에서 `--background` 를 쓴다. 이
 *      비대칭은 프리셋 8종 × 라이트/다크에서 실측한 결과다 — `--primary` 위의
 *      중간 명도대(L 0.4~0.6)는 어떤 고정 텍스트 토큰을 골라도 대비가 흔들리는
 *      구간이라(#103 스캐너 `scripts/manual/2026-09-23_issue-103_probe-*.mjs`),
 *      명도 자체를 프리셋별로 조정하는 대신 명도 단계값을 텍스트가 항상 4.5:1
 *      을 넘는 지점으로 고정했다.
 *
 * 값은 프리셋(hue)에 의존하지 않으므로 `themes/*.ts` 처럼 프리셋마다 값을 적지
 * 않고 `--risk-*`·`--sidebar-*` 와 같은 층 — `app/globals.css` 의 `:root`/`.dark`
 * 에서 한 번만 정의하고 `[data-theme="*"]` 블록이 재정의하지 않는다.
 * `lib/heatmap-tokens.test.ts` 가 실제 프리셋 8종 × 라이트/다크에서 이 약속(본문
 * 대비 4.5:1)을 기계적으로 지킨다.
 */

/** 강도 램프의 단계 수. 값 → 단계는 `matrixHeatmapStep` 이 계산한다. */
export const MATRIX_HEATMAP_STEPS = 5;

export type MatrixHeatmapStepIndex = 0 | 1 | 2 | 3 | 4;

const STEP_INDEXES: MatrixHeatmapStepIndex[] = [0, 1, 2, 3, 4];

/** `--heatmap-l-<step>` 전체 키. */
export const HEATMAP_LIGHTNESS_KEYS: string[] = STEP_INDEXES.map((step) => `heatmap-l-${step}`);

/** `--heatmap-text-<step>` 전체 키. */
export const HEATMAP_TEXT_KEYS: string[] = STEP_INDEXES.map((step) => `heatmap-text-${step}`);

/** `HEATMAP_TOKENS.light`/`.dark` 가 반드시 갖는 키 전체 — 테스트·registry 합성이 공유한다. */
export const HEATMAP_TOKEN_KEYS: string[] = [...HEATMAP_LIGHTNESS_KEYS, ...HEATMAP_TEXT_KEYS];

export type HeatmapTokens = Record<string, string>;

export const HEATMAP_TOKENS: { light: HeatmapTokens; dark: HeatmapTokens } = {
  light: {
    "heatmap-l-0": "0.94",
    "heatmap-l-1": "0.82",
    "heatmap-l-2": "0.68",
    "heatmap-l-3": "0.54",
    "heatmap-l-4": "0.38",
    "heatmap-text-0": "var(--foreground)",
    "heatmap-text-1": "var(--foreground)",
    "heatmap-text-2": "var(--foreground)",
    "heatmap-text-3": "var(--primary-foreground)",
    "heatmap-text-4": "var(--primary-foreground)",
  },
  dark: {
    "heatmap-l-0": "0.24",
    "heatmap-l-1": "0.32",
    "heatmap-l-2": "0.42",
    "heatmap-l-3": "0.62",
    "heatmap-l-4": "0.76",
    "heatmap-text-0": "var(--foreground)",
    "heatmap-text-1": "var(--foreground)",
    "heatmap-text-2": "var(--foreground)",
    "heatmap-text-3": "var(--background)",
    "heatmap-text-4": "var(--background)",
  },
};

/**
 * 값 하나를 0..(MATRIX_HEATMAP_STEPS-1) 단계로 정규화한다.
 * `max <= min` 이면(데이터가 한 값뿐이거나 비어 있으면) 항상 0단계.
 */
export function matrixHeatmapStep(value: number, min: number, max: number): MatrixHeatmapStepIndex {
  if (max <= min) return 0;
  const ratio = Math.min(1, Math.max(0, (value - min) / (max - min)));
  const step = Math.min(MATRIX_HEATMAP_STEPS - 1, Math.floor(ratio * MATRIX_HEATMAP_STEPS));
  return step as MatrixHeatmapStepIndex;
}

/** 셀 배경 — `--primary` 의 hue/chroma 를 유지한 채 단계별 목표 명도로 덮어쓴다. */
export function matrixHeatmapCellBackground(step: MatrixHeatmapStepIndex): string {
  // CSS 상대 색 문법(oklch(from ...))으로 --primary 에서 파생한다 — 리터럴 색이 아니다.
  return `oklch(from var(--primary) var(--heatmap-l-${step}) c h)`; // doksam-ui:allow-color
}

/** 셀 글자색 — 단계별로 프리셋 무관하게 4.5:1 을 넘도록 고른 토큰. */
export function matrixHeatmapCellForeground(step: MatrixHeatmapStepIndex): string {
  return `var(--heatmap-text-${step})`;
}
