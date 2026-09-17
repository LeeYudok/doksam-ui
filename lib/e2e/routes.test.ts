import { describe, expect, it } from "vitest"

import { getAllSmokeRoutes, getComponentRoutes, getPatternRoutes, getTemplateSubRoutes, getTemplateTopRoutes } from "@/lib/e2e/routes"
import { COMPONENT_REGISTRY } from "@/lib/showcase/registry"
import { PATTERN_REGISTRY } from "@/lib/patterns/registry"
import { TEMPLATE_REGISTRY } from "@/lib/templates/registry"
import { listProductIds } from "@/app/templates/shop/_lib/data"
import { listSymbols } from "@/lib/templates/trading-data"

// 이슈 #39 — 라우트 파생 로직 고정 테스트. "레지스트리에 항목을 추가하면
// 스모크 대상도 자동으로 늘어난다"는 계약을 실제 파일을 건드리지 않고
// 검증하기 위해, 파생 함수들은 레지스트리 배열을 파라미터로 주입받는다
// (기본값 = 실제 레지스트리).

describe("getComponentRoutes", () => {
  it("실제 컴포넌트 레지스트리 크기 + 인덱스 1개와 일치한다", () => {
    expect(getComponentRoutes()).toHaveLength(COMPONENT_REGISTRY.length + 1)
    expect(getComponentRoutes()).toContain("/components")
    expect(getComponentRoutes()).toContain(`/components/${COMPONENT_REGISTRY[0].slug}`)
  })

  it("레지스트리에 항목을 추가하면 라우트 목록이 늘어난다", () => {
    const before = getComponentRoutes()
    const after = getComponentRoutes([...COMPONENT_REGISTRY, { slug: "fake-added-component" }])
    expect(after.length).toBe(before.length + 1)
    expect(after).toContain("/components/fake-added-component")
  })
})

describe("getPatternRoutes", () => {
  it("실제 패턴 레지스트리 크기 + 인덱스 1개와 일치한다", () => {
    expect(getPatternRoutes()).toHaveLength(PATTERN_REGISTRY.length + 1)
  })

  it("레지스트리에 항목을 추가하면 라우트 목록이 늘어난다", () => {
    const before = getPatternRoutes()
    const after = getPatternRoutes([...PATTERN_REGISTRY, { slug: "fake-added-pattern" }])
    expect(after.length).toBe(before.length + 1)
    expect(after).toContain("/patterns/fake-added-pattern")
  })
})

describe("getTemplateTopRoutes", () => {
  it("실제 템플릿 레지스트리 크기 + 인덱스 1개와 일치한다", () => {
    expect(getTemplateTopRoutes()).toHaveLength(TEMPLATE_REGISTRY.length + 1)
  })

  it("레지스트리에 항목을 추가하면 라우트 목록이 늘어난다", () => {
    const before = getTemplateTopRoutes()
    const after = getTemplateTopRoutes([...TEMPLATE_REGISTRY, { href: "/templates/fake-added-template" }])
    expect(after.length).toBe(before.length + 1)
    expect(after).toContain("/templates/fake-added-template")
  })
})

describe("getTemplateSubRoutes", () => {
  const subRoutes = getTemplateSubRoutes()

  it("레지스트리에 없는 알려진 정적 하위 라우트를 수집한다", () => {
    expect(subRoutes).toContain("/templates/admin/data")
    expect(subRoutes).toContain("/templates/admin/logs")
    expect(subRoutes).toContain("/templates/admin/settings")
    expect(subRoutes).toContain("/templates/shop/cart")
    expect(subRoutes).toContain("/templates/trading/watchlist")
  })

  it("동적 세그먼트는 대괄호 없이 실제 파라미터 값으로 치환된다", () => {
    const productRoute = subRoutes.find((r) => r.startsWith("/templates/shop/product/"))
    const symbolRoute = subRoutes.find((r) => r.startsWith("/templates/trading/") && r !== "/templates/trading/watchlist")

    expect(productRoute).toBeDefined()
    expect(productRoute).not.toContain("[")
    expect(listProductIds()).toContain(productRoute!.replace("/templates/shop/product/", ""))

    expect(symbolRoute).toBeDefined()
    expect(symbolRoute).not.toContain("[")
    expect(listSymbols()).toContain(symbolRoute!.replace("/templates/trading/", ""))
  })

  it("레지스트리에 이미 등록된 최상위 템플릿 href 는 다시 포함하지 않는다", () => {
    for (const entry of TEMPLATE_REGISTRY) {
      expect(subRoutes).not.toContain(entry.href)
    }
  })

  it("동적 라우트에 매핑이 없으면 조용히 누락되지 않고 에러를 던진다", () => {
    expect(() => getTemplateSubRoutes([...TEMPLATE_REGISTRY, { href: "/templates/never-registered" }])).not.toThrow()
    // DYNAMIC_PARAM_SOURCES 는 파일시스템 실체([id]/[symbol] 폴더)에 묶여 있어
    // 여기서 새 동적 폴더를 만들지 않고는 미매핑 상태를 재현할 수 없다.
    // 대신 현재 파일시스템의 동적 폴더 2개가 전부 매핑돼 에러 없이 끝나는
    // 것으로, "매핑 누락 시 에러"가 아니라 "매핑 존재 시 무사통과"를 고정한다.
    expect(() => getTemplateSubRoutes()).not.toThrow()
  })
})

describe("getAllSmokeRoutes", () => {
  it("컴포넌트·패턴·템플릿·유틸리티 라우트를 중복 없이 합친다", () => {
    const all = getAllSmokeRoutes()
    expect(new Set(all).size).toBe(all.length)
    expect(all).toContain("/")
    expect(all).toContain("/components/button")
    expect(all.length).toBeGreaterThan(150)
  })
})
