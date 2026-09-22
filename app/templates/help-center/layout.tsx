import type { Metadata } from "next"
import type { ReactNode } from "react"

import { profileScopeAttributes } from "@/components/profile-scope"

import { HelpCenterNav } from "./_components/help-center-nav"

export const metadata: Metadata = {
  title: "Help Center · doksam-ui 템플릿",
  description: "admin 프로필(slate · Geist)을 강제 적용한 질문 창구형 도움말 센터 템플릿",
}

/**
 * Help Center 템플릿(#100) 레이아웃 — profiles/index.ts 의 "admin" 프로필
 * (theme: slate, font: geist)을 이 서브트리에만 강제한다. rag-search/ontology 와
 * 동일한 컨테이너 스코프 패턴: sidebar-app 원형의 "한 칼럼 작업 영역"을
 * 자체 사이드바 없이 쓴다(#87 RiskTable 등과 동일하게 이 이슈 범위에서는
 * 전역 사이드바 배선을 새로 만들지 않는다).
 *
 * 탭 4개(물어보기·매뉴얼 색인·FAQ·질문 이력)는 client Tabs 가 아니라 라우트다 —
 * HelpCenterNav 가 각 탭을 딥링크 가능한 하위 경로로 연결한다.
 */
export default function HelpCenterTemplateLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <div
      {...profileScopeAttributes("admin")}
      className="flex min-h-[calc(100vh-4rem)] w-full flex-col gap-4 rounded-xl border border-border bg-background p-4 font-sans text-foreground sm:gap-6 sm:p-6"
    >
      <header className="flex flex-col gap-3">
        <div className="flex flex-col gap-1">
          <span className="text-xs font-medium text-muted-foreground">doksam-ui 템플릿 · admin 프로필</span>
          <h1 className="text-lg font-semibold tracking-tight sm:text-xl">Help Center</h1>
          <p className="max-w-prose text-sm text-muted-foreground">
            문서를 훑어보는 대신 질문으로 들어오는 도움말 센터입니다. 전 업무화면의 ask 바가 여기로 연결됩니다.
          </p>
        </div>
        <HelpCenterNav />
      </header>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  )
}
