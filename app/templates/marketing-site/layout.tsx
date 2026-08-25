import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Marketing Site · doksam-ui 템플릿",
  description: "top-nav-site 원형 · service 프로필(ocean 라이트 · Noto Sans KR)을 강제 적용한 마케팅 사이트 템플릿",
}

/**
 * Marketing Site 템플릿(#89) 레이아웃 — profiles/index.ts 의 "service" 프로필
 * (theme: ocean, font: noto-sans-kr, defaultMode: light)을 이 서브트리에만 강제한다.
 * 셸 자체는 페이지가 소유한다(top-nav-site 원형은 상단 내비 + 세로 섹션 흐름).
 */
export default function MarketingSiteTemplateLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <div
      data-theme="ocean"
      data-font="noto-sans-kr"
      className="flex min-h-[calc(100vh-4rem)] flex-col overflow-hidden rounded-xl border border-border bg-background font-sans text-foreground"
    >
      <div className="border-b border-border px-4 py-3">
        <span className="text-xs font-medium text-muted-foreground">
          doksam-ui 템플릿 · service 프로필 · top-nav-site 원형
        </span>
        <h1 className="text-lg font-semibold tracking-tight sm:text-xl">Marketing Site</h1>
      </div>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  )
}
