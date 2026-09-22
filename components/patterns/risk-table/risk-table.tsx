import * as React from "react"

import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { riskTintBackground, type RiskLevel } from "@/lib/risk-tokens"
import { cn } from "@/lib/utils"

/**
 * 셀 규약 — EWS 9화면에서 반복되던 네 가지 셀 성격을 그대로 이름으로 굳힌 것이다.
 *
 * - `text`   기본. 줄바꿈 금지(`ews-nw`).
 * - `wrap`   줄바꿈 허용(`ews-wrapcell`). 업체명·사유처럼 긴 문장이 들어가는 칸.
 * - `money`  금액(`ews-money`). 우측정렬 + 등폭 숫자. 값 포맷은 `lib/finance/format-won.ts` 가 소유한다.
 * - `actions` 행 내 액션(`ews-rowbtn`). 우측정렬 + 줄바꿈 금지.
 */
export type RiskTableCellKind = "text" | "wrap" | "money" | "actions"

/**
 * 행 강조 심각도. `label` 이 필수인 것이 이 패턴의 핵심 제약이다 —
 * `--risk-*` 는 hue 하나로만 등급을 구분하므로 색만으로는 색각 이상 사용자에게
 * 아무것도 전달되지 않는다. 이 문구는 행의 sr-only 두 번째 채널로 나가며,
 * **보이는 등급 배지(`RiskGradeBadge`)를 같은 행의 컬럼으로 두는 것은 여전히 필수**다
 * (sr-only 는 스크린리더용이지 시각 채널이 아니다).
 */
export interface RiskTableSeverity {
  level: RiskLevel
  label: string
}

export interface RiskTableColumn<Row> {
  /** React key 겸 컬럼 식별자. */
  key: string
  header: React.ReactNode
  /** 기본 `text`. */
  kind?: RiskTableCellKind
  cell: (row: Row) => React.ReactNode
  /** 셀·헤더에 함께 붙는 추가 클래스. 색은 시맨틱 토큰만 쓴다. */
  className?: string
}

export interface RiskTableProps<Row> extends Omit<React.ComponentProps<"table">, "children"> {
  columns: ReadonlyArray<RiskTableColumn<Row>>
  rows: readonly Row[]
  getRowKey: (row: Row) => string
  /**
   * 행 강조. 생략하거나 `undefined` 를 돌려주면 그 행은 강조 없이 기본 표면으로 렌더한다 —
   * 모든 행이 칠해지면 어느 행도 강조되지 않는다.
   */
  getRowSeverity?: (row: Row) => RiskTableSeverity | undefined
  /** 표의 목적을 알리는 캡션. 시각적으로 숨기려면 `captionHidden`. */
  caption?: React.ReactNode
  captionHidden?: boolean
  /** `rows` 가 비었을 때 본문 한 줄로 표시할 문구. */
  emptyLabel?: React.ReactNode
}

const CELL_KIND_CLASS: Record<RiskTableCellKind, string> = {
  text: "whitespace-nowrap",
  wrap: "whitespace-normal",
  money: "whitespace-nowrap text-right font-mono tabular-nums",
  actions: "whitespace-nowrap text-right",
}

const HEAD_KIND_CLASS: Record<RiskTableCellKind, string> = {
  text: "",
  wrap: "",
  money: "text-right",
  actions: "text-right",
}

