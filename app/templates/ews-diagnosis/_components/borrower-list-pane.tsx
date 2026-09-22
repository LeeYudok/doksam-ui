"use client"

import * as React from "react"
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
 *
 * `className` 으로 표시/숨김을 토글할 때는 `flex`/`lg:flex` 를 쓴다 — `Card` 의
 * 기본값이 `flex flex-col` 이라 `block` 을 넘기면 twMerge 가 display 를 덮어
 * 카드 내부 `gap` 이 통째로 사라진다.
 *
 * 패널 제목은 `SectionPanelHeader` 가 `CardTitle`(div) 로 그리므로 heading 이
 * 아니다. 2단 전환에서 포커스를 되돌릴 자리 겸 문서 개요용으로 sr-only `h2` 를
 * 따로 두고 `headingRef` 로 노출한다.
 */
export function BorrowerListPane({
  borrowers,
  selectedId,
  onSelect,
  className,
  headingRef,
}: Readonly<{
  borrowers: EwsBorrowerRow[]
  selectedId: string
  onSelect: (id: string) => void
  className?: string
  /** 2단 전환에서 목록으로 포커스를 되돌릴 때 쓰는 sr-only 제목 ref. */
  headingRef?: React.Ref<HTMLHeadingElement>
}>) {
  return (
    <Card className={cn("min-w-0", className)}>
      <h2 ref={headingRef} tabIndex={-1} className="sr-only focus:outline-none">
        진단 대기 차주 목록
      </h2>
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
