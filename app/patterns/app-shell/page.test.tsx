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

  it("renders 8 samples", () => {
    render(<AppShellPatternsPage />)
    expect(APP_SHELL_SAMPLES.length).toBe(8)
  })
})
