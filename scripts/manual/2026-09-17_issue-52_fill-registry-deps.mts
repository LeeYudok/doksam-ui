/**
 * 이슈 #52 — 파운데이션 레지스트리 항목 추가 + 항목별 의존성 자동 채움.
 *
 * `registry.json` 을 읽어
 *   1) 소비 프로젝트에서 끊어지는 import 가 가리키는 파일을 제공하는 파운데이션 항목을 추가하고
 *   2) 각 항목의 registryDependencies 를 실제 import 로부터 계산해 채운다.
 *
 * 실행: npx tsx scripts/manual/2026-09-17_issue-52_fill-registry-deps.mts
 * 멱등이다 — 여러 번 돌려도 같은 결과가 나온다.
 */
import fs from "node:fs"
import path from "node:path"

import {
  REPO_ROOT,
  readRegistry,
  registryDependencyName,
  unresolvedImports,
  type Registry,
  type RegistryItem,
} from "../../lib/registry/closure"

const SCHEMA = "https://ui.shadcn.com/schema/registry-item.json"
const url = (name: string) => `https://ui.doksam.com/r/${name}.json`

/** `app/` 밖 파일을 그 자리에 그대로 깔기 위한 파일 엔트리. */
const file = (p: string, type = "registry:file") => ({ path: p, type, target: p })

/**
 * 새로 추가하는 파운데이션 항목.
 * 템플릿 블록이 공통으로 기대던 헬퍼 — 지금까지 어느 블록에도 실리지 않아
 * `shadcn add` 직후 import 가 끊어져 있었다.
 */
