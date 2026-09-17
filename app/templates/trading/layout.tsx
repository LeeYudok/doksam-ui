import type { Metadata } from "next"

import { TradingNav } from "./_components/trading-nav"
import { profileScopeAttributes } from "@/components/profile-scope"

export const metadata: Metadata = {
  title: "Trading Dashboard · doksam-ui 템플릿",
  description: "data 프로필(violet 다크 · Space Grotesk)을 강제 적용한 트레이딩/파이낸스 대시보드 템플릿",
}

/**
 * 트레이딩 대시보드 템플릿(#27) 레이아웃 — profiles/index.ts 의 "data" 프로필
 * (theme: violet, font: space-grotesk, defaultMode: dark)을 이 서브트리에만
 * 강제 적용한다. 루트 <html>(app/layout.tsx)의 사이트 전역 테마 스위처와는
 * 별개로, components/profile-preview-kit.tsx 와 동일한 "컨테이너 스코프"
 * 패턴(프로필 축 data-* · dark 를 래퍼 div 에 직접 부여)을 그대로 따른다.
 */
export default function TradingTemplateLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <div
      {...profileScopeAttributes("data")}
      className="dark flex min-h-[calc(100vh-4rem)] flex-col gap-4 rounded-xl border border-border bg-background p-4 font-sans text-foreground sm:gap-6 sm:p-6"
    >
      <header className="flex flex-col gap-3">
        <div className="flex flex-col gap-1">
          <span className="text-xs font-medium text-muted-foreground">doksam-ui 템플릿 · data 프로필</span>
          <h1 className="text-lg font-semibold tracking-tight sm:text-xl">Trading Dashboard</h1>
        </div>
        <TradingNav />
      </header>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  )
}
