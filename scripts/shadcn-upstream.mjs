/**
 * shadcn 상류 드리프트 점검 (#48) — 수동 게이트.
 *
 * 이 레포는 `components/ui/` 를 "shadcn CLI 원본" 으로 취급해 왔지만 실제로는
 * 여러 파일이 의도적으로 수정돼 있다(예: 버튼 사이즈를 한 단계씩 축소, 모서리를
 * --radius-md 기반 토큰으로 교체). 그 차이가 어디에도 기록돼 있지 않아
 * `shadcn add` 재실행이나 업그레이드가 커스터마이즈를 조용히 덮어쓸 수 있었다.
 *
 * 이 스크립트는 상류 레지스트리에서 같은 컴포넌트를 받아 매니페스트의 기준 해시와
 * 대조한다. 두 방향을 각각 보고한다:
 *   - 상류가 바뀐 항목 (기준 해시 불일치)  → 반영할지 판단이 필요하다
 *   - 우리가 기록 없이 고친 항목 (local 해시 불일치) → 매니페스트에 이유를 남겨야 한다
 *
 * **네트워크를 쓰므로 CI·테스트에서 돌리지 않는다.** 이 레포는 폐쇄망 전제이며
 * 제품 코드의 외부 fetch 는 0건이어야 한다. vision 게이트와 같은 수동 게이트다.
 *
 *   node scripts/shadcn-upstream.mjs           # 점검
 *   node scripts/shadcn-upstream.mjs --update  # 현재 상태를 기준으로 매니페스트 갱신
 */
import { createHash } from "node:crypto";
import { readFileSync, writeFileSync, readdirSync, existsSync } from "node:fs";
import { join } from "node:path";

const ROOT = new URL("..", import.meta.url).pathname;
const UI_DIR = join(ROOT, "components", "ui");
const MANIFEST_PATH = join(ROOT, "components", "ui", "upstream.manifest.json");
const STYLE = process.env.SHADCN_STYLE || "new-york-v4";
const BASE = `https://ui.shadcn.com/r/styles/${STYLE}`;

/**
 * 상류 레지스트리 JSON 은 CLI 가 설치 시점에 재작성하는 **플레이스홀더 import**
 * (`from "cn"` 등)를 담고 있다. 그대로 비교하면 전 파일이 "차이 있음" 으로 잡혀
 * 신호가 죽는다. 설치 후 형태로 맞춘 뒤 비교한다.
 */
function rewriteUpstream(src) {
  return src
    .replace(/from ["']cn["']/g, 'from "@/lib/utils"')
    .replace(/from ["']ui\/([a-z-]+)["']/g, 'from "@/components/ui/$1"')
    .replace(/from ["']hooks\/([a-z-]+)["']/g, 'from "@/hooks/$1"')
    .replace(/from ["']lib\/([a-z-]+)["']/g, 'from "@/lib/$1"');
}

const sha = (s) => createHash("sha256").update(s).digest("hex").slice(0, 16);

/**
 * 따옴표·세미콜론·공백만 다른 경우는 포맷 차이지 커스터마이즈가 아니다.
 * 드리프트 감지는 정확 해시로 하고, "의미 있는 차이" 판정만 이 정규화를 쓴다.
 */
const meaning = (s) => s.replace(/['"`]/g, "").replace(/;/g, "").replace(/\s+/g, " ").trim();
const isUpdate = process.argv.includes("--update");

function localFiles() {
  return readdirSync(UI_DIR)
    .filter((f) => f.endsWith(".tsx") || f.endsWith(".ts"))
    .sort();
}

async function fetchUpstream(name) {
  const res = await fetch(`${BASE}/${name}.json`);
  if (!res.ok) return null;
  const json = await res.json();
  const file = (json.files ?? []).find((f) => f.path?.endsWith(`${name}.tsx`)) ?? json.files?.[0];
  return file?.content ? rewriteUpstream(file.content) : null;
}

const manifest = existsSync(MANIFEST_PATH)
  ? JSON.parse(readFileSync(MANIFEST_PATH, "utf8"))
  : { style: STYLE, checkedAt: null, components: {} };

const results = { upstreamChanged: [], localUnrecorded: [], missingUpstream: [], clean: [] };

for (const file of localFiles()) {
  if (file === "upstream.manifest.json") continue;
  const name = file.replace(/\.tsx?$/, "");
  const localContent = readFileSync(join(UI_DIR, file), "utf8");
  const localHash = sha(localContent);
  const upstreamContent = await fetchUpstream(name);
  const entry = manifest.components[file];

  if (upstreamContent === null) {
    // 상류에 없는 컴포넌트(자체 제작이거나 다른 이름). 매니페스트에 명시돼 있어야 한다.
    results.missingUpstream.push(file);
    if (isUpdate) {
      manifest.components[file] = {
        upstream: null,
        localHash,
        note: entry?.note ?? "상류 레지스트리에 같은 이름이 없다 — 자체 컴포넌트인지 확인 필요",
      };
    }
    continue;
  }

  const upstreamHash = sha(upstreamContent);
  const customized = meaning(upstreamContent) !== meaning(localContent);

  if (isUpdate) {
    manifest.components[file] = {
      upstream: upstreamHash,
      localHash,
      customized,
      note: entry?.note ?? (customized ? "차이 있음 — 이유를 여기에 적는다" : "상류와 동일"),
    };
    continue;
  }

  if (!entry) {
    results.localUnrecorded.push(`${file} (매니페스트에 없음)`);
    continue;
  }
  if (entry.upstream !== upstreamHash) results.upstreamChanged.push(`${file} (상류 변경)`);
  if (entry.localHash !== localHash) results.localUnrecorded.push(`${file} (기록 없는 로컬 수정)`);
  if (entry.upstream === upstreamHash && entry.localHash === localHash) results.clean.push(file);
}

if (isUpdate) {
  manifest.style = STYLE;
  manifest.checkedAt = new Date().toISOString().slice(0, 10);
  writeFileSync(MANIFEST_PATH, `${JSON.stringify(manifest, null, 2)}\n`);
  const customized = Object.values(manifest.components).filter((c) => c.customized).length;
  console.log(`매니페스트 갱신: ${Object.keys(manifest.components).length}개 (커스터마이즈 ${customized}개)`);
  process.exit(0);
}

const report = (label, list) => {
  if (!list.length) return;
  console.log(`\n${label} (${list.length})`);
  for (const item of list) console.log(`  - ${item}`);
};
console.log(`상류 스타일: ${STYLE} · 기준일: ${manifest.checkedAt ?? "(없음)"}`);
console.log(`일치: ${results.clean.length}`);
report("상류가 바뀌었다 — 반영 여부 판단 필요", results.upstreamChanged);
report("기록 없는 로컬 수정 — 매니페스트에 이유를 남겨라", results.localUnrecorded);
report("상류에 없는 컴포넌트", results.missingUpstream);

const failed = results.upstreamChanged.length + results.localUnrecorded.length;
if (failed) {
  console.log(`\n점검 실패: ${failed}건. 확인 후 이유를 매니페스트에 남기고 --update 로 갱신한다.`);
  process.exitCode = 1;
} else {
  console.log("\n점검 통과.");
}