const FOUNDATION_ITEMS: RegistryItem[] = [
  {
    name: "theme-storage",
    type: "registry:lib",
    title: "Theme Storage",
    description:
      "테마·프로필·로케일 선택을 localStorage 에 담을 때 쓰는 키와 안전한 읽기/쓰기 헬퍼. 서버 렌더와 클라이언트 하이드레이션 사이에서 값이 어긋나지 않도록 초기화 순서를 고정한다.",
    dependencies: [],
    registryDependencies: [],
    files: [file("lib/theme-storage.ts")],
  } as RegistryItem,
  {
    name: "profile-scope",
    type: "registry:lib",
    title: "Profile Scope",
    description:
      "브랜드 프로필·성격 프리셋·모서리·타입 대비 네 축을 한 곳에서 해소해 레이아웃이 걸 data-* 속성과 클래스로 만들어 주는 헬퍼. 템플릿 레이아웃이 프로필을 스코프할 때 쓴다.",
    dependencies: [],
    registryDependencies: [url("theme-storage")],
    files: [
      file("components/profile-scope.ts"),
      file("profiles/index.ts"),
      file("personalities/index.ts"),
      file("corners/index.ts"),
      file("type-contrast/index.ts"),
    ],
  } as RegistryItem,
  {
    name: "i18n-provider",
    type: "registry:component",
    title: "I18n Provider",
    description:
      "로케일 4종(ko·en·ja·zh·es) 메시지 사전과 로케일 선택을 담는 Context Provider. 외부 i18n 의존성 없이 동작하며 선택은 localStorage 에 남는다.",
    dependencies: [],
    registryDependencies: [url("theme-storage")],
    files: [
      file("components/i18n-provider.tsx", "registry:component"),
      file("lib/i18n/index.ts"),
      file("lib/i18n/messages/en.json"),
      file("lib/i18n/messages/ja.json"),
      file("lib/i18n/messages/zh.json"),
      file("lib/i18n/messages/es.json"),
    ],
  } as RegistryItem,
  {
    name: "route-error",
    type: "registry:component",
    title: "Route Error",
    description:
      "Next App Router 의 error.tsx 가 그대로 쓰는 오류 화면. 다시 시도 버튼과 digest 표기를 표준화한다.",
    dependencies: ["@phosphor-icons/react"],
    registryDependencies: ["button"],
    files: [file("components/route-error.tsx", "registry:component")],
  } as RegistryItem,
  {
    name: "route-loading",
    type: "registry:component",
    title: "Route Loading",
    description:
      "Next App Router 의 loading.tsx 가 그대로 쓰는 스켈레톤 화면. 라우트 전환 중 레이아웃이 튀지 않도록 높이를 잡아 둔다.",
    dependencies: [],
    registryDependencies: ["skeleton"],
    files: [file("components/route-loading.tsx", "registry:component")],
  } as RegistryItem,
  {
    name: "sparkline",
    type: "registry:component",
    title: "Sparkline",
    description:
      "축·범례 없이 추세만 보여 주는 소형 라인 차트. 기준선·밴드·마커를 옵션으로 얹을 수 있고 recharts 없이 SVG 로 그린다.",
    dependencies: [],
    registryDependencies: [],
    files: [file("components/patterns/dataviz/sparkline-demo.tsx", "registry:component")],
  } as RegistryItem,
  {
    name: "return-curve",
    type: "registry:component",
    title: "Return Curve",
    description: "누적 수익률 곡선 — 0선을 기준으로 이익/손실 구간을 나눠 칠하는 영역 차트.",
    dependencies: [],
    registryDependencies: [],
    files: [file("components/patterns/dataviz/return-curve-demo.tsx", "registry:component")],
  } as RegistryItem,
  {
    name: "diverging-bar",
    type: "registry:component",
    title: "Diverging Bar",
    description: "0을 중심으로 좌우로 뻗는 발산형 막대 — 증감·편차 비교에 쓴다.",
    dependencies: [],
    registryDependencies: [],
    files: [file("components/patterns/dataviz/diverging-bar-demo.tsx", "registry:component")],
  } as RegistryItem,
  {
    name: "activity-heatmap",
    type: "registry:component",
    title: "Activity Heatmap",
    description: "날짜별 활동량을 격자 밀도로 보여 주는 히트맵.",
    dependencies: [],
    registryDependencies: [],
    files: [file("components/patterns/dataviz/activity-heatmap-demo.tsx", "registry:component")],
  } as RegistryItem,
  {
    name: "content-feed",
    type: "registry:component",
    title: "Content Feed",
    description: "같은 목록을 그리드·리스트·테이블 세 표현으로 전환해 보여 주는 콘텐츠 피드.",
    dependencies: ["@phosphor-icons/react"],
    registryDependencies: [],
    files: [
      file("components/patterns/content-feed/content-feed-demo.tsx", "registry:component"),
      file("components/patterns/content-feed/content-feed-data.ts"),
    ],
  } as RegistryItem,
  {
    name: "list-controls",
    type: "registry:component",
    title: "List Controls",
    description: "목록 상단의 검색·정렬·페이지네이션 컨트롤 묶음.",
    dependencies: ["@phosphor-icons/react"],
    registryDependencies: [],
    files: [file("components/patterns/list-controls/list-controls-demo.tsx", "registry:component")],
  } as RegistryItem,
]

/** 항목에 실리지 않았지만 그 블록에만 쓰이는 파일 — 블록 자기 `files` 에 넣는다. */
const BLOCK_LOCAL_FILES: Record<string, string[]> = {
  "template-trading": ["lib/templates/trading-data.ts"],
}

