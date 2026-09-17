import { fireEvent, render, screen } from "@testing-library/react"
import { beforeAll, describe, expect, it } from "vitest"

import BankHomePage from "@/app/templates/bank/page"
import { HERO_SLIDES } from "@/app/templates/bank/_data/hero"
import { PROMO_CARDS } from "@/app/templates/bank/_data/promos"
import { PRODUCT_CATEGORIES } from "@/app/templates/bank/_data/product-categories-data"
import { QUICK_SERVICE_TABS } from "@/app/templates/bank/_data/quick-services"
import { QUICK_LINK_GROUPS } from "@/app/templates/bank/_data/quick-links"
import { TRENDING_PRODUCTS } from "@/app/templates/bank/_data/trending-products-data"
import { BOTTOM_QUICK_ACTIONS, NEWS_ITEMS } from "@/app/templates/bank/_data/news"

// embla-carousel-react(components/ui/carousel.tsx가 사용)는 window.matchMedia /
// ResizeObserver / IntersectionObserver로 반응형 옵션과 슬라이드 가시성을 계산한다 —
// jsdom은 셋 다 구현하지 않으므로 렌더 전에 최소 스텁을 채워준다
// (app/templates/shop/product/[id]/page.test.tsx 와 동일한 패턴, 이 파일에 로컬로만 정의).
beforeAll(() => {
  window.matchMedia =
    window.matchMedia ||
    ((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }))

  class StubObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
  window.ResizeObserver = window.ResizeObserver || (StubObserver as unknown as typeof ResizeObserver)
  window.IntersectionObserver =
    window.IntersectionObserver || (StubObserver as unknown as typeof IntersectionObserver)
})

describe("BankHomePage", () => {
  it("renders every hero slide title", () => {
    render(<BankHomePage />)
    for (const slide of HERO_SLIDES) {
      expect(screen.getByText(slide.title)).toBeInTheDocument()
    }
  })

  it("renders the hero banner dot indicators", () => {
    render(<BankHomePage />)
    expect(screen.getByRole("tablist", { name: "배너 선택" })).toBeInTheDocument()
  })

  it("renders every quick service tab with card-register active by default", () => {
    render(<BankHomePage />)
    for (const tab of QUICK_SERVICE_TABS) {
      expect(screen.getByRole("tab", { name: new RegExp(tab.label) })).toBeInTheDocument()
    }
    expect(screen.getByRole("tab", { name: /카드등록/ })).toHaveAttribute("aria-selected", "true")
  })

  it("renders every promo card with its badge", () => {
    render(<BankHomePage />)
    for (const promo of PROMO_CARDS) {
      expect(screen.getByText(promo.title)).toBeInTheDocument()
    }
    expect(screen.getByText("EVENT")).toBeInTheDocument()
    expect(screen.getByText("NEW")).toBeInTheDocument()
  })

  it("renders every product category", () => {
    render(<BankHomePage />)
    for (const category of PRODUCT_CATEGORIES) {
      // "대출"은 지금 뜨는 상품(TrendingProducts)의 뱃지 텍스트와도 겹치므로
      // 원형 카테고리 링크(role=link)로 범위를 좁혀 조회한다.
      expect(screen.getByRole("link", { name: category.label })).toBeInTheDocument()
    }
  })

  it("renders the deposit quick links by default and switches to card on toggle", () => {
    render(<BankHomePage />)

    for (const link of QUICK_LINK_GROUPS.deposit.links) {
      expect(screen.getByText(link.label)).toBeInTheDocument()
    }

    fireEvent.click(screen.getByRole("radio", { name: QUICK_LINK_GROUPS.card.label }))

    for (const link of QUICK_LINK_GROUPS.card.links) {
      expect(screen.getByText(link.label)).toBeInTheDocument()
    }
  })

  it("renders every trending product", () => {
    render(<BankHomePage />)
    for (const product of TRENDING_PRODUCTS) {
      expect(screen.getByText(product.name)).toBeInTheDocument()
    }
  })

  it("renders the bottom quick actions and news list", () => {
    render(<BankHomePage />)
    for (const action of BOTTOM_QUICK_ACTIONS) {
      expect(screen.getByText(action.label)).toBeInTheDocument()
    }
    for (const news of NEWS_ITEMS) {
      expect(screen.getByText(news.title)).toBeInTheDocument()
    }
  })
})
