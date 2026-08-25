import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import ActivityFeedPage from "@/app/templates/activity-feed/page"
import { EVENTS } from "@/app/templates/activity-feed/_data/events"

const PAGE_SIZE = 5

describe("ActivityFeedPage (feed-timeline 원형)", () => {
  it("페이지 제목과 원형 뱃지를 렌더한다", () => {
    render(<ActivityFeedPage />)
    expect(screen.getByRole("heading", { level: 2, name: "활동 스트림" })).toBeInTheDocument()
    expect(screen.getByText("feed-timeline 원형")).toBeInTheDocument()
  })

  it("첫 화면에는 PAGE_SIZE 만큼만 보여준다", () => {
    render(<ActivityFeedPage />)
    expect(screen.getAllByRole("listitem")).toHaveLength(PAGE_SIZE)
  })

  it("더 보기를 누르면 이전 활동을 이어 붙인다", () => {
    render(<ActivityFeedPage />)
    fireEvent.click(screen.getByRole("button", { name: /이전 활동 더 보기/ }))
    expect(screen.getAllByRole("listitem")).toHaveLength(EVENTS.length)
  })

  it("필터로 종류를 좁히고, 좁히면 목록이 처음부터 다시 시작한다", () => {
    render(<ActivityFeedPage />)
    fireEvent.click(screen.getByRole("button", { name: "배포" }))

    const deploys = EVENTS.filter((e) => e.kind === "deploy")
    expect(screen.getAllByRole("listitem")).toHaveLength(deploys.length)
    expect(screen.getByRole("button", { name: "배포" })).toHaveAttribute("aria-pressed", "true")
  })

  it("날짜 버킷을 그룹 헤딩으로 노출한다", () => {
    render(<ActivityFeedPage />)
    expect(screen.getByRole("heading", { level: 3, name: "오늘" })).toBeInTheDocument()
  })
})
