"use client"

import { useState, type ClipboardEvent, type KeyboardEvent } from "react"
import { PlusIcon, XIcon } from "@phosphor-icons/react/dist/ssr"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

/** 알림 문구 세트 — 도메인 문구(번호/사번/이메일 등)를 호출부가 갈아끼운다. */
export interface ChipInputMessages {
  addLabel: string
  clearAllLabel: string
  removeLabel: (chip: string) => string
  duplicate: (chip: string) => string
  added: (count: number) => string
  duplicateSkipped: (count: number) => string
  invalidSkipped: (count: number) => string
}

export const CHIP_INPUT_DEFAULT_MESSAGES: ChipInputMessages = {
  addLabel: "추가",
  clearAllLabel: "전체 비우기",
  removeLabel: (chip) => `${chip} 제거`,
  duplicate: (chip) => `이미 추가된 값입니다: ${chip}`,
  added: (count) => `${count}건 추가`,
  duplicateSkipped: (count) => `중복 ${count}건 제외`,
  invalidSkipped: (count) => `형식 오류 ${count}건 제외`,
}

export interface ChipInputProps {
  /** 확정된 칩 목록 — 상태는 부모가 소유한다. */
  value: string[]
  onChange: (chips: string[]) => void
  /** 입력 중 표시 포맷(예: 전화번호 하이픈). 기본은 원문 그대로. */
  format?: (raw: string) => string
  /** 중복 판정·검증에 쓰는 정규화 키(예: 숫자만). 기본은 trim. */
  normalize?: (value: string) => string
  /** 정규화 값이 칩으로 확정 가능한지. 기본은 비어 있지 않으면 유효. */
  isValid?: (normalized: string) => boolean
  placeholder?: string
  inputLabel?: string
  maxLength?: number
  monospace?: boolean
  messages?: Partial<ChipInputMessages>
  className?: string
}

/** 붙여넣기 텍스트를 줄바꿈·쉼표·공백으로 쪼갠다. */
function splitTokens(text: string): string[] {
  return text
    .split(/[\r\n,]+|\s+/)
    .map((t) => t.trim())
    .filter((t) => t.length > 0)
}

/**
 * 자동 포맷팅 입력 → 펜딩 칩 변환 → 부모 제출 패턴(프로덕션 검증 패턴).
 * 붙여넣기로 여러 값을 한 번에 분할 파싱하고, 추가 전 중복·형식을 사전 검증해
 * 몇 건이 왜 빠졌는지를 한 줄 알림으로 알려준다.
 */
export function ChipInput({
  value,
  onChange,
  format = (raw) => raw,
  normalize = (raw) => raw.trim(),
  isValid = (normalized) => normalized.length > 0,
  placeholder,
  inputLabel,
  maxLength,
  monospace = false,
  messages,
  className,
}: Readonly<ChipInputProps>) {
  const msg = { ...CHIP_INPUT_DEFAULT_MESSAGES, ...messages }
  const [input, setInput] = useState("")
  const [notice, setNotice] = useState<{ tone: "muted" | "destructive"; text: string } | null>(null)

  function isDuplicate(key: string, within: string[]): boolean {
    return within.some((chip) => normalize(chip) === key)
  }

  function addOne(raw: string) {
    const key = normalize(raw)
    if (!isValid(key)) return
    const formatted = format(raw)
    if (isDuplicate(key, value)) {
      setNotice({ tone: "destructive", text: msg.duplicate(formatted) })
      return
    }
    onChange([...value, formatted])
    setNotice(null)
    setInput("")
  }

  function addBatch(tokens: string[]) {
    const next = [...value]
    let added = 0
    let dup = 0
    let invalid = 0
    for (const token of tokens) {
      const key = normalize(token)
      if (!isValid(key)) {
        invalid++
        continue
      }
      if (isDuplicate(key, next)) {
        dup++
        continue
      }
      next.push(format(token))
      added++
    }
    onChange(next)
    setInput("")
    const parts: string[] = []
    if (added > 0) parts.push(msg.added(added))
    if (dup > 0) parts.push(msg.duplicateSkipped(dup))
    if (invalid > 0) parts.push(msg.invalidSkipped(invalid))
    setNotice(parts.length > 0 ? { tone: dup + invalid > 0 ? "destructive" : "muted", text: parts.join(", ") } : null)
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault()
      addOne(input)
    }
  }

  function handlePaste(e: ClipboardEvent<HTMLInputElement>) {
    const tokens = splitTokens(e.clipboardData.getData("text"))
    if (tokens.length <= 1) return
    e.preventDefault()
    addBatch(tokens)
  }

  return (
    <div className={cn("flex w-full flex-col gap-3", className)}>
      <div className="flex items-center gap-2">
        <Input
          value={input}
          onChange={(e) => {
            setInput(format(e.target.value))
            setNotice(null)
          }}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          placeholder={placeholder}
          aria-label={inputLabel}
          className={cn(monospace && "font-mono")}
          maxLength={maxLength}
        />
        <Button
          type="button"
          size="icon"
          aria-label={msg.addLabel}
          onClick={() => addOne(input)}
          disabled={!isValid(normalize(input))}
        >
          <PlusIcon className="size-4" />
        </Button>
      </div>

      {notice && (
        <p className={cn("text-xs", notice.tone === "destructive" ? "text-destructive" : "text-muted-foreground")}>
          {notice.text}
        </p>
      )}

      {value.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          {value.map((chip) => (
            <span
              key={chip}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-md border border-border bg-muted px-2 py-1 text-xs",
                monospace && "font-mono",
              )}
            >
              {chip}
              <button
                type="button"
                aria-label={msg.removeLabel(chip)}
                onClick={() => onChange(value.filter((c) => c !== chip))}
                className="text-muted-foreground hover:text-destructive"
              >
                <XIcon className="size-3" />
              </button>
            </span>
          ))}
          <Button type="button" variant="outline" size="xs" onClick={() => onChange([])}>
            {msg.clearAllLabel}
          </Button>
        </div>
      )}
    </div>
  )
}
