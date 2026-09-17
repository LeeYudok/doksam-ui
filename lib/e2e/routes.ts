import fs from "node:fs"
import path from "node:path"

import { COMPONENT_REGISTRY } from "@/lib/showcase/registry"
import { PATTERN_REGISTRY } from "@/lib/patterns/registry"
import { TEMPLATE_REGISTRY } from "@/lib/templates/registry"
import { listProductIds } from "@/app/templates/shop/_lib/data"
import { listSymbols } from "@/lib/templates/trading-data"

/**
 * 이슈 #39 — e2e 스모크(e2e/smoke.spec.ts)가 순회할 라우트를 카탈로그
 * 레지스트리에서 파생시키는 단일 모듈. 레지스트리(컴포넌트/패턴/템플릿)에
 * 항목을 추가하면 이 모듈의 출력이 자동으로 늘어나고, smoke.spec.ts 는
 * 이 모듈만 import 한다 — 하드코딩 라우트 목록이 카탈로그 성장을 못
 * 따라가던 문제(전체의 20% 남짓만 감시)를 구조적으로 없앤다.
 *
 * vitest(Node 환경, lib/e2e/routes.test.ts)와 Playwright(e2e/smoke.spec.ts,
 * 둘 다 테스트 실행 자체는 Node 프로세스) 양쪽에서 그대로 import 해 쓴다.
 */

/**
 * 레지스트리 파생 대상이 아닌 인덱스/유틸리티 라우트.
 * 컴포넌트·패턴·템플릿처럼 "항목이 늘면 라우트도 는다" 구조가 아니라
 * 레포에 고정된 소수 페이지라 하드코딩을 유지한다 — 카탈로그 항목이
 * 아니므로 레지스트리 파생과 목적이 다르다.
 */
export const UTILITY_ROUTES = [
  "/",
  "/tokens",
  "/icons",
  "/rules",
  "/profiles",
  "/archetypes",
  "/personalities",
  "/corners",
  "/type-contrast",
  "/wireframe",
]

/** 컴포넌트 레지스트리에서 파생한 라우트 — 인덱스 + 항목별 상세. */
export function getComponentRoutes(registry: { slug: string }[] = COMPONENT_REGISTRY): string[] {
  return ["/components", ...registry.map((c) => `/components/${c.slug}`)]
}

/** 패턴 레지스트리에서 파생한 라우트 — 인덱스 + 항목별 상세. */
export function getPatternRoutes(registry: { slug: string }[] = PATTERN_REGISTRY): string[] {
  return ["/patterns", ...registry.map((p) => `/patterns/${p.slug}`)]
}

/** 템플릿 레지스트리에서 파생한 최상위 라우트 — 인덱스 + 항목별 루트 페이지. */
export function getTemplateTopRoutes(registry: { href: string }[] = TEMPLATE_REGISTRY): string[] {
  return ["/templates", ...registry.map((t) => t.href)]
}

const APP_TEMPLATES_DIR = path.resolve(import.meta.dirname, "..", "..", "app", "templates")

/**
 * 동적 세그먼트를 가진 템플릿 하위 라우트 → 실제 파라미터 값 소스.
 *
 * next.js 빌드가 정적 생성(generateStaticParams)할 때 쓰는 것과 동일한
 * 함수를 재사용한다 — 스모크가 임의 문자열("test" 등)로 찔러 404 를 오탐
 * 내는 대신, 빌드가 실제로 만드는 페이지와 같은 값으로 검증한다.
 *
 * 새 동적 템플릿 라우트를 추가하면 여기에도 등록해야 하고, 잊으면
 * getTemplateSubRoutes() 가 명시적으로 에러를 던진다(조용히 누락되지 않음).
 */
const DYNAMIC_PARAM_SOURCES: Record<string, () => string[]> = {
  "/templates/shop/product/[id]": () => listProductIds(),
  "/templates/trading/[symbol]": () => listSymbols(),
}

