import { Badge } from "@/components/ui/badge"
import { PatternSection } from "./_components/pattern-section"
import { StepFlow } from "./_components/step-flow"
import { StatusBadgeShowcase } from "./_components/status-badge-showcase"
import { TooltipActionButtons } from "./_components/tooltip-action-buttons"
import { StepCardGrid } from "./_components/step-card-grid"
import { CollectionHistoryTable } from "./_components/collection-history-table"
import { StepResultList } from "./_components/step-result-list"
import { AdvancedDataTable } from "./_components/advanced-data-table"
import { ErrorAndLog } from "./_components/error-and-log"

const STEP_FLOW_CODE = `function StepIcon({ status }: { status: StepStatus }) {
  if (status === "done") return <CheckCircleIcon weight="fill" className="text-success" />
  if (status === "running") return <SpinnerGapIcon className="animate-spin text-chart-1" />
  if (status === "error") return <XCircleIcon weight="fill" className="text-destructive" />
  return <CircleIcon className="text-muted-foreground" />
}

<Progress value={progress} />`

const STATUS_BADGE_CODE = `const STATUSES = [
  { status: "Running", className: "border-chart-1/30 bg-chart-1/10 text-chart-1" },
  { status: "Success", className: "border-success/30 bg-success/10 text-success" },
  { status: "Failed", className: "border-destructive/30 bg-destructive/10 text-destructive" },
  { status: "Stopped", className: "border-warning/30 bg-warning/10 text-warning" },
]`

const TOOLTIP_CODE = `<Tooltip>
  <TooltipTrigger asChild>
    <Button variant="ghost" size="icon" className="h-7 w-7" aria-label="수정">
      <PencilSimpleIcon size={14} />
    </Button>
  </TooltipTrigger>
  <TooltipContent>수정</TooltipContent>
</Tooltip>`

const STEP_CARD_GRID_CODE = `function statusIcon(status: StepStatus) {
  if (status === "done") return <CheckCircleIcon weight="fill" className="text-success" />
  if (status === "running") return <SpinnerGapIcon className="animate-spin text-chart-1" />
  if (status === "error") return <XCircleIcon weight="fill" className="text-destructive" />
  return null
}`

const HISTORY_TABLE_CODE = `function rowHighlightClass(status: RunStatus) {
  if (status === "running") return "bg-chart-1/5"
  if (status === "failed") return "bg-destructive/5"
  return ""
}
// 수치 색상: inserted=text-success, filtered=text-chart-1, skipped=text-destructive`

const STEP_RESULT_CODE = `const TOTAL_ELAPSED = RESULTS.reduce((sum, item) => sum + item.elapsed, 0)
// order, label, count, elapsed(초) 만으로 리스트 + 하단 합산 행을 렌더링`

const ADVANCED_TABLE_CODE = `<Checkbox aria-label="전체 선택" />
<button className="flex items-center gap-0.5">
  이름 <SortAscendingIcon size={10} />
</button>
<Badge variant={row.status === "active" ? "default" : "secondary"}>
  {row.status === "active" ? "활성" : "비활성"}
</Badge>`

const ERROR_LOG_CODE = `<Card className="border-destructive/50 bg-destructive/5">
  <XCircleIcon className="text-destructive" />
</Card>
<Card className="border-warning/50 bg-warning/5">
  <WarningCircleIcon className="text-warning" />
</Card>`

