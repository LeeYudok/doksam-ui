"use client"

import * as React from "react"
import { CheckCircleIcon, ClockIcon, PaperPlaneRightIcon, SparkleIcon } from "@phosphor-icons/react/dist/ssr"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"

import { QUESTION_HISTORY, type QuestionStatus } from "../_data/questions"
import { SUGGESTED_QUESTIONS } from "../_data/suggested-questions"

const STATUS_LABEL: Record<QuestionStatus, string> = {
  answered: "답변 완료",
  pending: "답변 대기",
}

const STATUS_CLASS: Record<QuestionStatus, string> = {
  answered: "border-success/40 bg-success/10 text-success",
  pending: "border-warning/40 bg-warning/10 text-warning",
}

const RECENT_ANSWERED = QUESTION_HISTORY.filter((q) => q.status === "answered").slice(0, 2)

/**
 * 물어보기 탭(#100) — 자유 질문 입력 + 추천 질문 칩 + 최근 답변 미리보기.
 *
 * ChatWidget(components/chat-widget.tsx)은 화면 구석 상주형 런처+패널이라 항상
 * 열려 있어야 하는 탭 본문으로 끼워 넣기에 맞지 않는다(설계 판단 — 최종 보고 참고).
 * 대신 같은 자유 질문 진입점 의도를 로컬 프레젠테이션 컴포넌트로 구현하고,
 * 새 카탈로그 컴포넌트는 만들지 않는다.
 */
export function AskPanel() {
  const [value, setValue] = React.useState("")
  const [submitted, setSubmitted] = React.useState<string[]>([])

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    const question = value.trim()
    if (!question) return
    setSubmitted((prev) => [question, ...prev])
    setValue("")
  }

  return (
    <div className="flex flex-col gap-6">
      <form onSubmit={handleSubmit} className="flex flex-col gap-3 rounded-lg border border-border bg-card p-4">
        <label htmlFor="ask-question" className="text-sm font-medium text-foreground">
          무엇이 궁금하신가요?
        </label>
        <Textarea
          id="ask-question"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder="예: 여신 심사 화면에서 반려 사유는 어디서 확인하나요?"
          rows={3}
          className="resize-none"
        />

        <div className="flex flex-wrap gap-1.5">
          {SUGGESTED_QUESTIONS.map((question) => (
            <button
              key={question}
              type="button"
              onClick={() => setValue(question)}
              className="flex items-center gap-1 rounded-full border border-border bg-background px-2.5 py-1 text-xs text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
            >
              <SparkleIcon size={12} aria-hidden />
              {question}
            </button>
          ))}
        </div>

        <div className="flex justify-end">
          <Button type="submit" disabled={!value.trim()}>
            <PaperPlaneRightIcon aria-hidden />
            질문 보내기
          </Button>
        </div>
      </form>

      {submitted.length > 0 ? (
        <section aria-label="방금 보낸 질문" className="flex flex-col gap-2">
          <h3 className="text-sm font-semibold text-foreground">방금 보낸 질문</h3>
          <ul className="flex flex-col gap-2">
            {submitted.map((question) => (
              <li
                key={question}
                className="flex items-center gap-2 rounded-lg border border-dashed border-border bg-muted/30 px-3 py-2 text-sm text-foreground"
              >
                <ClockIcon size={14} className="shrink-0 text-muted-foreground" aria-hidden />
                {question}
                <Badge variant="outline" className={cn("ml-auto shrink-0 gap-1", STATUS_CLASS.pending)}>
                  {STATUS_LABEL.pending}
                </Badge>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section aria-label="최근 답변된 질문" className="flex flex-col gap-2">
        <h3 className="text-sm font-semibold text-foreground">최근 답변된 질문</h3>
        <ul className="flex flex-col gap-2">
          {RECENT_ANSWERED.map((item) => (
            <li key={item.id} className="flex flex-col gap-1 rounded-lg border border-border bg-card p-3">
              <div className="flex items-center gap-2">
                <CheckCircleIcon size={14} weight="fill" className="shrink-0 text-success" aria-hidden />
                <p className="text-sm font-medium text-foreground">{item.question}</p>
                <Badge variant="outline" className={cn("ml-auto shrink-0 gap-1", STATUS_CLASS.answered)}>
                  {STATUS_LABEL.answered}
                </Badge>
              </div>
              {item.answer ? <p className="pl-6 text-sm text-muted-foreground">{item.answer}</p> : null}
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