function isDynamicSegment(segment: string): boolean {
  return segment.startsWith("[") && segment.endsWith("]")
}

/** app/templates 아래를 재귀 순회해 page.tsx 가 있는 디렉터리를 라우트 문자열로 수집한다. */
function walkTemplatePageRoutes(dir: string, base: string): string[] {
  const routes: string[] = []
  const entries = fs.readdirSync(dir, { withFileTypes: true })

  if (entries.some((e) => e.isFile() && e.name === "page.tsx")) {
    routes.push(base === "" ? "/templates" : `/templates${base}`)
  }

  for (const entry of entries) {
    if (!entry.isDirectory()) continue
    // _components·_data·_lib 등은 Next.js 프라이빗 폴더(라우트 아님) — 순회하지 않는다.
    if (entry.name.startsWith("_")) continue
    routes.push(...walkTemplatePageRoutes(path.join(dir, entry.name), `${base}/${entry.name}`))
  }

  return routes
}

/**
 * 템플릿 레지스트리에는 없는(= 레지스트리가 모르는) 하위 라우트를
 * 파일시스템에서 수집한다. 동적 세그먼트는 DYNAMIC_PARAM_SOURCES 로 실제
 * 값 1개를 채워 대표 라우트로 편입한다 — 상품/종목 N개를 전부 도는 건
 * 템플릿 셸이 동일한 페이지를 N배 반복 검사하는 것과 같아 시간 대비
 * 얻는 신호가 없다(스모크는 404·콘솔 에러·가로 오버플로우만 본다).
 *
 * `filePages`·`paramSources` 는 테스트 주입용이다(기본값 = 실제 파일시스템
 * 순회 결과 · 실제 DYNAMIC_PARAM_SOURCES). "매핑 누락 시 에러를 던진다"는
 * 계약은 실제 [id]/[symbol] 폴더가 있어야만 재현되던 것을, 가짜 동적
 * 라우트 문자열과 빈 매핑을 주입해 lib/e2e/routes.test.ts 가 실제로
 * 재현·고정할 수 있게 한다.
 */
export function getTemplateSubRoutes(
  templateRegistry: { href: string }[] = TEMPLATE_REGISTRY,
  filePages: string[] = walkTemplatePageRoutes(APP_TEMPLATES_DIR, ""),
  paramSources: Record<string, () => string[]> = DYNAMIC_PARAM_SOURCES,
): string[] {
  const knownHrefs = new Set(templateRegistry.map((t) => t.href))

  const result: string[] = []
  for (const routePattern of filePages) {
    if (routePattern === "/templates") continue
    if (knownHrefs.has(routePattern)) continue

    const segments = routePattern.split("/")
    const dynamicIndex = segments.findIndex(isDynamicSegment)

    if (dynamicIndex === -1) {
      result.push(routePattern)
      continue
    }

    const paramSource = paramSources[routePattern]
    if (!paramSource) {
      throw new Error(
        `동적 템플릿 라우트 ${routePattern} 에 대응하는 DYNAMIC_PARAM_SOURCES 매핑이 없습니다. ` +
          `lib/e2e/routes.ts 의 DYNAMIC_PARAM_SOURCES 에 실제 값 소스를 등록하세요.`,
      )
    }

    const values = paramSource()
    if (values.length === 0) continue

    const sample = values[0]
    segments[dynamicIndex] = sample
    result.push(segments.join("/"))
  }

  return result
}

/** smoke.spec.ts 가 순회할 전체 라우트(중복 제거, 정렬). */
export function getAllSmokeRoutes(): string[] {
  const routes = new Set<string>([
    ...UTILITY_ROUTES,
    ...getComponentRoutes(),
    ...getPatternRoutes(),
    ...getTemplateTopRoutes(),
    ...getTemplateSubRoutes(),
  ])
  return [...routes].sort()
}
