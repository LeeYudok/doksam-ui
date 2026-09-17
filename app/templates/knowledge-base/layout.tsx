import type { Metadata } from "next"
import type { ReactNode } from "react"
import { profileScopeAttributes } from "@/components/profile-scope"

export const metadata: Metadata = {
  title: "Knowledge Base Console · doksam-ui 템플릿",
  description: "admin 프로필(slate · Geist 라이트)을 강제 적용한 위키·보드·로그 지식관리 콘솔 템플릿",
}

/**
 * 지식관리 콘솔 템플릿(#53) 레이아웃 — profiles/index.ts 의 "admin" 프로필
 * (theme: slate, font: geist)을 이 서브트리에만 강제한다. admin/layout.tsx 와
 * 동일하게 프로필 축 data-* 를 래퍼 div 에 직접 부여하는 컨테이너 스코프
 * 패턴을 따른다(라이트/다크는 사이트 전역 .dark 클래스를 그대로 상속).
 */
export default function KnowledgeBaseTemplateLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <div
      {...profileScopeAttributes("admin")}
      className="flex min-h-[calc(100vh-4rem)] w-full flex-col gap-4 overflow-hidden rounded-xl border border-border bg-background p-4 font-sans text-foreground sm:gap-6 sm:p-6"
    >
      <header className="flex flex-col gap-1">
        <span className="text-xs font-medium text-muted-foreground">doksam-ui 템플릿 · admin 프로필</span>
        <h1 className="text-lg font-semibold tracking-tight sm:text-xl">Knowledge Base Console</h1>
      </header>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  )
}
