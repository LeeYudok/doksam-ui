import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import KanbanPatternsPage from "@/app/patterns/kanban/page"
import { KANBAN_SAMPLES } from "@/components/patterns/kanban-samples"

describe("KanbanPatternsPage", () => {
  it("renders the page heading", () => {
    render(<KanbanPatternsPage />)
    expect(screen.getByRole("heading", { level: 1, name: "칸반 보드" })).toBeInTheDocument()
  })

  it("renders every kanban sample as a numbered section", () => {
    render(<KanbanPatternsPage />)
    for (const sample of KANBAN_SAMPLES) {
      expect(screen.getByRole("heading", { level: 2, name: sample.title })).toBeInTheDocument()
      expect(screen.getByText(`#${sample.num}`)).toBeInTheDocument()
    }
  })

  it("renders the 3 columns with their card counts", () => {
    render(<KanbanPatternsPage />)
    expect(screen.getByText("할 일")).toBeInTheDocument()
    expect(screen.getByText("진행 중")).toBeInTheDocument()
    expect(screen.getByText("완료")).toBeInTheDocument()
  })

  it("renders cards with a label badge and an assignee avatar", () => {
    render(<KanbanPatternsPage />)
    expect(screen.getByText("드래그 앤 드롭 컬럼 이동 구현")).toBeInTheDocument()
    expect(screen.getAllByText("개발").length).toBeGreaterThan(0)
    expect(screen.getByText("버그")).toBeInTheDocument()
  })

  it("gives every draggable card an accessible label", () => {
    render(<KanbanPatternsPage />)
    expect(
      screen.getByRole("button", { name: "요금제 페이지 카피 검수 — 기획, 담당자 이유" })
    ).toBeInTheDocument()
  })
})
