import { fireEvent, render, screen, within } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import { TopNavAskBar, TopNavShell, type TopNavItem } from "@/components/patterns/top-nav-shell/top-nav-shell"

const ITEMS: TopNavItem[] = Array.from({ length: 9 }, (_, i) => ({
  key: `menu-${i + 1}`,
  label: `메뉴${i + 1}`,
  href: `/menu-${i + 1}`,
}))

function renderShell(extra?: Partial<React.ComponentProps<typeof TopNavShell>>) {
  return render(
    <TopNavShell
      brand={<span>업무시스템</span>}
      items={ITEMS}
      activeItem="menu-3"
      screenTitle="조기경보"
      subTabs={[
        { key: "summary", label: "요약", href: "/ews" },
        { key: "by-obligor", label: "차주별", href: "/ews/obligor" },
      ]}
      activeSubTab="summary"
      ask={<TopNavAskBar href="/help" />}
      {...extra}
    >
      <p>본문</p>
    </TopNavShell>,
  )
}

describe("TopNavShell", () => {
  it("maxVisibleItems 개까지만 글로벌 nav 에 펼치고 나머지는 더보기로 접는다", () => {
    const { container } = renderShell({ maxVisibleItems: 6 })
    const nav = within(container).getByLabelText("글로벌 내비게이션")
    expect(within(nav).getByText("메뉴6")).toBeInTheDocument()
    expect(within(nav).queryByText("메뉴7")).toBeNull()
    expect(within(nav).getByText("더보기")).toBeInTheDocument()
  })

  it("메뉴가 최대 개수 이하면 더보기 트리거를 만들지 않는다", () => {
    const { container } = renderShell({ items: ITEMS.slice(0, 4) })
    const nav = within(container).getByLabelText("글로벌 내비게이션")
    expect(within(nav).queryByText("더보기")).toBeNull()
  })

  it("접히는 메뉴를 포함해 모든 목적지를 모바일 시트에 담는다 — 좁은 폭에서 사라지는 메뉴가 없어야 한다", () => {
    const { container } = renderShell()
    fireEvent.click(within(container).getByLabelText("메뉴 열기"))
    const sheetNav = screen.getByLabelText("모바일 글로벌 내비게이션")
    for (const item of ITEMS) {
      expect(within(sheetNav).getByText(item.label)).toBeInTheDocument()
    }
  })

  it("활성 메뉴·서브탭에 aria-current 를 붙인다", () => {
    const { container } = renderShell()
    expect(within(container).getByRole("link", { name: "메뉴3" })).toHaveAttribute("aria-current", "page")
    expect(within(container).getByRole("link", { name: "요약" })).toHaveAttribute("aria-current", "page")
    expect(within(container).getByRole("link", { name: "차주별" })).not.toHaveAttribute("aria-current")
  })

  it("화면명·서브탭·ask 가 모두 없으면 2단 서브탭바를 렌더하지 않는다", () => {
    const { container } = renderShell({ screenTitle: undefined, subTabs: [], ask: undefined })
    expect(within(container).queryByLabelText("화면 내 탭")).toBeNull()
    expect(within(container).queryByText("조기경보")).toBeNull()
  })

  it("본문은 main 랜드마크 안에 한 번만 렌더된다", () => {
    const { container } = renderShell()
    const mains = container.querySelectorAll("main")
    expect(mains).toHaveLength(1)
    expect(within(mains[0] as HTMLElement).getByText("본문")).toBeInTheDocument()
  })
})

describe("TopNavAskBar", () => {
  it("href 를 주면 링크, 없으면 버튼으로 렌더한다 — 슬롯 어느 쪽으로도 연결된다", () => {
    const { container, rerender } = render(<TopNavAskBar href="/help" />)
    expect(within(container).getByRole("link")).toHaveAttribute("href", "/help")

    const onSelect = vi.fn()
    rerender(<TopNavAskBar onSelect={onSelect} />)
    fireEvent.click(within(container).getByRole("button"))
    expect(onSelect).toHaveBeenCalledTimes(1)
  })

  it("문구를 감추는 좁은 폭에서도 이름이 남도록 aria-label 을 둔다", () => {
    const { container } = render(<TopNavAskBar onSelect={() => {}} label="사용법을 물어보세요" />)
    expect(within(container).getByRole("button")).toHaveAccessibleName("사용법을 물어보세요")
  })

  it("/ 를 누르면 ask 바로 포커스가 간다", () => {
    const { container } = render(<TopNavAskBar onSelect={() => {}} />)
    fireEvent.keyDown(document.body, { key: "/" })
    expect(within(container).getByRole("button")).toHaveFocus()
  })

  it("입력에 포커스가 있을 때는 / 단축키가 동작하지 않는다", () => {
    const { container } = render(
      <>
        <input aria-label="검색어" />
        <TopNavAskBar onSelect={() => {}} />
      </>,
    )
    const input = within(container).getByLabelText("검색어")
    input.focus()
    fireEvent.keyDown(input, { key: "/" })
    expect(within(container).getByRole("button")).not.toHaveFocus()
  })
})
