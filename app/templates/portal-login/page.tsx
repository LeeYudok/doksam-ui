import { BuildingOfficeIcon } from "@phosphor-icons/react/dist/ssr"

import { Badge } from "@/components/ui/badge"

import { PortalLogin } from "./_components/portal-login"

export default function PortalLoginPage() {
  return (
    <div className="flex w-full flex-col gap-6">
      <section className="flex flex-col gap-3">
        <Badge variant="secondary" className="w-fit">
          <BuildingOfficeIcon weight="fill" aria-hidden />
          Auth · focus-task 원형
        </Badge>
        <h2 className="text-xl font-semibold tracking-tight md:text-2xl">사내 업무포털 로그인</h2>
        <p className="max-w-prose text-sm leading-relaxed text-muted-foreground">
          focus-task 원형에 시스템 상태바·공지사항·보안 고지를 더한 변형입니다. 세 표시 모두 클릭해도 다른
          화면으로 이동하지 않는 정보성 표시라 원형의 &ldquo;내비게이션 없음&rdquo; 규칙을 어기지 않습니다. 담당자·심사역·
          관리자 역할 분기는 로그인 후 서버가 판단하므로 화면에는 안내 문구로만 드러냅니다.
        </p>
      </section>

      <PortalLogin />
    </div>
  )
}
