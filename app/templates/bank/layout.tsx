import type { Metadata } from "next"

import { BankNav } from "@/app/templates/bank/_components/bank-nav"
import { BANK_NAME } from "@/app/templates/bank/_data/site"
import { profileScopeAttributes } from "@/components/profile-scope"

export const metadata: Metadata = {
  title: `${BANK_NAME} · doksam-ui 템플릿`,
  description: "service 프로필(ocean · noto-sans-kr)을 강제 적용한 리테일 뱅크 포털 홈페이지 템플릿.",
}

/**
 * app/templates/bank/** 전체를 service 프로필(ocean 테마 + noto-sans-kr 폰트)로
 * 스코프한다 — app/templates/saas/layout.tsx 와 동일한 컨테이너 스코핑 기법
 * (프로필 축 data-*). 은행은 신뢰감을 주는 블루(ocean) 계열이 정석이라
 * 이슈에서 지정한 프로필을 그대로 강제 적용한다.
 *
 * app/layout.tsx(루트)는 건드리지 않는다.
 */
export default function BankTemplateLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <div {...profileScopeAttributes("service")} className="flex flex-col bg-background font-sans text-foreground">
      <BankNav />
      <div className="flex flex-col gap-10 px-4 py-6 sm:px-6 sm:py-10">{children}</div>
    </div>
  )
}
