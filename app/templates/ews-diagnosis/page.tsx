"use client"

import * as React from "react"
import { BellIcon, CaretLeftIcon, ClockCounterClockwiseIcon, ShieldCheckIcon } from "@phosphor-icons/react/dist/ssr"

import { PageHeader } from "@/components/page-header"
import { PartyIdentityCell } from "@/components/party-identity-cell"
import { TopNavAskBar, TopNavShell } from "@/components/patterns/top-nav-shell/top-nav-shell"
import { RiskGradeBadge } from "@/components/risk-grade-badge"
import { StickyActionbar } from "@/components/sticky-actionbar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
  EWS_AS_OF,
  EWS_DIAGNOSES,
  EWS_DIAGNOSIS_SUB_TABS,
  EWS_NAV_ITEMS,
  EWS_ORG_NAME,
  EWS_URGENT_BORROWERS,
} from "@/lib/templates/ews-data"

import { BorrowerListPane } from "./_components/borrower-list-pane"
import { CollectionStatusCard } from "./_components/collection-status-card"
import { EvidenceTrailCard } from "./_components/evidence-trail-card"
import { FactorRankingCard } from "./_components/factor-ranking-card"

/**
 * EWS 경보 원인 진단 템플릿 (#90) — `split-pane` 원형.
 *
 * `/templates/ews-dashboard`(#89) 와 **같은 파츠 집합만으로** 다른 원형의 화면을
 * 조립할 수 있는지 확인하는 것이 이 화면의 목적이다. 그래서 새로 정의하는 것은
 * 좌우 분할 배치와 선택 상태뿐이고, 보이는 요소는 전부 카탈로그 파츠다.
 *
 * 좌측 목록이 곧 내비게이션이라 선택은 라우트를 바꾸지 않고 우측만 교체한다.
 * 모바일에서는 좌우를 동시에 세울 폭이 없어 목록↔상세 2단 전환으로 접는다
 * (`mail-workspace` 선례).
 *
 * 셸은 `TopNavShell` 이 `<main>` 과 `max-w-[1300px]` 컨테이너를 직접 렌더하므로
 * 이 페이지는 폭을 선언하지 않는다. 셸에 준 값 중 #89 와 다른 것은 `activeItem`
 * 과 화면 제목·서브탭뿐이다.
 */
export default function EwsDiagnosisPage() {
  const [selectedId, setSelectedId] = React.useState(EWS_URGENT_BORROWERS[0].id)
  const [mobileDetail, setMobileDetail] = React.useState(false)

  const borrower = EWS_URGENT_BORROWERS.find((row) => row.id === selectedId) ?? EWS_URGENT_BORROWERS[0]
  const diagnosis = EWS_DIAGNOSES[borrower.id]

  const handleSelect = React.useCallback((id: string) => {
    setSelectedId(id)
    setMobileDetail(true)
  }, [])

  return (
    <TopNavShell
      brand={
        <span className="flex items-center gap-2">
          <ShieldCheckIcon size={20} weight="duotone" className="text-primary" aria-hidden />
          <span className="text-sm font-semibold tracking-tight">{EWS_ORG_NAME}</span>
        </span>
      }
      items={EWS_NAV_ITEMS}
      activeItem="borrowers"
      screenTitle="경보 원인 진단"
      subTabs={EWS_DIAGNOSIS_SUB_TABS}
      activeSubTab="diagnosis"
      ask={<TopNavAskBar label="차주명 · 사업자번호로 물어보세요" href="/templates/help-center" />}
      tools={
        <>
          <Button type="button" variant="outline" size="sm">
            <ClockCounterClockwiseIcon size={14} weight="regular" aria-hidden />
            새로고침
          </Button>
          <Button type="button" variant="ghost" size="icon" aria-label="알림 7건">
            <BellIcon size={18} weight="regular" />
          </Button>
        </>
      }
    >
      <div className="flex flex-wrap items-end justify-between gap-3">
        <PageHeader
          title="경보 원인 진단"
          description={
            <PartyIdentityCell
              name={borrower.name}
              industry={borrower.industry}
              corpType="법인"
              bizNo={borrower.bizNo}
            />
          }
        >
          <RiskGradeBadge level={borrower.level} label={borrower.gradeLabel} tier={borrower.tier} />
          <Badge variant="outline" className="font-mono text-[11px] font-normal">
            기준시각 {EWS_AS_OF}
          </Badge>
        </PageHeader>
        <div className="flex flex-wrap items-center gap-2">
          <Button type="button" variant="secondary" size="sm">
            진단 리포트 내려받기
          </Button>
          <Button type="button" variant="outline" size="sm">
            홈 대시보드
          </Button>
        </div>
      </div>

      <div className="flex min-w-0 flex-col gap-4 lg:flex-row lg:items-start">
        <BorrowerListPane
          borrowers={EWS_URGENT_BORROWERS}
          selectedId={selectedId}
          onSelect={handleSelect}
          className={cn("lg:w-80 lg:shrink-0", mobileDetail ? "hidden lg:block" : "block")}
        />

        <div className={cn("min-w-0 flex-1 flex-col gap-4 lg:flex", mobileDetail ? "flex" : "hidden lg:flex")}>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="self-start lg:hidden"
            onClick={() => setMobileDetail(false)}
          >
            <CaretLeftIcon size={14} weight="bold" aria-hidden />
            차주 목록으로
          </Button>

          <p className="text-sm text-muted-foreground">{diagnosis.summary}</p>

          <FactorRankingCard
            factors={diagnosis.factors}
            scoreLabel={diagnosis.scoreLabel}
            modelLabel={diagnosis.modelLabel}
          />
          <EvidenceTrailCard rows={diagnosis.evidence} />
          <CollectionStatusCard items={diagnosis.collection} />
        </div>
      </div>

      <StickyActionbar
        meta={diagnosis.nextStepLabel}
        destructiveAction={{ label: "경보 해제 요청" }}
        secondaryAction={{ label: "근거 자료 내려받기" }}
        primaryAction={{ label: "조치방안 수립" }}
      />

      <footer className="border-t border-border pt-4 text-center text-xs text-muted-foreground">
        가상 데이터 · 데모. 표시되는 기관명 · 차주명 · 사업자번호 · 금액은 실재와 무관합니다.
      </footer>
    </TopNavShell>
  )
}
