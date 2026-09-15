/**
 * #37 RC2 — registry.json 에 미노출 원형의 template 블록을 추가한다.
 *
 * 문제: registry.json 의 template 블록이 7개(admin·bank·brokerage·chat·saas·shop·trading)뿐이고
 * 전부 sidebar-app / dashboard-grid / top-nav-site / chat-workspace / wizard-flow 계열이다.
 * 원형 표가 가리키는 split-pane·feed-timeline·canvas·doc-reader 대표 템플릿은
 * 에이전트가 `shadcn add` 할 수 없어, 원형을 골라도 모방할 실물이 없다.
 *
 * 이 스크립트는 기존 블록과 동일한 규약으로 새 블록을 만든다:
 *   - files: app/templates/<slug>/ 아래 *.test.tsx 를 뺀 전부 (루트 → _components → 하위 라우트 순)
 *   - dependencies: 소스의 npm import 중 package.json dependencies 에 있는 것
 *   - registryDependencies: 소스가 import 하는 경로가 다른 registry item 의 파일이면 그 item 의 URL
 *
 * 일회성이지만 재실행 가능(idempotent)하게 썼다 — 이미 있는 블록은 건드리지 않는다.
 */
import { readFileSync, writeFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const ROOT = new URL("../../", import.meta.url).pathname;
const REGISTRY_PATH = join(ROOT, "registry.json");
const HOMEPAGE = "https://ui.doksam.com";

/** 추가할 템플릿 — 각 원형을 실물로 덮는 최소 집합. */
const TARGETS = [
  { slug: "mail-workspace", archetype: "split-pane" },
  { slug: "activity-feed", archetype: "feed-timeline" },
  { slug: "marketing-site", archetype: "top-nav-site" },
  { slug: "knowledge-base", archetype: "doc-reader" },
  { slug: "crawler-console", archetype: "wizard-flow" },
  { slug: "glossary", archetype: "canvas" },
];

function walk(dir) {
  const out = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) out.push(...walk(full));
    else out.push(full);
  }
  return out;
}

/** 기존 블록의 파일 순서 규약: 루트 깊이 우선, 그 안에서 _components 뒤로. */
function orderFiles(paths, base) {
  const depth = (p) => relative(base, p).split("/").length;
  const rank = (p) => (relative(base, p).startsWith("_") ? 1 : 0);
  return paths.sort((a, b) => depth(a) - depth(b) || rank(a) - rank(b) || a.localeCompare(b));
}

const registry = JSON.parse(readFileSync(REGISTRY_PATH, "utf8"));
const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8"));
/** 프레임워크 런타임은 기존 블록 관례상 dependencies 에 싣지 않는다. */
const FRAMEWORK_DEPS = new Set(["react", "react-dom", "next"]);
const npmDeps = new Set(Object.keys(pkg.dependencies ?? {}).filter((d) => !FRAMEWORK_DEPS.has(d)));

/** registry item 이 소유한 소스 경로 → item 이름. registryDependencies 판정에 쓴다. */
const ownerByPath = new Map();
for (const item of registry.items) {
  if (item.name.startsWith("template-")) continue;
  for (const file of item.files ?? []) ownerByPath.set(file.path, item.name);
}

const existing = new Set(registry.items.map((i) => i.name));
const templateMeta = readFileSync(join(ROOT, "lib/templates/registry.ts"), "utf8");

function metaFor(slug) {
  const block = templateMeta.split(`href: "/templates/${slug}"`)[1] ?? "";
  const title = block.match(/title: "([^"]+)"/)?.[1] ?? slug;
  const profile = block.match(/profile: "([^"]+)"/)?.[1] ?? "";
  const description = block.match(/description:\s*\n?\s*"([^"]+)"/)?.[1] ?? "";
  return { title, profile, description };
}

const added = [];
for (const { slug, archetype } of TARGETS) {
  const name = `template-${slug}`;
  if (existing.has(name)) continue;

  const base = join(ROOT, "app/templates", slug);
  const files = orderFiles(
    walk(base).filter((p) => !p.endsWith(".test.tsx") && !p.endsWith(".test.ts")),
    base,
  ).map((p) => {
    const path = relative(ROOT, p);
    return { path, type: "registry:page", target: path };
  });

  const sources = files.map((f) => readFileSync(join(ROOT, f.path), "utf8")).join("\n");
  const dependencies = [...npmDeps]
    .filter((d) => new RegExp(`from "${d.replace(/[/\\]/g, "\\$&")}(/|")`).test(sources))
    .sort();

  const registryDependencies = [...new Set(
    [...sources.matchAll(/from "@\/([^"]+)"/g)]
      .map((m) => m[1])
      .flatMap((imp) => {
        for (const ext of [".tsx", ".ts"]) {
          const owner = ownerByPath.get(`${imp}${ext}`);
          if (owner) return [owner];
        }
        return [];
      }),
  )].sort().map((n) => `${HOMEPAGE}/r/${n}.json`);

  const { title, profile, description } = metaFor(slug);
  registry.items.push({
    $schema: "https://ui.shadcn.com/schema/registry-item.json",
    name,
    type: "registry:block",
    title: `${title} 템플릿`,
    description: `${profile} · ${archetype} 원형. ${description}`,
    ...(dependencies.length ? { dependencies } : {}),
    ...(registryDependencies.length ? { registryDependencies } : {}),
    files,
  });
  added.push({ name, archetype, files: files.length, dependencies, registryDependencies });
}

writeFileSync(REGISTRY_PATH, `${JSON.stringify(registry, null, 2)}\n`);
console.log(JSON.stringify(added, null, 2));
console.log(`template blocks: ${registry.items.filter((i) => i.name.startsWith("template-")).length}`);
