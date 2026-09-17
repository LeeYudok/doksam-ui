import type { Metadata } from "next"

import { profileScopeAttributes } from "@/components/profile-scope"

export const metadata: Metadata = {
  title: "Passkey Auth · doksam-ui 템플릿",
  description: "console 프로필(ember 다크 · Geist)을 강제 적용한 패스키(WebAuthn) 인증 템플릿",
}

/**
 * Passkey Auth 템플릿(#46) 레이아웃 — profiles/index.ts 의 "console" 프로필을
 * 이 서브트리에만 강제한다. 축 속성을 수기로 적지 않고 profileScopeAttributes 로
 * 방출하는 것이 규약이다(#47) — 축이 늘어날 때 레이아웃마다 빠뜨리는 것을 막는다.
 * components/profile-scope.test.ts 가 수기 작성을 실패로 잡는다.
 */
export default function PasskeyAuthTemplateLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <div
      {...profileScopeAttributes("console")}
      className="dark flex min-h-[calc(100vh-4rem)] flex-col gap-4 rounded-xl border border-border bg-background p-4 font-sans text-foreground sm:gap-6 sm:p-6"
    >
      <header className="flex flex-col gap-1">
        <span className="text-xs font-medium text-muted-foreground">doksam-ui 템플릿 · console 프로필</span>
        <h1 className="text-lg font-semibold tracking-tight sm:text-xl">Passkey Auth</h1>
      </header>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  )
}
