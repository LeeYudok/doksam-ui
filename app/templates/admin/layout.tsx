import type { ReactNode } from "react"

import { AdminSidebar } from "./_components/admin-sidebar"
import { profileScopeAttributes } from "@/components/profile-scope"

/**
 * Admin/Backoffice Pro 템플릿 레이아웃 (#27 템플릿 2/3).
 *
 * profiles/index.ts의 "admin" 프로필(theme: slate, font: geist)을 이
 * 서브트리에 강제 스코프한다 — components/profile-preview-kit.tsx와 동일한
 * 프로필 축 data-* 속성 스코핑 기법(app/globals.css의
 * [data-theme="slate"] / [data-font="geist"] 선택자가 이 컨테이너 안에서만
 * 적용된다). 라이트/다크는 강제하지 않고 사이트 전역 .dark 클래스를 그대로
 * 상속한다.
 *
 * app-shell-samples.tsx가 문서화한 "사이드바형 셸" 패턴(내비게이션 상시 노출,
 * 관리자·데이터 도구에 적합)을 이 템플릿 자체 사이드바(AdminSidebar)로 구현한다.
 */
export default function AdminTemplateLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <div
      {...profileScopeAttributes("admin")}
      className="flex min-h-[calc(100vh-4rem)] w-full flex-col overflow-hidden rounded-xl border border-border bg-background font-sans text-foreground md:flex-row"
    >
      <AdminSidebar />
      <main className="min-w-0 flex-1 overflow-x-auto px-4 py-4 sm:px-6 sm:py-6">{children}</main>
    </div>
  )
}
