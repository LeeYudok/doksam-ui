#!/usr/bin/env node --experimental-strip-types
/**
 * #81 위험등급 토큰 후보값 탐침 — 8개 프리셋 × 라이트/다크의 실제 표면
 * (background · card · muted) 위에서 후보 색이 본문 대비 4.5:1 을 넘는지,
 * 그리고 인접 등급끼리 서로 구분되는지를 표로 찍는다.
 *
 * 값을 고른 뒤에는 `lib/risk-tokens.test.ts` 가 같은 판정을 상시로 지키므로
 * 이 스크립트는 값을 다시 고를 때(등급 추가·팔레트 교체)만 돌린다.
 *
 *   node --experimental-strip-types scripts/manual/2026-09-22_issue-81_probe-risk-contrast.mjs
 */
import { contrastRatio, oklchToHex, parseOklch } from "../../lib/color-contrast.ts";
import { THEME_PRESETS } from "../../themes/index.ts";
import { RISK_LEVELS, RISK_TOKENS } from "../../lib/risk-tokens.ts";

/** 대비를 따질 불투명 표면 — border/input 은 반투명(알파) 값이라 제외한다. */
const SURFACES = ["background", "card", "muted", "secondary", "accent"];

function report(mode) {
  console.log(`\n=== ${mode} ===`);
  for (const level of RISK_LEVELS) {
    const color = RISK_TOKENS[mode][`risk-${level}`];
    const fg = RISK_TOKENS[mode][`risk-${level}-foreground`];
    let worst = Number.POSITIVE_INFINITY;
    let worstAt = "";
    for (const preset of THEME_PRESETS) {
      for (const surface of SURFACES) {
        const ratio = contrastRatio(color, preset[mode][surface]);
        if (ratio < worst) {
          worst = ratio;
          worstAt = `${preset.name}.${surface}`;
        }
      }
    }
    const onFill = contrastRatio(color, fg);
    console.log(
      `${level.padEnd(10)} ${oklchToHex(color)}  본문최저 ${worst.toFixed(2)} (${worstAt})  전경 ${onFill.toFixed(2)}`,
    );
  }

  console.log("-- 인접 등급 구분(hue 차 / L 차) --");
  for (let i = 1; i < RISK_LEVELS.length; i++) {
    const a = parseOklch(RISK_TOKENS[mode][`risk-${RISK_LEVELS[i - 1]}`]);
    const b = parseOklch(RISK_TOKENS[mode][`risk-${RISK_LEVELS[i]}`]);
    console.log(
      `${RISK_LEVELS[i - 1]} → ${RISK_LEVELS[i]}: Δhue ${Math.abs(a.h - b.h).toFixed(0)}  ΔL ${Math.abs(a.l - b.l).toFixed(3)}`,
    );
  }
}

report("light");
report("dark");
