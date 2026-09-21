import { createHash, type BinaryLike } from "node:crypto";
import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

/**
 * shadcn 상류 차이 매니페스트 검증 (#48, 대조 방식 정정 #62).
 *
 * 배경: `components/ui/` 는 components.json 의 style(radix-nova)로 설치한 상류
 * 원본이다. 한동안 매니페스트가 **다른 스타일(new-york-v4)** 과 대조한 탓에 60개 중
 * 52개가 "하우스 포크" 로 기록돼 있었고(#57 에서 정정), 그 뒤에도 **레지스트리 JSON
 * 원문**과 대조한 탓에 CLI 가 설치 시점에 치환하는 자리가 차이로 섞여 있었다. #62 에서
 * 게이트를 **실제 설치본 대조**로 바꾸면서 `customized` 의 뜻이 "설치했을 때 달라지는
 * 파일" 로 좁아졌다.
 *
 * 그래서 이 테스트가 지키는 것은 "포크 기록" 이 아니라 **기록이 현실과 맞는지** 다 —
 * 기준 스타일이 components.json 과 같은지, 측정이 지금 파일 상태를 반영하는지. 상류와의
 * 실제 대조는 네트워크와 shadcn CLI 가 필요하므로 `pnpm check:shadcn` 수동 게이트가
 * 담당한다(폐쇄망 전제라 테스트에서 외부 fetch 를 하지 않는다).
 */
const REPO_ROOT = path.resolve(__dirname, "..");
const UI_DIR = path.join(REPO_ROOT, "components", "ui");
const MANIFEST_PATH = path.join(UI_DIR, "upstream.manifest.json");

/** 게이트가 쓰는 것과 같은 해시 — 기록이 현재 파일에서 나온 것인지 대조한다. */
const sha = (s: BinaryLike) => createHash("sha256").update(s).digest("hex").slice(0, 16);

/** scripts/shadcn-upstream.mjs 의 RESIDUAL_KINDS 와 짝이다. */
const RESIDUAL_KINDS = ["identical", "absent", "cnAlias", "importOrder", "importLayout", "formatting", "differs"];

interface Manifest {
  style: string;
  checkedAt: string | null;
  components: Record<
    string,
    {
      installed: string | null;
      localHash: string;
      customized?: boolean;
      residual?: string;
      groups?: string[];
      note: string;
    }
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
    // 빈 맵도 통과시키면 측정이 사라져도 초록이 된다 — 측정 자체가 게이트의 값이다.
    const files = Object.entries(manifest.installDiff?.files ?? {});
    expect(files.length, "installDiff.files 가 비었다 — 측정 결과가 사라졌다").toBeGreaterThan(0);
    for (const [file, why] of files) {
      expect(manifest.components[file], `installDiff 의 ${file} 이 실재하지 않는다`).toBeDefined();
      expect(why.length, `${file} 의 사유가 비었다`).toBeGreaterThan(0);
    }
  });

  /**
   * `installDiff` 는 손으로 적는 목록이 아니라 게이트가 매 측정마다 다시 쓰는 결과다.
   * 두 곳이 갈라지면 어느 쪽이 사실인지 알 수 없어지므로 집합이 같아야 한다 (#62).
   */
  it("installDiff.files 의 집합이 customized 집합과 같다", () => {
    const customized = Object.entries(manifest.components)
      .filter(([, entry]) => entry.customized)
      .map(([file]) => file)
      .sort();
    expect(Object.keys(manifest.installDiff?.files ?? {}).sort()).toEqual(customized);
  });

  /**
   * **신선도 검사 (#62).** 날짜 창(예: 90일)으로 재면 아무도 파일을 안 건드려도 언젠가
   * 빨개지고, 반대로 어제 프리미티브를 고쳐도 오늘은 초록이다 — 둘 다 틀린 신호다.
   * 대신 기록된 `localHash` 를 실제 파일에서 다시 계산해 맞춘다. 프리미티브를 고쳤는데
   * 게이트를 다시 돌리지 않았다면 정확히 그 순간 실패한다. 네트워크는 필요 없다.
   */
  it("측정이 현재 파일 상태를 반영한다 — 프리미티브를 고쳤으면 게이트를 다시 돌려야 한다", () => {
    for (const file of componentFiles) {
      const entry = manifest.components[file];
      if (!entry) continue;
      expect(
        sha(readFileSync(path.join(UI_DIR, file), "utf8")),
        `${file} 이 기록된 localHash 와 다르다 — 측정이 낡았다. node scripts/shadcn-upstream.mjs --update 를 돌려라`,
      ).toBe(entry.localHash);
    }
  });

  it("측정일과 점검일이 같은 실행에서 나왔다", () => {
    expect(
      manifest.installDiff?.measuredAt,
      "installDiff.measuredAt 과 checkedAt 이 다르다 — 한쪽만 손으로 고친 기록이다",
    ).toBe(manifest.checkedAt);
  });

  /**
   * "내용은 같은데 바이트는 왜 다른가" 를 사람이 문장으로 적으면 낡아도 아무도 모른다.
   * 게이트가 분류한 값만 오도록 막는다 (#67 리뷰 2 → #62).
   */
  it("residual 이 알려진 분류값이다", () => {
    for (const [file, entry] of Object.entries(manifest.components)) {
      expect(RESIDUAL_KINDS, `${file} 의 residual "${entry.residual}" 이 알려진 분류가 아니다`).toContain(
        entry.residual,
      );
      expect(entry.residual === "differs", `${file} 의 residual 과 customized 가 어긋난다`).toBe(
        Boolean(entry.customized),
      );
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

  /**
   * examples 는 "그 성격이 드러나는 파일" 이다 — 성격은 radix-nova 스타일에서 오므로
   * 상류와 같은 파일에도 드러난다. 설명만으로는 그 주장이 낡아도 알 수 없으니,
   * 축이 실제로 의존하는 두 성격은 파일 내용으로 확인한다 (#63 리뷰).
   */
  it("축이 의존하는 성격은 examples 파일에서 실제로 확인된다", () => {
    const read = (file: string) => readFileSync(path.join(UI_DIR, file), "utf8");
    for (const file of manifest.houseStyle.controlScale.examples) {
      expect(read(file), `${file} 에 축소된 컨트롤 높이(h-8/h-7)가 없다`).toMatch(/\bh-(?:7|8)\b/);
    }
    for (const file of manifest.houseStyle.radiusTokens.examples) {
      expect(read(file), `${file} 이 --radius 파생 토큰을 쓰지 않는다`).toMatch(/rounded-(?:lg|\[min\(var\(--radius)/);
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
