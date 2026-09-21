"use client"

import * as React from "react"
import { CaretDownIcon, CheckIcon, XIcon } from "@phosphor-icons/react/dist/ssr"

import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button, buttonVariants } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

export interface MultiSelectOption {
  value: string
  label: string
}

export interface MultiSelectProps {
  options: MultiSelectOption[]
  value?: string[]
  defaultValue?: string[]
  onValueChange?: (value: string[]) => void
  placeholder?: string
  searchPlaceholder?: string
  emptyText?: string
  disabled?: boolean
  className?: string
}

/**
 * components/ui/command.tsx + popover.tsx + badge.tsx를 조합한 커스텀
 * 컴포넌트(#36). 팝오버 안 Command 목록에서 다중 선택하고, 선택된 항목은
 * 트리거에 제거 버튼이 달린 칩(Badge)으로 보여준다.
 */
function MultiSelect({
  options,
  value,
  defaultValue = [],
  onValueChange,
  placeholder = "항목 선택",
  searchPlaceholder = "검색",
  emptyText = "일치하는 결과가 없습니다.",
  disabled,
  className,
}: Readonly<MultiSelectProps>) {
  const [open, setOpen] = React.useState(false)
  const isControlled = value !== undefined
  const [internalValue, setInternalValue] = React.useState<string[]>(defaultValue)
  const selected = isControlled ? value : internalValue

  const commit = (next: string[]) => {
    if (!isControlled) setInternalValue(next)
    onValueChange?.(next)
  }

  const toggle = (optionValue: string) => {
    const next = selected.includes(optionValue)
      ? selected.filter((v) => v !== optionValue)
      : [...selected, optionValue]
    commit(next)
  }

  const remove = (optionValue: string) => {
    commit(selected.filter((v) => v !== optionValue))
  }

  const selectedOptions = options.filter((option) => selected.includes(option.value))
  const listboxId = React.useId()

  return (
    <Popover open={open} onOpenChange={setOpen}>
      {/*
       * #66: 트리거가 <button> 이면서 그 안에 칩 제거용 인터랙티브 자손을
       * 두면(과거엔 중첩 <button>, #50 수정 뒤엔 role="button" span) HTML
       * 콘텐츠 모델의 nested-interactive 위반이다 — 일부 스크린리더는 버튼
       * 자손을 평탄화해 제거 컨트롤을 별도 컨트롤로 노출하지 않는다.
       * 트리거 자체를 non-button 컨테이너(role="combobox")로 바꾸고, 칩
       * 제거·여닫기는 그 안의 실제 <button> 으로 둔다. PopoverTrigger 가
       * asChild 로 클론하는 onClick(context.onOpenToggle)은 컨테이너에
       * 그대로 얹히므로 배경 클릭으로 여닫는 기존 동작은 유지되고, 여닫기
       * 전용 버튼을 누르면 그 네이티브 click 이 버블링해 같은 핸들러를
       * 태운다. disabled 는 button 전용 속성이라 컨테이너에는 못 쓰므로
       * onClick 에서 preventDefault 로 토글 자체를 막는다(radix 의
       * composeEventHandlers 가 defaultPrevented 면 자기 핸들러를 건너뜀).
       */}
      <PopoverTrigger asChild>
        <div
          role="combobox"
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-controls={listboxId}
          aria-disabled={disabled || undefined}
          data-disabled={disabled || undefined}
          onClick={(event) => {
            if (disabled) event.preventDefault()
          }}
          className={cn(
            buttonVariants({ variant: "outline" }),
            "h-auto! min-h-8 w-72 cursor-pointer justify-between py-1 font-normal",
            disabled && "pointer-events-none cursor-not-allowed opacity-50",
            className
          )}
        >
          <span className="flex flex-1 flex-wrap items-center gap-1">
            {selectedOptions.length === 0 ? (
              <span className="text-muted-foreground">{placeholder}</span>
            ) : (
              selectedOptions.map((option) => (
                <Badge
                  key={option.value}
                  variant="secondary"
                  className="gap-1"
                  onClick={(event) => event.stopPropagation()}
                >
                  {option.label}
                  <button
                    type="button"
                    aria-label={`${option.label} 제거`}
                    disabled={disabled}
                    className="rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring/50 disabled:pointer-events-none"
                    onClick={(event) => {
                      event.stopPropagation()
                      remove(option.value)
                    }}
                    onKeyDown={(event) => {
                      // 네이티브 버튼도 Enter/Space 로 click 을 발생시키지만,
                      // 여기서 명시적으로 처리해 preventDefault 로 그 네이티브
                      // click 합성을 막고 한 번만 remove 가 실행되게 한다 —
                      // 팝오버 트리거 컨테이너로 이벤트가 새는 것도 이걸로 막는다.
                      if (event.key !== "Enter" && event.key !== " ") return
                      event.preventDefault()
                      event.stopPropagation()
                      remove(option.value)
                    }}
                  >
                    <XIcon className="pointer-events-none size-3" />
                  </button>
                </Badge>
              ))
            )}
          </span>
          {/*
           * 클릭이 부모 combobox 컨테이너까지 그대로 버블링하도록 별도
           * onClick 을 달지 않는다 — PopoverTrigger 가 컨테이너에 얹은
           * onOpenToggle 이 이 네이티브 click 을 받아 여닫는다. 실제
           * <button> 이므로 Enter/Space 로도 같은 click 이 발생해 키보드
           * 로도 여닫을 수 있다.
           */}
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            aria-label={open ? "옵션 목록 닫기" : "옵션 목록 열기"}
            disabled={disabled}
            className="shrink-0"
          >
            <CaretDownIcon className="pointer-events-none text-muted-foreground" />
          </Button>
        </div>
      </PopoverTrigger>
      <PopoverContent id={listboxId} className="w-72 p-0" align="start">
        <Command>
          <CommandInput placeholder={searchPlaceholder} />
          <CommandList>
            <CommandEmpty>{emptyText}</CommandEmpty>
            <CommandGroup>
              {options.map((option) => {
                const isSelected = selected.includes(option.value)
                return (
                  <CommandItem
                    key={option.value}
                    value={option.label}
                    onSelect={() => toggle(option.value)}
                  >
                    <span
                      className={cn(
                        "flex size-4 items-center justify-center rounded-sm border border-input text-transparent",
                        isSelected && "border-primary bg-primary text-primary-foreground"
                      )}
                    >
                      <CheckIcon className="pointer-events-none size-3" />
                    </span>
                    {option.label}
                  </CommandItem>
                )
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

export { MultiSelect }
