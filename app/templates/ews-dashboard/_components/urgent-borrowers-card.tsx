"use client"

import { WarningOctagonIcon } from "@phosphor-icons/react/dist/ssr"

import { PartyIdentityCell } from "@/components/party-identity-cell"
import {
  RiskTable,
  RiskTableActions,
  RiskTableRowAction,
  type RiskTableColumn,
} from "@/components/patterns/risk-table/risk-table"
import { RiskGradeBadge } from "@/components/risk-grade-badge"
import { SectionPanelHeader } from "@/components/section-panel-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { formatWon } from "@/lib/finance/format-won"
import { EWS_AS_OF, EWS_URGENT_BORROWERS, type EwsBorrowerRow } from "@/lib/templates/ews-data"

/**
 * 긴급 처리 차주 표 — `risk-table` 패턴(#87)에 컬럼 정의만 주입한다.
 *
 * 등급 배지 컬럼은 패턴이 만들어 주지 않고 화면이 넣는 것이 규약이다. 행 강조의
 * sr-only 문구는 스크린리더용이라 보이는 등급 표기를 대신하지 못한다.
 */
const COLUMNS: RiskTableColumn<EwsBorrowerRow>[] = [
  {
    key: "party",
    header: "차주",
    kind: "wrap",
    cell: (row) => (
      <PartyIdentityCell name={row.name} industry={row.industry} bizNo={row.bizNo} density="compact" />
    ),
  },
  {
    key: "grade",
    header: "등급",
    cell: (row) => <RiskGradeBadge level={row.level} label={row.gradeLabel} tier={row.tier} />,
  },
  {
    key: "exposure",
    header: "여신잔액",
    kind: "money",
    cell: (row) => formatWon(row.exposureWon),
  },
  {
    key: "signal",
    header: "경보 신호",
    kind: "wrap",
    cell: (row) => <span className="text-muted-foreground">{row.signal}</span>,
    className: "min-w-[14rem]",
  },
  {
    key: "due",
    header: "조치 기한",
    cell: (row) => <span className="tabular-nums">{row.dueLabel}</span>,
  },
  {
    key: "owner",
    header: "담당",
    cell: (row) => row.owner,
  },
  {
    key: "actions",
    header: "조치",
    kind: "actions",
    cell: () => (
      <RiskTableActions>
        <RiskTableRowAction>상세</RiskTableRowAction>
        <RiskTableRowAction>조치 등록</RiskTableRowAction>
      </RiskTableActions>
    ),
  },
]

export function UrgentBorrowersCard() {
  return (
    <Card className="min-w-0">
      <SectionPanelHeader
        icon={WarningOctagonIcon}
        title="긴급 처리 차주"
        description="경보·주의 등급 중 조치 기한이 임박한 차주"
        meta={`${EWS_URGENT_BORROWERS.length}건 · ${EWS_AS_OF} 기준`}
        actions={
          <Button type="button" variant="ghost" size="sm">
            전체 목록
          </Button>
        }
      />
      <CardContent>
        <RiskTable
          columns={COLUMNS}
          rows={EWS_URGENT_BORROWERS}
          getRowKey={(row) => row.id}
          getRowSeverity={(row) =>
            row.level === "low" ? undefined : { level: row.level, label: `${row.gradeLabel} 등급` }
          }
          caption="조치 기한이 임박한 조기경보 대상 차주 목록"
          captionHidden
          emptyLabel="긴급 처리 대상 차주가 없습니다."
        />
      </CardContent>
    </Card>
  )
}
