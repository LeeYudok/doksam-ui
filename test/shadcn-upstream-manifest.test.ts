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
  components: Record<
    string,
    { upstream: string | null; localHash: string; customized?: boolean; groups?: string[]; note: string }
  >;
  houseStyle: Record<string, { what: string; why: string; examples: string[] }>;
  installDiff?: { measuredAt: string; how: string; meaning?: string; files: Record<string, string> };
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

  /**
   * 기준 스타일이 components.json 과 다르면 이 게이트는 **다른 스타일의 파일과 대조**한다.
   * 실제로 new-york-v4 로 대조하던 동안 60개 중 52개가 "커스터마이즈" 로 잡혔지만,
   * 같은 프리셋으로 설치해 보면 다른 것은 6개뿐이었다 (#57).
   */
  it("기준 스타일이 components.json 의 style 과 같다", () => {
    const components = JSON.parse(readFileSync(path.join(REPO_ROOT, "components.json"), "utf8")) as { style: string };
    expect(manifest.style).toBe(components.style);
  });

  it("실제 설치본과의 차이가 측정돼 기록돼 있다 — 원문 해시 비교만으로는 CLI 치환과 구분되지 않는다", () => {
    expect(manifest.installDiff?.measuredAt, "installDiff.measuredAt 이 없다").toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(manifest.installDiff?.how?.length ?? 0).toBeGreaterThan(0);
    for (const [file, why] of Object.entries(manifest.installDiff?.files ?? {})) {
      expect(manifest.components[file], `installDiff 의 ${file} 이 실재하지 않는다`).toBeDefined();
      expect(why.length, `${file} 의 사유가 비었다`).toBeGreaterThan(0);
    }
  });

  it("점검일이 기록돼 있다", () => {
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

  /**
   * 차이가 있다는 사실만 기록하면 6개월 뒤 누가 그 차이를 보고 "되돌려도 되나" 를
   * 물을 때 매니페스트가 답을 못 한다. 자동 생성 플레이스홀더가 사유 자리를 채우고
   * 있으면 기록이 있는 척만 하는 것이다(#48 리뷰 C1).
   */
  it("커스터마이즈된 파일마다 분류 또는 사유가 있다", () => {
    for (const [file, entry] of Object.entries(manifest.components)) {
      if (!entry.customized) continue;
      const hasGroups = (entry.groups ?? []).length > 0;
      const hasNote = entry.note.trim().length > 0;
      expect(hasGroups || hasNote, `${file} 에 groups 도 note 도 없다`).toBe(true);
      expect(entry.note, `${file} 의 note 가 플레이스홀더다 — 실제 사유를 적어라`).not.toMatch(
        /이유를 여기에 적는다/,
      );
    }
  });

  it("분류에 쓰인 그룹 이름이 houseStyle 에 정의돼 있다", () => {
    const defined = new Set(Object.keys(manifest.houseStyle));
    for (const [file, entry] of Object.entries(manifest.components)) {
      for (const group of entry.groups ?? []) {
        expect(defined.has(group), `${file} 의 그룹 "${group}" 이 houseStyle 에 없다`).toBe(true);
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
