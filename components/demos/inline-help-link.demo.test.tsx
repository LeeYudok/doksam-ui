import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { code, demo, donts, dos } from "@/components/demos/inline-help-link.demo"

describe("inline-help-link demo", () => {
  it("섹션 제목 옆에 두 트리거(onOpen 버튼, href 링크)를 접근 가능한 이름과 함께 렌더한다", () => {
    render(demo)
    expect(screen.getByRole("button", { name: "여신 한도 산정 방식 보기" })).toBeInTheDocument()
    expect(screen.getByRole("link", { name: "담보 평가 이력 사용법 문서로 이동" })).toBeInTheDocument()
  })

  it("exposes non-empty code and rule lists", () => {
    expect(code).toContain("InlineHelpLink")
    expect(dos.length).toBeGreaterThanOrEqual(2)
    expect(donts.length).toBeGreaterThanOrEqual(2)
  })
})
