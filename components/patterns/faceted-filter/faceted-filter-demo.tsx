"use client"

import { useState } from "react"

import { FacetedFilter, type FacetGroup } from "@/components/patterns/faceted-filter/faceted-filter"

interface FacetItem {
  id: string
  title: string
  group: string
  sub: string
}

const GROUPS: FacetGroup[] = [
  { key: "design", label: "디자인", color: "var(--chart-1)" },
  { key: "engineering", label: "엔지니어링", color: "var(--chart-2)" },
  { key: "operations", label: "오퍼레이션", color: "var(--chart-3)" },
]

const ITEMS: FacetItem[] = [
  { id: "1", title: "컬러 시스템 v2", group: "design", sub: "토큰" },
  { id: "2", title: "아이콘 가이드라인", group: "design", sub: "아이콘" },
  { id: "3", title: "컴포넌트 스펙 정리", group: "design", sub: "컴포넌트" },
  { id: "4", title: "API 게이트웨이 마이그레이션", group: "engineering", sub: "인프라" },
  { id: "5", title: "테스트 커버리지 개선", group: "engineering", sub: "QA" },
  { id: "6", title: "타입 안정성 강화", group: "engineering", sub: "QA" },
  { id: "7", title: "배포 파이프라인 개편", group: "engineering", sub: "인프라" },
  { id: "8", title: "온콜 로테이션 정책", group: "operations", sub: "운영정책" },
  { id: "9", title: "장애 보고서 템플릿", group: "operations", sub: "운영정책" },
  { id: "10", title: "비용 모니터링 대시보드", group: "operations", sub: "모니터링" },
]

function countBy(group: string, sub?: string): number {
  return ITEMS.filter((item) => item.group === group && (sub === undefined || item.sub === sub)).length
}

function subCatsOf(group: string): string[] {
  return Array.from(new Set(ITEMS.filter((item) => item.group === group).map((item) => item.sub)))
}

/** /patterns/faceted-filter 데모용 — 업무 항목 10건에 2단계 필터를 얹는다. */
export function FacetedFilterDemo() {
  const [group, setGroup] = useState("")
  const [sub, setSub] = useState("")

  function selectGroup(next: string) {
    setGroup(next)
    setSub("") // depth0을 바꾸면 depth1 선택은 더 이상 유효하지 않으므로 초기화한다.
  }

  const filtered = ITEMS.filter((item) => {
    if (group && item.group !== group) return false
    if (sub && item.sub !== sub) return false
    return true
  })

  return (
    <div className="flex w-full flex-col gap-3">
      <FacetedFilter
        groups={GROUPS}
        group={group}
        onGroupChange={selectGroup}
        sub={sub}
        onSubChange={setSub}
        subCategories={group ? subCatsOf(group) : []}
        totalCount={ITEMS.length}
        countOf={countBy}
      />

      <ul className="flex flex-col gap-1.5">
        {filtered.map((item) => {
          const itemGroup = GROUPS.find((g) => g.key === item.group)
          return (
            <li
              key={item.id}
              className="flex items-center justify-between gap-2 rounded-md border border-border bg-card py-2 pr-3 pl-2.5"
              style={{ borderLeft: `3px solid ${itemGroup?.color ?? "var(--border)"}` }}
            >
              <span className="text-xs font-medium text-foreground">{item.title}</span>
              <span className="text-[10px] text-muted-foreground">
                {itemGroup?.label} · {item.sub}
              </span>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
