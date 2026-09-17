import type { Metadata } from "next"

import { ShopNav } from "@/app/templates/shop/_components/shop-nav"
import { profileScopeAttributes } from "@/components/profile-scope"

export const metadata: Metadata = {
  title: "Shop 템플릿 · doksam-ui",
  description: "service 프로필(ocean · noto-sans-kr)을 강제 적용한 E-commerce Storefront 풀 템플릿.",
}

/**
 * app/templates/shop/** 전체를 service 프로필(ocean 테마 + noto-sans-kr 폰트)로
 * 스코프한다. 사이트 전역 프로필(admin: slate/geist)과 무관하게 이 서브트리
 * 안에서는 항상 ocean/noto-sans-kr 토큰이 적용된다 —
 * components/profile-preview-kit.tsx 의 프로필 축 data-* 스코핑 기법과 동일
 * (app/templates/saas/layout.tsx 와 같은 패턴).
 *
 * app/layout.tsx(루트) 는 건드리지 않고, 여기서 중첩 레이아웃으로만 스코프한다.
 */
export default function ShopTemplateLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <div
      {...profileScopeAttributes("service")}
      className="flex flex-col gap-6 bg-background font-sans text-foreground"
    >
      <ShopNav />
      {children}
    </div>
  )
}
