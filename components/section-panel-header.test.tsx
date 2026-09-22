import { GaugeIcon } from "@phosphor-icons/react/dist/ssr"
import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { SectionPanelHeader } from "@/components/section-panel-header"

describe("SectionPanelHeader", () => {
  it("title을 렌더한다", () => {
    render(<SectionPanelHeader icon={GaugeIcon} title="여신감리 대상 차주" />)
    expect(screen.getByText("여신감리 대상 차주")).toBeInTheDocument()
  })

  it("description을 생략하면 렌더하지 않는다", () => {
    const { container } = render(<SectionPanelHeader icon={GaugeIcon} title="제목" />)
    expect(container.querySelector('[data-slot="card-description"]')).not.toBeInTheDocument()
  })

  it("meta와 actions를 모두 생략하면 우측 슬롯을 렌더하지 않는다", () => {
    const { container } = render(<SectionPanelHeader icon={GaugeIcon} title="제목" />)
    expect(container.querySelector('[data-slot="section-panel-header-meta"]')).not.toBeInTheDocument()
    expect(container.querySelector('[data-slot="section-panel-header-actions"]')).not.toBeInTheDocument()
  })

  it("meta 텍스트를 렌더한다", () => {
    render(<SectionPanelHeader icon={GaugeIcon} title="제목" meta="총 128건" />)
    expect(screen.getByText("총 128건")).toBeInTheDocument()
  })

  it("actions 노드를 렌더한다", () => {
    render(<SectionPanelHeader icon={GaugeIcon} title="제목" actions={<button type="button">필터</button>} />)
    expect(screen.getByRole("button", { name: "필터" })).toBeInTheDocument()
  })
})
