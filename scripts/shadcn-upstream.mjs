/**
 * shadcn 상류 드리프트 점검 (#48 → #62) — 수동 게이트.
 *
 * ## 무엇과 대조하는가
 *
 * 예전 이 게이트는 상류 레지스트리 **JSON 원문**과 `components/ui/*.tsx` 를 비교했다.
 * 그런데 소비자가 실제로 받는 것은 원문이 아니라 **CLI 가 설치 시점에 치환한 결과**다.
 * 치환은 최소 세 종류다.
 *
 *   - `IconPlaceholder` → `components.json` 의 `iconLibrary` 에 맞는 아이콘 import
 *   - `cn-*` 토큰 — 어떤 것은 접두사만 벗고(`cn-font-heading` → `font-heading`),
 *     어떤 것은 `menuColor`/`menuAccent` 옵션에 따라 통째로 사라진다
 *   - import 경로 별칭 — `@/registry/<style>/ui/x` → `aliases.ui`
 *
 * 이 치환을 정규식으로 흉내내는 시도는 #57 에서 두 번 실패했다(접두사만 벗기면 12건,
 * 토큰을 통째로 지우면 17건 — 실측 6건과 둘 다 어긋났다). 규칙이 옵션 조합에 따라
 * 갈리므로 재구현은 원리적으로 따라잡을 수 없다. **그래서 CLI 규칙을 흉내내지 않고
 * CLI 를 돌린다** — 프로브 프로젝트에 같은 프리셋으로 실제 설치한 뒤 그 결과와 비교한다.
 *
 * 남는 정규화는 두 가지뿐이고, 둘 다 "CLI 가 무엇을 하는가" 가 아니라 "설치 후 우리가
 * 무엇을 하는가" 에 대한 것이다.
 *
 *   1. `from "cn"` → `aliases.utils` — 현재 CLI 는 radix-nova 설치본 60개 중 56개에
 *      이 플레이스홀더를 그대로 남긴다(그 상태로는 빌드되지 않는다). 우리 쪽은 설치 후
 *      실제 별칭으로 고쳐 쓴다.
 *   2. import 문 정렬·빈 줄 묶음 — 이 레포의 포매터가 다시 배치한다.
 *
 * ## 프로브 캐시
 *
 * 프로브는 `.shadcn-probe/app` (gitignore 대상)에 둔다. 스캐폴딩(create-next-app +
 * shadcn init + node_modules)은 재사용하고, 점검할 때마다 `shadcn add` 만 다시 돌린다 —
 * 상류를 새로 받는 것은 그 단계이므로 캐시가 측정을 낡게 만들지 않는다.
 * 스캐폴딩을 새로 만들려면 `--refresh`.
 *
 * ## 네트워크
 *
 * **네트워크와 외부 CLI 를 쓰므로 CI·테스트에서 돌리지 않는다.** 이 레포는 폐쇄망
 * 전제이며 제품 코드의 외부 fetch 는 0건이어야 한다. vision 게이트와 같은 수동 게이트다.
 * 상류에 닿지 못하면 **조용히 통과하지 않고** 사유를 찍고 실패한다.
 *
 *   node scripts/shadcn-upstream.mjs            # 점검 (상류 재설치 포함)
 *   node scripts/shadcn-upstream.mjs --update   # 현재 상태를 기준으로 매니페스트 갱신
 *   node scripts/shadcn-upstream.mjs --cached   # 재설치 없이 캐시된 설치본과만 대조 (폐쇄망)
 *   node scripts/shadcn-upstream.mjs --refresh  # 프로브 스캐폴딩을 새로 만든다
 */
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const UI_DIR = join(ROOT, "components", "ui");
const MANIFEST_PATH = join(UI_DIR, "upstream.manifest.json");
const PROBE_ROOT = process.env.SHADCN_PROBE_DIR || join(ROOT, ".shadcn-probe");
const PROBE_APP = join(PROBE_ROOT, "app");

const isUpdate = process.argv.includes("--update");
const isForce = process.argv.includes("--force");
const isCached = process.argv.includes("--cached");
const isRefresh = process.argv.includes("--refresh");