export default function PipelinePatternsPage() {
  return (
    <div className="flex max-w-3xl flex-col gap-8">
      <section className="flex flex-col gap-3">
        <Badge variant="secondary" className="w-fit">
          금융 도메인
        </Badge>
        <h1 className="text-2xl font-semibold tracking-tight">파이프라인 UI 패턴</h1>
        <p className="max-w-prose text-sm text-muted-foreground">
          srope 프로젝트의 크롤러/분석 파이프라인 관리 화면에서 반복되는 UI 패턴을 doksam-ui 표준
          컴포넌트와 시맨틱 토큰으로 재작성한 모음입니다. 실행 상태(Running/Success/Failed/Stopped)는
          chart-1 · success · destructive · warning 토큰 조합으로 라이트/다크 모드를 모두 지원합니다.
        </p>
      </section>

      <PatternSection
        num={33}
        title="스텝 플로우"
        desc="번호 + 화살표 + 상태 아이콘 + 진행률 바."
        code={STEP_FLOW_CODE}
        usage={[
          "상태 아이콘: done=success, running=chart-1(회전), error=destructive, idle=muted-foreground.",
          "진행률은 components/ui/progress 를 그대로 사용한다.",
        ]}
      >
        <StepFlow />
      </PatternSection>

      <PatternSection
        num={34}
        title="실행 상태 배지"
        desc="Running/Success/Failed/Stopped 4종 — 시맨틱 토큰으로 다크모드 자동 대응."
        code={STATUS_BADGE_CODE}
        usage={[
          "라이트/다크 각각 다른 bg-{color}-100/900 하드코딩 대신 {token}/10 opacity 조합 하나로 양쪽을 모두 만족시킨다.",
          "Running 은 SpinnerGapIcon 에 animate-spin 을 적용해 진행 중임을 표시한다.",
        ]}
      >
        <StatusBadgeShowcase />
      </PatternSection>

      <PatternSection
        num={35}
        title="툴팁 액션 버튼"
        desc="모든 아이콘 전용 버튼에 Tooltip 필수 — 접근성 라벨 겸용."
        code={TOOLTIP_CODE}
        usage={[
          "아이콘 전용 버튼은 크기와 무관하게 항상 aria-label 을 채운다(Tooltip 텍스트와 동일 값).",
          "TooltipProvider 는 섹션(또는 페이지) 최상위에서 한 번만 감싼다 — delayDuration 기본값 0.",
        ]}
      >
        <TooltipActionButtons />
      </PatternSection>

      <PatternSection
        num={36}
        title="스텝 카드 그리드"
        desc="카테고리 배지 + 카테고리별 스텝 카드, 상태별 아이콘/에러 메시지."
        code={STEP_CARD_GRID_CODE}
        usage={[
          "에러 상태는 elapsed/count 대신 errorMessage 를 text-destructive 로 노출한다.",
          "카테고리 배지는 첫 번째만 default, 나머지는 secondary — 활성 카테고리 강조 관례를 유지한다.",
        ]}
      >
        <StepCardGrid />
      </PatternSection>

      <PatternSection
        num={37}
        title="수집 이력 테이블"
        desc="상태별 행 하이라이팅 + 체크박스 일괄선택 + 인라인 Tooltip 액션."
        code={HISTORY_TABLE_CODE}
        usage={[
          "행 배경은 상태 강조용으로만 옅게(opacity 5%) 사용하고 본문 텍스트 대비를 해치지 않는다.",
          "sticky 헤더 + ScrollArea 로 긴 이력 목록도 헤더가 고정되도록 한다.",
        ]}
      >
        <CollectionHistoryTable />
      </PatternSection>

      <PatternSection
        num={38}
        title="스텝 결과 리스트"
        desc="순번 + 스텝명 + 건수 + 소요시간, 하단 자동 합산."
        code={STEP_RESULT_CODE}
        usage={[
          "총 소요시간은 items.reduce 로 자동 계산하고 별도 prop 으로 전달하지 않는다.",
          "각 행은 성공 아이콘 고정 — 실패/진행중 표시가 필요하면 #34 StatusBadge 패턴을 함께 사용한다.",
        ]}
      >
        <StepResultList />
      </PatternSection>

      <PatternSection
        num={39}
        title="고급 데이터 테이블"
        desc="필터 + 정렬 헤더 + 일괄 선택 + 페이징 — 목록 화면 표준 툴바."
        code={ADVANCED_TABLE_CODE}
        usage={[
          "일괄 액션(삭제·내보내기)은 선택된 건수와 함께 툴바 좌측에, 필터·새로고침은 우측에 배치한다.",
          "페이징은 이전/다음 버튼 + 현재 페이지만 노출하는 간단한 형태를 기본으로 한다.",
        ]}
      >
        <AdvancedDataTable />
      </PatternSection>

      <PatternSection
        num={40}
        title="에러 카드 + 실행 로그"
        desc="실패/경고 알림 카드와 최근 실행 이력 리스트."
        code={ERROR_LOG_CODE}
        usage={[
          "에러 카드는 border+bg 를 같은 토큰의 옅은 버전으로 맞춰(destructive/warning) 카드 자체가 상태를 말하게 한다.",
          "로그 리스트는 실패 항목에만 에러 사유를 truncate 로 짧게 덧붙인다.",
        ]}
      >
        <ErrorAndLog />
      </PatternSection>
    </div>
  )
}
