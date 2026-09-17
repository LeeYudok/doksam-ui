import { readFileSync } from "node:fs";
import { readdirSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { profileScopeAttributes } from "@/components/profile-scope";
import { getPersonalityPreset } from "@/personalities";
import { BRAND_PROFILES, getBrandProfile } from "@/profiles";

const TEMPLATES_DIR = "app/templates";

/** 레이아웃 소스에서 profileScopeAttributes("x") 의 x 를 뽑는다. */
function scopedProfileOf(source: string): string | undefined {
  return source.match(/profileScopeAttributes\("([\w-]+)"\)/)?.[1];
}

describe("profileScopeAttributes", () => {
  it("프로필의 전 축을 data-* 속성으로 방출한다 (#47)", () => {
    for (const profile of BRAND_PROFILES) {
      const attributes = profileScopeAttributes(profile.name);
      const personality = getPersonalityPreset(profile.personality)!;

      expect(attributes, profile.name).toEqual({
        "data-theme": profile.theme,
        "data-font": profile.font,
        "data-density": profile.density,
        "data-corner": profile.corner,
        "data-type-contrast": profile.typeContrast,
        "data-personality": personality.scale,
        "data-personality-surface": personality.surface,
        "data-personality-motion": personality.motion,
      });
    }
  });

  /**
   * 반경은 data-corner 가 소유한다 — app/globals.css 의 [data-corner] 블록이
   * --radius 와 파생값을 함께 재계산하므로 인라인 --radius 를 같이 내보내면
   * 같은 값을 두 곳에서 말하는 중복이 된다.
   */
  it("--radius 인라인 스타일을 방출하지 않는다", () => {
    for (const profile of BRAND_PROFILES) {
      expect(Object.keys(profileScopeAttributes(profile.name))).not.toContain("style");
    }
  });

  it("레지스트리에 없는 프로필 이름은 즉시 실패한다", () => {
    expect(() => profileScopeAttributes("nope")).toThrow(/알 수 없는 프로필/);
  });
});

describe("템플릿 레이아웃 프로필 스코프", () => {
  const layouts = readdirSync(TEMPLATES_DIR, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && !entry.name.startsWith("_"))
    .map((entry) => ({ slug: entry.name, file: join(TEMPLATES_DIR, entry.name, "layout.tsx") }))
    .flatMap((candidate) => {
      try {
        return [{ ...candidate, source: readFileSync(candidate.file, "utf8") }];
      } catch {
        // 블루프린트 템플릿(docker-container · kubernetes-firewall)은 브랜드
        // 프로필이 아니라 스코프 CSS 모듈로 룩을 캡슐화하므로 layout.tsx 가 없다.
        return [];
      }
    });

  it("레이아웃이 있는 템플릿은 모두 헬퍼로 프로필을 스코프한다 (#47)", () => {
    for (const { slug, source } of layouts) {
      const scoped = scopedProfileOf(source);
      expect(scoped, `${slug}: profileScopeAttributes 호출 없음`).toBeDefined();
      expect(getBrandProfile(scoped!), `${slug}: 알 수 없는 프로필 ${scoped}`).toBeDefined();
    }
  });

  /**
   * 축을 손으로 적는 순간 다시 어긋난다 — data-theme/data-font 만 적고 밀도·모서리·
   * 타입 대비·성격을 빠뜨린 것이 #47 의 원인이다.
   */
  it("레이아웃이 프로필 축 속성을 손으로 적지 않는다", () => {
    for (const { slug, source } of layouts) {
      // 주석 안에는 globals.css 선택자 예시([data-theme="slate"] 등)가 남아 있어
      // 먼저 걷어낸 뒤 실제 JSX 속성만 본다.
      const code = source.replaceAll(/\/\*[\s\S]*?\*\//g, "").replaceAll(/\/\/[^\n]*/g, "");
      const handWritten = code.match(
        /\b(data-theme|data-font|data-density|data-corner|data-type-contrast|data-personality)=/g,
      );
      expect(handWritten, `${slug}: 수기 축 속성 ${handWritten?.join(", ")}`).toBeNull();
    }
  });
});
