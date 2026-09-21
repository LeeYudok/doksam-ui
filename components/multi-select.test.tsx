import { fireEvent, render, screen } from "@testing-library/react"
import { beforeAll, describe, expect, it, vi } from "vitest"

import { MultiSelect, type MultiSelectOption } from "@/components/multi-select"

// cmdk(Command 내부)는 브라우저에서 옵션 리스트 높이 측정에 ResizeObserver를,
// 하이라이트된 항목 포커스 시 scrollIntoView를 사용한다 — 둘 다 jsdom에는
// 없어 스텁이 필요하다(components/demos/multi-select.demo.test.tsx 와 동일).
beforeAll(() => {
  if (typeof globalThis.ResizeObserver === "undefined") {
    globalThis.ResizeObserver = class {
      observe() {}
      unobserve() {}
      disconnect() {}
    } as unknown as typeof ResizeObserver
  }
  if (typeof Element.prototype.scrollIntoView !== "function") {
    Element.prototype.scrollIntoView = function scrollIntoView() {}
  }
})

const OPTIONS: MultiSelectOption[] = [
  { value: "next", label: "Next.js" },
  { value: "remix", label: "Remix" },
  { value: "astro", label: "Astro" },
]

/**
 * DOM 트리에서 focus 가능한 요소를 문서 순서대로 뽑는다. 실제 Tab 키 이동을
 * jsdom 이 흉내내지 않으므로(별도 @testing-library/user-event 없이) 이
 * 목록이 곧 "Tab 으로 도달하는 순서"의 근거다.
 */
function focusableElements(container: HTMLElement) {
  return Array.from(
    container.querySelectorAll<HTMLElement>(
      'button:not([disabled]), [tabindex]:not([tabindex="-1"])'
    )
  )
}

describe("MultiSelect — 중첩 인터랙티브 없음 (#66)", () => {
  it("어떤 button 에도 button/[role=button]/[tabindex] 자손이 없다", () => {
    const { container } = render(
      <MultiSelect options={OPTIONS} defaultValue={["next", "astro"]} />
    )

    const buttons = container.querySelectorAll("button")
    expect(buttons.length).toBeGreaterThan(0)

    for (const button of buttons) {
      expect(button.querySelector("button")).toBeNull()
      expect(button.querySelector('[role="button"]')).toBeNull()
      expect(button.querySelector("[tabindex]")).toBeNull()
    }
  })

  it("트리거 컨테이너는 button 이 아니라 role=combobox 인 div 다", () => {
    render(<MultiSelect options={OPTIONS} />)
    const combobox = screen.getByRole("combobox")
    expect(combobox.tagName).not.toBe("BUTTON")
    expect(combobox).toHaveAttribute("aria-haspopup", "listbox")
    expect(combobox).toHaveAttribute("aria-expanded", "false")
    expect(combobox).toHaveAttribute("aria-controls")
  })
})

describe("MultiSelect — 칩 제거 버튼 키보드 동작", () => {
  it("Tab 순서(문서 순서)에 각 칩의 제거 버튼이 실제 button 으로 존재한다", () => {
    const { container } = render(
      <MultiSelect options={OPTIONS} defaultValue={["next", "remix", "astro"]} />
    )

    const focusable = focusableElements(container)
    const removeButtons = focusable.filter((el) =>
      el.getAttribute("aria-label")?.endsWith("제거")
    )

    expect(removeButtons).toHaveLength(3)
    expect(removeButtons.map((el) => el.getAttribute("aria-label"))).toEqual([
      "Next.js 제거",
      "Remix 제거",
      "Astro 제거",
    ])
    for (const button of removeButtons) {
      expect(button.tagName).toBe("BUTTON")
      expect(button).not.toHaveAttribute("disabled")
    }
  })

  it("Enter 로 칩을 제거하고 팝오버를 열거나 닫지 않는다", () => {
    const onValueChange = vi.fn()
    render(
      <MultiSelect
        options={OPTIONS}
        defaultValue={["next", "astro"]}
        onValueChange={onValueChange}
      />
    )

    const combobox = screen.getByRole("combobox")
    expect(combobox).toHaveAttribute("aria-expanded", "false")

    fireEvent.keyDown(screen.getByRole("button", { name: "Next.js 제거" }), {
      key: "Enter",
    })

    expect(onValueChange).toHaveBeenCalledWith(["astro"])
    expect(screen.queryByText("Next.js")).not.toBeInTheDocument()
    expect(combobox).toHaveAttribute("aria-expanded", "false")
  })

  it("Space 로 칩을 제거하고 팝오버를 열거나 닫지 않는다", () => {
    const onValueChange = vi.fn()
    render(
      <MultiSelect
        options={OPTIONS}
        defaultValue={["next", "astro"]}
        onValueChange={onValueChange}
      />
    )

    const combobox = screen.getByRole("combobox")

    fireEvent.keyDown(screen.getByRole("button", { name: "Astro 제거" }), {
      key: " ",
    })

    expect(onValueChange).toHaveBeenCalledWith(["next"])
    expect(screen.queryByText("Astro")).not.toBeInTheDocument()
    expect(combobox).toHaveAttribute("aria-expanded", "false")
  })

  it("마우스 클릭으로 칩을 제거해도 팝오버를 열거나 닫지 않는다", () => {
    render(<MultiSelect options={OPTIONS} defaultValue={["next", "astro"]} />)
    const combobox = screen.getByRole("combobox")

    fireEvent.click(screen.getByRole("button", { name: "Next.js 제거" }))

    expect(screen.queryByText("Next.js")).not.toBeInTheDocument()
    expect(combobox).toHaveAttribute("aria-expanded", "false")
  })

  it("배경(트리거 컨테이너) 클릭은 여전히 팝오버를 연다", () => {
    render(<MultiSelect options={OPTIONS} defaultValue={["next"]} />)
    const combobox = screen.getByRole("combobox")

    fireEvent.click(combobox)

    expect(combobox).toHaveAttribute("aria-expanded", "true")
  })
})

describe("MultiSelect — disabled", () => {
  it("칩 제거 버튼이 focus 대상에서 빠지고(disabled) 클릭이 무시된다", () => {
    const onValueChange = vi.fn()
    const { container } = render(
      <MultiSelect
        options={OPTIONS}
        defaultValue={["next", "astro"]}
        onValueChange={onValueChange}
        disabled
      />
    )

    const removeButton = screen.getByRole("button", { name: "Next.js 제거" })
    expect(removeButton).toBeDisabled()

    // disabled 인 button 은 Tab 순서에서 자동으로 빠진다.
    expect(focusableElements(container)).not.toContain(removeButton)

    fireEvent.click(removeButton)
    expect(onValueChange).not.toHaveBeenCalled()
    expect(screen.getByText("Next.js")).toBeInTheDocument()
  })

  it("여닫기 버튼도 disabled 다", () => {
    render(<MultiSelect options={OPTIONS} disabled />)
    expect(screen.getByRole("button", { name: "옵션 목록 열기" })).toBeDisabled()
  })

  it("컨테이너 클릭으로도 팝오버가 열리지 않는다", () => {
    render(<MultiSelect options={OPTIONS} disabled />)
    const combobox = screen.getByRole("combobox")

    fireEvent.click(combobox)

    expect(combobox).toHaveAttribute("aria-expanded", "false")
    expect(combobox).toHaveAttribute("aria-disabled", "true")
  })
})
