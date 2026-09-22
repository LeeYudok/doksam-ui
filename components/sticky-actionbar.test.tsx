import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { StickyActionbar } from "@/components/sticky-actionbar"

describe("StickyActionbar", () => {
  it("primaryAction을 렌더한다", () => {
    render(<StickyActionbar primaryAction={{ label: "결재 상신" }} />)
    expect(screen.getByRole("button", { name: "결재 상신" })).toBeInTheDocument()
  })

  it("secondaryAction·destructiveAction을 생략하면 렌더하지 않는다", () => {
    render(<StickyActionbar primaryAction={{ label: "승인" }} />)
    expect(screen.getAllByRole("button")).toHaveLength(1)
  })

  it("destructiveAction은 좌측(파괴적) 자리에, primaryAction은 우측 끝에 렌더한다", () => {
    const { container } = render(
      <StickyActionbar
        destructiveAction={{ label: "반려" }}
        secondaryAction={{ label: "보류" }}
        primaryAction={{ label: "승인" }}
      />
    )
    const labels = Array.from(container.querySelectorAll("button")).map((btn) => btn.textContent)
    expect(labels).toEqual(["반려", "보류", "승인"])
  })

  it("meta 텍스트를 렌더한다", () => {
    render(<StickyActionbar primaryAction={{ label: "승인" }} meta="3/5 단계" />)
    expect(screen.getByText("3/5 단계")).toBeInTheDocument()
  })

  it("onClick을 그대로 전달한다", () => {
    let clicked = false
    render(<StickyActionbar primaryAction={{ label: "승인", onClick: () => (clicked = true) }} />)
    screen.getByRole("button", { name: "승인" }).click()
    expect(clicked).toBe(true)
  })

  it("fixed가 아니라 sticky로 하단에 붙는다", () => {
    render(<StickyActionbar primaryAction={{ label: "승인" }} data-testid="bar" />)
    expect(screen.getByTestId("bar").className).toMatch(/\bsticky\b/)
    expect(screen.getByTestId("bar").className).not.toMatch(/\bfixed\b/)
  })
})
