#!/usr/bin/env node
// llms.txt(AI 발견용 카탈로그) 생성기(#26, #28, #34).
//
// registry.json(루트 — shadcn build 입력, 단일 진실원천)의 items[]를 그대로 순회해
// public/llms.txt 를 만든다. 새 registry item을 추가/수정해도 이 스크립트를 다시
// 실행하면 llms.txt가 항상 동기화된다 — 수기 하드코딩 금지.
//
// 사용: node scripts/gen-llms.mjs (또는 pnpm gen:llms)

import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

const HOMEPAGE = "https://ui.doksam.com";

/**
 * 디자인 브리프 절을 규칙 원문(lib/rules-markdown.ts)에서 그대로 가져온다(#28).
 * 카탈로그를 읽는 AI 가 컴포넌트 목록보다 먼저 만나야 하는 단계이므로 llms.txt 의
 * 맨 앞에 싣는다 — 문안은 규칙 원문에만 두고 여기서 다시 쓰지 않는다.
 *
 * Node 22.18+ 는 .ts 를 타입 스트리핑으로 그대로 import 한다(CI 도 node 22).
 */
const { DESIGN_BRIEF_SECTION, CONVERGENCE_ANTIPATTERNS_SECTION, RULES_SECTIONS } = await import("../lib/rules-markdown.ts");
const componentRules = RULES_SECTIONS.find((section) => section.title === "컴포넌트");
if (!componentRules) throw new Error("규칙 원문에서 컴포넌트 절을 찾지 못했습니다.");
// 원형·성격 메뉴는 링크가 아니라 표로 인라인한다(#34) — llms.txt 하나만 읽는 에이전트가
// 레지스트리를 따라가지 않고도 등록된 원형 중에서 고를 수 있어야 한다. 항목 원천은 각 레지스트리.
const { LAYOUT_ARCHETYPES } = await import("../archetypes/index.ts");
const { PERSONALITY_PRESETS } = await import("../personalities/index.ts");
const { CORNER_PRESETS } = await import("../corners/index.ts");
const { TYPE_CONTRAST_PRESETS } = await import("../type-contrast/index.ts");

/** markdown 표 셀 — 파이프는 표를 깨므로 이스케이프한다. */
const cell = (text) => String(text).replaceAll("|", "\\|");

function archetypeTable() {
  const rows = [
    "| 원형(name) | 뼈대(내비 + 본문 구조) | 적합한 화면 | 피해야 할 경우 | 대표 템플릿 |",
    "| --- | --- | --- | --- | --- |",
  ];
  for (const a of LAYOUT_ARCHETYPES) {
    rows.push(
      `| \`${a.name}\` | ${cell(a.skeleton)} | ${cell(a.suitedFor.join(" · "))} | ${cell(a.avoidWhen.join(" · "))} | ${a.templates.map((t) => `\`${t}\``).join(", ")} |`,
    );
  }
  return rows;
}

/**
 * 모서리 계열 표 (#43). "피해야 할 경우" 열은 원형·성격 표와 같은 목적이다 —
 * 선택지만 나열하면 에이전트가 가장 안전한 기본값을 고르거나 평균을 낸다.
 * 후보를 실제로 잘라내는 열이 있어야 축이 작동한다.
 */
function cornerTable() {
  const rows = [
    "| 모서리(name) | 표면 반경 | 컨트롤 반경 | 어울리는 곳 | 피해야 할 경우 |",
    "| --- | --- | --- | --- | --- |",
  ];
  for (const c of CORNER_PRESETS) {
    rows.push(
      `| \`${c.name}\` | ${c.surface} | ${c.control} | ${cell(c.suitedFor.join(" · "))} | ${cell(c.avoidWhen.join(" · "))} |`,
    );
  }
  return rows;
}

/**
 * 타입 대비 표 (#43). 제목 배율은 **본문에 곱하지 않는다** — 그래서 이 축은
 * 균등 배율인 personality scale 과 달리 비례 자체를 바꾼다.
 */
