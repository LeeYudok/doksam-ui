import { fireEvent, render, screen, within } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import StepperPatternsPage from "@/app/patterns/stepper/page"
import { STEPPER_SAMPLES } from "@/components/patterns/stepper-samples"

describe("StepperPatternsPage", () => {
  it("renders the page heading", () => {
    render(<StepperPatternsPage />)
    expect(screen.getByRole("heading", { level: 1, name: "스텝퍼·위저드" })).toBeInTheDocument()
  })

  it("renders every stepper sample as a numbered section", () => {
    render(<StepperPatternsPage />)
    for (const sample of STEPPER_SAMPLES) {
      expect(screen.getByRole("heading", { level: 2, name: sample.title })).toBeInTheDocument()
      expect(screen.getByText(`#${sample.num}`)).toBeInTheDocument()
    }
  })

  it("renders 3 samples", () => {
    render(<StepperPatternsPage />)
    expect(STEPPER_SAMPLES.length).toBe(3)
  })

  function getWizardSection() {
    const heading = screen.getByRole("heading", { level: 2, name: "온보딩 위저드" })
    const section = heading.closest("section")
    if (!section) throw new Error("온보딩 위저드 section을 찾을 수 없습니다.")
    return within(section)
  }

  it("walks the onboarding wizard forward and back through its steps", () => {
    render(<StepperPatternsPage />)
    const wizard = getWizardSection()

    expect(wizard.getByText("기본 정보")).toBeInTheDocument()

    fireEvent.click(wizard.getByRole("button", { name: "다음" }))
    expect(wizard.getByText("소속 회사와 규모를 알려주세요.")).toBeInTheDocument()

    fireEvent.click(wizard.getByRole("button", { name: "이전" }))
    expect(wizard.getByText("이름과 이메일을 입력하세요.")).toBeInTheDocument()
  })

  it("reaches the completion screen after the final step", () => {
    render(<StepperPatternsPage />)
    const wizard = getWizardSection()

    fireEvent.click(wizard.getByRole("button", { name: "다음" }))
    fireEvent.click(wizard.getByRole("button", { name: "다음" }))
    fireEvent.click(wizard.getByRole("button", { name: "다음" }))
    fireEvent.click(wizard.getByRole("button", { name: "완료" }))

    expect(wizard.getByText("온보딩이 완료됐어요")).toBeInTheDocument()
  })
})
