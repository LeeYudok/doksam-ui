"use client"

import { FileMagnifyingGlassIcon } from "@phosphor-icons/react/dist/ssr"

import { AuditCodeTag } from "@/components/audit-code-tag"
import { RiskTable, type RiskTableColumn } from "@/components/patterns/risk-table/risk-table"
import { SectionPanelHeader } from "@/components/section-panel-header"
import { Card, CardContent } from "@/components/ui/card"
import type { EwsEvidenceRow } from "@/lib/templates/ews-data"

/**
 * 진단 근거 · 감사 추적 — `risk-table`(#87) 에 컬럼 정의만 주입하고, 코드 열은
 * `audit-code-tag`(#83) 가 그린다.
 *
 * #89 의 긴급 처리 차주 표와 같은 패턴을 쓰지만 열 구성이 전혀 다르다(식별·금액
 * 대신 코드·출처·관측 시각). 패턴에 분기를 더하지 않고 컬럼만 갈아끼워 다른
 * 성격의 표가 만들어지는지가 이 화면의 검증 지점이다.
 */
const COLUMNS: RiskTableColumn<EwsEvidenceRow>[] = [
  {
    key: "code",
    header: "감사코드",
    cell: (row) => <AuditCodeTag code={row.code} copyable />,
  },
  {
    key: "source",
    header: "자료 출처",
    cell: (row) => row.source,
  },
  {
    key: "observation",
    header: "관측 내용",
    kind: "wrap",
    cell: (row) => <span className="text-muted-foreground">{row.observation}</span>,
    className: "min-w-[14rem]",
  },
  {
    key: "collectedAt",
    header: "수집 시각",
    cell: (row) => <span className="font-mono text-xs tabular-nums">{row.collectedAt}</span>,
  },
]

export function EvidenceTrailCard({ rows }: Readonly<{ rows: EwsEvidenceRow[] }>) {
  return (
    <Card className="min-w-0">
      <SectionPanelHeader
        icon={FileMagnifyingGlassIcon}
        title="진단 근거 · 감사 추적"
        description="기여 변수를 뒷받침한 원자료와 수집 시각"
        meta={`${rows.length}건`}
      />
      <CardContent>
        <RiskTable
          columns={COLUMNS}
          rows={rows}
          getRowKey={(row) => row.id}
          getRowSeverity={(row) =>
            row.level === "low" ? undefined : { level: row.level, label: `${row.levelLabel} 등급 근거` }
          }
          caption="경보 원인 진단의 근거 자료 목록"
          captionHidden
          emptyLabel="수집된 근거 자료가 없습니다."
        />
      </CardContent>
    </Card>
  )
}
