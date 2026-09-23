#!/usr/bin/env node
/**
 * GitHub(SSOT) 과 GitLab(배포용) 클론의 내용 드리프트를 수동으로 점검한다 (#54, #56).
 *
 * 두 레포는 히스토리가 다르고 라우팅 구조도 다르다(`app/X` ↔ `app/[locale]/X`). CI 에
 * 넣지 않는 이유는 폐쇄망 전제 — 이 스크립트는 GitLab 클론이 로컬에 이미 있다고
 * 가정하고 그 경로를 인자로 받는다. 외부 네트워크를 쓰지 않는다.
 *
 * 사용:
 *   node scripts/check-gitlab-drift.mjs <gitlab 클론 경로>
 *   node scripts/check-gitlab-drift.mjs ~/workspace/gitlab.doksam.com/doksam-ui
 *
 * 대상 디렉터리(`components/`, `lib/`, `scripts/`, `test/`, `app/`)를 걸으며
 * 같은 상대 경로(app 아래는 `app/X` → `app/[locale]/X` 로 치환)의 파일을 찾아
 * 내용을 비교한다. 구조적으로 다른 게 확실한 것은 스킵 목록에 넣어 제외한다 —
 * 배포 설정(.gitlab-ci.yml 등), 규칙 원문 위치(형식 자체가 다르다: GitHub 는
 * lib/rules-markdown.ts, GitLab 은 content/rules.mdx), 로케일 라우팅을 성립시키는
 * 파일(app/[locale]/layout.tsx, middleware.ts), 생성물(public/r/, registry.json —
 * 소스가 같아도 로케일 라우팅 경로 차이로 항상 다르게 나온다), 개인 메모리.
 *
 * 결과는 참고용 목록이다 — 사람이 "이식 / 불필요 / GitLab 전용" 을 판단해야 한다
 * (#54 가 이미 그렇게 했다). 이 스크립트는 그 판단의 재료(어떤 파일이 다른가)만 만든다.
 *
 * 두 가지를 추가로 점검한다(#71, #72):
 * - GitLab 전용 파일 스캔: GitHub 에는 없는데 GitLab 에만 있는 파일을 찾는다(위 본 스캔의
 *   역방향). GL #71(settings-form-kit)처럼 "표준 카탈로그로서 SSOT 에는 없는 게 맞다"고
 *   판정된 의도된 분기는 INTENDED_GITLAB_ONLY 에 등록해 매번 드리프트로 다시 잡히지
 *   않게 한다. 등록 안 된 GitLab 전용 파일만 보고한다.
 * - 규칙 절 제목 집합 비교: lib/rules-markdown.ts 의 RULES_SECTIONS 와 GitLab
 *   content/rules.mdx 의 "## 제목 [kind]" 헤더를 절 제목 집합으로 비교한다. #72 의
 *   gen-rules-mdx.mjs 로 GitLab MDX 를 재생성하면 이 드리프트는 구조적으로 사라지지만,
 *   재생성을 깜빡하고 손으로 고친 경우를 잡는 안전망으로 남겨둔다.
 */
import { readFileSync, existsSync, statSync, readdirSync } from "node:fs";
import path from "node:path";

const GITHUB_ROOT = path.resolve(import.meta.dirname, "..");

const gitlabRootArg = process.argv[2];
if (!gitlabRootArg) {
  console.error("사용법: node scripts/check-gitlab-drift.mjs <gitlab 클론 경로>");
  process.exit(1);
}
const GITLAB_ROOT = path.resolve(gitlabRootArg);
if (!existsSync(GITLAB_ROOT)) {
  console.error(`경로가 없다: ${GITLAB_ROOT}`);
  process.exit(1);
}

// 구조적으로 다르다고 이미 확인된 것들 — 드리프트가 아니라 설계다.
const SKIP_PATTERNS = [
  /^\.github\//,
  /^\.gitlab-ci\.yml$/,
  /^content\/rules(\.en)?\.mdx$/,
  /^lib\/rules-markdown/, // GitLab 에 대응 파일이 없다(마크다운 vs TS)
  /^public\/r\//, // 생성물 — 소스가 같아도 라우팅 차이로 항상 다르다
  /^registry\.json$/,
  /^\.claude\//,
  /^HANDOFF\.md$/,
  /middleware\.ts$/,
  /^app\/\[locale\]\/layout\.tsx$/, // 로케일 세그먼트를 성립시키는 카탈로그 전용 레이아웃
  /node_modules\//,
  /\.next\//,
  /coverage\//,
  /playwright-report\//,
  /^\.git\//,
];

