import type { Metadata } from "next"

import { profileScopeAttributes } from "@/components/profile-scope"

export const metadata: Metadata = {
  title: "Portal Login · doksam-ui 템플릿",
  description: "finance 프로필(ivory 라이트 · Noto Sans KR)을 강제 적용한 사내 업무포털 로그인 템플릿",
}

/**
 * Portal Login 템플릿(#101) 레이아웃 — profiles/index.ts 의 "finance" 프로필을
 * 이 서브트리에만 강제한다. 축 속성을 수기로 적지 않고 profileScopeAttributes 로
 * 방출하는 것이 규약이다(#47) — components/profile-scope.test.ts 가 수기 작성을 실패로 잡는다.
 */
export default function PortalLoginTemplateLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <div
      {...profileScopeAttributes("finance")}
      className="flex min-h-[calc(100vh-4rem)] flex-col gap-4 rounded-xl border border-border bg-background p-4 font-sans text-foreground sm:gap-6 sm:p-6"
    >
      <header className="flex flex-col gap-1">
        <span className="text-xs font-medium text-muted-foreground">doksam-ui 템플릿 · finance 프로필</span>
        <h1 className="text-lg font-semibold tracking-tight sm:text-xl">Portal Login</h1>
      </header>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  )
}
