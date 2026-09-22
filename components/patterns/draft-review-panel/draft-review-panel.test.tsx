import { fireEvent, render, within } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import { DraftReviewPanel, type DraftReviewDocument } from "@/components/patterns/draft-review-panel/draft-review-panel"

const DOCUMENTS: DraftReviewDocument[] = [
  {
    key: "survey-report",
    label: "여신조사보고서",
    sections: [
      {
        key: "overview",
        title: "차주 개요",
        status: "draft",
        statusLabel: "초안",
        content: "AI 가 생성한 차주 개요 초안입니다.",
      },
      {
        key: "cause",
        title: "원인 정밀 분석",
        status: "in_review",
        statusLabel: "검토중",
        content: "AI 가 생성한 원인 분석 초안입니다.",
      },
    ],
  },
  {
    key: "followup-report",
    label: "사후관리보고서",
    sections: [
      {
        key: "opinion",
        title: "담당자 최종 종합의견",
        status: "final",
        statusLabel: "확정",
        content: "AI 가 생성한 종합의견 초안입니다.",
      },
    ],
  },
]

function renderPanel(extra?: Partial<React.ComponentProps<typeof DraftReviewPanel>>) {
  return render(
    <DraftReviewPanel
      documents={DOCUMENTS}
      primaryAction={{ label: "출력" }}
      secondaryAction={{ label: "임시저장" }}
      {...extra}
    />,
  )
}

describe("DraftReviewPanel", () => {
  it("섹션마다 상태 라벨과 AI 초안 표기를 함께 보여준다", () => {
    const { container } = renderPanel()
    expect(within(container).getByText("초안")).toBeInTheDocument()
    expect(within(container).getByText("검토중")).toBeInTheDocument()
    expect(within(container).getAllByText("AI 초안").length).toBeGreaterThan(0)
  })

  it("편집 토글 후 값을 고치면 사람 수정으로 표기가 바뀌고, 완료를 눌러도 값이 유지된다", () => {
    const { container } = renderPanel()
    const [editButton] = within(container).getAllByRole("button", { name: /편집/ })
    fireEvent.click(editButton)

    const textarea = within(container).getByLabelText("차주 개요")
    fireEvent.change(textarea, { target: { value: "사람이 가필한 차주 개요입니다." } })
    expect(within(container).getByText("사람 수정")).toBeInTheDocument()

    fireEvent.click(within(container).getByRole("button", { name: /완료/ }))
    expect(within(container).getByText("사람이 가필한 차주 개요입니다.")).toBeInTheDocument()
    expect(within(container).getByText("사람 수정")).toBeInTheDocument()
  })

  it("종료 게이트 — 편집 중 상태가 섹션 전환에서 유실되지 않는다", () => {
    const { container } = renderPanel()
    const [firstEdit, secondEdit] = within(container).getAllByRole("button", { name: /편집/ })

    fireEvent.click(firstEdit)
    fireEvent.change(within(container).getByLabelText("차주 개요"), {
      target: { value: "첫 섹션 가필 중" },
    })

    // 다른 섹션 편집을 시작해도 첫 섹션은 여전히 편집 모드이고 값도 남아 있다.
    fireEvent.click(secondEdit)
    expect(within(container).getByDisplayValue("첫 섹션 가필 중")).toBeInTheDocument()
    expect(within(container).getByLabelText("원인 정밀 분석")).toBeInTheDocument()
  })

  it("종료 게이트 — 편집 중 상태가 문서(탭) 전환에서 유실되지 않는다", () => {
    const { container } = renderPanel()
    const [firstEdit] = within(container).getAllByRole("button", { name: /편집/ })

    fireEvent.click(firstEdit)
    fireEvent.change(within(container).getByLabelText("차주 개요"), {
      target: { value: "탭을 넘나들어도 남아야 하는 가필" },
    })

    fireEvent.mouseDown(within(container).getByRole("tab", { name: "사후관리보고서" }))
    expect(within(container).queryByLabelText("차주 개요")).toBeNull()

    fireEvent.mouseDown(within(container).getByRole("tab", { name: "여신조사보고서" }))
    expect(within(container).getByDisplayValue("탭을 넘나들어도 남아야 하는 가필")).toBeInTheDocument()
    expect(within(container).getByText("사람 수정")).toBeInTheDocument()
  })

  it("주·보조 액션은 sticky-actionbar 로 렌더되고 클릭이 전달된다", () => {
    const onPrimary = vi.fn()
    const { container } = renderPanel({ primaryAction: { label: "출력", onClick: onPrimary } })
    fireEvent.click(within(container).getByRole("button", { name: "출력" }))
    expect(onPrimary).toHaveBeenCalledTimes(1)
  })

  it("문서 전환 시 onDocumentChange 를 호출한다", () => {
    const onDocumentChange = vi.fn()
    const { container } = renderPanel({ onDocumentChange })
    fireEvent.mouseDown(within(container).getByRole("tab", { name: "사후관리보고서" }))
    expect(onDocumentChange).toHaveBeenCalledWith("followup-report")
  })
})
