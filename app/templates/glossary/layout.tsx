import type { Metadata } from "next"
import { profileScopeAttributes } from "@/components/profile-scope"

export const metadata: Metadata = {
  title: "Term Network Explorer · doksam-ui 템플릿",
  description: "data 프로필(violet 다크 · Space Grotesk)을 강제 적용한 SDLC·AI 용어 네트워크 탐색 템플릿",
}

/**
 * Term Network Explorer 템플릿(#51) 레이아웃 — profiles/index.ts 의 "data" 프로필
 * (theme: violet, font: space-grotesk, defaultMode: dark)을 이 서브트리에만 강제한다.
 * trading/layout.tsx 와 동일하게 프로필 축 data-* · dark 를 래퍼 div 에 직접 부여하는
 * 컨테이너 스코프 패턴을 따른다(루트 <html> 전역 테마 스위처와 별개).
 */
export default function GlossaryTemplateLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <div
      {...profileScopeAttributes("data")}
      className="dark flex min-h-[calc(100vh-4rem)] flex-col gap-4 rounded-xl border border-border bg-background p-4 font-sans text-foreground sm:gap-6 sm:p-6"
    >
      <header className="flex flex-col gap-1">
        <span className="text-xs font-medium text-muted-foreground">doksam-ui 템플릿 · data 프로필</span>
        <h1 className="text-lg font-semibold tracking-tight sm:text-xl">Term Network Explorer</h1>
      </header>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  )
}
