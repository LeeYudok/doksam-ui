import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Mail Workspace · doksam-ui 템플릿",
  description: "split-pane 원형 · admin 프로필(slate · Geist)을 강제 적용한 목록·상세 2패인 작업 화면 템플릿",
}

/**
 * Mail Workspace 템플릿(#89) 레이아웃 — profiles/index.ts 의 "admin" 프로필
 * (theme: slate, font: geist, defaultMode: light)을 이 서브트리에만 강제한다.
 */
export default function MailWorkspaceTemplateLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <div
      data-theme="slate"
      data-font="geist"
      data-density="compact"
      className="flex min-h-[calc(100vh-4rem)] flex-col gap-4 rounded-xl border border-border bg-background p-4 font-sans text-foreground sm:gap-6 sm:p-6"
    >
      <header className="flex flex-col gap-1">
        <span className="text-xs font-medium text-muted-foreground">
          doksam-ui 템플릿 · admin 프로필 · split-pane 원형
        </span>
        <h1 className="text-lg font-semibold tracking-tight sm:text-xl">Mail Workspace</h1>
      </header>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  )
}
