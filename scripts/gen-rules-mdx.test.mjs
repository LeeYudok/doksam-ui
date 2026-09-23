import { describe, expect, it } from "vitest";

import { RULES_SECTIONS } from "../lib/rules-markdown.ts";
import { buildEnMdxSkeleton, buildKoMdx } from "./gen-rules-mdx.mjs";

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
        expect(ko, `"${section.title}" 절의 항목이 누락됐다: ${item.slice(0, 40)}...`).toContain(`- ${item}`);
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
