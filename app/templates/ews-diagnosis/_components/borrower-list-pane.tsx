"use client"

import { ListBulletsIcon } from "@phosphor-icons/react/dist/ssr"

import { PartyIdentityCell } from "@/components/party-identity-cell"
import { RiskGradeBadge } from "@/components/risk-grade-badge"
import { SectionPanelHeader } from "@/components/section-panel-header"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import type { EwsBorrowerRow } from "@/lib/templates/ews-data"

/**
 * split-pane 원형의 좌측 목록 패인 — 이 목록이 곧 내비게이션이고, 선택은 우측
 * 상세만 교체한다(페이지 이동 없음).
 *
 * 항목 하나의 생김새는 `party-identity-cell`(#83) 과 `risk-grade-badge`(#82) 가
 * 소유한다. 선택 상태는 배경색만으로 구분하지 않고 `aria-current` 와 좌측 굵은
 * 경계선을 함께 준다 — 색 하나에 의미를 몰아두지 않는 규칙이 목록에도 적용된다.
 */
export function BorrowerListPane({
  borrowers,
  selectedId,
  onSelect,
  className,
}: Readonly<{
  borrowers: EwsBorrowerRow[]
  selectedId: string
  onSelect: (id: string) => void
  className?: string
}>) {
  return (
    <Card className={cn("min-w-0", className)}>
      <SectionPanelHeader
        icon={ListBulletsIcon}
        title="진단 대기 차주"
        description="선택하면 오른쪽 진단 상세가 바뀝니다"
        meta={`${borrowers.length}건`}
      />
      <CardContent>
        <ul aria-label="진단 대기 차주 목록" className="flex flex-col gap-1">
          {borrowers.map((borrower) => {
            const selected = borrower.id === selectedId
            return (
              <li key={borrower.id}>
                <button
                  type="button"
                  aria-current={selected ? "true" : undefined}
                  onClick={() => onSelect(borrower.id)}
                  className={cn(
                    "flex w-full min-w-0 items-start justify-between gap-2 rounded-md border-l-2 px-3 py-2 text-left transition-colors duration-200",
                    "focus-visible:ring-ring/50 focus-visible:ring-[3px] focus-visible:outline-none",
                    selected
                      ? "border-l-primary bg-accent text-accent-foreground"
                      : "border-l-transparent hover:bg-muted"
                  )}
                >
                  <PartyIdentityCell
                    name={borrower.name}
                    industry={borrower.industry}
                    bizNo={borrower.bizNo}
                    density="compact"
                    className="min-w-0"
                  />
                  <span className="flex shrink-0 flex-col items-end gap-1">
                    <RiskGradeBadge level={borrower.level} label={borrower.gradeLabel} tier={borrower.tier} />
                    <span className="text-[11px] text-muted-foreground tabular-nums">{borrower.dueLabel}</span>
                  </span>
                </button>
              </li>
            )
          })}
        </ul>
      </CardContent>
    </Card>
  )
}
