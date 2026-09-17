"use client"

import * as React from "react"
import { DownloadSimpleIcon, SortAscendingIcon, SortDescendingIcon, TrashIcon } from "@phosphor-icons/react/dist/ssr"
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  type SortingState,
} from "@tanstack/react-table"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  paginate,
  pageSelectionState,
  countSelected,
  toggleRowSelection,
  togglePageSelection,
} from "@/lib/patterns/data-table/paginate"

interface Order {
  id: string
  customer: string
  category: string
  amount: number
  status: "paid" | "pending" | "refunded"
  date: string
}

const ORDERS: Order[] = [
  { id: "ORD-1001", customer: "김민준", category: "구독", amount: 29000, status: "paid", date: "07-01" },
  { id: "ORD-1002", customer: "이서연", category: "일회성", amount: 128000, status: "paid", date: "07-01" },
  { id: "ORD-1003", customer: "박도윤", category: "구독", amount: 29000, status: "pending", date: "07-02" },
  { id: "ORD-1004", customer: "최지우", category: "번들", amount: 342000, status: "paid", date: "07-02" },
  { id: "ORD-1005", customer: "정하은", category: "일회성", amount: 58000, status: "refunded", date: "07-03" },
  { id: "ORD-1006", customer: "강시우", category: "구독", amount: 29000, status: "paid", date: "07-04" },
  { id: "ORD-1007", customer: "조유진", category: "번들", amount: 210000, status: "pending", date: "07-04" },
  { id: "ORD-1008", customer: "윤하준", category: "일회성", amount: 76000, status: "paid", date: "07-05" },
  { id: "ORD-1009", customer: "임서준", category: "구독", amount: 29000, status: "paid", date: "07-06" },
  { id: "ORD-1010", customer: "한지호", category: "번들", amount: 458000, status: "refunded", date: "07-06" },
  { id: "ORD-1011", customer: "오수아", category: "일회성", amount: 34000, status: "paid", date: "07-07" },
  { id: "ORD-1012", customer: "서지안", category: "구독", amount: 29000, status: "pending", date: "07-08" },
]

const PAGE_SIZE = 5

function statusLabel(status: Order["status"]): string {
  if (status === "paid") return "결제완료"
  if (status === "pending") return "대기중"
  return "환불"
}

function statusVariant(status: Order["status"]): "default" | "secondary" | "outline" {
  if (status === "paid") return "default"
  if (status === "pending") return "secondary"
  return "outline"
}

const COLUMNS: ColumnDef<Order, unknown>[] = [
  { accessorKey: "id", header: "주문번호" },
  { accessorKey: "customer", header: "고객" },
  { accessorKey: "category", header: "구분" },
  {
    accessorKey: "amount",
    header: "금액",
    cell: ({ row }) => <span className="tabular-nums">{row.original.amount.toLocaleString()}원</span>,
  },
  {
    accessorKey: "status",
    header: "상태",
    cell: ({ row }) => <Badge variant={statusVariant(row.original.status)}>{statusLabel(row.original.status)}</Badge>,
  },
  { accessorKey: "date", header: "일자" },
]

function getId(row: Order) {
  return row.id
}

/**
 * #1 선택 가능한 데이터 테이블 — table-sortable.tsx의 정렬 헤더 관례(@tanstack/react-table
 * getSortedRowModel + 헤더 클릭 토글)를 기반으로, 행 선택(체크박스) + 선택 시 일괄 액션 바 +
 * 하단 페이지네이션을 추가한 목록 화면 표준 조합이다(#33).
 *
 * 선택 상태는 paginate.ts의 순수 함수(pageSelectionState/toggleRowSelection 등)로 계산해
 * 렌더링 로직과 분리했다 — id → boolean 맵이라 페이지를 넘나들어도 선택이 유지된다.
 */