function isSkipped(relPath) {
  return SKIP_PATTERNS.some((re) => re.test(relPath));
}

/**
 * GitLab 전용 파일 중 "드리프트가 아니라 의도된 분기"로 이미 판정된 것들 (#71).
 *
 * settings-form-kit: GL #54(원 PR #69)에서 GitLab 쪽 설정 화면들의 실제 중복 폼
 * 구성 코드를 묶어 만든 추상화다. SSOT(GitHub)에는 애초에 그 중복이 없었으므로 같은
 * 커밋을 이식하면 "중복 없는 곳에 추상화만 들어가는" 결과가 된다 — 표준 카탈로그로서
 * SSOT 에 없는 게 맞다고 GH #71 에서 판정했다(사유는 그 이슈와 reports/gh-72-71.md 참고).
 * settings-form.tsx 는 app/ 하위라 WALK_DIRS 스캔 대상이 아니지만(app/ 은 구조적으로
 * 제외) 함께 적어 둔다 — WALK_DIRS 에 app 서브트리를 추가할 경우를 대비한 문서화.
 */
const INTENDED_GITLAB_ONLY = [
  /^components\/settings-form-kit\.tsx$/,
  /^app\/\[locale\]\/templates\/(chat|admin)\/_components\/settings-form\.tsx$/,
];

function isIntendedGitlabOnly(relPath) {
  return INTENDED_GITLAB_ONLY.some((re) => re.test(relPath));
}

