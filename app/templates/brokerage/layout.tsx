import type { Metadata } from "next"
import { profileScopeAttributes } from "@/components/profile-scope"

export const metadata: Metadata = {
  title: "증권 마켓 홈 · doksam-ui 템플릿",
  description:
    "service 프로필(Ocean · Noto Sans KR)을 적용한 증권사 마켓 홈 템플릿 — 시장 지표·실시간 랭킹 스크리너·종목 상세·관심종목(가상 누리증권).",
}

/**
 * 증권 마켓 홈 템플릿(#41) 레이아웃 — profiles/index.ts 의 "service" 프로필
 * (theme: ocean, font: noto-sans-kr, defaultMode: light)을 이 서브트리에만
 * 컨테이너 스코프로 강제한다(profile-preview-kit 패턴).
 */
export default function BrokerageTemplateLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <div
      {...profileScopeAttributes("service")}
      className="flex min-h-[calc(100vh-4rem)] flex-col rounded-xl border border-border bg-background font-sans text-foreground"
    >
      {children}
    </div>
  )
}
