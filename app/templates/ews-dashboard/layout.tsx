import type { Metadata } from "next"

import { profileScopeAttributes } from "@/components/profile-scope"

export const metadata: Metadata = {
  title: "EWS Dashboard · doksam-ui 템플릿",
  description: "finance 프로필(ivory 라이트 · Noto Sans KR)을 강제 적용한 여신 조기경보 홈 대시보드 템플릿.",
}

/**
 * EWS 홈 대시보드 템플릿(#89) 레이아웃 — profiles/index.ts 의 "finance" 프로필을
 * 이 서브트리에만 강제한다. 축 속성은 수기로 적지 않고 profileScopeAttributes 로
 * 방출하는 것이 규약이다(#47).
 *
 * admin 템플릿과 같이 카탈로그 chrome 헤더를 두지 않는다 — 화면 셸을 `TopNavShell`
 * (#86) 이 통째로 소유하고 그 상단 바가 sticky 라, 위에 별도 제목 줄을 얹으면
 * 스크롤 시 두 겹이 겹친다. 폭 컨테이너도 셸이 가지므로 여기서 선언하지 않는다.
 */
export default function EwsDashboardTemplateLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <div
      {...profileScopeAttributes("finance")}
      className="min-w-0 overflow-hidden rounded-xl border border-border bg-background font-sans text-foreground"
    >
      {children}
    </div>
  )
}