function main() {
  const registry = readRegistry()

  // 1) 파운데이션 항목 추가(이미 있으면 갱신).
  for (const item of FOUNDATION_ITEMS) {
    const withSchema = { $schema: SCHEMA, ...item } as RegistryItem
    const at = registry.items.findIndex((i) => i.name === item.name)
    if (at >= 0) registry.items[at] = withSchema
    else registry.items.push(withSchema)
  }

  // 2) 블록 전용 파일 추가.
  for (const [name, paths] of Object.entries(BLOCK_LOCAL_FILES)) {
    const item = registry.items.find((i) => i.name === name)
    if (!item) throw new Error(`${name} 항목이 없다`)
    for (const p of paths) {
      if (item.files?.some((f) => f.path === p)) continue
      item.files!.push({ path: p, type: "registry:file", target: p })
    }
  }

  // 3) 제공자 색인: 레포 상대 경로 → 그 파일을 싣는 항목 이름.
  const provider = new Map<string, string>()
  for (const item of registry.items) {
    for (const f of item.files ?? []) {
      const owner = provider.get(f.path)
      if (owner && owner !== item.name) {
        // 같은 파일을 두 항목이 싣는다 — 어느 쪽을 의존해야 할지 모호해진다.
        console.warn(`! ${f.path} 를 ${owner} 와 ${item.name} 이 함께 싣는다`)
        continue
      }
      provider.set(f.path, item.name)
    }
  }

  // 4) 끊어진 import 가 없을 때까지 의존성을 채운다.
  const upstreamManifest = JSON.parse(
    fs.readFileSync(path.join(REPO_ROOT, "components/ui/upstream.manifest.json"), "utf8"),
  ) as { components: Record<string, unknown> }
  const upstreamNames = new Set(Object.keys(upstreamManifest.components).map((f) => f.replace(/\.tsx$/, "")))

  let added = 0
  for (const item of registry.items) {
    for (let pass = 0; pass < 10; pass++) {
      const problems = unresolvedImports(item, registry)
      if (problems.length === 0) break
      const deps = new Set((item.registryDependencies ?? []).map(registryDependencyName))
      let changed = false
      for (const p of problems) {
        const uiName = p.resolved.startsWith("components/ui/")
          ? path.basename(p.resolved).replace(/\.tsx?$/, "")
          : null
        let dep: string | null = null
        if (uiName && upstreamNames.has(uiName)) dep = uiName
        else if (provider.has(p.resolved)) dep = url(provider.get(p.resolved)!)
        if (!dep) {
          console.error(`✗ ${item.name}: ${p.from} 의 ${p.specifier} → ${p.resolved} 를 실어 줄 항목이 없다`)
          continue
        }
        const depName = registryDependencyName(dep)
        if (depName === item.name || deps.has(depName)) continue
        deps.add(depName)
        item.registryDependencies = [...(item.registryDependencies ?? []), dep]
        changed = true
        added += 1
      }
      if (!changed) break
    }
  }

  // 5) npm 의존성에 버전 범위를 박는다.
  // 범위가 없으면 shadcn 이 latest 를 깔아 카탈로그 코드와 메이저가 어긋난다 —
  // 실제로 @tanstack/react-table 이 v8 코드에 v9 가 깔려 빌드가 깨졌다.
  const pkg = JSON.parse(fs.readFileSync(path.join(REPO_ROOT, "package.json"), "utf8")) as {
    dependencies: Record<string, string>
  }
  for (const item of registry.items) {
    if (!item.dependencies) continue
    item.dependencies = item.dependencies.map((dep) => {
      const name = dep.startsWith("@") ? "@" + dep.slice(1).split("@")[0] : dep.split("@")[0]
      const range = pkg.dependencies[name]
      if (!range) {
        console.error(`✗ ${item.name}: ${name} 이 package.json 에 없다 — 버전을 박을 수 없다`)
        return dep
      }
      return `${name}@${range}`
    })
  }

  // registryDependencies 정렬 — 상류 이름 먼저, 그다음 doksam URL.
  for (const item of registry.items) {
    if (!item.registryDependencies) continue
    item.registryDependencies.sort((a, b) => {
      const au = a.startsWith("http") ? 1 : 0
      const bu = b.startsWith("http") ? 1 : 0
      return au - bu || a.localeCompare(b)
    })
  }

  fs.writeFileSync(path.join(REPO_ROOT, "registry.json"), JSON.stringify(registry as Registry, null, 2) + "\n")
  console.log(`✔ registryDependencies ${added}건 추가, 항목 ${registry.items.length}개`)
}

main()
