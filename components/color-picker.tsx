"use client"

import * as React from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"

const HEX_PATTERN = /^#(?:[0-9a-fA-F]{6}|[0-9a-fA-F]{3})$/

/**
 * 데모용 기본 프리셋 팔레트. 컬러피커 본질상 스와치 자체는 hex 값을 그대로
 * 쓴다 — 이 컴포넌트가 표현해야 하는 대상이 임의의 색이기 때문이다.
 * 컴포넌트 UI(테두리·배경·링 등)는 항상 시맨틱 토큰만 사용한다.
 */
export const DEFAULT_COLOR_PRESETS = [
  "#ef4444",
  "#f97316",
  "#eab308",
  "#22c55e",
  "#06b6d4",
  "#3b82f6",
  "#8b5cf6",
  "#ec4899",
  "#64748b",
  "#0f172a",
] as const

function normalizeHex(input: string): string | null {
  const trimmed = input.trim()
  if (!HEX_PATTERN.test(trimmed)) return null
  if (trimmed.length === 4) {
    const [, r, g, b] = trimmed
    return `#${r}${r}${g}${g}${b}${b}`.toLowerCase()
  }
  return trimmed.toLowerCase()
}

export interface ColorPickerProps {
  /** 현재 선택된 hex 색상. 항상 상위 컴포넌트가 소유하는 controlled 값. */
  value: string
  /** 프리셋 클릭 또는 유효한 hex 입력 시 호출된다. */
  onValueChange: (hex: string) => void
  /** 팝오버에 표시할 프리셋 hex 목록. */
  presets?: readonly string[]
  className?: string
  "aria-label"?: string
}

/**
 * 프리셋 스와치 그리드 + hex 텍스트 입력으로만 구성한 순수 컬러피커(#36).
 * 외부 컬러 라이브러리·HSV 휠 없이 스와치 선택과 hex 직접 입력 두 경로만
 * 지원한다. value/onValueChange 는 항상 controlled — 내부에 확정 색상
 * state를 두지 않고, hex 입력 중 임시 편집 버퍼(draft)만 로컬로 갖는다.
 */
export function ColorPicker({
  value,
  onValueChange,
  presets = DEFAULT_COLOR_PRESETS,
  className,
  "aria-label": ariaLabel = "색상 선택",
}: Readonly<ColorPickerProps>) {
  const [draft, setDraft] = React.useState(value)
  const [prevValue, setPrevValue] = React.useState(value)

  // 외부에서 value가 바뀌면(예: 프리셋 다른 곳에서 선택) 편집 버퍼도 동기화한다.
  // effect 대신 렌더 중 state 조정 패턴을 써서 불필요한 추가 렌더를 피한다.
  if (value !== prevValue) {
    setPrevValue(value)
    setDraft(value)
  }

  const isDraftValid = normalizeHex(draft) !== null

  function handleDraftChange(next: string) {
    setDraft(next)
    const normalized = normalizeHex(next)
    if (normalized) {
      onValueChange(normalized)
    }
  }

  function handleDraftBlur() {
    if (!normalizeHex(draft)) {
      setDraft(value)
    }
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className={cn("gap-2!", className)}
          aria-label={ariaLabel}
        >
          <span
            aria-hidden
            className="size-4 shrink-0 rounded-full border border-border"
            style={{ backgroundColor: value }}
          />
          <span className="font-mono text-xs text-muted-foreground">{value}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-56">
        <div role="group" aria-label="색상 프리셋" className="grid grid-cols-5 gap-1.5">
          {presets.map((preset) => {
            const selected = normalizeHex(preset) === normalizeHex(value)
            return (
              <button
                key={preset}
                type="button"
                aria-label={preset}
                aria-pressed={selected}
                onClick={() => {
                  onValueChange(preset)
                  setDraft(preset)
                }}
                className={cn(
                  "size-7 rounded-md ring-1 ring-border ring-offset-2 ring-offset-popover transition-transform hover:scale-105",
                  selected && "ring-2 ring-primary"
                )}
                style={{ backgroundColor: preset }}
              />
            )
          })}
        </div>
        <div className="flex items-center gap-2">
          <span
            aria-hidden
            className="size-6 shrink-0 rounded-md border border-border"
            style={{ backgroundColor: isDraftValid ? draft : value }}
          />
          <Input
            value={draft}
            onChange={(event) => handleDraftChange(event.target.value)}
            onBlur={handleDraftBlur}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault()
                event.currentTarget.blur()
              }
            }}
            aria-label="Hex 코드"
            aria-invalid={!isDraftValid}
            placeholder="#000000"
            className="font-mono text-xs"
          />
        </div>
      </PopoverContent>
    </Popover>
  )
}
