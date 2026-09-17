import { describe, expect, it } from "vitest"

import { getAllSmokeRoutes, getComponentRoutes, getPatternRoutes, getTemplateSubRoutes, getTemplateTopRoutes } from "@/lib/e2e/routes"
import { KNOWN_FAILING_ROUTES, KNOWN_FAILING_ROUTES_MAX_SIZE } from "@/lib/e2e/known-failing-routes"
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
    // getTemplateSubRoutes 가 filePages·paramSources 를 주입받도록 열려 있어
    // (lib/e2e/routes.ts), 실제 [id]/[symbol] 폴더를 만들지 않고도 미매핑
    // 상태를 재현한다 — 가짜 동적 라우트 하나를 filePages 로 흘려보내고
    // paramSources 를 비워 실제로 throw 되는지 검증한다.
    expect(() =>
      getTemplateSubRoutes(TEMPLATE_REGISTRY, ["/templates/never-registered/[id]"], {}),
    ).toThrow(/DYNAMIC_PARAM_SOURCES/)

    // 실제 파일시스템 상태(기본값)는 동적 폴더 2개가 전부 매핑돼 있어
    // 에러 없이 끝난다 — 회귀 시(새 [param] 폴더를 추가하고 매핑을 깜빡함)
    // 이 assertion 이 걸린다.
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

// 이슈 #39 PR #51 적대적 리뷰 H1 — KNOWN_FAILING_ROUTES(e2e/smoke.spec.ts 가
// 읽는 SSOT, lib/e2e/known-failing-routes.ts)가 세 겹으로 새던 것을 막는다.
describe("KNOWN_FAILING_ROUTES", () => {
  it("모든 키가 실제 스모크 라우트에 존재한다(라우트 rename·오타로 죽은 항목 방지)", () => {
    const all = new Set(getAllSmokeRoutes())
    for (const route of Object.keys(KNOWN_FAILING_ROUTES)) {
      expect(all.has(route), `${route} 가 getAllSmokeRoutes() 에 없습니다 — rename/오타 여부 확인`).toBe(true)
    }
  })

  it("모든 사유에 이슈 번호(#숫자)가 있다(PR 본문에만 남아 추적 불가능해지는 것 방지)", () => {
    for (const [route, reason] of Object.entries(KNOWN_FAILING_ROUTES)) {
      expect(reason, `${route} 사유에 이슈 번호(#숫자)가 없습니다: ${reason}`).toMatch(/#\d+/)
    }
  })

  it("목록 크기가 KNOWN_FAILING_ROUTES_MAX_SIZE 를 넘지 않는다(조용히 늘어나는 것 방지)", () => {
    // 새 예외를 추가하려면 KNOWN_FAILING_ROUTES_MAX_SIZE 도 함께 올려야 하고,
    // 그 diff 자체가 리뷰에서 "예외가 늘었다"는 신호가 된다. 이 테스트는
    // "줄어드는 것"은 막지 않는다 — 늘리기 전에 정말 별도 이슈로 미룰
    // 결함인지 한 번 더 검토하라는 의도적인 마찰이다.
    expect(Object.keys(KNOWN_FAILING_ROUTES).length).toBeLessThanOrEqual(KNOWN_FAILING_ROUTES_MAX_SIZE)
  })
})
