"use client"

import * as React from "react"
import { FileTextIcon } from "@phosphor-icons/react/dist/ssr"

import { Badge } from "@/components/ui/badge"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"

import { MANUAL_CATEGORIES, type ManualEntry } from "../_data/manual"

const FIRST_ENTRY = MANUAL_CATEGORIES[0]?.entries[0] ?? null

/**
 * 매뉴얼 색인 탭(#100) — components/ui/command.tsx 의 Command(다이얼로그 아님,
 * 인라인)를 화면·기능 트리 검색기로 재사용한다. 좌측에서 고른 항목이 우측
 * 디테일 패널에 뜬다(md 미만에서는 세로로 쌓인다).
 */
export function ManualIndex() {
  const [selected, setSelected] = React.useState<ManualEntry | null>(FIRST_ENTRY)

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-[280px_1fr]">
      <Command className="min-w-0 rounded-lg border border-border" aria-label="매뉴얼 검색">
        <CommandInput placeholder="화면·기능 검색…" />
        <CommandList>
          <CommandEmpty>일치하는 매뉴얼이 없습니다.</CommandEmpty>
          {MANUAL_CATEGORIES.map((category) => (
            <CommandGroup key={category.id} heading={category.label}>
              {category.entries.map((entry) => (
                <CommandItem key={entry.id} value={`${category.label} ${entry.title}`} onSelect={() => setSelected(entry)}>
                  <FileTextIcon aria-hidden />
                  {entry.title}
                </CommandItem>
              ))}
            </CommandGroup>
          ))}
        </CommandList>
      </Command>

      <div className="min-w-0 rounded-lg border border-border bg-card p-4">
        {selected ? (
          <div className="flex flex-col gap-2">
            <Badge variant="secondary" className="w-fit">
              {selected.screen}
            </Badge>
            <h3 className="text-base font-semibold text-foreground">{selected.title}</h3>
            <p className="text-sm leading-relaxed text-muted-foreground">{selected.body}</p>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">왼쪽에서 항목을 선택하면 설명이 여기 표시됩니다.</p>
        )}
      </div>
    </div>
  )
}
