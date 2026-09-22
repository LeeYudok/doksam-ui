import path from "node:path";

import { ESLint } from "eslint";
import { describe, expect, it } from "vitest";

import doksam from "../tools/eslint-doksam/index.mjs";

/**
 * 카탈로그가 자기가 배포하는 표준 준수 규칙을 자신에게도 물고 있는지 잠근다 (#79).
 *
 * #40 이 규칙을 소비 프로젝트용으로 배포했고 #79 가 카탈로그의 위반 23건을 없애면서
 * eslint.config.mjs 에 물렸다. 설정에서 이게 빠지면 `pnpm lint` 는 계속 초록인 채로
 * 카탈로그만 규칙 밖으로 빠져나가고, 아무도 알아차리지 못한다 — 배포물의 근거가
 * "우리부터 지킨다" 이므로 그 상태를 테스트로 막는다.
 *
 * **설정 배열을 이름으로 뒤져 보지 않는다.** flat config 는 뒤 블록이 앞을 덮으므로
 * 맨 뒤에 `{ rules: { "doksam-ui/no-hardcoded-color": "off" } }` 한 줄만 붙여도 규칙은
 * 꺼지는데 블록 자체는 그대로 남는다. 그래서 ESLint 가 파일마다 **최종 해석한** 설정
 * (`calculateConfigForFile`)을 본다 — `eslint --print-config` 와 같은 결과다.
 *
 * 실제 위반 0건 여부는 이 테스트가 아니라 `pnpm lint` 가 판정한다. 여기서는 배선만 본다.
 */
describe("카탈로그 자신의 린트 dogfood (#79)", () => {
  const root = path.resolve(__dirname, "..");
  const eslint = new ESLint({
    cwd: root,
    // 레포의 실제 설정 파일을 그대로 읽는다 — 이 테스트의 요점이 "카탈로그가
    // 무엇을 물고 있나" 이므로 설정을 여기서 재구성하면 의미가 없다.
    overrideConfigFile: path.join(root, "eslint.config.mjs"),
  });
  const ruleNames = Object.keys(doksam.rules);

  /** 그 파일에 최종 적용되는 doksam-ui 규칙 설정. */
  async function resolvedRules(file: string) {
    const config = (await eslint.calculateConfigForFile(file)) as {
      rules: Record<string, unknown>;
    };
    return config.rules;
  }

  it("일반 소스 파일에 전 규칙이 error 로 적용된다 — 불변 조항이므로 warn 이 아니다", async () => {
    const rules = await resolvedRules("components/relation-network.tsx");
    for (const name of ruleNames) {
      const entry = rules[`doksam-ui/${name}`];
      const level = Array.isArray(entry) ? entry[0] : entry;
      // ESLint 는 해석 결과를 숫자 심각도로 돌려준다 — 2 = error.
      expect(level, `doksam-ui/${name} 이 error 로 적용되지 않는다`).toBe(2);
    }
  });

  it("관측 로더 예외는 app/layout.tsx 에만 적용된다 — 규칙 원문 '폐쇄망 대응' 절", async () => {
    const [, options] = (await resolvedRules("app/layout.tsx"))["doksam-ui/no-external-url"] as [
      number,
      { allow: string[] },
    ];
    // 소스에 글자로 적히는 로더 호스트 하나만. 목록이 늘어나면 여기서 막힌다.
    expect(options.allow).toEqual(["https://www.googletagmanager.com/"]);
  });

  it("다른 파일에는 그 예외가 새지 않는다", async () => {
    const entry = (await resolvedRules("app/page.tsx"))["doksam-ui/no-external-url"];
    // 옵션 없이 error 이거나, 옵션이 있더라도 allow 가 비어 있어야 한다.
    const options = Array.isArray(entry) ? (entry[1] as { allow?: string[] } | undefined) : undefined;
    expect(options?.allow ?? []).toEqual([]);
  });

  it("색 규칙을 끄는 자리는 토큰 정의·테스트로만 좁혀져 있다", async () => {
    const levelOf = (entry: unknown) => (Array.isArray(entry) ? entry[0] : entry);

    const theme = await resolvedRules("themes/index.ts");
    expect(levelOf(theme["doksam-ui/no-hardcoded-color"])).toBe(0);

    // 화면 코드에서는 꺼지지 않는다.
    const screen = await resolvedRules("app/templates/brokerage/page.tsx");
    expect(levelOf(screen["doksam-ui/no-hardcoded-color"])).toBe(2);
  });
});
