import { Badge } from "@/components/ui/badge"
import { ScreenHelpDialog } from "@/components/screen-help-dialog"
import { RecentUpdates } from "@/app/templates/saas/_components/recent-updates"
import { DocList } from "@/app/templates/saas/_components/doc-list"
import { DashboardSummary } from "@/app/templates/saas/_components/dashboard-summary"

const HELP_ITEMS = [
  { title: "요약 카드", body: "워크스페이스·사용자·자동화·응답 시간 등 핵심 지표를 한눈에 보여줍니다." },
  { title: "콘텐츠 피드", body: "그리드/리스트/테이블 뷰를 전환하며 최근 업데이트를 확인할 수 있습니다." },
  { title: "목록 컨트롤", body: "탭·검색·페이지네이션으로 항목을 좁혀볼 수 있습니다." },
]

export default function SaasDashboardPage() {
  return (
    <div className="flex flex-col gap-8 pb-8">
      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-2">
          <Badge variant="secondary" className="w-fit">
            대시보드
          </Badge>
          <ScreenHelpDialog
            title="대시보드 도움말"
            description="이 화면을 구성하는 주요 영역을 설명합니다."
            items={HELP_ITEMS}
          />
        </div>
        <h1 className="text-2xl font-semibold tracking-tight">워크스페이스 현황</h1>
        <p className="max-w-prose text-sm text-muted-foreground">
          전체 워크스페이스의 활동과 최근 업데이트를 한 화면에서 확인하세요.
        </p>
      </section>

      <DashboardSummary />

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold tracking-tight">최근 업데이트</h2>
        <RecentUpdates />
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold tracking-tight">문서 목록</h2>
        <DocList />
      </section>
    </div>
  )
}
