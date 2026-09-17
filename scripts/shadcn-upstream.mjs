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
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const UI_DIR = join(ROOT, "components", "ui");
const MANIFEST_PATH = join(ROOT, "components", "ui", "upstream.manifest.json");
const STYLE = process.env.SHADCN_STYLE || "new-york-v4";
const BASE = `https://ui.shadcn.com/r/styles/${STYLE}`;
/** 상류 레지스트리 연속 조회 간격 — 60개를 한 번에 때리지 않는다. */
const FETCH_DELAY_MS = Number(process.env.SHADCN_FETCH_DELAY_MS ?? 150);

/**
 * 상류 레지스트리 JSON 은 CLI 가 설치 시점에 재작성하는 **플레이스홀더 import**
 * (`from "cn"` 등)를 담고 있다. 그대로 비교하면 전 파일이 "차이 있음" 으로 잡혀
 * 신호가 죽는다. 설치 후 형태로 맞춘 뒤 비교한다.
 */
function rewriteUpstream(src) {
  return src
    .replace(/from ["']@\/registry\/[a-z0-9-]+\/ui\/([a-z-]+)["']/g, 'from "@/components/ui/$1"')
    .replace(/from ["']@\/registry\/[a-z0-9-]+\/(lib|hooks)\/([a-z-]+)["']/g, 'from "@/$1/$2"')
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
function meaning(src) {
  // import 순서 차이는 커스터마이즈가 아니라 정렬 규칙 차이다 — 정렬해서 비교한다.
  const lines = src.split("\n");
  const imports = lines.filter((l) => /^\s*import\s/.test(l)).sort();
  const rest = lines.filter((l) => !/^\s*import\s/.test(l));
  return [...imports, ...rest]
    .join("\n")
    .replace(/['"`]/g, "")
    .replace(/;/g, "")
    .replace(/\s+/g, " ")
    .trim();
}
const isUpdate = process.argv.includes("--update");
const isForce = process.argv.includes("--force");

/**
 * 파일이 어느 하우스 스타일 그룹에 해당하는지 표식으로 분류한다 (#48 리뷰 C1).
 *
 * "차이가 있다" 만 기록하면 나중에 누가 그 차이를 보고 "되돌려도 되나" 를 물을 때
 * 매니페스트가 답을 못 한다. 그룹을 파일 단위로 붙여야 사유(houseStyle[*].why)가
 * 실제로 연결된다.
 */
function classify(local, upstream) {
  const groups = [];
  const sizeRe = /\b(?:h|size)-\d+(?:\.\d+)?\b/g;
  const localSizes = (local.match(sizeRe) ?? []).join(",");
  const upstreamSizes = (upstream.match(sizeRe) ?? []).join(",");
  if (localSizes !== upstreamSizes) groups.push("controlScale");
  const roundedRe = /\brounded-(?:\[[^\]]+\]|[a-z0-9]+)/g;
  const localRounded = (local.match(roundedRe) ?? []).join(",");
  const upstreamRounded = (upstream.match(roundedRe) ?? []).join(",");
  if (localRounded !== upstreamRounded) groups.push("radiusTokens");
  const shorthandLocal = /(?:data-(?:horizontal|vertical):|\bin-data-\[)/.test(local);
  const longhandUpstream = /(?:data-\[orientation=|\[\[data-slot=)/.test(upstream);
  if (shorthandLocal && longhandUpstream) groups.push("variantShorthand");
  if (local.includes("has-data-[icon=")) groups.push("iconSlotConvention");

  // 시맨틱 토큰 교체 — 예: 상류 bg-accent → 우리 bg-muted.
  const tokenRe = /\b(?:bg|text|border|ring)-(?:accent|muted|border|primary|secondary)\b/g;
  const localTokens = (local.match(tokenRe) ?? []).join(",");
  const upstreamTokens = (upstream.match(tokenRe) ?? []).join(",");
  if (localTokens !== upstreamTokens) groups.push("semanticTokenSwap");

  // 상류에 없는 prop 추가 — 예: card 의 size.
  if (/\n\s+size\??:/.test(local) && !/\n\s+size\??:/.test(upstream)) groups.push("addedProps");

  // 어포던스 추가 — 상류에 없는 의사요소·슬롯 처리로 기능을 덧댄 경우.
  if (/(after:|before:|\*\*:data-\[slot=)/.test(local) && !/(after:|before:|\*\*:data-\[slot=)/.test(upstream))
    groups.push("addedAffordance");

  return groups;
}

function localFiles() {
  return readdirSync(UI_DIR)
    .filter((f) => f.endsWith(".tsx") || f.endsWith(".ts"))
    .sort();
}

/**
 * 상류 조회 결과는 세 가지다 — 내용 / 상류에 없음(404) / 조회 실패(네트워크·429).
 * 셋을 구분하지 않으면 사내망이나 rate limit 상황에서 **아무것도 검증하지 못한 채
 * "점검 통과" 가 뜬다**(#48 리뷰 H2).
 */
async function fetchUpstream(name) {
  let res;
  try {
    res = await fetch(`${BASE}/${name}.json`);
  } catch (error) {
    return { status: "error", reason: String(error?.message ?? error) };
  }
  // 레지스트리도 남의 서버다 — 연속 조회 사이에 간격을 둔다.
  await new Promise((resolve) => setTimeout(resolve, FETCH_DELAY_MS));
  if (res.status === 404) return { status: "absent" };
  if (res.status === 429) return { status: "error", reason: `429 (Retry-After: ${res.headers.get("retry-after") ?? "?"})` };
  if (!res.ok) return { status: "error", reason: `HTTP ${res.status}` };
  const json = await res.json();
  const file = (json.files ?? []).find((f) => f.path?.endsWith(`${name}.tsx`)) ?? json.files?.[0];
  if (!file?.content) return { status: "absent" };
  return { status: "ok", content: rewriteUpstream(file.content) };
}

const manifest = existsSync(MANIFEST_PATH)
  ? JSON.parse(readFileSync(MANIFEST_PATH, "utf8"))
  : { style: STYLE, checkedAt: null, components: {} };

const results = { upstreamChanged: [], localUnrecorded: [], missingUpstream: [], fetchFailed: [], clean: [] };
const flips = [];

for (const file of localFiles()) {
  const name = file.replace(/\.tsx?$/, "");
  const localContent = readFileSync(join(UI_DIR, file), "utf8");
  const localHash = sha(localContent);
  const upstream = await fetchUpstream(name);
  const entry = manifest.components[file];

  if (upstream.status === "error") {
    // 조회 실패는 "차이 없음" 이 아니다. 검증하지 못한 것이므로 실패로 센다.
    results.fetchFailed.push(`${file} — ${upstream.reason}`);
    continue;
  }

  if (upstream.status === "absent") {
    results.missingUpstream.push(file);
    if (isUpdate) {
      manifest.components[file] = {
        upstream: null,
        localHash,
        customized: entry?.customized ?? false,
        groups: entry?.groups ?? [],
        note: entry?.note ?? "상류 레지스트리에 같은 이름이 없다 — 자체 컴포넌트인지 확인 필요",
      };
    }
    continue;
  }

  const upstreamHash = sha(upstream.content);
  const customized = meaning(upstream.content) !== meaning(localContent);

  if (isUpdate) {
    // 커스터마이즈가 사라지는 방향의 변화는 손실일 수 있다 — 조용히 기록하지 않는다.
    if (entry?.customized === true && customized === false) flips.push(file);
    manifest.components[file] = {
      upstream: upstreamHash,
      localHash,
      customized,
      groups: customized ? classify(localContent, upstream.content) : [],
      note: entry?.note ?? (customized ? "" : "상류와 동일"),
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
  // 조회에 실패한 항목이 있으면 갱신하지 않는다. 부분 실패 상태를 기준으로 삼으면
  // 그 파일들의 기준 해시가 null 로 덮여 이후 드리프트를 영영 못 잡는다(#48 리뷰 H3).
  if (results.fetchFailed.length) {
    console.error(`상류 조회 실패 ${results.fetchFailed.length}건 — 매니페스트를 갱신하지 않는다.`);
    for (const item of results.fetchFailed) console.error(`  - ${item}`);
    process.exit(1);
  }
  // 커스터마이즈가 사라졌다면 의도한 것인지 사람이 확인해야 한다. 실수로 상류
  // 원본을 덮어쓴 뒤 --update 를 돌리면 그 손실이 "정상" 으로 기록된다(#48 리뷰 H4).
  if (flips.length && !isForce) {
    console.error(`커스터마이즈가 사라진 항목 ${flips.length}건 — 의도한 변경이 아니면 되돌려라.`);
    for (const file of flips) console.error(`  - ${file}`);
    console.error("의도한 변경이면 --force 를 붙여 다시 실행한다.");
    process.exit(1);
  }
  manifest.style = STYLE;
  manifest.checkedAt = new Date().toISOString().slice(0, 10);
  writeFileSync(MANIFEST_PATH, `${JSON.stringify(manifest, null, 2)}\n`);
  const customized = Object.values(manifest.components).filter((c) => c.customized).length;
  const blank = Object.entries(manifest.components).filter(([, c]) => c.customized && !c.note).length;
  console.log(`매니페스트 갱신: ${Object.keys(manifest.components).length}개 (커스터마이즈 ${customized}개)`);
  if (blank) console.log(`사유가 비어 있는 항목 ${blank}개 — note 를 채워라. 테스트가 이를 강제한다.`);
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
report("상류 조회 실패 — 검증하지 못했다", results.fetchFailed);

const failed = results.upstreamChanged.length + results.localUnrecorded.length + results.fetchFailed.length;
if (failed) {
  console.log(`\n점검 실패: ${failed}건. 확인 후 이유를 매니페스트에 남기고 --update 로 갱신한다.`);
  process.exitCode = 1;
} else {
  console.log("\n점검 통과.");
}
