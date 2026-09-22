import { describe, expect, it } from "vitest";

import base from "../eslint.config.mjs";
import doksam from "../tools/eslint-doksam/index.mjs";

/**
 * 카탈로그가 자기가 배포하는 표준 준수 규칙을 자신에게도 물고 있는지 잠근다 (#79).
 *
 * #40 이 규칙을 소비 프로젝트용으로 배포했고 #79 가 카탈로그의 위반 23건을 없애면서
 * eslint.config.mjs 에 물렸다. 설정에서 이게 빠지면 `pnpm lint` 는 계속 초록인 채로
 * 카탈로그만 규칙 밖으로 빠져나가고, 아무도 알아차리지 못한다 — 배포물의 근거가
 * "우리부터 지킨다" 이므로 그 상태를 테스트로 막는다.
 *
 * 실제 위반 0건 여부는 이 테스트가 아니라 `pnpm lint` 가 판정한다(설정이 물려 있으면
 * 위반은 곧 lint 에러다). 여기서는 배선만 본다.
 */
describe("카탈로그 자신의 린트 dogfood (#79)", () => {
  const names = new Set(
    base.flat().flatMap((entry) => (typeof entry?.name === "string" ? [entry.name] : [])),
  );

  it("eslint.config.mjs 가 doksam.configs.recommended 를 포함한다", () => {
    for (const config of doksam.configs.recommended) {
      expect(names, `"${config.name}" 설정이 카탈로그 eslint.config.mjs 에 없다`).toContain(
        config.name,
      );
    }
  });

  it("전 규칙이 error 로 켜져 있다 — 불변 조항이므로 warn 이 아니다", () => {
    const recommended = base
      .flat()
      .find((entry) => entry?.name === "doksam-ui/recommended");
    expect(recommended).toBeDefined();
    for (const rule of Object.keys(doksam.rules)) {
      expect(recommended?.rules?.[`doksam-ui/${rule}`]).toBe("error");
    }
  });

  it("관측 로더 예외는 app/layout.tsx 로만 좁혀져 있다 — 규칙 원문 '폐쇄망 대응' 절", () => {
    const analytics = base
      .flat()
      .find((entry) => entry?.name === "doksam-ui/catalog-analytics");
    expect(analytics, "관측 예외 설정에 이름이 없으면 범위를 추적할 수 없다").toBeDefined();
    expect(analytics?.files).toEqual(["app/layout.tsx"]);

    const [level, options] = analytics?.rules?.["doksam-ui/no-external-url"] as [
      string,
      { allow: string[] },
    ];
    expect(level).toBe("error");
    // 허용 목록은 관측 호스트만. 폰트·아이콘·이미지 CDN 이 섞이면 예외가 아니라 구멍이다.
    for (const prefix of options.allow) {
      expect(prefix).toMatch(/^https:\/\/www\.google(tagmanager|-analytics)\.com\//);
    }
  });
});
