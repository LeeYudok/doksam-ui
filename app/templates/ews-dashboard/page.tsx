"use client"

import { BellIcon, ClockCounterClockwiseIcon, ShieldCheckIcon } from "@phosphor-icons/react/dist/ssr"

import { ComplianceCallout } from "@/components/compliance-callout"
import { PageHeader } from "@/components/page-header"
import { TopNavAskBar, TopNavShell } from "@/components/patterns/top-nav-shell/top-nav-shell"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { EWS_AS_OF, EWS_HOME_SUB_TABS, EWS_NAV_ITEMS, EWS_ORG_NAME } from "@/lib/templates/ews-data"

import { EwsKpiRow } from "./_components/ews-kpi-row"
import { GradeDistributionCard } from "./_components/grade-distribution-card"
import { UrgentBorrowersCard } from "./_components/urgent-borrowers-card"

/**
 * EWS 홈 대시보드 템플릿 (#89) — `dashboard-grid` 원형.
 *
 * 이 화면의 목적은 새 UI 를 만드는 것이 아니라 #81~#88 에서 추출한 파츠가 실제
 * 업무 화면 하나로 조립되는지 확인하는 것이다. 그래서 여기서 새로 정의하는 것은
 * 배치(그리드)와 데모 데이터뿐이고, 눈에 보이는 요소는 전부 카탈로그 파츠다.
 *
 * 셸은 `TopNavShell` 이 `<main>` 과 `max-w-[1300px]` 컨테이너를 직접 렌더하므로
 * 이 페이지는 폭을 선언하지 않는다.
 */
export default function EwsDashboardPage() {
  return (
    <TopNavShell
      brand={
        <span className="flex items-center gap-2">
          <ShieldCheckIcon size={20} weight="duotone" className="text-primary" aria-hidden />
          <span className="text-sm font-semibold tracking-tight">{EWS_ORG_NAME}</span>
        </span>
      }
      items={EWS_NAV_ITEMS}
      activeItem="home"
      screenTitle="홈 대시보드"
      subTabs={EWS_HOME_SUB_TABS}
      activeSubTab="overview"
      ask={<TopNavAskBar label="차주명 · 사업자번호로 물어보세요" />}
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
          title="조기경보 홈"
          description="모니터링 대상 차주의 등급 변동과 기한이 임박한 조치를 한 화면에서 확인합니다."
        >
          <Badge variant="outline" className="font-mono text-[11px] font-normal">
            기준시각 {EWS_AS_OF}
          </Badge>
        </PageHeader>
        <div className="flex flex-wrap items-center gap-2">
          <Button type="button" variant="secondary" size="sm">
            리포트 내려받기
          </Button>
          <Button type="button">일괄 조치 상신</Button>
        </div>
      </div>

      <ComplianceCallout
        severity="critical"
        severityLabel="경보"
        regulationRef="여신감리 준수 지침 제2026-42호"
        condition="[경보] 등급으로 하향된 차주는"
        requirement="등급 확정일로부터 3영업일 안에 조치방안을 수립하여 센터장 결재를 득하여야 합니다."
        dueLabel="미결 2건 · 최단 기한 D-1 (2026-09-24)"
        actions={[
          { label: "조치방안 수립" },
          { label: "경보 해제 요청", variant: "destructive" },
          { label: "규정 원문", variant: "link" },
        ]}
      />

      <EwsKpiRow />

      <div className="grid min-w-0 grid-cols-1 gap-4 lg:grid-cols-[minmax(0,20rem)_minmax(0,1fr)]">
        <GradeDistributionCard />
        <UrgentBorrowersCard />
      </div>

      <footer className="border-t border-border pt-4 text-center text-xs text-muted-foreground">
        가상 데이터 · 데모. 표시되는 기관명 · 차주명 · 사업자번호 · 금액은 실재와 무관합니다.
      </footer>
    </TopNavShell>
  )
}
