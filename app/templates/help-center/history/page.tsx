import { Badge } from "@/components/ui/badge"

import { QuestionHistory } from "../_components/question-history"
import { QUESTION_HISTORY } from "../_data/questions"

export default function HelpCenterHistoryPage() {
  return (
    <div className="flex w-full flex-col gap-4">
      <section className="flex flex-col gap-1">
        <Badge variant="secondary" className="w-fit">
          질문 이력
        </Badge>
        <p className="max-w-prose text-sm leading-relaxed text-muted-foreground">
          내가 보낸 질문 {QUESTION_HISTORY.length}건을 최근 순으로 보여줍니다. 답변 대기/완료 상태는 배지 색과
          텍스트로 함께 구분합니다.
        </p>
      </section>
      <QuestionHistory />
    </div>
  )
}