const components = JSON.parse(readFileSync(join(ROOT, "components.json"), "utf8"));
const STYLE = process.env.SHADCN_STYLE || components.style;
const UTILS_ALIAS = components.aliases?.utils ?? "@/lib/utils";

if (isCached && isUpdate) {
  console.error("--cached 와 --update 는 함께 쓸 수 없다 — 낡은 설치본을 기준으로 매니페스트를 덮어쓰게 된다.");
  process.exit(1);
}

const sha = (s) => createHash("sha256").update(s).digest("hex").slice(0, 16);

/**
 * 설치본과 카탈로그 파일의 "내용이 같은가" 판정.
 *
 * 여기서 손대는 것은 **설치 이후 우리 쪽 후처리**뿐이다(상단 주석 참고). CLI 치환을
 * 흉내내는 규칙은 하나도 없다 — 그건 실제 설치가 이미 끝낸 일이다.
 */
function meaning(src) {
  const lines = src.replace(/from ["']cn["']/g, `from "${UTILS_ALIAS}"`).split("\n");
  const imports = lines.filter((l) => /^\s*import\s/.test(l)).sort();
  const rest = lines.filter((l) => !/^\s*import\s/.test(l));
  return [...imports, ...rest].join("\n").replace(/['"`]/g, "").replace(/;/g, "").replace(/\s+/g, " ").trim();
}

/**
 * 설치본과 "내용은 같다" 로 판정된 파일이 그래도 바이트가 다를 때, **정확히 무엇이
 * 남은 차이인지** 를 기계적으로 답한다 (#67 리뷰 2 → #62).
 *
 * 예전 매니페스트는 이 자리에 "포맷 차이뿐" 이라고 손으로 적어 뒀는데, 그 문장은
 * 검증되지 않아 낡아도 아무도 모른다. 아래 단계를 차례로 적용해 어느 단계에서 같아지는지
 * 로 분류하면 사람의 주장이 아니라 측정이 된다.
 */
const RESIDUAL_KINDS = {
  identical: "바이트까지 동일",
  absent: "상류 설치본에 같은 이름이 없다",
  cnAlias: '설치본의 from "cn" 플레이스홀더만 다름 — 우리 쪽은 실제 별칭으로 해소돼 있다',
  importOrder: 'import 문 순서만 다름(그 밖의 바이트는 동일, from "cn" 해소 포함)',
  importLayout: 'import 문 순서와 빈 줄 배치가 다름(from "cn" 해소 포함)',
  formatting: 'import 순서는 같고 빈 줄·공백 배치만 다름(from "cn" 해소 포함)',
};

/** import 문만 정렬하고 나머지 줄은 원문 그대로 둔 형태. */
function sortImports(src) {
  const lines = src.split("\n");
  const imports = lines.filter((l) => /^\s*import\s/.test(l)).sort();
  const rest = lines.filter((l) => !/^\s*import\s/.test(l));
  return [...imports, ...rest].join("\n");
}

function residualKind(local, installed) {
  if (local === installed) return "identical";
  const resolved = installed.replace(/from ["']cn["']/g, `from "${UTILS_ALIAS}"`);
  if (resolved === local) return "cnAlias";
  if (sortImports(resolved) === sortImports(local)) return "importOrder";
  if (meaning(installed) === meaning(local)) {
    // 공백·빈 줄까지 무시해야 같아진다. import 줄이 관여했는지로 둘을 가른다.
    const localImports = local.split("\n").filter((l) => /^\s*import\s/.test(l));
    const installedImports = resolved.split("\n").filter((l) => /^\s*import\s/.test(l));
    return localImports.join("\n") === installedImports.join("\n") ? "formatting" : "importLayout";
  }
  return "differs";
}

/**
 * 파일이 어느 하우스 스타일 그룹에 해당하는지 표식으로 분류한다 (#48 리뷰 C1).
 *
 * "차이가 있다" 만 기록하면 나중에 누가 그 차이를 보고 "되돌려도 되나" 를 물을 때
 * 매니페스트가 답을 못 한다. 그룹을 파일 단위로 붙여야 사유(houseStyle[*].why)가
 * 실제로 연결된다. 비교 대상은 이제 상류 원문이 아니라 **설치본**이다.
 */
function classify(local, installed) {
  const groups = [];
  const sizeRe = /\b(?:h|size)-\d+(?:\.\d+)?\b/g;
  if ((local.match(sizeRe) ?? []).join(",") !== (installed.match(sizeRe) ?? []).join(",")) groups.push("controlScale");
  const roundedRe = /\brounded-(?:\[[^\]]+\]|[a-z0-9]+)/g;
  if ((local.match(roundedRe) ?? []).join(",") !== (installed.match(roundedRe) ?? []).join(","))
    groups.push("radiusTokens");
  const shorthandLocal = /(?:data-(?:horizontal|vertical):|\bin-data-\[)/.test(local);
  const longhandInstalled = /(?:data-\[orientation=|\[\[data-slot=)/.test(installed);
  if (shorthandLocal && longhandInstalled) groups.push("variantShorthand");
  if (local.includes("has-data-[icon=") && !installed.includes("has-data-[icon=")) groups.push("iconSlotConvention");

  const tokenRe = /\b(?:bg|text|border|ring)-(?:accent|muted|border|primary|secondary)\b/g;
  if ((local.match(tokenRe) ?? []).join(",") !== (installed.match(tokenRe) ?? []).join(","))
    groups.push("semanticTokenSwap");

  if (/\n\s+size\??:/.test(local) && !/\n\s+size\??:/.test(installed)) groups.push("addedProps");

  const affordanceRe = /(after:|before:|\*\*:data-\[slot=)/;
  if (affordanceRe.test(local) && !affordanceRe.test(installed)) groups.push("addedAffordance");

  return groups;
}

function localFiles() {
  return readdirSync(UI_DIR)
    .filter((f) => f.endsWith(".tsx") || f.endsWith(".ts"))
    .sort();
}

function run(cmd, args, cwd) {
  const res = spawnSync(cmd, args, { cwd, encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });
  if (res.error) return { ok: false, output: String(res.error.message) };
  const output = `${res.stdout ?? ""}${res.stderr ?? ""}`;
  return { ok: res.status === 0, output };
}

/** 상류에 닿지 못한 것인지, 다른 이유로 실패한 것인지 구분해 사람이 읽을 사유를 만든다. */
function diagnose(output) {
  if (/ENOTFOUND|EAI_AGAIN|ECONNREFUSED|ETIMEDOUT|ECONNRESET|network|getaddrinfo|socket hang up/i.test(output))
    return "상류 레지스트리에 닿지 못했다(네트워크·프록시·폐쇄망). 검증하지 못했으므로 통과가 아니다.";
  if (/\b429\b|rate limit/i.test(output)) return "상류가 요청을 제한했다(429). 잠시 뒤 다시 돌려라.";
  return "shadcn CLI 가 실패했다. 아래 출력을 확인하라.";
}

/**
 * 프로브 스캐폴딩을 보장한다. 이미 있으면 재사용하고, 없거나 --refresh 면 새로 만든다.
 * `components.json` 은 **항상 이 레포의 것으로 덮어쓴다** — 프리셋(style·iconLibrary·
 * menuColor·menuAccent·aliases)이 달라지면 CLI 의 치환 결과가 달라지기 때문이다.
 * registries 는 우리 카탈로그를 가리키므로 프로브에서는 비운다(상류만 받아야 한다).
 */
function ensureProbe() {
  if (isRefresh && existsSync(PROBE_ROOT)) rmSync(PROBE_ROOT, { recursive: true, force: true });

  if (!existsSync(join(PROBE_APP, "package.json"))) {
    if (isCached) {
      console.error(`프로브 캐시가 없다: ${PROBE_APP}`);
      console.error("--cached 는 이미 만들어 둔 설치본과 대조하는 모드다. 먼저 네트워크에서 한 번 돌려라.");
      process.exit(1);
    }
    console.log("프로브 스캐폴딩 생성 중 (create-next-app + shadcn init) …");
    mkdirSync(PROBE_ROOT, { recursive: true });
    const created = run(
      "pnpm",
      // prettier-ignore
      ["dlx", "create-next-app@latest", "app", "--ts", "--tailwind", "--eslint", "--app",
       "--no-src-dir", "--turbopack", "--import-alias", "@/*", "--use-pnpm", "--yes"],
      PROBE_ROOT,
    );
    if (!created.ok) {
      console.error(`프로브 생성 실패 — ${diagnose(created.output)}`);
      console.error(created.output.trim().split("\n").slice(-20).join("\n"));
      process.exit(1);
    }
    const inited = run("pnpm", ["dlx", "shadcn@latest", "init", "-t", "next", "-b", "radix", "-p", "nova", "-y"], PROBE_APP);
    if (!inited.ok) {
      console.error(`프로브 init 실패 — ${diagnose(inited.output)}`);
      console.error(inited.output.trim().split("\n").slice(-20).join("\n"));
      process.exit(1);
    }
  }

  const preset = { ...components, registries: {} };
  writeFileSync(join(PROBE_APP, "components.json"), `${JSON.stringify(preset, null, 2)}\n`);
}

/** 프로브에 60종을 한 번의 `add` 로 받는다 — 상류 서버를 항목마다 때리지 않는다. */
function installUpstream(names) {
  console.log(`상류 설치 중 (${names.length}종, style=${STYLE}) …`);
  const added = run("pnpm", ["dlx", "shadcn@latest", "add", ...names, "-y", "--overwrite"], PROBE_APP);
  if (!added.ok) {
    console.error(`상류 설치 실패 — ${diagnose(added.output)}`);
    console.error(added.output.trim().split("\n").slice(-20).join("\n"));
    process.exit(1);
  }
}

const files = localFiles().filter((f) => f.endsWith(".tsx"));
const names = files.map((f) => f.replace(/\.tsx$/, ""));

ensureProbe();
if (isCached) {
  console.log("주의: --cached — 상류를 다시 받지 않고 캐시된 설치본과만 대조한다. 상류 드리프트는 검증되지 않는다.");
} else {
  installUpstream(names);
}

const probeUi = join(PROBE_APP, "components", "ui");
const manifest = existsSync(MANIFEST_PATH)
  ? JSON.parse(readFileSync(MANIFEST_PATH, "utf8"))
  : { style: STYLE, checkedAt: null, components: {}, houseStyle: {}, installDiff: { files: {} } };

const results = { installChanged: [], localUnrecorded: [], missingInstall: [], clean: [], differs: [] };
const flips = [];
const nextComponents = {};

for (const file of localFiles()) {
  const localContent = readFileSync(join(UI_DIR, file), "utf8");
  const localHash = sha(localContent);
  const entry = manifest.components[file];
  const probePath = join(probeUi, file);

  if (!existsSync(probePath)) {
    // 상류에 없는 컴포넌트다 — 자체 자산이거나 이름이 바뀐 것이다. "차이 없음" 이 아니다.
    results.missingInstall.push(file);
    nextComponents[file] = {
      installed: null,
      localHash,
      customized: entry?.customized ?? false,
      residual: "absent",
      groups: entry?.groups ?? [],
      note: entry?.note ?? "상류 설치본에 같은 이름이 없다 — 자체 컴포넌트인지 확인 필요",
    };
    if (!isUpdate && entry && entry.localHash !== localHash) results.localUnrecorded.push(`${file} (기록 없는 로컬 수정)`);
    continue;
  }

  const installedContent = readFileSync(probePath, "utf8");
  const installedMeaning = meaning(installedContent);
  const installedHash = sha(installedMeaning);
  const residual = residualKind(localContent, installedContent);
  const differs = residual === "differs";
  if (differs) results.differs.push(file);

  nextComponents[file] = {
    installed: installedHash,
    localHash,
    customized: differs,
    residual,
    groups: differs ? classify(localContent, installedContent) : [],
    // 차이 없음 쪽의 사유는 사람이 적는 문장이 아니라 **측정 결과**다. 손으로 적은
    // "포맷 차이뿐" 같은 문장은 검증되지 않아 낡아도 아무도 모른다 (#67 리뷰 2).
    note: differs ? (entry?.note ?? "") : `설치본과 내용 동일 — ${RESIDUAL_KINDS[residual]}.`,
  };

  if (isUpdate) {
    if (entry?.customized === true && differs === false) flips.push(file);
    continue;
  }

  if (!entry) {
    results.localUnrecorded.push(`${file} (매니페스트에 없음)`);
    continue;
  }
  if (entry.installed !== installedHash) results.installChanged.push(`${file} (상류 설치본 변경)`);
  if (entry.localHash !== localHash) results.localUnrecorded.push(`${file} (기록 없는 로컬 수정)`);
  if (entry.installed === installedHash && entry.localHash === localHash) results.clean.push(file);
}

const today = new Date().toISOString().slice(0, 10);

if (isUpdate) {
  // 차이가 사라졌다면 의도한 것인지 사람이 확인해야 한다. 실수로 설치본을 그대로
  // 덮어쓴 뒤 --update 를 돌리면 그 손실이 "정상" 으로 기록된다(#48 리뷰 H4).
  if (flips.length && !isForce) {
    console.error(`설치본과의 차이가 사라진 항목 ${flips.length}건 — 의도한 변경이 아니면 되돌려라.`);
    for (const file of flips) console.error(`  - ${file}`);
    console.error("의도한 변경이면 --force 를 붙여 다시 실행한다.");
    process.exit(1);
  }

  manifest.style = STYLE;
  manifest.checkedAt = today;
  manifest.components = nextComponents;

  // installDiff 는 손으로 적는 목록이 아니라 **이번 측정의 결과**다. 사유는 기존 것을
  // 잇고, 사라진 파일은 떨군다 — 남겨 두면 옛 측정이 현재 기록인 척한다.
  const priorFiles = manifest.installDiff?.files ?? {};
  const diffFiles = {};
  for (const file of results.differs) diffFiles[file] = priorFiles[file] ?? nextComponents[file].note ?? "";
  manifest.installDiff = {
    measuredAt: today,
    how: `.shadcn-probe 프로브에 이 레포의 components.json 프리셋(style=${STYLE})으로 shadcn init 후 ${names.length}종을 bare 이름으로 설치해 대조 (node scripts/shadcn-upstream.mjs --update).`,
    meaning:
      "CLI 설치본과 실제로 다른 파일. 원문이 아니라 설치 결과와 비교하므로 CLI 치환(IconPlaceholder·cn-* 토큰·메뉴 옵션)은 여기에 섞이지 않는다 (#62).",
    files: diffFiles,
  };

  writeFileSync(MANIFEST_PATH, `${JSON.stringify(manifest, null, 2)}\n`);
  const blank = Object.entries(diffFiles).filter(([, why]) => !String(why).trim()).length;
  console.log(
    `매니페스트 갱신: ${Object.keys(nextComponents).length}개 (설치본과 다름 ${results.differs.length}개, 상류에 없음 ${results.missingInstall.length}개)`,
  );
  for (const file of results.differs) console.log(`  - ${file}`);
  if (blank) console.log(`사유가 비어 있는 항목 ${blank}개 — installDiff.files 에 이유를 적어라. 테스트가 이를 강제한다.`);
  process.exit(0);
}

const report = (label, list) => {
  if (!list.length) return;
  console.log(`\n${label} (${list.length})`);
  for (const item of list) console.log(`  - ${item}`);
};
console.log(`\n기준 스타일: ${STYLE} · 매니페스트 측정일: ${manifest.installDiff?.measuredAt ?? "(없음)"}`);
console.log(`대조 방식: 실제 설치본 (프로브 ${probeUi})`);
console.log(`일치: ${results.clean.length} / 설치본과 다름: ${results.differs.length}`);
const residualTally = {};
for (const entry of Object.values(nextComponents)) residualTally[entry.residual] = (residualTally[entry.residual] ?? 0) + 1;
console.log(
  `남은 차이 내역: ${Object.entries(residualTally)
    .map(([kind, count]) => `${kind} ${count}`)
    .join(" · ")}`,
);
report("상류 설치본이 바뀌었다 — 반영 여부 판단 필요", results.installChanged);
report("기록 없는 로컬 수정 — 매니페스트에 이유를 남겨라", results.localUnrecorded);
report("상류 설치본에 없는 컴포넌트", results.missingInstall);

const failed = results.installChanged.length + results.localUnrecorded.length;
if (failed) {
  console.log(`\n점검 실패: ${failed}건. 확인 후 이유를 매니페스트에 남기고 --update 로 갱신한다.`);
  process.exitCode = 1;
} else {
  console.log("\n점검 통과.");
}
