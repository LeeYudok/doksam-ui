import { ColumnsIcon } from "@phosphor-icons/react/dist/ssr"

import { Badge } from "@/components/ui/badge"

import { MailSplitPane } from "./_components/mail-split-pane"
import { THREADS } from "./_data/threads"

/**
 * split-pane 원형 대표 템플릿(#89).
 * 좌측 목록과 우측 상세가 한 화면에 있고, 선택은 라우팅이 아니라 우측 교체다 —
 * 항목을 연달아 훑으며 처리하는 화면의 뼈대다.
 */
export default function MailWorkspacePage() {
  return (
    <div className="flex w-full flex-col gap-6">
      <section className="flex flex-col gap-3">
        <Badge variant="secondary" className="w-fit">
          <ColumnsIcon weight="fill" aria-hidden />
          split-pane 원형
        </Badge>
        <h2 className="text-xl font-semibold tracking-tight md:text-2xl">목록·상세 2패인 작업 화면</h2>
        <p className="max-w-prose text-sm leading-relaxed text-muted-foreground">
          가상 운영 메일함 {THREADS.length}건입니다. 좌측 목록에서 항목을 고르면 페이지 이동 없이 우측 상세만 바뀌고,
          검색·폴더는 목록을 좁히기만 합니다. lg 미만에서는 두 패인을 나란히 두지 않고 목록 → 상세 단일 패인으로 접힙니다.
          발신자·본문은 모두 로컬 placeholder 입니다.
        </p>
      </section>

      <MailSplitPane />
    </div>
  )
}
