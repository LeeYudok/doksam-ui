"use client"

import * as React from "react"
import { CaretDownIcon, CheckIcon, XIcon } from "@phosphor-icons/react/dist/ssr"

import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
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

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          aria-haspopup="listbox"
          disabled={disabled}
          aria-expanded={open}
          className={cn(
            "h-auto! min-h-8 w-72 justify-between py-1 font-normal",
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
                  {/*
                   * 상위 트리거가 이미 <button>(Button 컴포넌트)이라 여기에
                   * 또 <button> 을 두면 브라우저 HTML 파서가 button-in-button
                   * 을 만나 자동으로 태그를 닫아 트리 구조를 다시 짠다(#50).
                   * 그 결과 SSR 로 내려간 마크업과 파서가 실제로 구성한 DOM
                   * 이 달라져 하이드레이션 불일치가 난다. 버튼 안에 버튼을
                   * 두지 않도록 role="button" 을 가진 span 으로 대체한다.
                   */}
                  <span
                    role="button"
                    aria-label={`${option.label} 제거`}
                    aria-disabled={disabled || undefined}
                    tabIndex={disabled ? -1 : 0}
                    className="rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
                    onClick={(event) => {
                      event.stopPropagation()
                      if (disabled) return
                      remove(option.value)
                    }}
                    onKeyDown={(event) => {
                      if (event.key !== "Enter" && event.key !== " ") return
                      event.preventDefault()
                      event.stopPropagation()
                      if (disabled) return
                      remove(option.value)
                    }}
                  >
                    <XIcon className="pointer-events-none size-3" />
                  </span>
                </Badge>
              ))
            )}
          </span>
          <CaretDownIcon className="pointer-events-none shrink-0 text-muted-foreground" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-72 p-0" align="start">
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
