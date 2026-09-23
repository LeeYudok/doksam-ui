"use client"

import { useState } from "react"
import { PlusIcon } from "@phosphor-icons/react/dist/ssr"

import { Button } from "@/components/ui/button"
import { ChipInput } from "@/components/patterns/verified/chip-input"

function digitsOf(value: string): string {
  return value.replace(/\D/g, "")
}

/** 숫자만 남기고 010-1234-5678 형태로 타이핑 중에도 포맷팅한다. */
function formatPhoneTyping(value: string): string {
  const digits = digitsOf(value).slice(0, 11)
  if (digits.length <= 3) return digits
  if (digits.length <= 7) return `${digits.slice(0, 3)}-${digits.slice(3)}`
  return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`
}

/** /patterns/verified 데모용 — 휴대폰번호 일괄 등록. */
export function ChipInputDemo() {
  const [chips, setChips] = useState<string[]>([])
  const [submitted, setSubmitted] = useState<string[] | null>(null)

  return (
    <div className="flex w-full max-w-md flex-col gap-3">
      <ChipInput
        value={chips}
        onChange={setChips}
        format={formatPhoneTyping}
        normalize={digitsOf}
        isValid={(digits) => digits.length === 10 || digits.length === 11}
        placeholder="휴대폰번호 (010-0000-0000)"
        inputLabel="휴대폰번호 입력"
        maxLength={13}
        monospace
        messages={{
          addLabel: "번호 추가",
          duplicate: (chip) => `이미 추가된 번호입니다: ${chip}`,
        }}
      />

      <Button type="button" onClick={() => setSubmitted(chips)} disabled={chips.length === 0} className="self-start">
        <PlusIcon className="size-4" />
        일괄 등록
      </Button>

      {submitted && <p className="text-sm text-muted-foreground">{submitted.length}건 등록되었습니다.</p>}
    </div>
  )
}
