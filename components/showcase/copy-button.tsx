"use client"

import { useState } from "react"
import { CheckIcon, CopyIcon } from "@phosphor-icons/react/dist/ssr"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface CopyButtonProps {
  value: string
  className?: string
}

/**
 * 코드 스니펫 복사 버튼.
 * components/copy-button.tsx 가 다른 브랜치에서 만들어질 예정이라
 * 통합 전까지는 components/showcase/ 하위에 자체 구현한다.
 */
export function CopyButton({ value, className }: Readonly<CopyButtonProps>) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(true)
      globalThis.setTimeout(() => setCopied(false), 1500)
    } catch {
      // 클립보드 접근 불가 환경(권한 거부 등) — 조용히 무시
    }
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={handleCopy}
      className={cn("gap-1.5", className)}
    >
      {copied ? (
        <>
          <CheckIcon size={14} weight="regular" />
          복사됨
        </>
      ) : (
        <>
          <CopyIcon size={14} weight="regular" />
          복사
        </>
      )}
    </Button>
  )
}
