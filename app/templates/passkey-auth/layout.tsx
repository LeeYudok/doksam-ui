import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Passkey Auth · doksam-ui 템플릿",
  description: "console 프로필(ember 다크 · Geist)을 강제 적용한 패스키(WebAuthn) 인증 템플릿",
}

/**
 * Passkey Auth 템플릿(#46) 레이아웃 — profiles/index.ts 의 "console" 프로필
 * (theme: ember, font: geist, defaultMode: dark)을 이 서브트리에만 강제한다.
 * trading/elearning layout 과 동일한 컨테이너 스코프 패턴(data-theme/data-font/dark).
 */
export default function PasskeyAuthTemplateLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <div
      data-theme="ember"
      data-font="geist"
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
