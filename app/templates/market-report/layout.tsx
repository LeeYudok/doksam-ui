import type { Metadata } from "next"

import { ReportNav } from "./_components/report-nav"
import { profileScopeAttributes } from "@/components/profile-scope"

export const metadata: Metadata = {
  title: "Market Intelligence Report · doksam-ui 템플릿",
  description: "service 프로필(ocean 라이트 · Noto Sans KR)을 강제 적용한 데일리/주간 마켓 리포트 템플릿",
}

/**
 * 마켓 리포트 템플릿(#51) 레이아웃 — profiles/index.ts 의 "service" 프로필
 * (theme: ocean, font: noto-sans-kr, defaultMode: light)을 이 서브트리에만
 * 강제 적용한다. 데일리 리포트가 기준이라 라이트 고정(dark 클래스 없음).
 * 주간 리포트(weekly/page.tsx)는 페이지 루트에서 data-theme="violet" + dark 로
 * 다시 스코프해 그 페이지만 다크로 뒤집는다(trading layout 의 컨테이너 스코프
 * 패턴 — 중첩 재스코프). 색·폰트는 전부 시맨틱 토큰으로 해소한다.
 */
export default function MarketReportLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <div
      {...profileScopeAttributes("service")}
      className="flex min-h-[calc(100vh-4rem)] flex-col gap-4 rounded-xl border border-border bg-background p-4 font-sans text-foreground sm:gap-6 sm:p-6"
    >
      <header className="flex flex-col gap-3">
        <div className="flex flex-col gap-1">
          <span className="text-xs font-medium text-muted-foreground">doksam-ui 템플릿 · service 프로필</span>
          <h1 className="text-lg font-semibold tracking-tight sm:text-xl">Market Intelligence</h1>
        </div>
        <ReportNav />
      </header>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  )
}
