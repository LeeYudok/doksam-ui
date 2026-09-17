import type { Metadata } from "next"

import { ChatNav } from "./_components/chat-nav"
import { PRODUCT_NAME } from "./_lib/data"
import { profileScopeAttributes } from "@/components/profile-scope"

export const metadata: Metadata = {
  title: "Chat 템플릿 · doksam-ui",
  description: "data 프로필(violet 다크 · Space Grotesk)을 강제 적용한 AI 채팅 어시스턴트 템플릿.",
}

/**
 * Chat/AI Assistant 템플릿(#29) 레이아웃 — profiles/index.ts 의 "data" 프로필
 * (theme: violet, font: space-grotesk, defaultMode: dark)을 이 서브트리에만
 * 강제 적용한다. app/templates/trading/layout.tsx 와 동일한 "컨테이너 스코프"
 * 패턴(프로필 축 data-* · dark 를 래퍼 div 에 직접 부여, 루트 레이아웃은
 * 건드리지 않음)을 따른다 — components/profile-preview-kit.tsx 기법과 같다.
 *
 * 데스크톱 3분할(사이트 사이드바 + 대화목록 + 대화창)은 사이트 전역
 * SiteSidebar(components/site-sidebar.tsx, 이 이슈 범위 밖)와 page.tsx 안의
 * 대화목록/대화창 2분할이 합쳐져 만들어진다 — 이 레이아웃 자체는 프로필
 * 스코프와 대화/설정 탭 전환만 담당한다. min-h-0 로 자식(page.tsx)이
 * flex-1 높이를 온전히 가져가게 해 message-scroller 가 뷰포트 안에서
 * 스크롤되도록 한다.
 */
export default function ChatTemplateLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <div
      {...profileScopeAttributes("data")}
      className="dark flex min-h-[calc(100vh-4rem)] flex-col gap-4 rounded-xl border border-border bg-background p-4 font-sans text-foreground sm:p-6"
    >
      <header className="flex flex-col gap-3">
        <div className="flex flex-col gap-1">
          <span className="text-xs font-medium text-muted-foreground">doksam-ui 템플릿 · data 프로필</span>
          <h1 className="text-xl font-semibold tracking-tight">{PRODUCT_NAME}</h1>
        </div>
        <ChatNav />
      </header>
      <div className="min-h-0 flex-1">{children}</div>
    </div>
  )
}
