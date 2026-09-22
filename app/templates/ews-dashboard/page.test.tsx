import { render, screen, within } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import EwsDashboardPage from "@/app/templates/ews-dashboard/page"
import {
  EWS_AS_OF,
  EWS_GRADE_DISTRIBUTION,
  EWS_KPIS,
  EWS_URGENT_BORROWERS,
} from "@/lib/templates/ews-data"

describe("EwsDashboardPage", () => {
  it("top-nav 셸의 브랜드·화면명·활성 메뉴를 렌더한다", () => {
    const { container } = render(<EwsDashboardPage />)
    expect(screen.getByText("누리은행 여신 조기경보")).toBeInTheDocument()
    expect(screen.getByText("홈 대시보드")).toBeInTheDocument()
    // 활성 메뉴는 데스크톱 nav 와 모바일 시트 양쪽에 있어 aria-current 로만 센다.
    expect(container.querySelectorAll('[aria-current="page"]').length).toBeGreaterThan(0)
  })

  it("페이지 헤더에 기준시각 칩을 싣는다 — 시각을 컴포넌트가 계산하지 않는다", () => {
    render(<EwsDashboardPage />)
    expect(screen.getByRole("heading", { level: 1, name: "조기경보 홈" })).toBeInTheDocument()
    expect(screen.getByText(`기준시각 ${EWS_AS_OF}`)).toBeInTheDocument()
  })

  it("여신감리 규정 콜아웃을 경보 심각도로 렌더한다", () => {
    const { container } = render(<EwsDashboardPage />)
    const callout = container.querySelector('[data-slot="compliance-callout"]')
    expect(callout).not.toBeNull()
    expect(callout).toHaveAttribute("data-severity", "critical")
    expect(within(callout as HTMLElement).getByText("여신감리 준수 지침 제2026-42호")).toBeInTheDocument()
  })

  it("KPI 4장의 라벨과 증감 보조 문구를 모두 렌더한다", () => {
    render(<EwsDashboardPage />)
    expect(EWS_KPIS).toHaveLength(4)
    for (const kpi of EWS_KPIS) {
      expect(screen.getByText(kpi.label)).toBeInTheDocument()
      expect(screen.getByText(kpi.caption)).toBeInTheDocument()
    }
  })

  it("등급 분포 범례를 등급 배지로 렌더한다 — 색 외 두 번째 채널", () => {
    const { container } = render(<EwsDashboardPage />)
    const badges = container.querySelectorAll("[data-risk-level]")
    for (const slice of EWS_GRADE_DISTRIBUTION) {
      expect(container.querySelector(`[data-risk-level="${slice.level}"]`)).not.toBeNull()
    }
    // 분포 범례 4개 + 표의 등급 배지·행 강조.
    expect(badges.length).toBeGreaterThanOrEqual(EWS_GRADE_DISTRIBUTION.length)
  })

  it("긴급 처리 차주 표의 모든 행을 심각도 강조와 함께 렌더한다", () => {
    const { container } = render(<EwsDashboardPage />)
    for (const row of EWS_URGENT_BORROWERS) {
      expect(screen.getByText(row.name)).toBeInTheDocument()
      expect(screen.getByText(row.signal)).toBeInTheDocument()
    }
    const highlighted = container.querySelectorAll('tbody tr[data-risk-level]')
    expect(highlighted).toHaveLength(EWS_URGENT_BORROWERS.length)
  })

  it("데모 데이터임을 알리는 푸터를 남긴다", () => {
    render(<EwsDashboardPage />)
    expect(screen.getByText(/가상 데이터 · 데모/)).toBeInTheDocument()
  })
})
