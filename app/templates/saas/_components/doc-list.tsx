"use client"

import { useMemo, useState, type FormEvent } from "react"

import { ListControls } from "@/components/patterns/list-controls/list-controls"
import { DOC_ITEMS, DOC_PAGE_SIZE, DOC_TABS } from "@/app/templates/saas/_lib/data"

interface ListParams {
  type: string
  q: string
  page: number
}

const INITIAL_PARAMS: ListParams = { type: "", q: "", page: 0 }

/**
 * 다음 상태의 쿼리스트링을 만든다.
 *
 * 실서비스에서는 이 반환값이 그대로 `<Link href>` 가 되고 서버 컴포넌트가 같은
 * 값을 `searchParams` 로 읽는다 — 클라이언트 상태가 아니라 URL 이 단일 진실원천이다.
 */
function buildQuery(params: ListParams): string {
  const sp = new URLSearchParams()
  if (params.type) sp.set("type", params.type)
  if (params.q) sp.set("q", params.q)
  if (params.page > 0) sp.set("page", String(params.page))
  const qs = sp.toString()
  return qs ? `?${qs}` : ""
}

/**
 * 대시보드 "문서 목록" 영역 — 실물 list-controls 에 이 템플릿의 데이터를 물린다.
 *
 * 카탈로그 데모(`list-controls-demo.tsx`)를 쓰지 않는 이유는 #58 이다 — 데모는
 * 카탈로그 전용 표본을 품고 있어 설치본에 함께 실려 나간다.
 */
export function DocList() {
  const [params, setParams] = useState<ListParams>(INITIAL_PARAMS)
  const [qInput, setQInput] = useState("")

  const filtered = useMemo(() => {
    return DOC_ITEMS.filter((item) => {
      if (params.type && item.type !== params.type) return false
      if (params.q && !item.title.toLowerCase().includes(params.q.toLowerCase())) return false
      return true
    })
  }, [params.type, params.q])

  const pageCount = Math.max(1, Math.ceil(filtered.length / DOC_PAGE_SIZE))
  const page = Math.min(params.page, pageCount - 1)
  const pageItems = filtered.slice(page * DOC_PAGE_SIZE, page * DOC_PAGE_SIZE + DOC_PAGE_SIZE)

  function goTab(type: string) {
    // 탭(필터 축)을 바꾸면 이전 페이지 번호는 더 이상 유효하지 않을 수 있으므로 1페이지로 되돌린다.
    setParams((prev) => ({ ...prev, type, page: 0 }))
  }

  function submitSearch(e: FormEvent) {
    e.preventDefault()
    setParams((prev) => ({ ...prev, q: qInput.trim(), page: 0 }))
  }

  function resetSearch() {
    setQInput("")
    setParams((prev) => ({ ...prev, q: "", page: 0 }))
  }

  function goPage(next: number) {
    setParams((prev) => ({ ...prev, page: Math.max(0, Math.min(pageCount - 1, next)) }))
  }

  return (
    <ListControls
      items={pageItems}
      getItemKey={(item) => item.id}
      renderItem={(item) => (
        <div className="flex items-center justify-between gap-2 p-3 text-xs">
          <span className="font-medium text-foreground">{item.title}</span>
          <span className="text-muted-foreground">{item.updatedAt}</span>
        </div>
      )}
      tabs={DOC_TABS}
      activeTab={params.type}
      onTabChange={goTab}
      searchValue={qInput}
      onSearchChange={setQInput}
      onSearchSubmit={submitSearch}
      onSearchReset={resetSearch}
      searchPlaceholder="제목으로 검색"
      page={page}
      pageCount={pageCount}
      onPrevPage={() => goPage(page - 1)}
      onNextPage={() => goPage(page + 1)}
      buildPageHref={(p) => buildQuery({ ...params, page: p }) || "?"}
    />
  )
}
