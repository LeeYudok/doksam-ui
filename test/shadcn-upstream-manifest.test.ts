import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

/**
 * shadcn 상류 차이 매니페스트 검증 (#48).
 *
 * 배경: 규칙은 오래도록 `components/ui/` 를 "손대지 않은 shadcn CLI 원본" 으로
 * 취급했지만, 실측 결과 60개 중 56개가 상류와 의미 있게 다르다. 컨트롤을 한 단계
 * 축소하고 반경을 토큰화한 하우스 스타일이며, #43 의 밀도·모서리 축이 그 값을
 * 전제한다. 즉 되돌리면 축이 깨진다.
 *
 * 그래서 "수정 금지" 가 아니라 "기록하고 검증한다" 로 바꿨다. 이 테스트는 그 기록이
 * 비지 않도록 지킨다 — 상류와의 실제 대조는 네트워크가 필요하므로
 * `scripts/shadcn-upstream.mjs` 수동 게이트가 담당한다(폐쇄망 전제라 테스트에서
 * 외부 fetch 를 하지 않는다).
 */
const REPO_ROOT = path.resolve(__dirname, "..");
const UI_DIR = path.join(REPO_ROOT, "components", "ui");
const MANIFEST_PATH = path.join(UI_DIR, "upstream.manifest.json");

interface Manifest {
  style: string;
  checkedAt: string | null;
  components: Record<string, { upstream: string | null; localHash: string; customized?: boolean; note: string }>;
  houseStyle: Record<string, { what: string; why: string; examples: string[] }>;
}

const manifest = JSON.parse(readFileSync(MANIFEST_PATH, "utf8")) as Manifest;
const componentFiles = readdirSync(UI_DIR)
  .filter((f) => f.endsWith(".tsx") || f.endsWith(".ts"))
  .sort();

describe("shadcn 상류 매니페스트", () => {
  it("components/ui 의 모든 파일이 기록돼 있다", () => {
    for (const file of componentFiles) {
      expect(
        manifest.components[file],
        `${file} 이 매니페스트에 없다 — 컴포넌트를 추가했으면 node scripts/shadcn-upstream.mjs --update 를 돌려라`,
      ).toBeDefined();
    }
  });

  it("매니페스트에 실재하지 않는 파일이 남아 있지 않다", () => {
    const present = new Set(componentFiles);
    for (const file of Object.keys(manifest.components)) {
      expect(present.has(file), `${file} 은 삭제됐는데 매니페스트에 남아 있다`).toBe(true);
    }
  });

  it("기준 스타일과 점검일이 기록돼 있다", () => {
    expect(manifest.style.length).toBeGreaterThan(0);
    expect(manifest.checkedAt, "점검일이 없다 — 언제 기준인지 모르면 드리프트 판정이 무의미하다").toMatch(
      /^\d{4}-\d{2}-\d{2}$/,
    );
  });

  /**
   * 차이가 있다는 사실만 기록하면 다음 작업자가 "되돌려도 되는 차이" 인지 알 수 없다.
   * 되돌리면 안 되는 이유가 적혀 있어야 기록이 제 역할을 한다.
   */
  it("체계적 차이마다 무엇을·왜 가 적혀 있다", () => {
    const groups = Object.entries(manifest.houseStyle);
    expect(groups.length, "houseStyle 이 비어 있다").toBeGreaterThan(0);
    for (const [name, group] of groups) {
      expect(group.what?.length, `${name}.what 이 비었다`).toBeGreaterThan(0);
      expect(group.why?.length, `${name}.why 가 비었다`).toBeGreaterThan(0);
      expect(group.examples?.length, `${name}.examples 가 비었다`).toBeGreaterThan(0);
      for (const example of group.examples) {
        expect(manifest.components[example], `${name}.examples 의 ${example} 이 실재하지 않는다`).toBeDefined();
      }
    }
  });

  it("커스터마이즈된 파일이 실제로 존재한다 — 기록이 현실과 맞는지 확인", () => {
    const customized = Object.values(manifest.components).filter((c) => c.customized);
    expect(
      customized.length,
      "커스터마이즈가 0건이면 이 매니페스트 자체가 불필요하다 — 실측과 어긋난 것이다",
    ).toBeGreaterThan(0);
  });
});
