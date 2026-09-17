import type { Metadata } from "next"
import { profileScopeAttributes } from "@/components/profile-scope"

export const metadata: Metadata = {
  title: "Company Intel Dashboard · doksam-ui 템플릿",
  description: "service 프로필(ocean 라이트 · noto-sans-kr)을 강제 적용한 기업 인텔리전스 대시보드 템플릿.",
}

/**
 * Company Intelligence 대시보드 템플릿(#53) 레이아웃 — profiles/index.ts 의 "service"
 * 프로필(theme: ocean, font: noto-sans-kr, 라이트)을 이 서브트리에만 강제한다.
 * bank/saas layout 과 동일한 컨테이너 스코프 패턴(프로필 축 data-* 래퍼)을 따른다.
 * 루트 <html> 전역 테마 스위처와는 별개다.
 */
export default function CompanyIntelTemplateLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <div
      {...profileScopeAttributes("service")}
      className="flex min-h-[calc(100vh-4rem)] flex-col gap-4 rounded-xl border border-border bg-background p-4 font-sans text-foreground sm:gap-6 sm:p-6"
    >
      <header className="flex flex-col gap-1">
        <span className="text-xs font-medium text-muted-foreground">doksam-ui 템플릿 · service 프로필</span>
        <h1 className="text-lg font-semibold tracking-tight sm:text-xl">Company Intelligence</h1>
      </header>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  )
}
