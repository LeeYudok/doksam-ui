import type { Metadata } from "next"

import { profileScopeAttributes } from "@/components/profile-scope"

export const metadata: Metadata = {
  title: "EWS Diagnosis · doksam-ui 템플릿",
  description: "finance 프로필(ivory 라이트 · Noto Sans KR)을 강제 적용한 여신 조기경보 원인 진단 상세 템플릿.",
}

/**
 * EWS 경보 원인 진단 템플릿(#90) 레이아웃 — `/templates/ews-dashboard`(#89) 와
 * 같은 finance 프로필을 이 서브트리에만 강제한다. 두 화면이 한 시스템으로
 * 읽혀야 파츠 재사용 검증이 성립하므로 프로필·축 설정을 그대로 맞춘다.
 *
 * 카탈로그 chrome 헤더를 두지 않는 것도 같은 이유다 — 화면 셸을 `TopNavShell`
 * (#86) 이 통째로 소유하고 그 상단 바가 sticky 라, 위에 제목 줄을 얹으면 스크롤
 * 시 두 겹이 겹친다. 폭 컨테이너도 셸이 가지므로 여기서 선언하지 않는다.
 *
 * 래퍼에 `overflow-hidden` 을 주지 않는다 — `overflow: hidden` 은 scrollport 를
 * 만들어 안쪽 `TopNavShell` 의 `sticky top-0` 과 `StickyActionbar` 의
 * `sticky bottom-0` 을 이 래퍼 기준으로 가둬버린다(둘 다 붙지 않는다).
 * 모서리 밖으로 넘치는 가로 폭만 잘라내면 되므로 `overflow-x-clip` 을 쓴다 —
 * `clip` 은 scrollport 를 만들지 않아 sticky 가 뷰포트 기준으로 살아 있다.
 */
export default function EwsDiagnosisTemplateLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <div
      {...profileScopeAttributes("finance")}
      className="min-w-0 overflow-x-clip rounded-xl border border-border bg-background font-sans text-foreground"
    >
      {children}
    </div>
  )
}