/**
 * 심각도 행 강조 업무 테이블(#87) — EWS 9화면에서 반복돼 온 "심각도가 행에 칠해지는
 * 업무 테이블"을 컬럼 정의만 바꿔 재사용하는 층으로 만든다.
 *
 * `data-table` 패턴(정렬·행 선택·일괄 액션·페이지네이션)을 대체하지 않는다. 이쪽이
 * 정하는 것은 **행 강조**와 **셀 규약** 둘뿐이고, 그 위에 정렬·선택을 얹는 것은
 * 소비 화면의 몫이다.
 *
 * ── 행 강조를 어떻게 칠하는가 ───────────────────────────────────────────────
 * 배경 tint 는 `backgroundColor` 가 아니라 **`backgroundImage` 의 단색 그라디언트**로
 * 넣는다. `TableRow` 의 `hover:bg-muted/50` 은 클래스라 인라인 `backgroundColor` 에
 * 무조건 진다 — 그대로 칠하면 강조된 행만 hover 피드백이 사라진다. tint 를 이미지
 * 층으로 올리면 배경색 자리가 비어 hover 클래스가 그대로 살고, tint 가 14% 반투명이라
 * 그 아래 hover 색이 비쳐 보인다.
 *
 * 좌측 accent bar 는 첫 셀의 `inset` box-shadow 다. `tr` 에 그림자를 거는 방식은
 * border-collapse 상태에 따라 브라우저마다 다르게 그려져 쓰지 않는다.
 *
 * 색은 Tailwind 유틸리티(`bg-risk-severe`)가 아니라 인라인 `style` 의 `var(--risk-*)`
 * 로 넣는다 — 프로필 설치는 소비 프로젝트의 `:root`/`.dark` 에 **값만** 넣으므로
 * 유틸리티를 쓰면 소비측에서 색이 통째로 빠진다(`risk-grade-badge` 와 같은 이유).
 *
 * ── 밀도 ────────────────────────────────────────────────────────────────────
 * 셀 세로 패딩을 이 패턴이 새로 정하지 않는다. `TableCell` 을 그대로 쓰면
 * `app/globals.css` 의 밀도 층(`[data-density] [data-slot="table-cell"]`)이
 * `--cell-py` 로 잡아 준다 — 밀도는 브랜드 프로필이 소유한다.
 *
 * ── 가로 스크롤 ─────────────────────────────────────────────────────────────
 * `Table` 프리미티브가 이미 `overflow-x-auto` 컨테이너를 렌더한다. 넓은 표에서도
 * 스크롤은 표 안에서 끝나고 body 로 새지 않으므로 별도 래퍼를 덧대지 않는다.
 */
function RiskTable<Row>({
  className,
  columns,
  rows,
  getRowKey,
  getRowSeverity,
  caption,
  captionHidden = false,
  emptyLabel,
  ...props
}: Readonly<RiskTableProps<Row>>) {
  return (
    <Table className={cn(className)} {...props}>
      {caption ? (
        <TableCaption className={cn(captionHidden && "sr-only")}>{caption}</TableCaption>
      ) : null}
      <TableHeader>
        <TableRow>
          {columns.map((column) => {
            const kind = column.kind ?? "text"
            return (
              <TableHead key={column.key} className={cn(HEAD_KIND_CLASS[kind], column.className)}>
                {column.header}
              </TableHead>
            )
          })}
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.length === 0 && emptyLabel ? (
          <TableRow>
            <TableCell colSpan={columns.length} className="py-8 text-center text-muted-foreground">
              {emptyLabel}
            </TableCell>
          </TableRow>
        ) : null}
        {rows.map((row) => {
          const severity = getRowSeverity?.(row)
          const tint = severity ? riskTintBackground(severity.level) : null

          return (
            <TableRow
              key={getRowKey(row)}
              data-risk-level={severity?.level}
              style={
                tint
                  ? { backgroundImage: `linear-gradient(to right, ${tint}, ${tint})` }
                  : undefined
              }
            >
              {columns.map((column, index) => {
                const kind = column.kind ?? "text"
                return (
                  <TableCell
                    key={column.key}
                    className={cn(CELL_KIND_CLASS[kind], column.className)}
                    style={
                      index === 0 && severity
                        ? { boxShadow: `inset 3px 0 0 0 var(--risk-${severity.level})` }
                        : undefined
                    }
                  >
                    {index === 0 && severity ? (
                      <span className="sr-only">{severity.label}</span>
                    ) : null}
                    {column.cell(row)}
                  </TableCell>
                )
              })}
            </TableRow>
          )
        })}
      </TableBody>
    </Table>
  )
}

/**
 * 행 내 액션 버튼 — `variant="outline" size="sm"` 으로 고정한다. variant·size 를
 * prop 으로 열어 두지 않는 것이 의도다: 행마다 버튼 모양이 갈리면 수십 행이 깔린
 * 표에서 시선이 버튼으로 먼저 끌려가 정작 심각도 강조가 묻힌다.
 */
function RiskTableRowAction({
  className,
  ...props
}: Readonly<Omit<React.ComponentProps<typeof Button>, "variant" | "size">>) {
  return <Button type="button" variant="outline" size="sm" className={cn(className)} {...props} />
}

/** 한 셀에 액션이 둘 이상일 때의 정렬 래퍼. */
function RiskTableActions({ className, ...props }: Readonly<React.ComponentProps<"div">>) {
  return <div className={cn("flex items-center justify-end gap-1.5", className)} {...props} />
}

export { RiskTable, RiskTableActions, RiskTableRowAction }
