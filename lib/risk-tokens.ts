// 상대 경로 + 명시적 확장자 — `@/` 별칭은 tsc/Next 번들러 전용이라
// scripts/registry/sync-profile-vars.ts 가 plain `node --experimental-strip-types`
// 로 (lib/profile-registry-css-vars.ts 를 거쳐) 이 파일을 import 하면 해소되지
// 않는다. lib/sidebar-tokens.ts 와 같은 이유다(#36).

/**
 * 위험 심각도 4단 시맨틱 토큰 — 단일 진실원천 (#81).
 *
 * `--gain`/`--loss`(한국식 등락색)와 같은 성격의 **도메인 토큰**이다 — 브랜드가
 * 아니라 관례가 값을 정한다. 다만 층의 위치는 다르다: gain/loss 는 `ThemeTokens`
 * 27키 안에 있고 프리셋 8종이 같은 값을 각각 적는 방식이지만(SSOT 는
 * `themes/*.ts`), risk-* 는 사이드바 chrome 과 같이 27키에서 빠져
 * `app/globals.css` 의 `:root`/`.dark` 에만 정의되고 프리셋이 재정의하지 않는다.
 * 심각도는 브랜드에 따라 달라지면 안 되는 층이므로, 프리셋마다 값을 적어 두고
 * 같기를 바라는 것보다 아예 프리셋이 손댈 수 없는 자리에 두는 쪽이 맞다
 * (forest 테마에서 "경보" 가 초록이 되면 안 된다).
 *
 * 왜 `--chart-1~5` 가 아닌가: chart 토큰은 **범주(category)** 구분용 팔레트이고
 * 실제로 한 색상 띠 안에 모여 있다(기본 테마 hue 262/220/200/290/235 — #93).
 * 위험 등급은 범주가 아니라 **순서 있는 심각도**라 의미도, 색 배치의 요건도
 * 다르다. 같은 화면에서 등급 색과 계열 색이 같은 토큰을 쓰면 둘 중 하나는
 * 반드시 오독된다.
 *
 * 이름에 등급 번호(`--risk-1`)를 쓰지 않는다 — 몇 단계로 나눌지는 프로젝트가
 * 정하는 선택이라(lib/rules-markdown.ts "위험 심각도 표기" 절) 3단만 쓰는
 * 프로젝트가 `low`/`high`/`severe` 를 고를 수 있어야 한다.
 *
 * 값의 근거: 초록 → 황갈 → 주황 → 빨강의 순서 있는 hue 램프. 네 등급의 L 은
 * 모드별로 같게 두고(라이트 0.45 · 다크 0.74) 등급 차이를 hue 하나로만 싣는다 —
 * 밝기까지 같이 움직이면 어떤 등급은 대비가 기준 밑으로 떨어진다. 이 값은
 * 프리셋 8종의 불투명 표면 5종(background · card · muted · secondary · accent)
 * 전부에서 **본문 대비 4.5:1** 을 넘는다(라이트 최저 4.66 · 다크 최저 4.99).
 * 노랑 계열이 황갈색으로 어두워지는 것은 WCAG 를 만족하는 노랑의 불가피한
 * 모습이다. `lib/risk-tokens.test.ts` 가 이 판정을 기계적으로 지키고, 후보값
 * 탐침은 `scripts/manual/2026-09-22_issue-81_probe-risk-contrast.mjs` 에 있다.
 *
 * hue 하나로만 구분되므로 **색각 이상 사용자에게는 등급 차가 전달되지 않는다** —
 * 등급 표기는 반드시 텍스트·아이콘 등 두 번째 채널을 같이 싣는다(접근성 절의
 * 불변 규칙).
 *
 * `-foreground` 는 **solid 채움 위 글자색**이다. tint 배경(`riskTintBackground`)에
 * 얹는 글자는 foreground 가 아니라 값 토큰 자신을 쓰는데, 위 4.5:1 이 그 용법을
 * 그대로 보장하지는 **않는다** — tint 면은 backdrop 이 글자색 쪽으로 14% 끌려와
 * 대비가 내려가므로 별도 판정이 필요하다(#81 리뷰 finding 1). 그래서 tint 용법은
 * `RISK_TINT_SAFE_SURFACES` 위에서만 약속하고, 이미 틴트된 표면(accent·secondary)
 * 위에서는 solid 채움을 쓴다. 이 약속도 `lib/risk-tokens.test.ts` 가 합성색을
 * 실제로 계산해서 지킨다.
 */

