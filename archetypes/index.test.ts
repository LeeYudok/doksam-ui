import { describe, expect, it } from "vitest";

import { APP_SHELL_SAMPLES } from "@/components/patterns/app-shell-samples";
import { LAYOUT_ARCHETYPES, DEFAULT_LAYOUT_ARCHETYPE, getLayoutArchetype } from "@/archetypes";
import { TEMPLATE_REGISTRY } from "@/lib/templates/registry";
import { BRAND_PROFILES } from "@/profiles";

const TEMPLATE_SLUGS = new Set(TEMPLATE_REGISTRY.map((t) => t.href.split("/").pop() ?? ""));
const SHELL_TITLES = new Set(APP_SHELL_SAMPLES.map((s) => s.title));

describe("LAYOUT_ARCHETYPES", () => {
  it("설계에 명시된 9종 원형을 등록한다", () => {
    expect(LAYOUT_ARCHETYPES.map((a) => a.name)).toEqual([
      "sidebar-app",
      "top-nav-site",
      "split-pane",
      "feed-timeline",
      "dashboard-grid",
      "wizard-flow",
      "chat-workspace",
      "canvas",
      "doc-reader",
    ]);
  });

  it("원형 이름은 중복되지 않는다", () => {
    const names = LAYOUT_ARCHETYPES.map((a) => a.name);
    expect(new Set(names).size).toBe(names.length);
  });

  it("모든 원형의 shell 이 실재하는 app-shell 샘플을 가리킨다", () => {
    for (const archetype of LAYOUT_ARCHETYPES) {
      expect(SHELL_TITLES.has(archetype.shell), `${archetype.name}.shell = ${archetype.shell}`).toBe(true);
    }
  });

  it("모든 원형의 대표 템플릿이 실재하는 템플릿 slug 다", () => {
    for (const archetype of LAYOUT_ARCHETYPES) {
      expect(archetype.templates.length, `${archetype.name}.templates`).toBeGreaterThan(0);
      for (const slug of archetype.templates) {
        expect(TEMPLATE_SLUGS.has(slug), `${archetype.name} → ${slug}`).toBe(true);
      }
    }
  });

  it("모든 원형이 설명·적합 성격·내비 방식·뼈대 한 줄·반례를 갖는다", () => {
    for (const archetype of LAYOUT_ARCHETYPES) {
      expect(archetype.label.length).toBeGreaterThan(0);
      expect(archetype.description.length).toBeGreaterThan(0);
      expect(archetype.navigation.length).toBeGreaterThan(0);
      expect(archetype.skeleton.length, `${archetype.name} 의 skeleton 이 비어 있다 — llms.txt 원형 표의 원천(#34)`).toBeGreaterThan(0);
      expect(archetype.suitedFor.length).toBeGreaterThan(0);
      expect(archetype.avoidWhen.length).toBeGreaterThan(0);
    }
  });

  it("DEFAULT_LAYOUT_ARCHETYPE 이 등록된 원형을 가리킨다", () => {
    expect(getLayoutArchetype(DEFAULT_LAYOUT_ARCHETYPE)).toBeDefined();
  });

  it("등록되지 않은 이름은 undefined 를 돌려준다", () => {
    expect(getLayoutArchetype("no-such-archetype")).toBeUndefined();
  });

  it("모든 브랜드 프로필의 archetype 이 실재하는 원형을 가리킨다", () => {
    for (const profile of BRAND_PROFILES) {
      if (!profile.archetype) continue;
      expect(getLayoutArchetype(profile.archetype), `${profile.name}.archetype = ${profile.archetype}`).toBeDefined();
    }
  });
});
