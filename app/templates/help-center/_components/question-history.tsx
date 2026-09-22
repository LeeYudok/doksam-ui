import { CheckCircleIcon, ClockIcon } from "@phosphor-icons/react/dist/ssr"

import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

import { QUESTION_HISTORY, type QuestionStatus } from "../_data/questions"

const STATUS_LABEL: Record<QuestionStatus, string> = {
  answered: "답변 완료",
  pending: "답변 대기",
}

const STATUS_CLASS: Record<QuestionStatus, string> = {
  answered: "border-success/40 bg-success/10 text-success",
  pending: "border-warning/40 bg-warning/10 text-warning",
}

/**
 * 질문 이력 탭(#100) — 표가 아니라 시간순 목록(이슈 설계). 상태는 배지 색뿐
 * 아니라 텍스트("답변 완료"/"답변 대기")와 아이콘으로도 구분한다(색 외 2번째
 * 채널). askedAt 은 목 데이터의 포맷된 문자열을 그대로 쓰고 new Date() 로
 * 내부에서 다시 계산하지 않는다(hydration).
 */
export function QuestionHistory() {
  return (
    <ol aria-label="내 질문 이력" className="relative flex flex-col gap-4 pl-2">
      {QUESTION_HISTORY.map((item) => {
        const Icon = item.status === "answered" ? CheckCircleIcon : ClockIcon
        return (
          <li key={item.id} className="relative flex gap-3 pb-4 pl-6 last:pb-0">
            <span aria-hidden className="absolute top-6 bottom-0 left-[7px] w-px bg-border last:hidden" />
            <span
              className={cn(
                "absolute top-1 left-0 flex size-4 shrink-0 items-center justify-center rounded-full border",
                STATUS_CLASS[item.status],
              )}
            >
              <Icon size={10} weight="fill" aria-hidden />
            </span>
            <div className="flex min-w-0 flex-1 flex-col gap-1 rounded-lg border border-border bg-card p-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono text-[11px] text-muted-foreground">{item.askedAt}</span>
                <Badge variant="outline" className={cn("gap-1 text-[10px]", STATUS_CLASS[item.status])}>
                  {STATUS_LABEL[item.status]}
                </Badge>
              </div>
              <p className="text-sm font-medium text-foreground">{item.question}</p>
              {item.answer ? <p className="text-sm text-muted-foreground">{item.answer}</p> : null}
            </div>
          </li>
        )
      })}
    </ol>
  )
}
