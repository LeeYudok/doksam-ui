import { render, within } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import {
  RiskTable,
  RiskTableActions,
  RiskTableRowAction,
  type RiskTableColumn,
  type RiskTableProps,
} from "@/components/patterns/risk-table/risk-table"
import { RISK_TINT_PERCENT, type RiskLevel } from "@/lib/risk-tokens"

interface Row {
  id: string
  name: string
  amount: number
  level?: RiskLevel
}

const ROWS: Row[] = [
  { id: "a", name: "대성정밀공업", amount: 4820, level: "severe" },
  { id: "b", name: "한별물류", amount: 1260, level: "high" },
  { id: "c", name: "서린바이오텍", amount: 640 },
]

const COLUMNS: RiskTableColumn<Row>[] = [
  { key: "name", header: "차주", kind: "wrap", cell: (row) => row.name },
  { key: "amount", header: "금액", kind: "money", cell: (row) => String(row.amount) },
  {
    key: "actions",
    header: "조치",
    kind: "actions",
    cell: () => (
      <RiskTableActions>
        <RiskTableRowAction>근거 보기</RiskTableRowAction>
      </RiskTableActions>
    ),
  },
]

function renderTable(props: Partial<RiskTableProps<Row>> = {}) {
  return render(
    <RiskTable
      columns={COLUMNS}
      rows={ROWS}
      getRowKey={(row) => row.id}
      getRowSeverity={(row) => (row.level ? { level: row.level, label: `위험등급 ${row.level}` } : undefined)}
      {...props}
    />
  ).container
}

describe("RiskTable", () => {
  it("renders one body row per data row with the severity level on the row element", () => {
    const container = renderTable()
    const rows = container.querySelectorAll("tbody tr")
    expect(rows).toHaveLength(3)
    expect(rows[0].getAttribute("data-risk-level")).toBe("severe")
    expect(rows[1].getAttribute("data-risk-level")).toBe("high")
    expect(rows[2].hasAttribute("data-risk-level")).toBe(false)
  })

  it("tints a severity row through backgroundImage so the hover class keeps backgroundColor", () => {
    const container = renderTable()
    const row = container.querySelector("tbody tr") as HTMLElement
    const style = row.getAttribute("style") ?? ""
    expect(style).toContain("background-image")
    expect(style).toContain(`var(--risk-severe) ${RISK_TINT_PERCENT}%`)
    expect(style).not.toContain("background-color")
  })

  it("puts the left accent bar on the first cell only", () => {
    const container = renderTable()
    const cells = container.querySelectorAll("tbody tr:first-child td")
    expect(cells[0].getAttribute("style")).toContain("var(--risk-severe)")
    expect(cells[1].getAttribute("style") ?? "").not.toContain("var(--risk-severe)")
  })

  it("carries the severity label as a screen-reader-only second channel", () => {
    const container = renderTable()
    const firstCell = container.querySelector("tbody tr:first-child td") as HTMLElement
    const srOnly = within(firstCell).getByText("위험등급 severe")
    expect(srOnly.className).toContain("sr-only")
  })

  it("leaves rows without a severity unpainted", () => {
    const container = renderTable()
    const row = container.querySelectorAll("tbody tr")[2] as HTMLElement
    expect(row.getAttribute("style") ?? "").toBe("")
    expect(row.querySelector("td")?.getAttribute("style") ?? "").toBe("")
  })

  it("applies the cell conventions per column kind", () => {
    const container = renderTable()
    const cells = container.querySelectorAll("tbody tr:first-child td")
    expect(cells[0].className).toContain("whitespace-normal")
    expect(cells[1].className).toContain("text-right")
    expect(cells[1].className).toContain("tabular-nums")
    expect(cells[2].className).toContain("text-right")
  })

  it("does not set its own vertical cell padding so the density layer owns it", () => {
    const container = renderTable()
    for (const cell of container.querySelectorAll("tbody td")) {
      expect(cell.className).not.toMatch(/\bpy-\d/)
    }
  })

  it("renders the empty label across all columns when there is no row", () => {
    const container = renderTable({ rows: [], emptyLabel: "대상이 없습니다." })
    const cell = container.querySelector("tbody td") as HTMLElement
    expect(cell.textContent).toBe("대상이 없습니다.")
    expect(cell.getAttribute("colspan")).toBe(String(COLUMNS.length))
  })

  it("keeps the caption available to assistive tech when visually hidden", () => {
    const container = renderTable({ caption: "긴급 처리 필요 차주", captionHidden: true })
    const caption = container.querySelector("caption") as HTMLElement
    expect(caption.textContent).toBe("긴급 처리 필요 차주")
    expect(caption.className).toContain("sr-only")
  })

  it("wraps the table in the primitive's horizontal scroll container", () => {
    const container = renderTable()
    expect(container.querySelector('[data-slot="table-container"]')?.className).toContain("overflow-x-auto")
  })
})

describe("RiskTableRowAction", () => {
  it("pins every row action to the outline/sm button", () => {
    const { container } = render(<RiskTableRowAction>근거 보기</RiskTableRowAction>)
    const button = container.querySelector("button") as HTMLButtonElement
    expect(button.getAttribute("data-size")).toBe("sm")
    expect(button.type).toBe("button")
  })
})