function typeContrastTable() {
  const rows = [
    "| 대비(name) | 제목 배율 | 제목 굵기 | 자간 | 어울리는 곳 | 피해야 할 경우 |",
    "| --- | --- | --- | --- | --- | --- |",
  ];
  for (const t of TYPE_CONTRAST_PRESETS) {
    rows.push(
      `| \`${t.name}\` | ${t.headingScale}x | ${t.headingWeight} | ${t.headingTracking} | ${cell(t.suitedFor.join(" · "))} | ${cell(t.avoidWhen.join(" · "))} |`,
    );
  }
  return rows;
}

function personalityTable() {
  const rows = [
    "| 성격(name) | scale | surface | motion | 어울리는 곳 | 피해야 할 경우 |",
    "| --- | --- | --- | --- | --- | --- |",
  ];
  for (const p of PERSONALITY_PRESETS) {
    rows.push(
      `| \`${p.name}\` | ${p.scale} | ${p.surface} | ${p.motion} | ${cell(p.suitedFor.join(" · "))} | ${cell(p.avoidWhen.join(" · "))} |`,
    );
  }
  return rows;
}

const TYPE_LABEL = {
  "registry:component": "컴포넌트",
  "registry:lib": "라이브러리/유틸",
  "registry:theme": "프로필(테마+폰트+radius)",
  "registry:style": "스타일",
  "registry:ui": "UI 프리미티브",
  "registry:hook": "훅",
  "registry:block": "블록",
};

