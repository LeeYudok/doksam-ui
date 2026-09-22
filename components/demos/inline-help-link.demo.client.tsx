"use client"

import { useState } from "react"

import { InlineHelpLink } from "@/components/inline-help-link"

export function InlineHelpLinkDemo() {
  const [opened, setOpened] = useState<string | null>(null)

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-1.5">
        <h2 className="text-lg font-semibold">여신 한도 산정</h2>
        <InlineHelpLink label="여신 한도 산정 방식 보기" onOpen={() => setOpened("여신 한도 산정")} />
      </div>
      <div className="flex items-center gap-1.5">
        <h2 className="text-lg font-semibold">담보 평가 이력</h2>
        <InlineHelpLink label="담보 평가 이력 사용법 문서로 이동" href="/rules" />
      </div>
      <span className="text-sm text-muted-foreground">
        {opened ? `→ "${opened}" 섹션의 도움말 다이얼로그가 열립니다.` : "왼쪽 아이콘을 눌러보세요."}
      </span>
    </div>
  )
}
