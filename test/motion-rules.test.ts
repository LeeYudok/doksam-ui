import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { collectFiles } from "./helpers/scan-build-output";

/**
 * 이슈 #21 — 「모션 · 애니메이션」 규칙(lib/rules-markdown.ts)의 기계 검증.
 *
 * 폐쇄망 규칙을 test/closed-network.test.ts 가 실증하듯, 모션 규칙도 소스 스캔으로
 * 실증한다. 규칙 문장만 있고 게이트가 없으면 카탈로그 항목이 늘어날 때마다 조용히
 * 어긋난다 — 실제로 이 규칙을 도입할 당시 transition-all 이 11곳에 있었다.
 *
 * 스캔 대상은 사람이 쓰는 소스뿐이다. `components/ui/` 는 상류 포맷을 따르는 영역이라
 * 「컴포넌트」 규칙상 수정 금지 대상이므로 명시적으로 제외한다.
 */

const REPO_ROOT = path.resolve(__dirname, "..");
const SOURCE_DIRS = ["app", "components", "lib", "hooks", "themes"];
const SOURCE_EXTENSIONS = [".ts", ".tsx", ".css"] as const;

/** shadcn 유래 프리미티브 — 상류 포맷을 따르므로 규칙 적용에서 제외한다(#48). */
const SHADCN_ORIGINAL_DIR = `${path.join("components", "ui")}${path.sep}`;

/**
 * 규칙 원문 자체는 제외한다 — 조항이 "transition-all 을 쓰지 않는다",
 * "duration-[450ms] 같은 임의 값" 처럼 금지 대상을 인용하므로 스캐너에 걸린다.
 */
const RULES_SSOT = path.join("lib", "rules-markdown.ts");

function isScanned(label: string): boolean {
  if (label.startsWith(SHADCN_ORIGINAL_DIR)) return false;
  if (label === RULES_SSOT) return false;
  // 테스트 파일은 위반 fixture 를 의도적으로 포함한다.
  return !/\.(test|spec)\.tsx?$/.test(label);
}

interface SourceFile {
  label: string;
  content: string;
}

function collectSourceFiles(): SourceFile[] {
  const files: SourceFile[] = [];
  for (const dir of SOURCE_DIRS) {
    for (const full of collectFiles(path.join(REPO_ROOT, dir), SOURCE_EXTENSIONS)) {
      const label = path.relative(REPO_ROOT, full);
      if (!isScanned(label)) continue;
      files.push({ label, content: readFileSync(full, "utf-8") });
    }
  }
  return files;
}

const SOURCE_FILES = collectSourceFiles();

/** 파일에서 정규식에 걸리는 줄을 "경로:줄번호 — 내용" 목록으로 만든다. */
function findLines(pattern: RegExp, predicate?: (file: SourceFile) => boolean): string[] {
  const hits: string[] = [];
  for (const file of SOURCE_FILES) {
    if (predicate && !predicate(file)) continue;
    file.content.split("\n").forEach((line, i) => {
      if (pattern.test(line)) hits.push(`${file.label}:${i + 1} — ${line.trim()}`);
    });
  }
  return hits;
}

describe("모션 규칙 검증 — 소스 스캔", () => {
  it("스캔 대상 소스가 실제로 수집된다", () => {
    // 경로 오타·헬퍼 변경으로 0건을 스캔하고 통과하는 false negative 방지.
    expect(SOURCE_FILES.length).toBeGreaterThan(100);
  });

  it("transition-all 이 0건이다 (components/ui/ 제외)", () => {
    const hits = findLines(/\btransition-all\b/);
    expect(
      hits,
      `transition-all 발견 — 전환할 속성을 명시하세요(transition-colors / transition-transform / transition-[width] 등):\n${hits.join("\n")}`,
    ).toHaveLength(0);
  });

  it("duration 은 100/200/300 스케일만 쓴다", () => {
    // duration-[450ms] 같은 임의 값과 duration-75/500/700 등 스케일 밖 값을 모두 잡는다.
    const hits = findLines(/\bduration-(?!100\b|200\b|300\b)(\[[^\]]+\]|\d+)/);
    expect(
      hits,
      `허용 스케일(100/200/300) 밖 duration 발견:\n${hits.join("\n")}`,
    ).toHaveLength(0);
  });

  it("@keyframes 를 정의하는 파일은 prefers-reduced-motion 을 함께 처리한다", () => {
    const offenders = SOURCE_FILES.filter(
      (file) => /@keyframes\b/.test(file.content) && !/prefers-reduced-motion/.test(file.content),
    ).map((file) => file.label);

    expect(
      offenders,
      `커스텀 keyframes 가 prefers-reduced-motion: reduce 를 존중하지 않습니다:\n${offenders.join("\n")}`,
    ).toHaveLength(0);
  });
});

describe("스캐너 자체 검증 — false negative 방지 (fixture)", () => {
  const asFile = (content: string): SourceFile => ({ label: "fixture.tsx", content });

  it("transition-all 패턴이 실제 위반을 잡는다", () => {
    expect(/\btransition-all\b/.test(`className="rounded transition-all hover:shadow-md"`)).toBe(true);
  });

  it("transition-[width] 등 명시형은 위반이 아니다", () => {
    const pattern = /\btransition-all\b/;
    expect(pattern.test(`className="transition-[width] duration-300"`)).toBe(false);
    expect(pattern.test(`className="transition-colors"`)).toBe(false);
    expect(pattern.test(`className="transition-transform"`)).toBe(false);
  });

  it("duration 패턴이 스케일 밖 값만 잡는다", () => {
    const pattern = /\bduration-(?!100\b|200\b|300\b)(\[[^\]]+\]|\d+)/;
    expect(pattern.test(`className="duration-[450ms]"`)).toBe(true);
    expect(pattern.test(`className="duration-500"`)).toBe(true);
    expect(pattern.test(`className="duration-75"`)).toBe(true);
    expect(pattern.test(`className="duration-100"`)).toBe(false);
    expect(pattern.test(`className="duration-200"`)).toBe(false);
    expect(pattern.test(`className="duration-300"`)).toBe(false);
  });

  it("prefers-reduced-motion 없는 keyframes 파일을 잡는다", () => {
    const dirty = asFile(`@keyframes spin{to{transform:rotate(360deg)}}`);
    const clean = asFile(
      `@keyframes spin{to{transform:rotate(360deg)}}@media (prefers-reduced-motion:reduce){.x{animation:none}}`,
    );
    const offends = (f: SourceFile) => /@keyframes\b/.test(f.content) && !/prefers-reduced-motion/.test(f.content);
    expect(offends(dirty)).toBe(true);
    expect(offends(clean)).toBe(false);
  });
});
