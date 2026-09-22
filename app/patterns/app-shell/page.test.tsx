import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import AppShellPatternsPage from "@/app/patterns/app-shell/page"
import { APP_SHELL_SAMPLES } from "@/components/patterns/app-shell-samples"

describe("AppShellPatternsPage", () => {
  it("renders the page heading from the pattern registry", () => {
    render(<AppShellPatternsPage />)
    expect(screen.getByRole("heading", { level: 1, name: "앱 셸 패턴" })).toBeInTheDocument()
  })

  it("renders every app shell sample as a numbered section", () => {
    render(<AppShellPatternsPage />)
    for (const sample of APP_SHELL_SAMPLES) {
      expect(screen.getByRole("heading", { level: 2, name: sample.title })).toBeInTheDocument()
      expect(screen.getByText(`#${sample.num}`)).toBeInTheDocument()
    }
  })

  it("renders 10 samples — 셸 7종 + 타이틀·여백·브레이크포인트 3종", () => {
    render(<AppShellPatternsPage />)
    expect(APP_SHELL_SAMPLES.length).toBe(10)
  })

  it("글로벌 탑내비 셸 샘플이 메뉴 오버플로 표준을 노출한다", () => {
    render(<AppShellPatternsPage />)
    expect(screen.getByRole("heading", { level: 2, name: "글로벌 탑내비 셸" })).toBeInTheDocument()
    expect(screen.getAllByText(/더보기/).length).toBeGreaterThan(0)
  })
})
