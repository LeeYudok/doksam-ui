import { describe, expect, it } from "vitest";

import { contrastRatio, oklchToHex, parseOklch } from "@/lib/color-contrast";
import {
  RISK_LEVELS,
  RISK_LEVEL_DESCRIPTIONS,
  RISK_TOKENS,
  RISK_TOKEN_KEYS,
  type RiskLevel,
} from "@/lib/risk-tokens";
import { THEME_PRESETS, THEME_TOKEN_KEYS } from "@/themes";

/**
 * 위험등급 토큰의 약속을 기계적으로 지킨다 (#81).
 *
 * 이 토큰의 존재 이유가 "프리셋이 무엇이든 같은 심각도를 같은 색으로, 읽히게"
 * 이므로 그 두 가지를 테스트가 지켜야 한다 — 값이 바뀌면(등급 추가, 팔레트
 * 교체) 여기서 먼저 깨진다.
 */

/** 대비를 따질 표면 — 반투명 토큰(border/input, `oklch(... / 12%)`)은 알파 합성이라 제외한다. */
const OPAQUE_SURFACES = ["background", "card", "muted", "secondary", "accent"] as const;

/** WCAG 2.x AA 본문 기준. */
const AA_TEXT = 4.5;

const MODES = ["light", "dark"] as const;

describe("위험등급 토큰 구조", () => {
  it("등급은 심각도 오름차순 4단이다", () => {
    expect(RISK_LEVELS).toEqual(["low", "moderate", "high", "severe"]);
  });

  it("키는 등급마다 값 토큰 + 전경 토큰 쌍이다", () => {
    expect(RISK_TOKEN_KEYS).toEqual([
      "risk-low",
      "risk-low-foreground",
      "risk-moderate",
      "risk-moderate-foreground",
      "risk-high",
      "risk-high-foreground",
      "risk-severe",
      "risk-severe-foreground",
    ]);
  });

  it.each(MODES)("%s 가 키 전체를 OKLCH 로 정의한다", (mode) => {
    for (const key of RISK_TOKEN_KEYS) {
      expect(RISK_TOKENS[mode][key], `${mode}.${key} 가 없다`).toMatch(/^oklch\(/);
    }
    expect(Object.keys(RISK_TOKENS[mode]).sort()).toEqual([...RISK_TOKEN_KEYS].sort());
  });

  it("등급 이름에 번호를 쓰지 않는다 — 단계 수는 프로젝트가 정한다", () => {
    for (const level of RISK_LEVELS) expect(level).not.toMatch(/\d/);
  });

  it("등급마다 설명이 있다", () => {
    for (const level of RISK_LEVELS) expect(RISK_LEVEL_DESCRIPTIONS[level]).toBeTruthy();
  });

  it("themes/*.ts 의 27키와 겹치지 않는다 — 프리셋 토큰이 아니라 별도 층이다", () => {
    for (const key of RISK_TOKEN_KEYS) {
      expect(THEME_TOKEN_KEYS as string[]).not.toContain(key);
    }
  });
});

describe("위험등급 토큰 대비 (프리셋 8종 × 라이트/다크)", () => {
  const cases = MODES.flatMap((mode) => RISK_LEVELS.map((level) => ({ mode, level })));

  it.each(cases)(
    "$mode · $level 은 모든 프리셋의 불투명 표면 위에서 본문 대비를 넘는다",
    ({ mode, level }: { mode: (typeof MODES)[number]; level: RiskLevel }) => {
      const color = RISK_TOKENS[mode][`risk-${level}`];
      for (const preset of THEME_PRESETS) {
        for (const surface of OPAQUE_SURFACES) {
          const ratio = contrastRatio(color, preset[mode][surface]);
          expect(
            ratio,
            `${mode}/${level}(${oklchToHex(color)}) on ${preset.name}.${surface} = ${ratio.toFixed(2)}`,
          ).toBeGreaterThanOrEqual(AA_TEXT);
        }
      }
    },
  );

  it.each(cases)(
    "$mode · $level 의 전경 토큰은 solid 채움 위에서 본문 대비를 넘는다",
    ({ mode, level }: { mode: (typeof MODES)[number]; level: RiskLevel }) => {
      const ratio = contrastRatio(RISK_TOKENS[mode][`risk-${level}`], RISK_TOKENS[mode][`risk-${level}-foreground`]);
      expect(ratio, `${mode}/${level} fill↔foreground = ${ratio.toFixed(2)}`).toBeGreaterThanOrEqual(AA_TEXT);
    },
  );
});

describe("위험등급 램프의 모양", () => {
  it.each(MODES)("%s 의 네 등급은 hue 로만 갈리고 밝기는 같다", (mode) => {
    const lightnesses = RISK_LEVELS.map((level) => parseOklch(RISK_TOKENS[mode][`risk-${level}`]).l);
    expect(new Set(lightnesses).size, `L 이 등급마다 다르다: ${lightnesses.join(", ")}`).toBe(1);
  });

  it.each(MODES)("%s 의 인접 등급은 hue 가 충분히 떨어져 있다", (mode) => {
    for (let i = 1; i < RISK_LEVELS.length; i++) {
      const prev = parseOklch(RISK_TOKENS[mode][`risk-${RISK_LEVELS[i - 1]}`]);
      const next = parseOklch(RISK_TOKENS[mode][`risk-${RISK_LEVELS[i]}`]);
      const delta = Math.abs(prev.h - next.h);
      expect(delta, `${RISK_LEVELS[i - 1]} → ${RISK_LEVELS[i]} Δhue = ${delta}`).toBeGreaterThanOrEqual(20);
    }
  });

  it.each(MODES)("%s 는 초록에서 빨강으로 내려가는 단조 hue 램프다", (mode) => {
    const hues = RISK_LEVELS.map((level) => parseOklch(RISK_TOKENS[mode][`risk-${level}`]).h);
    for (let i = 1; i < hues.length; i++) {
      expect(hues[i], `${RISK_LEVELS[i]} 의 hue 가 앞 등급보다 크다`).toBeLessThan(hues[i - 1]);
    }
    expect(hues[0]).toBeGreaterThan(100); // 정상 = 초록 계열
    expect(hues.at(-1)).toBeLessThan(40); // 경보 = 빨강 계열
  });
});
