import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { code, demo, donts, dos, examples } from "@/components/demos/button.demo"

describe("button demo", () => {
  it("renders the demo buttons", () => {
    render(demo)
    expect(screen.getByRole("button", { name: "저장하기" })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "처리 중" })).toBeDisabled()
  })

  it("exposes usage guidance", () => {
    expect(dos.length).toBeGreaterThanOrEqual(2)
    expect(donts.length).toBeGreaterThanOrEqual(2)
  })

  /**
   * 기본 데모는 프리미티브 그대로여야 한다 (#76).
   *
   * `demo`·`code` 는 상세 화면의 "코드 복사"가 주는 기준 예시다. 여기에 장식용
   * className 이 끼면 소비자가 배우는 "표준 버튼 쓰는 법"이 그 문자열이 된다.
   * 광택 변형은 GlossyButton 과 Glossy 예제가 맡는다.
   */
  it("keeps the default example free of decorative overrides", () => {
    render(demo)
    const save = screen.getByRole("button", { name: "저장하기" })
    expect(save).not.toHaveClass("bg-linear-to-b")
    expect(save.dataset.slot).toBe("button")

    expect(code).toContain("<Button>저장하기</Button>")
    expect(code).not.toContain("className=")
  })

  it("offers the glossy treatment as its own example", () => {
    const glossy = examples.find((example) => example.name === "Glossy")
    expect(glossy, "Glossy 예제가 없다").toBeTruthy()

    render(glossy!.demo)
    const cta = screen.getByRole("button", { name: "결제하기" })
    expect(cta.dataset.slot).toBe("glossy-button")
    expect(cta).toHaveClass("bg-linear-to-b", "before:pointer-events-none", "motion-reduce:transition-none")

    // 복사용 코드는 컴포넌트 한 줄이어야 한다 — className blob 이 아니다.
    expect(glossy!.code).toContain("<GlossyButton>결제하기</GlossyButton>")
    expect(glossy!.code).not.toContain("className=")
  })

  it("keeps the Variants example on the plain primitive", () => {
    const variants = examples.find((example) => example.name === "Variants")!
    render(variants.demo)
    expect(screen.getByRole("button", { name: "저장하기" })).not.toHaveClass("bg-linear-to-b")
    expect(variants.code).not.toContain("className=")
  })
})
