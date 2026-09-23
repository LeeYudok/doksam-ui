#!/usr/bin/env node
// content/rules.mdx (ko) + content/rules.en.mdx (en) 생성기 (#72).
//
// 단일 진실원천은 lib/rules-markdown.ts 의 RULES_SECTIONS 다. GitLab 클론
// (gitlab.doksam.com/doksam-ui) 은 규칙 원문을 MDX 파일 2개로 들고 있고, 지금까지는
// 사람이 손으로 옮겨 적었다 — 그 과정에서 절이 통째로 누락되는 일이 실제로 있었다
// (GL #93: 모션·접근성 절 미이관). 이 스크립트는 손 이관을 없애고 SSOT 에서 GitLab
// MDX 형식을 그대로 생성한다.
//
// ko(content/rules.mdx): RULES_SECTIONS 의 한국어 원문을 그대로 렌더링한다.
// en(content/rules.en.mdx): SSOT(RULES_SECTIONS)에 영문 원문이 없다 — lib/i18n/messages/en.json
//   에도 절 본문에 해당하는 영문 텍스트가 없음을 확인했다(카탈로그 UI 라벨만 있음, 2026-09-23).
//   그래서 en 출력은 절 골격(제목 + [invariant]/[decision] 마커)만 내고, 각 절 본문 자리에는
//   번역이 필요하다는 플레이스홀더를 남긴다. RULES_SECTIONS 에 영문 필드가 생기면(#72 후속)
//   이 스크립트도 그 필드를 렌더하도록 바꾼다.
//
// 사용:
//   node scripts/gen-rules-mdx.mjs [출력 디렉터리]
//   출력 디렉터리를 생략하면 이 레포의 content/ 아래에 참고용으로 쓴다(GitLab 형식 확인용 —
//   이 레포 자체는 이 파일을 소비하지 않는다. lib/rules-markdown.ts 가 여전히 SSOT).
//   GitLab 클론에 바로 쓰려면: node scripts/gen-rules-mdx.mjs ~/workspace/gitlab.doksam.com/doksam-ui/content
//
// Node 22.18+ 는 .ts 를 타입 스트리핑으로 그대로 import 한다(gen-llms.mjs 와 동일 전제).
// GitLab 러너는 Node 20 이라 이 스크립트를 그 파이프라인에서 직접 돌릴 수 없다 — 이 레포(SSOT,
// CI 가 Node 22)에서 실행해 산출물(rules.mdx/rules.en.mdx) 만 GitLab 레포로 옮긴다. 자세한
// 이식 절차는 AGENTS.md 의 "카탈로그 항목을 추가할 때" 절 근처에 한 문단으로 남긴다(#72).

import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

/** GitLab MDX 는 마커를 굵게 쓰지 않지만 절 머리말 설명 블록에서는 굵게 쓴다 — 원문 그대로 맞춘다. */
export const KO_INTRO = `# doksam-ui 사용 규칙

doksam 프로젝트에서 UI를 만들 때 지키는 규칙입니다. ui.doksam.com 을 참고하세요.

규칙은 두 층입니다. 절 제목 뒤에 붙은 표시를 먼저 보세요.

- \`[invariant]\` — **불변**. 프로젝트가 달라도 답이 같습니다. 어기면 표준 위반이고, 상당수는 자동 테스트가 막습니다.
- \`[decision]\` — **선택**. 프로젝트마다 정답이 다릅니다. 이 절은 명령이 아니라 선택지와 고르는 기준을 주며, 무엇을 골랐는지는 \`DESIGN.md\` 에 남깁니다. 각 선택지에는 그 선택을 골랐을 때 지켜야 할 경계가 붙습니다.

불변만 지키면 "틀리지 않은" 화면이 나올 뿐이고, 선택을 하지 않으면 모든 화면이 같은 뼈대로 수렴합니다. 무엇을 만들기 전에 "디자인 브리프" 절부터 수행하세요.`;

export const EN_INTRO = `# doksam-ui Usage Rules

Rules to follow when building UI in doksam projects. See ui.doksam.com for reference.

Rules come in two layers. Read the marker after each section title first.

- \`[invariant]\` — the answer is the same in every project. Breaking it is a standards violation, and most of these are enforced by automated tests.
- \`[decision]\` — the right answer differs per project. These sections give options and criteria rather than commands, and whatever you pick is recorded in \`DESIGN.md\`. Each option carries the boundaries you must keep once you pick it.

Following only the invariants yields a screen that is merely "not wrong"; skipping the decisions makes every screen converge on the same skeleton. Do the "Design Brief" section before building anything.`;

/** markdown 안의 백틱(코드 인용) 안 `<태그>` 는 GitLab 원문처럼 그대로 이스케이프 없이 둔다. */
export function sectionToKoMdx(section) {
  const bullets = section.items.map((item) => `- ${item}`).join("\n");
  return `## ${section.title} [${section.kind}]\n\n${bullets}`;
}

/** en 은 SSOT 에 영문 본문이 없으므로 번역 대기 플레이스홀더를 낸다(#72). */
export function sectionToEnSkeleton(section) {
  return `## ${section.title} [${section.kind}]\n\n<!-- TODO(#72): 영문 번역 필요 — SSOT(lib/rules-markdown.ts)에 영문 필드가 없다. 한국어 원문(content/rules.mdx)을 참고해 번역한다. -->`;
}

/** RULES_SECTIONS → GitLab 형식 ko MDX 전문. */
export function buildKoMdx(sections) {
  return [KO_INTRO, ...sections.map(sectionToKoMdx)].join("\n\n") + "\n";
}

/** RULES_SECTIONS → GitLab 형식 en MDX 골격(번역 대기). */
export function buildEnMdxSkeleton(sections) {
  return [EN_INTRO, ...sections.map(sectionToEnSkeleton)].join("\n\n") + "\n";
}

// CLI 로 직접 실행됐을 때만 파일을 쓴다 — 테스트에서 import 할 때는 부수효과 없이
// 위 순수 함수만 쓴다.
if (import.meta.url === `file://${process.argv[1]}`) {
  const { RULES_SECTIONS } = await import("../lib/rules-markdown.ts");

  const outDirArg = process.argv[2];
  const OUT_DIR = outDirArg ? path.resolve(outDirArg) : path.join(ROOT, "content");

  const koBody = buildKoMdx(RULES_SECTIONS);
  const enBody = buildEnMdxSkeleton(RULES_SECTIONS);

  writeFileSync(path.join(OUT_DIR, "rules.mdx"), koBody, "utf8");
  writeFileSync(path.join(OUT_DIR, "rules.en.mdx"), enBody, "utf8");

  console.log(`생성됨: ${path.join(OUT_DIR, "rules.mdx")} (${RULES_SECTIONS.length}절)`);
  console.log(
    `생성됨: ${path.join(OUT_DIR, "rules.en.mdx")} (${RULES_SECTIONS.length}절, 본문은 번역 대기 플레이스홀더)`,
  );
}
