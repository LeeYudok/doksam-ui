import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { AuditTrail, type AuditTrailEntry } from "@/components/audit-trail"

function entry(overrides: Partial<AuditTrailEntry> = {}): AuditTrailEntry {
  return {
    id: overrides.id ?? "1",
    timestamp: "2026-09-22 09:14:02",
    actor: { type: "human", name: "김민지" },
    action: "위험등급 확인",
    target: "차주 A-1042",
    ...overrides,
  }
}

describe("AuditTrail", () => {
  it("시각을 고정폭 문자열 그대로 렌더한다", () => {
    render(<AuditTrail entries={[entry()]} />)
    expect(screen.getByText("2026-09-22 09:14:02")).toBeInTheDocument()
  })

  it.each([
    ["human", "사람"],
    ["system", "시스템"],
    ["model", "AI 모형"],
  ] as const)("actor.type=%s면 라벨 %s 를 아이콘과 함께 낸다(색 외 두 번째 채널)", (type, label) => {
    const { container } = render(
      <AuditTrail entries={[entry({ actor: { type, name: "주체" } })]} />
    )
    expect(screen.getByText(label)).toBeInTheDocument()
    expect(container.querySelector('svg[aria-hidden="true"]')).toBeInTheDocument()
  })

  it("행위와 대상을 함께 렌더한다", () => {
    render(<AuditTrail entries={[entry({ action: "등급 예외 승인", target: "차주 B-2001" })]} />)
    expect(screen.getByText("등급 예외 승인")).toBeInTheDocument()
    expect(screen.getByText(/차주 B-2001/)).toBeInTheDocument()
  })

  it("code를 주면 AuditCodeTag로 감사코드를 렌더한다", () => {
    render(<AuditTrail entries={[entry({ code: "EVD-2026-0918" })]} />)
    expect(screen.getByText("EVD-2026-0918")).toBeInTheDocument()
  })

  it("visibleCount 이하 항목이면 더 보기 버튼을 렌더하지 않는다", () => {
    const entries = Array.from({ length: 3 }, (_, i) => entry({ id: String(i) }))
    render(<AuditTrail entries={entries} visibleCount={5} />)
    expect(screen.queryByRole("button")).not.toBeInTheDocument()
  })

  it("visibleCount 를 넘으면 더 보기 버튼이 나타나고, 클릭하면 나머지가 보인다", () => {
    const entries = Array.from({ length: 7 }, (_, i) =>
      entry({ id: String(i), target: `대상-${i}` })
    )
    const { container } = render(<AuditTrail entries={entries} visibleCount={5} />)

    expect(screen.getByText(/더 보기/)).toBeInTheDocument()
    // 접힌 항목은 DOM에는 남아있지만 hidden 클래스로 숨는다(인쇄 대비 — 렌더에서 빼지 않는다).
    expect(container.querySelectorAll('[data-slot="audit-trail-row"]')).toHaveLength(7)
    const rows = container.querySelectorAll('[data-slot="audit-trail-row"]')
    expect(rows[6]!).toHaveClass("hidden")

    fireEvent.click(screen.getByRole("button"))
    expect(screen.getByText("접기")).toBeInTheDocument()
    expect(container.querySelectorAll('[data-slot="audit-trail-row"]')[6]!).not.toHaveClass("hidden")
  })

  it("접힌 항목의 wrapper 는 인쇄 시 강제로 펼쳐지는 print:block 클래스를 갖는다", () => {
    const entries = Array.from({ length: 7 }, (_, i) => entry({ id: String(i) }))
    const { container } = render(<AuditTrail entries={entries} visibleCount={5} />)
    const rows = container.querySelectorAll('[data-slot="audit-trail-row"]')
    expect(rows[5]!).toHaveClass("print:block")
  })

  it("ol 의 직계 자식은 전부 li 다 — 접힘 래퍼가 리스트 시맨틱과 last:border-b-0 판정을 깨지 않는다", () => {
    const entries = Array.from({ length: 7 }, (_, i) => entry({ id: String(i) }))
    const { container } = render(<AuditTrail entries={entries} visibleCount={5} />)
    const list = container.querySelector("ol")!
    const children = Array.from(list.children)
    expect(children).toHaveLength(7)
    expect(children.every((child) => child.tagName === "LI")).toBe(true)
    // 마지막 행만 구분선이 지워져야 한다(:last-child 가 전 행에 걸리면 구분선이 통째로 사라진다).
    expect(children.filter((child) => child.matches("li:last-child"))).toHaveLength(1)
  })

  it("하드코딩 색 없이 시맨틱 유틸리티 클래스만 쓴다", () => {
    const { container } = render(<AuditTrail entries={[entry({ code: "EVD-2026-0918" })]} />)
    const html = container.innerHTML
    expect(html).not.toMatch(/#[0-9a-f]{3,8}\b|\b(?:rgba?|hsla?|oklch|oklab|lab|lch)\(/i)
  })
})