/** 심각도 오름차순. 이 순서가 곧 등급 순서다(정상 → 경보). */
export const RISK_LEVELS = ["low", "moderate", "high", "severe"] as const;

export type RiskLevel = (typeof RISK_LEVELS)[number];

/** `--risk-<level>` + `--risk-<level>-foreground` 전체 키 — 테스트·registry 합성이 공유한다. */
export const RISK_TOKEN_KEYS: string[] = RISK_LEVELS.flatMap((level) => [
  `risk-${level}`,
  `risk-${level}-foreground`,
]);

export type RiskTokens = Record<string, string>;

export const RISK_TOKENS: { light: RiskTokens; dark: RiskTokens } = {
  light: {
    "risk-low": "oklch(0.45 0.13 152)",
    "risk-low-foreground": "oklch(0.98 0.01 152)",
    "risk-moderate": "oklch(0.45 0.11 85)",
    "risk-moderate-foreground": "oklch(0.98 0.01 85)",
    "risk-high": "oklch(0.45 0.15 48)",
    "risk-high-foreground": "oklch(0.98 0.01 48)",
    "risk-severe": "oklch(0.45 0.2 27)",
    "risk-severe-foreground": "oklch(0.98 0.01 27)",
  },
  dark: {
    "risk-low": "oklch(0.74 0.15 152)",
    "risk-low-foreground": "oklch(0.15 0.02 152)",
    "risk-moderate": "oklch(0.74 0.12 85)",
    "risk-moderate-foreground": "oklch(0.15 0.02 85)",
    "risk-high": "oklch(0.74 0.15 48)",
    "risk-high-foreground": "oklch(0.15 0.02 48)",
    "risk-severe": "oklch(0.74 0.18 27)",
    "risk-severe-foreground": "oklch(0.15 0.02 27)",
  },
};

/**
 * tint 면의 값 토큰 비율. 이 숫자를 올리면 tint 배경이 글자색에 가까워져
 * 대비가 내려간다 — 바꾸면 `lib/risk-tokens.test.ts` 의 tint 게이트가 먼저 깨진다.
 */
export const RISK_TINT_PERCENT = 14;

/** 위 비율을 0..1 로 — 대비 계산(합성 알파)이 쓴다. */
export const RISK_TINT_RATIO = RISK_TINT_PERCENT / 100;

/**
 * tint 배경 위 본문 글자의 4.5:1 을 약속하는 표면. 이미 자기 자신이 틴트된
 * 표면(accent·secondary)은 여기 없다 — 그 위에서는 tint 를 겹치지 않고 solid
 * 채움을 쓴다(#81 리뷰 finding 1의 실측: ocean 라이트 accent 위 risk-low tint 는
 * 3.86:1 로 미달).
 */
export const RISK_TINT_SAFE_SURFACES = ["background", "card", "muted"] as const;

/** tint 배경의 CSS 값 — 페이지와 테스트가 같은 문자열을 쓰도록 여기서 만든다. */
export function riskTintBackground(level: RiskLevel): string {
  return `color-mix(in oklch, var(--risk-${level}) ${RISK_TINT_PERCENT}%, transparent)`;
}

/** 각 등급이 무엇을 뜻하는지 — /tokens 스와치 설명과 문서가 공유한다. */
export const RISK_LEVEL_DESCRIPTIONS: Record<RiskLevel, string> = {
  low: "정상 — 조치가 필요 없는 기본 상태",
  moderate: "관찰 — 추세를 지켜보는 단계",
  high: "주의 — 담당자 확인이 필요한 단계",
  severe: "경보 — 즉시 조치가 필요한 최고 단계",
};
