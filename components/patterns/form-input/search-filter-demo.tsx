"use client"

import { useState } from "react"

import {
  SearchFilter,
  type SearchFilterSelect,
  type SearchFilterValue,
} from "@/components/patterns/form-input/search-filter"

const SELECTS: SearchFilterSelect[] = [
  {
    key: "status",
    placeholder: "상태",
    options: [
      { value: "all", label: "전체" },
      { value: "active", label: "활성" },
      { value: "inactive", label: "비활성" },
    ],
  },
  {
    key: "sort",
    placeholder: "정렬",
    options: [
      { value: "newest", label: "최신순" },
      { value: "oldest", label: "오래된순" },
      { value: "name", label: "이름순" },
    ],
  },
]

const DEFAULT_VALUE: SearchFilterValue = { search: "", selects: { status: "all", sort: "newest" } }

/** /patterns/form-input 데모용 — controlled state 를 대신 들고 있는 프리뷰 래퍼. */
export function SearchFilterDemoPreview() {
  const [value, setValue] = useState<SearchFilterValue>(DEFAULT_VALUE)
  return (
    <SearchFilter
      value={value}
      onChange={setValue}
      selects={SELECTS}
      defaultValue={DEFAULT_VALUE}
      onSearch={() => {}}
      searchPlaceholder="이름으로 검색"
    />
  )
}