export function DataTableDemo() {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [page, setPage] = React.useState(1)
  const [selection, setSelection] = React.useState<Record<string, boolean>>({})

  const table = useReactTable({
    data: ORDERS,
    columns: COLUMNS,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })

  const sortedRows = table.getRowModel().rows.map((row) => row.original)
  const slice = paginate(sortedRows, page, PAGE_SIZE)
  const pageOriginals = slice.rows
  const selectedCount = countSelected(selection)
  const headerState = pageSelectionState(pageOriginals, getId, selection)

  function setPageClamped(next: number) {
    setPage(Math.min(Math.max(next, 1), slice.pageCount))
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex min-h-8 items-center justify-between gap-2">
        {selectedCount > 0 ? (
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-foreground">{selectedCount}건 선택됨</span>
            <Button type="button" variant="outline" size="sm" className="px-2 text-xs" onClick={() => setSelection({})}>
              선택 해제
            </Button>
            <Button type="button" variant="outline" size="sm" className="px-2 text-xs">
              <DownloadSimpleIcon size={14} />
              내보내기
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="px-2 text-xs text-destructive hover:text-destructive"
            >
              <TrashIcon size={14} />
              삭제
            </Button>
          </div>
        ) : (
          <p className="text-xs text-muted-foreground">행을 선택하면 일괄 작업 도구가 나타납니다.</p>
        )}
      </div>

      <div className="overflow-x-auto rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="hover:bg-transparent">
                <TableHead className="w-8">
                  <Checkbox
                    aria-label="현재 페이지 전체 선택"
                    checked={headerState === "all" ? true : headerState === "some" ? "indeterminate" : false}
                    onCheckedChange={(checked) => setSelection(togglePageSelection(pageOriginals, getId, selection, checked === true))}
                  />
                </TableHead>
                {headerGroup.headers.map((header) => {
                  const canSort = header.column.getCanSort()
                  const sortDir = header.column.getIsSorted()
                  return (
                    <TableHead key={header.id}>
                      {canSort ? (
                        <button
                          type="button"
                          className="flex items-center gap-1 hover:text-foreground"
                          onClick={header.column.getToggleSortingHandler()}
                        >
                          {flexRender(header.column.columnDef.header, header.getContext())}
                          {sortDir === "asc" && <SortAscendingIcon size={12} />}
                          {sortDir === "desc" && <SortDescendingIcon size={12} />}
                        </button>
                      ) : (
                        flexRender(header.column.columnDef.header, header.getContext())
                      )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {pageOriginals.length === 0 ? (
              <TableRow>
                <TableCell colSpan={COLUMNS.length + 1} className="h-24 text-center text-muted-foreground">
                  데이터가 없습니다.
                </TableCell>
              </TableRow>
            ) : (
              table
                .getRowModel()
                .rows.filter((row) => pageOriginals.includes(row.original))
                .map((row) => (
                  <TableRow key={row.id} data-selected={selection[getId(row.original)] || undefined}>
                    <TableCell>
                      <Checkbox
                        aria-label={`${row.original.id} 선택`}
                        checked={!!selection[getId(row.original)]}
                        onCheckedChange={(checked) => setSelection(toggleRowSelection(getId(row.original), selection, checked === true))}
                      />
                    </TableCell>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                    ))}
                  </TableRow>
                ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>
          {slice.total === 0 ? 0 : (slice.page - 1) * PAGE_SIZE + 1}-{Math.min(slice.page * PAGE_SIZE, slice.total)} / {slice.total}건
        </span>
        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="px-2 text-xs"
            disabled={slice.page <= 1}
            onClick={() => setPageClamped(slice.page - 1)}
          >
            이전
          </Button>
          <span className="px-2 tabular-nums">
            {slice.page} / {slice.pageCount}
          </span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="px-2 text-xs"
            disabled={slice.page >= slice.pageCount}
            onClick={() => setPageClamped(slice.page + 1)}
          >
            다음
          </Button>
        </div>
      </div>
    </div>
  )
}
