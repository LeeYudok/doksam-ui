import { render } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import EwsDashboardTemplateLayout from "@/app/templates/ews-dashboard/layout"
import EwsDiagnosisTemplateLayout from "@/app/templates/ews-diagnosis/layout"

/**
 * 리뷰 finding(PR #111) 회귀 방지 — 템플릿 래퍼가 `overflow-hidden` 을 다시 달면
 * scrollport 가 생겨 안쪽 `TopNavShell` 의 `sticky top-0` 과 `StickyActionbar` 의
 * `sticky bottom-0` 이 붙지 않는다. jsdom 은 레이아웃을 계산하지 않으므로 sticky
 * 동작 자체가 아니라 그것을 깨는 클래스의 부재를 고정한다.
 */
const LAYOUTS = [
  { name: "ews-dashboard", Layout: EwsDashboardTemplateLayout },
  { name: "ews-diagnosis", Layout: EwsDiagnosisTemplateLayout },
] as const

describe.each(LAYOUTS)("$name 템플릿 레이아웃", ({ Layout }) => {
  it("sticky 를 깨는 overflow-hidden 없이 overflow-x-clip 으로 가로만 잘라낸다", () => {
    const { container } = render(
      <Layout>
        <div data-testid="child" />
      </Layout>
    )
    const wrapper = container.firstElementChild as HTMLElement
    expect(wrapper).not.toBeNull()
    expect(wrapper.className).not.toMatch(/(^|\s)overflow-hidden(\s|$)/)
    expect(wrapper.className).not.toMatch(/(^|\s)overflow-y-(hidden|auto|scroll)(\s|$)/)
    expect(wrapper).toHaveClass("overflow-x-clip")
  })

  it("finance 프로필 축 속성을 서브트리에 방출한다", () => {
    const { container } = render(
      <Layout>
        <div />
      </Layout>
    )
    const wrapper = container.firstElementChild as HTMLElement
    expect(wrapper.getAttribute("data-theme")).toBeTruthy()
  })
})
