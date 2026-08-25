import { fireEvent, render, screen, within } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import MarketingSitePage from "@/app/templates/marketing-site/page"
import { FAQ_ITEMS, NAV_LINKS, PRICING_PLANS } from "@/app/templates/marketing-site/_data/site"

describe("MarketingSitePage (top-nav-site 원형)", () => {
  it("상단 가로 내비에 전 목적지를 노출한다", () => {
    render(<MarketingSitePage />)
    const nav = screen.getByRole("navigation", { name: "메인 메뉴" })
    for (const link of NAV_LINKS) {
      expect(within(nav).getByRole("link", { name: link.label })).toHaveAttribute("href", link.href)
    }
  })

  it("사이드바 내비게이션을 두지 않는다 — 원형의 핵심 제약", () => {
    render(<MarketingSitePage />)
    expect(screen.queryByRole("complementary")).not.toBeInTheDocument()
  })

  it("히어로 제목과 주요 CTA 를 렌더한다", () => {
    render(<MarketingSitePage />)
    expect(screen.getByRole("heading", { level: 2, name: /흩어진 작업을 한 판 위에/ })).toBeInTheDocument()
    expect(screen.getAllByRole("button", { name: "무료로 시작" }).length).toBeGreaterThan(0)
  })

  it("요금제 카드를 전부 렌더한다", () => {
    render(<MarketingSitePage />)
    for (const plan of PRICING_PLANS) {
      expect(screen.getByText(plan.name)).toBeInTheDocument()
    }
  })

  it("FAQ 항목을 펼치면 답변이 보인다", () => {
    render(<MarketingSitePage />)
    const first = FAQ_ITEMS[0]
    fireEvent.click(screen.getByRole("button", { name: first.question }))
    expect(screen.getByText(first.answer)).toBeVisible()
  })

  it("모바일 메뉴는 기본 접힘이고 토글로 펼쳐진다", () => {
    render(<MarketingSitePage />)
    const toggle = screen.getByRole("button", { name: "메뉴 열기" })
    expect(toggle).toHaveAttribute("aria-expanded", "false")
    expect(screen.getByRole("navigation", { name: "메인 메뉴 (모바일)" }).className).toContain("hidden")

    fireEvent.click(toggle)

    expect(screen.getByRole("button", { name: "메뉴 닫기" })).toHaveAttribute("aria-expanded", "true")
  })
})
