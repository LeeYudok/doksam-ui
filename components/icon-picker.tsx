"use client"

import * as React from "react"
import { CaretDoubleDownIcon, XIcon } from "@phosphor-icons/react/dist/ssr"
import type { Icon } from "@phosphor-icons/react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import { ICON_CATALOG, ICON_CATEGORIES } from "@/lib/icons/catalog"

/** 카테고리별 아이콘 정의 — lib/icons/catalog.ts 카탈로그(#66)에서 파생.
 * picker 노출 이름은 기존과 동일하게 Icon 접미사를 뗀 짧은 이름을 쓴다. */
const CATALOG: Record<string, [name: string, icon: Icon, alias: string][]> = Object.fromEntries(
  ICON_CATEGORIES.map(({ key, label }) => [
    label,
    ICON_CATALOG.filter((entry) => entry.category === key).map(
      (entry) => [entry.name.replace(/Icon$/, ""), entry.Icon, entry.keywords.join(" ")] as [string, Icon, string],
    ),
  ]),
)

const CATEGORY_LIST = Object.keys(CATALOG)
const ALL_ICONS = CATEGORY_LIST.flatMap((cat) => CATALOG[cat])
const ICON_BY_NAME: Record<string, [string, Icon, string]> = Object.fromEntries(ALL_ICONS.map((e) => [e[0], e]))

export interface IconPickerProps {
  /** 현재 선택된 아이콘 이름(예: "ChartBar"). */
  value?: string
  onSelect?: (iconName: string) => void
  placeholder?: string
  disabled?: boolean
  className?: string
}

/** 이름으로 아이콘 컴포넌트를 찾는다 — 미등록 이름이면 null. */
export function getPickerIcon(name: string): Icon | null {
  return ICON_BY_NAME[name]?.[1] ?? null
}

/**
 * 아이콘 선택기 — Phosphor 아이콘을 카테고리 탭 + 한글/영문 통합 검색으로 고른다.
 * 트리거 버튼에 선택된 아이콘 미리보기 + 이름을 표시한다(srope customs/icon-picker 이식,
 * 아이콘 카탈로그를 컴포넌트에 내장해 외부 icon-map 의존을 제거).
 */
export function IconPicker({ value, onSelect, placeholder = "아이콘 선택…", disabled = false, className }: IconPickerProps) {
  const [open, setOpen] = React.useState(false)
  const [search, setSearch] = React.useState("")
  const [activeCategory, setActiveCategory] = React.useState<string>("전체")

  const filtered = React.useMemo(() => {
    const keyword = search.trim().toLowerCase()
    if (keyword) {
      return ALL_ICONS.filter(([name, , alias]) => name.toLowerCase().includes(keyword) || alias.includes(keyword))
    }
    if (activeCategory === "전체") return ALL_ICONS
    return CATALOG[activeCategory] ?? []
  }, [search, activeCategory])

  const selected = value ? ICON_BY_NAME[value] : undefined
  const SelectedIcon = selected?.[1]

  const handleSelect = (name: string) => {
    onSelect?.(name)
    setOpen(false)
    setSearch("")
  }

  return (
    <Popover
      open={disabled ? false : open}
      onOpenChange={(v) => {
        if (disabled) return
        setOpen(v)
        if (!v) setSearch("")
      }}
    >
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          aria-label="아이콘 선택"
          disabled={disabled}
          className={cn("w-full justify-between px-2", className)}
        >
          <span className="flex min-w-0 items-center gap-1.5">
            {SelectedIcon ? <SelectedIcon className="size-3.5 shrink-0 text-primary" aria-hidden /> : <span className="size-3.5 shrink-0" />}
            <span className="truncate text-xs">{value || placeholder}</span>
          </span>
          <CaretDoubleDownIcon className="ml-1 size-3.5 shrink-0 opacity-50" aria-hidden />
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-80 p-0" align="start" sideOffset={4}>
        <div className="flex items-center gap-1 border-b p-2">
          <Input
            placeholder="검색 (영문 or 한글)…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-7 text-xs"
            aria-label="아이콘 검색"
          />
          {search ? (
            <Button variant="ghost" size="icon-sm" className="shrink-0" onClick={() => setSearch("")} aria-label="검색어 지우기">
              <XIcon aria-hidden />
            </Button>
          ) : null}
        </div>

        {!search ? (
          <div className="flex gap-0.5 overflow-x-auto border-b px-2 py-1.5">
            {["전체", ...CATEGORY_LIST].map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveCategory(cat)}
                className={cn(
                  "shrink-0 rounded px-2 py-0.5 text-[10px] font-medium whitespace-nowrap transition-colors",
                  activeCategory === cat
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground",
                )}
              >
                {cat}
              </button>
            ))}
          </div>
        ) : null}

        <ScrollArea className="h-56">
          {filtered.length === 0 ? (
            <div className="py-8 text-center text-xs text-muted-foreground">검색 결과가 없습니다.</div>
          ) : (
            <div className="grid grid-cols-6 gap-1 p-2">
              {filtered.map(([name, IconComp, alias]) => (
                <button
                  key={name}
                  type="button"
                  onClick={() => handleSelect(name)}
                  title={`${name}\n${alias}`}
                  aria-pressed={value === name}
                  className={cn(
                    "flex flex-col items-center justify-center gap-1 rounded-md p-1.5 text-center transition-[color,background-color,transform]",
                    value === name
                      ? "bg-primary text-primary-foreground hover:bg-primary/90"
                      : "text-foreground hover:scale-110 hover:bg-accent hover:text-accent-foreground",
                  )}
                >
                  <IconComp className="size-4" aria-hidden />
                  <span className="w-full truncate text-center text-[8px] leading-tight">{name}</span>
                </button>
              ))}
            </div>
          )}
        </ScrollArea>

        {selected ? (
          <div className="flex items-center gap-2 border-t bg-muted/50 px-3 py-2">
            {SelectedIcon ? <SelectedIcon className="size-3.5 shrink-0 text-primary" aria-hidden /> : null}
            <span className="text-xs text-muted-foreground">선택됨:</span>
            <span className="text-xs font-medium">{selected[0]}</span>
            <span className="text-xs text-muted-foreground">({selected[2].split(" ")[0]})</span>
          </div>
        ) : null}
      </PopoverContent>
    </Popover>
  )
}