function main() {
  const registryPath = path.join(ROOT, "registry.json");
  const registry = JSON.parse(readFileSync(registryPath, "utf-8"));

  const groups = new Map();
  for (const item of registry.items) {
    const label = TYPE_LABEL[item.type] ?? item.type;
    if (!groups.has(label)) groups.set(label, []);
    groups.get(label).push(item);
  }

  const lines = [];
  lines.push(`# ${registry.name}`);
  lines.push("");
  lines.push(
    `> doksam 프로젝트 공통 UI 표준 사이트. shadcn/ui 기반 디자인 토큰 + 전 컴포넌트 쇼케이스를 ` +
      `한곳에 모은 레퍼런스이며, 이 카탈로그의 항목은 self-host shadcn 커스텀 레지스트리로 직접 설치할 수 있습니다.`,
  );
  lines.push("");
  lines.push(
    `AI 에이전트/사람 모두를 위한 발견용 문서입니다. 아래 각 항목은 ` +
      `\`npx shadcn add ${HOMEPAGE}/r/<name>.json\` 명령으로 즉시 설치됩니다 — ` +
      `components.json이 없는 새 프로젝트라면 \`npx shadcn@latest init\`을 먼저 실행하세요.`,
  );
  lines.push("");
  lines.push(`전체 사용 규칙(코딩 컨벤션·시맨틱 토큰·접근성 규칙)은 [${HOMEPAGE}/rules](${HOMEPAGE}/rules) 를 참고하세요 — AI 프롬프트에 그대로 붙여넣을 수 있는 markdown 원문을 [${HOMEPAGE}/rules.md](${HOMEPAGE}/rules.md) 에서 바로 받을 수 있습니다.`);
  lines.push("");

  lines.push(`## ${DESIGN_BRIEF_SECTION.title}`);
  lines.push("");
  lines.push(
    "아래 카탈로그에서 무엇을 고르기 전에 이 단계를 먼저 끝내세요. 규칙은 불변([invariant])과 " +
      "선택([decision]) 두 층이며, 선택 층은 이 브리프가 없으면 판정할 수 없습니다 — 브리프 없이 " +
      "설치부터 시작하면 모든 화면이 카탈로그의 기본 조합으로 수렴합니다.",
  );
  lines.push("");
  for (const item of DESIGN_BRIEF_SECTION.items) {
    lines.push(`- ${item}`);
  }
  lines.push("");
  lines.push(`### 원형 레지스트리 (${LAYOUT_ARCHETYPES.length}종 — 참고 출발점)`);
  lines.push("");
  lines.push(
    "아래 원형은 참고 출발점입니다. 사용자 과업에 맞게 채택·조합·변형하거나 새 구조를 설계할 수 있습니다. " +
      "표의 뼈대는 예시이며 목록 밖 구조도 DESIGN.md 에 사용자 흐름과 선택 이유를 설명하면 됩니다.",
  );
  lines.push("");
  lines.push(...archetypeTable());
  lines.push("");
  lines.push(`### 성격 레지스트리 (${PERSONALITY_PRESETS.length}종)`);
  lines.push("");
  lines.push(...personalityTable());
  lines.push("");
  lines.push(`### 모서리 레지스트리 (${CORNER_PRESETS.length}종)`);
  lines.push("");
  lines.push(
    "아래 모서리 계열은 기본값의 참고 자료입니다. 제품에 맞게 선택·조정하고 반복 값은 프로젝트 토큰으로 관리합니다. " +
      "표면(카드·팝오버)과 컨트롤(버튼·입력)의 반경은 같은 계열 안에서도 다를 수 있습니다.",
  );
  lines.push("");
  lines.push(...cornerTable());
  lines.push("");
  lines.push(`### 타입 대비 레지스트리 (${TYPE_CONTRAST_PRESETS.length}종)`);
  lines.push("");
  lines.push(
    "제목과 본문의 크기·굵기 격차를 정합니다. 화면이 '잡지처럼' 보이는지 '대시보드처럼' 보이는지를 " +
      "가르는 것은 절대 크기가 아니라 이 대비입니다. 성격(personality)의 scale 은 화면 전체를 같은 " +
      "비율로 키우는 균등 배율이라 대비를 바꾸지 못하므로, 둘을 혼동하지 않습니다.",
  );
  lines.push("");
  lines.push(...typeContrastTable());
  lines.push("");
  lines.push(`## ${CONVERGENCE_ANTIPATTERNS_SECTION.title}`);
  lines.push("");
  lines.push("구조와 조합을 정할 때 참고합니다 — 기본 조합의 관성적 반복을 점검하되 유용한 패턴을 일부러 버릴 필요는 없습니다.");
  lines.push("");
  for (const item of CONVERGENCE_ANTIPATTERNS_SECTION.items) {
    lines.push(`- ${item}`);
  }
  lines.push("");
  lines.push(`두 층의 전체 조항은 ${HOMEPAGE}/rules.md 에 있습니다.`);
  lines.push("");
  lines.push(`## ${componentRules.title} 구현 규칙`);
  lines.push("");
  for (const item of componentRules.items) lines.push(`- ${item}`);
  lines.push("");

  for (const [label, items] of groups) {
    lines.push(`## ${label}`);
    lines.push("");
    for (const item of items) {
      const title = item.title ?? item.name;
      const desc = item.description ?? "";
      lines.push(`### ${title} (\`${item.name}\`)`);
      lines.push("");
      if (desc) lines.push(desc);
      lines.push("");
      lines.push("```");
      lines.push(`npx shadcn add ${HOMEPAGE}/r/${item.name}.json`);
      lines.push("```");
      if (item.registryDependencies?.length) {
        lines.push("");
        lines.push(`registryDependencies: ${item.registryDependencies.join(", ")}`);
      }
      if (item.dependencies?.length) {
        lines.push("");
        lines.push(`npm dependencies: ${item.dependencies.join(", ")}`);
      }
      lines.push("");
    }
  }

  lines.push("## 링크");
  lines.push("");
  lines.push(`- 전체 컴포넌트 쇼케이스: ${HOMEPAGE}/components`);
  lines.push(`- 패턴(관측성/데이터뷰/폼 등 복합 조합): ${HOMEPAGE}/patterns`);
  lines.push(`- 브랜드 프로필: ${HOMEPAGE}/profiles`);
  lines.push(`- 디자인 토큰: ${HOMEPAGE}/tokens`);
  lines.push(`- AI 프롬프트용 사용 규칙: ${HOMEPAGE}/rules`);
  lines.push(`- 레지스트리 인덱스(JSON): ${HOMEPAGE}/r/registry.json`);
  lines.push("");

  const output = lines.join("\n");
  const outPath = path.join(ROOT, "public", "llms.txt");
  writeFileSync(outPath, output, "utf-8");
  console.log(`✔ wrote ${path.relative(ROOT, outPath)} (${registry.items.length} items)`);
}

main();
