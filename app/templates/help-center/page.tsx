import { Badge } from "@/components/ui/badge"

import { AskPanel } from "./_components/ask-panel"

export default function HelpCenterAskPage() {
  return (
    <div className="flex w-full flex-col gap-4">
      <section className="flex flex-col gap-1">
        <Badge variant="secondary" className="w-fit">
          물어보기
        </Badge>
        <p className="max-w-prose text-sm leading-relaxed text-muted-foreground">
          찾는 답이 매뉴얼에 없으면 바로 물어보세요. 자주 나오는 질문은 추천 질문 칩으로 바로 채울 수 있습니다.
        </p>
      </section>
      <AskPanel />
    </div>
  )
}
