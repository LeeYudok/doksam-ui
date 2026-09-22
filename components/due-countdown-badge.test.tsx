import { render } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { DueCountdownBadge } from "@/components/due-countdown-badge"
import { riskTintBackground } from "@/lib/risk-tokens"

const LABELS = {
  ahead: "기한 D-{days}",
  soon: "D-{days} 만료 임박",
  overdue: "D+{days} 경과",
}

const TODAY = "2026-09-22"

// 한 테스트 안에서 여러 번 렌더하므로 document 전역 쿼리 대신 그 렌더의
// container 만 본다 — cleanup 은 테스트 단위로만 돌아 렌더가 쌓인다.
function renderBadge(props: Partial<React.ComponentProps<typeof DueCountdownBadge>> = {}) {
  const { container } = render(
    <DueCountdownBadge
      deadline="2026-09-30"
      asOf={TODAY}
      labels={LABELS}
      {...props}
    />,
  )
  return container.firstElementChild as HTMLElement
}

describe("DueCountdownBadge", () => {
  it("상태별 문구를 주입받은 대로 쓰고 {days}에 잔여일 절대값을 넣는다", () => {
    expect(renderBadge({ deadline: "2026-09-30" }).textContent).toBe("기한 D-8")
    expect(renderBadge({ deadline: "2026-09-24" }).textContent).toBe("D-2 만료 임박")
    expect(renderBadge({ deadline: "2026-09-19" }).textContent).toBe("D+3 경과")
  })

  it("문구를 함수로 주면 상태 전체를 넘긴다", () => {
    const badge = renderBadge({
      deadline: "2026-09-19",
      labels: { ...LABELS, overdue: (state) => `${state.status}:${state.daysRemaining}` },
    })
    expect(badge.textContent).toBe("overdue:-3")
  })

  it("임박 임계값을 주입하면 같은 기한의 상태가 달라진다", () => {
    expect(renderBadge({ deadline: "2026-09-25" }).dataset.dueStatus).toBe("soon")
    expect(renderBadge({ deadline: "2026-09-25", soonWithinDays: 1 }).dataset.dueStatus).toBe("ahead")
    expect(renderBadge({ deadline: "2026-09-30", soonWithinDays: 10 }).dataset.dueStatus).toBe("soon")
  })

  it("임박은 risk-high, 경과는 risk-severe 토큰을 쓴다", () => {
    expect(renderBadge({ deadline: "2026-09-24" }).style.backgroundColor).toBe(
      riskTintBackground("high"),
    )
    expect(renderBadge({ deadline: "2026-09-19" }).style.backgroundColor).toBe(
      riskTintBackground("severe"),
    )
  })

  it("여유 상태에는 등급 색을 칠하지 않는다", () => {
    const badge = renderBadge({ deadline: "2026-12-31" })
    expect(badge.dataset.riskLevel).toBeUndefined()
    expect(badge.getAttribute("style")).toBeNull()
  })

  it("fill=solid면 값 토큰 채움 + 전경 토큰 글자가 된다", () => {
    const badge = renderBadge({ deadline: "2026-09-19", fill: "solid" })
    expect(badge.style.backgroundColor).toBe("var(--risk-severe)")
    expect(badge.style.color).toBe("var(--risk-severe-foreground)")
  })
})
