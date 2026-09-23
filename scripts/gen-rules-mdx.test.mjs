import { describe, expect, it } from "vitest";

import { RULES_SECTIONS } from "../lib/rules-markdown.ts";
import { execFileSync } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

import { buildEnMdxSkeleton, buildKoMdx, escapeMdx } from "./gen-rules-mdx.mjs";

// vitest 는 레포 루트를 cwd 로 돌린다(vitest.config 의 root).
const SCRIPT = path.resolve(process.cwd(), "scripts/gen-rules-mdx.mjs");

/**
 * GitLab MDX 생성기 잠금 테스트 (#72).
 *
 * GL #93 이 실제로 겪은 실패 모드는 "규칙 절을 손으로 옮기다가 절이 통째로
 * 빠지는 것"이었다 — SSOT 는 19절인데 GitLab MDX 는 13절이었다. 생성기를 쓰면
 * 구조적으로 이 실패가 불가능해야 하고, 이 테스트가 그것을 잠근다.
 */
describe("gen-rules-mdx — ko MDX", () => {
  const ko = buildKoMdx(RULES_SECTIONS);
  const koHeadings = [...ko.matchAll(/^## (.+)$/gm)].map((m) => m[1]);

  it("절 수가 RULES_SECTIONS.length 와 같다", () => {
    expect(koHeadings.length).toBe(RULES_SECTIONS.length);
  });

  it("모든 절 제목 뒤에 kind 와 일치하는 마커가 붙는다", () => {
    for (const section of RULES_SECTIONS) {
      expect(koHeadings).toContain(`${section.title} [${section.kind}]`);
    }
  });

  it("절 순서가 RULES_SECTIONS 순서와 같다 — 디자인 브리프가 첫 절", () => {
    expect(koHeadings).toEqual(RULES_SECTIONS.map((s) => `${s.title} [${s.kind}]`));
  });

  it("각 절의 항목이 전부 본문에 들어간다", () => {
    for (const section of RULES_SECTIONS) {
      for (const item of section.items) {
        expect(ko, `"${section.title}" 절의 항목이 누락됐다: ${item.slice(0, 40)}...`).toContain(
          `- ${escapeMdx(item)}`,
        );
      }
    }
  });

  it("두 층 설명이 첫 절보다 앞에 온다", () => {
    const briefIndex = ko.indexOf("## 디자인 브리프");
    expect(ko.indexOf("[invariant]` — **불변**")).toBeLessThan(briefIndex);
    expect(ko.indexOf("[decision]` — **선택**")).toBeLessThan(briefIndex);
  });
});

describe("gen-rules-mdx — en MDX 골격", () => {
  const en = buildEnMdxSkeleton(RULES_SECTIONS);
  const enHeadings = [...en.matchAll(/^## (.+)$/gm)].map((m) => m[1]);

  it("절 수가 RULES_SECTIONS.length 와 같다 (제목+마커만 있어도 절이 빠지면 안 된다)", () => {
    expect(enHeadings.length).toBe(RULES_SECTIONS.length);
  });

  it("모든 절 제목 뒤에 kind 와 일치하는 마커가 붙는다", () => {
    for (const section of RULES_SECTIONS) {
      expect(enHeadings).toContain(`${section.title} [${section.kind}]`);
    }
  });

  it("본문 없는 절마다 번역 대기 표시를 남긴다", () => {
    const todoCount = (en.match(/TODO\(#72\)/g) ?? []).length;
    expect(todoCount).toBe(RULES_SECTIONS.length);
  });
});

/**
 * MDX 는 markdown 위에 JSX 를 얹은 문법이라 본문의 `<`·`{`·`}` 가 태그·표현식으로
 * 해석된다. 생성물이 실제로 MDX 로 컴파일되는지를 잠그지 않으면 "손 이관 제거"라는
 * #72 의 목적 자체가 성립하지 않는다(리뷰 F3 — 이스케이프 전에는 17줄이 깨졌다).
 */
describe("gen-rules-mdx — MDX 안전성", () => {
  const ko = buildKoMdx(RULES_SECTIONS);

  it("백틱 밖의 `<`/`{`/`}` 를 엔티티로 바꾸고 백틱 안은 원문 그대로 둔다", () => {
    expect(escapeMdx("themes/<name>.ts")).toBe("themes/&lt;name>.ts");
    expect(escapeMdx("strokeWidth={1.5}")).toBe("strokeWidth=&#123;1.5&#125;");
    expect(escapeMdx("`themes/<name>.ts`")).toBe("`themes/<name>.ts`");
    expect(escapeMdx("백틱 밖 <a> 와 백틱 안 `<b>`")).toBe("백틱 밖 &lt;a> 와 백틱 안 `<b>`");
  });

  it("본문에 백틱 밖 JSX 해석 문자가 0건이다", () => {
    const withoutCodeSpans = ko.replace(/(`+)[\s\S]*?\1/g, "");
    const offenders = withoutCodeSpans
      .split("\n")
      .filter((line) => /[<{}]/.test(line));
    expect(offenders, `MDX 로 깨지는 줄:\n${offenders.join("\n")}`).toEqual([]);
  });

  /**
   * 이 레포는 폐쇄망 전제라 MDX 컴파일러를 의존성으로 들이지 않는다. 소비처(GitLab 클론)에
   * @mdx-js/mdx 가 있으면 진짜 파서로 잠그고, 없으면 위의 구조 검사만으로 통과시킨다.
   * (2026-09-23 실측: GitLab 클론의 @mdx-js/mdx 3.1.1 로 ko 전문 compile() 통과.)
   */
  it("@mdx-js/mdx 가 있으면 실제로 컴파일된다", async () => {
    // 정적 지정자로 두면 번들러가 해석 단계에서 실패한다 — 변수로 감춰 런타임 분기로 만든다.
    const specifier = "@mdx-js/mdx";
    let compile;
    try {
      ({ compile } = await import(/* @vite-ignore */ specifier));
    } catch {
      return;
    }
    await expect(compile(ko)).resolves.toBeTruthy();
  });
});

describe("gen-rules-mdx — CLI", () => {
  const run = (args, options = {}) =>
    execFileSync(process.execPath, [SCRIPT, ...args], {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
      ...options,
    });

  it("없는 출력 디렉터리를 만들고 ko 만 쓴다", () => {
    const out = path.join(mkdtempSync(path.join(tmpdir(), "gen-rules-mdx-")), "content");
    const stdout = run([out]);

    expect(existsSync(path.join(out, "rules.mdx"))).toBe(true);
    expect(existsSync(path.join(out, "rules.en.mdx"))).toBe(false);
    expect(stdout).toContain("건너뜀");
    expect(readFileSync(path.join(out, "rules.mdx"), "utf8")).toBe(buildKoMdx(RULES_SECTIONS));
  });

  it("--en 없이는 기존 rules.en.mdx 를 건드리지 않는다", () => {
    const out = mkdtempSync(path.join(tmpdir(), "gen-rules-mdx-"));
    const enPath = path.join(out, "rules.en.mdx");
    writeFileSync(enPath, "# hand-translated\n", "utf8");

    run([out]);
    expect(readFileSync(enPath, "utf8")).toBe("# hand-translated\n");
  });

  it("--en 이어도 기존 파일이 있으면 --force 없이는 거부한다", () => {
    const out = mkdtempSync(path.join(tmpdir(), "gen-rules-mdx-"));
    const enPath = path.join(out, "rules.en.mdx");
    writeFileSync(enPath, "# hand-translated\n", "utf8");

    expect(() => run([out, "--en"])).toThrow();
    expect(readFileSync(enPath, "utf8")).toBe("# hand-translated\n");

    run([out, "--en", "--force"]);
    expect(readFileSync(enPath, "utf8")).toBe(buildEnMdxSkeleton(RULES_SECTIONS));
  });
});
