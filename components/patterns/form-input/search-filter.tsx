"use client"

import { MagnifyingGlassIcon } from "@phosphor-icons/react/dist/ssr"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"

/** 드롭다운 한 칸의 선택지. */
export interface SearchFilterOption {
  value: string
  label: string
}

/** 검색어 + 드롭다운 선택값들. 드롭다운 key 는 selects 의 key 와 1:1로 대응한다. */
export interface SearchFilterValue {
  search: string
  selects: Record<string, string>
}

export interface SearchFilterSelect {
  key: string
  placeholder: string
  options: SearchFilterOption[]
  /** 트리거 폭 클래스. 기본 w-28. */
  triggerClassName?: string
}

export interface SearchFilterProps {
  value: SearchFilterValue
  onChange: (value: SearchFilterValue) => void
  selects: SearchFilterSelect[]
  /** 초기화 버튼이 되돌릴 기본값. */
  defaultValue: SearchFilterValue
  onReset?: () => void
  /** 검색 버튼 클릭 — 생략하면 버튼을 그리지 않는다. */
  onSearch?: () => void
  searchPlaceholder?: string
  resetLabel?: string
  searchLabel?: string
  className?: string
}

/**
 * 검색어 + 드롭다운 필터로 구성하는 목록 상단 검색바.
 * 상태를 컴포넌트가 스스로 들고 있지 않고 value/onChange 로 부모가 소유하는 controlled
 * 컴포넌트다 — 서버 재조회 트리거·URL 동기화에 그대로 얹어 재사용할 수 있다.
 */
export function SearchFilter({
  value,
  onChange,
  selects,
  defaultValue,
  onReset,
  onSearch,
  searchPlaceholder = "검색어를 입력하세요",
  resetLabel = "초기화",
  searchLabel = "검색",
  className,
}: Readonly<SearchFilterProps>) {
  function handleReset() {
    if (onReset) {
      onReset()
      return
    }
    onChange(defaultValue)
  }

  return (
    <div className={cn("flex w-full flex-wrap items-center gap-2", className)}>
      <div className="relative min-w-[180px] flex-1">
        <MagnifyingGlassIcon
          size={14}
          weight="regular"
          className="pointer-events-none absolute top-1/2 left-2.5 -translate-y-1/2 text-muted-foreground"
        />
        <Input
          value={value.search}
          onChange={(e) => onChange({ ...value, search: e.target.value })}
          placeholder={searchPlaceholder}
          className="h-8 pl-8 text-xs"
        />
      </div>
      {selects.map((select) => (
        <Select
          key={select.key}
          value={value.selects[select.key]}
          onValueChange={(next) => onChange({ ...value, selects: { ...value.selects, [select.key]: next } })}
        >
          <SelectTrigger className={cn("h-8 text-xs", select.triggerClassName ?? "w-28")}>
            <SelectValue placeholder={select.placeholder} />
          </SelectTrigger>
          <SelectContent>
            {select.options.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ))}
      <Button size="sm" variant="outline" onClick={handleReset}>
        {resetLabel}
      </Button>
      {onSearch ? (
        <Button size="sm" onClick={onSearch}>
          {searchLabel}
        </Button>
      ) : null}
    </div>
  )
}
