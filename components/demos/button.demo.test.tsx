import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { code, demo, donts, dos, examples } from "@/components/demos/button.demo"

describe("button demo", () => {
  it("renders the demo buttons", () => {
    render(demo)
    expect(screen.getByRole("button", { name: "저장하기" })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "계정 삭제" })).toBeInTheDocument()
  })

  it("exposes non-empty code and rule lists", () => {
    expect(code).toContain("<Button")
    expect(dos.length).toBeGreaterThanOrEqual(2)
    expect(donts.length).toBeGreaterThanOrEqual(2)
  })

  it("limits the token-based glossy treatment to the primary save example", () => {
    render(demo)
    const save = screen.getByRole("button", { name: "저장하기" })
    expect(save).toHaveClass(
      "bg-linear-to-b",
      "from-primary",
      "before:pointer-events-none",
      "before:from-primary-foreground/20",
      "motion-reduce:transition-none",
      "motion-reduce:transform-none",
    )
    expect(screen.getByRole("button", { name: "취소" })).not.toHaveClass("bg-linear-to-b")
    expect(screen.getByRole("button", { name: "처리 중" })).toBeDisabled()

    const snippetClassName = code.match(/<Button className="([^"]+)">저장하기<\/Button>/)?.[1]
    expect(snippetClassName).toBeTruthy()
    for (const className of snippetClassName!.split(" ")) {
      expect(save).toHaveClass(className)
    }
  })

  it("keeps the Variants example and its copyable code in sync", () => {
    const variants = examples.find((example) => example.name === "Variants")!
    render(variants.demo)
    expect(screen.getByRole("button", { name: "저장하기" })).toHaveClass("bg-linear-to-b")
    expect(variants.code.split("\n")[0]).toBe(code.split("\n")[0])
  })
})
