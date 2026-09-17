import { FingerprintIcon } from "@phosphor-icons/react/dist/ssr"

import { Badge } from "@/components/ui/badge"

import { PasskeyAuth } from "./_components/passkey-auth"

export default function PasskeyAuthPage() {
  return (
    <div className="flex w-full flex-col gap-6">
      <section className="flex flex-col gap-3">
        <Badge variant="secondary" className="w-fit">
          <FingerprintIcon weight="fill" aria-hidden />
          Auth · focus-task 원형
        </Badge>
        <h2 className="text-xl font-semibold tracking-tight md:text-2xl">패스키(WebAuthn) 인증</h2>
        <p className="max-w-prose text-sm leading-relaxed text-muted-foreground">
          지속되는 내비게이션 없이 가운데 카드 한 장이 과제 하나만 담는 focus-task 원형의 실물입니다. 로그인 진입,
          인증기 대기, 사용자 취소와 인증 실패(반드시 구분합니다), 패스키 등록, 다른 기기 인증, 등록 기기 관리,
          문자 인증 대체 경로, 미지원 환경까지 WebAuthn 흐름의 화면 상태를 모두 렌더합니다. 실제
          navigator.credentials 는 호출하지 않으며, 각 화면이 대응하는 API 결과를 카드 아래에 표시합니다.
        </p>
      </section>

      <PasskeyAuth />
    </div>
  )
}