/** app/X 를 gitlab 쪽 app/[locale]/X 로 매핑한다. 그 외 디렉터리는 그대로. */
function toGitlabPath(relPath) {
  if (relPath === "app" || relPath.startsWith("app/")) {
    return relPath.replace(/^app\//, "app/[locale]/").replace(/^app$/, "app/[locale]");
  }
  return relPath;
}

// app/ 은 대상에서 뺀다 — GitHub 은 플랫 라우팅 + document.documentElement.lang,
// GitLab 은 app/[locale] 라우팅 + I18nProvider locale={...} 라 파일 내용 자체가
// 항상 갈린다(구조적 차이). 그 아래 컴포넌트/데이터 파일은 대부분 동일해야 하니
// 필요하면 이 목록에 app 하위 개별 서브트리를 추가해 좁게 쓴다.
const WALK_DIRS = ["components", "lib", "scripts", "test"];

function walk(root, rel = "") {
  const abs = path.join(root, rel);
  if (!existsSync(abs)) return [];
  const entries = readdirSync(abs, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const childRel = rel ? `${rel}/${entry.name}` : entry.name;
    if (isSkipped(childRel)) continue;
    if (entry.isDirectory()) {
      files.push(...walk(root, childRel));
    } else if (entry.isFile()) {
      files.push(childRel);
    }
  }
  return files;
}

const githubFiles = WALK_DIRS.flatMap((dir) => walk(GITHUB_ROOT, dir));

const onlyInGithub = [];
const differs = [];
let identical = 0;

for (const relPath of githubFiles) {
  const gitlabRel = toGitlabPath(relPath);
  const githubAbs = path.join(GITHUB_ROOT, relPath);
  const gitlabAbs = path.join(GITLAB_ROOT, gitlabRel);

  if (!existsSync(gitlabAbs) || !statSync(gitlabAbs).isFile()) {
    onlyInGithub.push(relPath);
    continue;
  }

  const githubContent = readFileSync(githubAbs, "utf8");
  const gitlabContent = readFileSync(gitlabAbs, "utf8");
  if (githubContent === gitlabContent) {
    identical++;
  } else {
    differs.push({ relPath, gitlabRel });
  }
}

console.log(`동일: ${identical}개`);
console.log(`GitHub 에만 있음: ${onlyInGithub.length}개`);
if (onlyInGithub.length) {
  for (const f of onlyInGithub.slice(0, 30)) console.log(`  - ${f}`);
  if (onlyInGithub.length > 30) console.log(`  ... 외 ${onlyInGithub.length - 30}개`);
}

console.log(`\n내용이 다름: ${differs.length}개`);
for (const { relPath, gitlabRel } of differs) {
  console.log(`  - ${relPath}  (gitlab: ${gitlabRel})`);
}

if (differs.length === 0 && onlyInGithub.length === 0) {
  console.log("\n드리프트 후보 없음 — 대상 디렉터리 전체가 내용까지 동일하다.");
} else {
  console.log(
    "\n각 항목을 '이식 / 불필요(의도된 차이) / GitLab 전용' 으로 사람이 분류할 것 — 이 스크립트는 목록만 만든다.",
  );
}

// --- GitLab 전용 파일 (역방향 스캔, #71) ---------------------------------
/** app/X 를 GitLab 쪽 app/[locale]/X 매핑의 역방향으로 GitHub 경로로 되돌린다. */
function toGithubPath(relPath) {
  if (relPath === "app/[locale]" || relPath.startsWith("app/[locale]/")) {
    return relPath.replace(/^app\/\[locale\]\//, "app/").replace(/^app\/\[locale\]$/, "app");
  }
  return relPath;
}

const gitlabFiles = WALK_DIRS.flatMap((dir) => walk(GITLAB_ROOT, dir));
const gitlabOnlyUnregistered = [];
const gitlabOnlyIntended = [];

for (const relPath of gitlabFiles) {
  const githubRel = toGithubPath(relPath);
  const githubAbs = path.join(GITHUB_ROOT, githubRel);
  if (existsSync(githubAbs) && statSync(githubAbs).isFile()) continue; // GitHub 에도 있음 — 위 정방향 스캔이 이미 다룬다

  if (isIntendedGitlabOnly(relPath)) {
    gitlabOnlyIntended.push(relPath);
  } else {
    gitlabOnlyUnregistered.push(relPath);
  }
}

console.log(`\nGitLab 에만 있음 (의도된 분기로 등록됨): ${gitlabOnlyIntended.length}개`);
for (const f of gitlabOnlyIntended) console.log(`  - ${f}`);

console.log(`\nGitLab 에만 있음 (미등록 — 드리프트 후보): ${gitlabOnlyUnregistered.length}개`);
if (gitlabOnlyUnregistered.length) {
  for (const f of gitlabOnlyUnregistered.slice(0, 30)) console.log(`  - ${f}`);
  if (gitlabOnlyUnregistered.length > 30) console.log(`  ... 외 ${gitlabOnlyUnregistered.length - 30}개`);
  console.log(
    "  사람이 판단할 것: SSOT 로 역이식할지, 아니면 INTENDED_GITLAB_ONLY 에 등록해 의도된 분기로 기록할지.",
  );
} else {
  console.log("  없음 — GitLab 전용 파일은 전부 의도된 분기로 등록돼 있다.");
}

// --- 규칙 절 제목 집합 비교 (#72) -----------------------------------------
const { RULES_SECTIONS } = await import(path.join(GITHUB_ROOT, "lib/rules-markdown.ts"));
const ssotTitles = RULES_SECTIONS.map((s) => `${s.title} [${s.kind}]`);

const gitlabRulesPath = path.join(GITLAB_ROOT, "content/rules.mdx");
if (existsSync(gitlabRulesPath)) {
  const gitlabRulesContent = readFileSync(gitlabRulesPath, "utf8");
  const gitlabTitles = [...gitlabRulesContent.matchAll(/^## (.+)$/gm)].map((m) => m[1].trim());

  const ssotSet = new Set(ssotTitles);
  const gitlabSet = new Set(gitlabTitles);
  const missingInGitlab = ssotTitles.filter((t) => !gitlabSet.has(t));
  const extraInGitlab = gitlabTitles.filter((t) => !ssotSet.has(t));

  console.log(`\n규칙 절 제목 비교: SSOT ${ssotTitles.length}절, GitLab content/rules.mdx ${gitlabTitles.length}절`);
  if (missingInGitlab.length === 0 && extraInGitlab.length === 0) {
    console.log("  절 제목 집합 일치 — 드리프트 없음.");
  } else {
    if (missingInGitlab.length) {
      console.log(`  SSOT 에는 있는데 GitLab 에 없음 (${missingInGitlab.length}개):`);
      for (const t of missingInGitlab) console.log(`    - ${t}`);
    }
    if (extraInGitlab.length) {
      console.log(`  GitLab 에는 있는데 SSOT 에 없음 (${extraInGitlab.length}개):`);
      for (const t of extraInGitlab) console.log(`    - ${t}`);
    }
    console.log(
      "  node scripts/gen-rules-mdx.mjs <gitlab 클론>/content 로 GitLab MDX 를 재생성하면 이 드리프트가 사라진다(#72).",
    );
  }
} else {
  console.log(`\n규칙 절 제목 비교: 건너뜀 — ${gitlabRulesPath} 없음.`);
}
