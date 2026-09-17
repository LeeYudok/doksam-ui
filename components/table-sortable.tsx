"use client"

import * as React from "react"
import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core"
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import {
  ColumnsIcon,
  DotsSixVerticalIcon,
  SortAscendingIcon,
  SortDescendingIcon,
} from "@phosphor-icons/react/dist/ssr"
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  type SortingState,
  type VisibilityState,
} from "@tanstack/react-table"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { cn } from "@/lib/utils"

export interface TableSortableProps<TData> {
  /** 표시할 행 데이터. 드래그 재정렬 시 내부 state로 복사되어 관리된다. */
  data: TData[]
  /** @tanstack/react-table 컬럼 정의. */
  columns: ColumnDef<TData, unknown>[]
  /** 각 행의 안정적인 고유 ID를 뽑아낸다(dnd-kit 정렬 컨텍스트에 필요). */
  getRowId: (row: TData) => string
  /** 드래그로 행 순서가 바뀔 때마다 재정렬된 전체 데이터를 전달받는다. */
  onReorder?: (next: TData[]) => void
  /** 바디 스크롤 영역 최대 높이. 헤더는 항상 고정된다. */
  maxBodyHeight?: string
  className?: string
}

interface DragHandleCellProps {
  rowId: string
  disabled: boolean
}

function DragHandleCell({ rowId, disabled }: Readonly<DragHandleCellProps>) {
  const { attributes, listeners } = useSortable({ id: rowId })
  return (
    <button
      type="button"
      className={cn(
        "flex h-6 w-6 cursor-grab items-center justify-center rounded text-muted-foreground hover:bg-muted hover:text-foreground active:cursor-grabbing",
        "disabled:cursor-not-allowed disabled:opacity-40"
      )}
      disabled={disabled}
      aria-label="행 순서 변경 핸들"
      title={disabled ? "정렬 해제 후 드래그할 수 있습니다" : "드래그해서 순서 변경"}
      {...(disabled ? {} : attributes)}
      {...(disabled ? {} : listeners)}
    >
      <DotsSixVerticalIcon size={14} weight="bold" />
    </button>
  )
}

interface SortableRowProps {
  rowId: string
  disabled: boolean
  cells: React.ReactNode
}

function SortableRow({ rowId, disabled, cells }: Readonly<SortableRowProps>) {
  const { setNodeRef, transform, transition, isDragging } = useSortable({ id: rowId })
  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
  }
  return (
    <TableRow
      ref={setNodeRef}
      style={style}
      data-dragging={isDragging || undefined}
      className="data-[dragging]:relative data-[dragging]:z-10 data-[dragging]:bg-muted data-[dragging]:shadow-sm"
    >
      <TableCell className="w-8 p-1">
        <DragHandleCell rowId={rowId} disabled={disabled} />
      </TableCell>
      {cells}
    </TableRow>
  )
}

/**
 * TableSortable — 고정 헤더 + 스크롤 바디를 가진 제네릭 데이터 그리드(#24, tossinvest
 * table-sortable.tsx 이식). 컬럼 헤더 클릭으로 정렬(@tanstack/react-table), 행 드래그
 * 핸들로 순서 변경(@dnd-kit), 컬럼 표시/숨김 토글(드롭다운 체크박스)을 지원한다.
 *
 * 정렬이 활성화된 동안에는 행 드래그를 비활성화한다 — 정렬된 뷰에서 드래그로 원본
 * 순서를 바꾸면 사용자가 보는 순서와 실제 데이터 순서가 어긋나 혼란을 준다.
 *
 * @tanstack/react-table·@dnd-kit는 self-host 검증(MIT 라이선스·런타임 외부 CDN/fetch
 * 없음·폐쇄망 빌드 테스트 그린)을 마친 승인 의존성이다(#24).
 */
export function TableSortable<TData>({
  data,
  columns,
  getRowId,
  onReorder,
  maxBodyHeight = "24rem",
  className,
}: Readonly<TableSortableProps<TData>>) {
  const [rows, setRows] = React.useState<TData[]>(data)
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})

  React.useEffect(() => {
    setRows(data)
  }, [data])

  const table = useReactTable({
    data: rows,
    columns,
    state: { sorting, columnVisibility },
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getRowId,
  })

  const isSorted = sorting.length > 0
  const rowIds = React.useMemo(() => rows.map((row) => getRowId(row)), [rows, getRowId])

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor)
  )

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return

    setRows((current) => {
      const oldIndex = current.findIndex((row) => getRowId(row) === active.id)
      const newIndex = current.findIndex((row) => getRowId(row) === over.id)
      if (oldIndex === -1 || newIndex === -1) return current
      const next = arrayMove(current, oldIndex, newIndex)
      onReorder?.(next)
      return next
    })
  }

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center justify-end">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button type="button" variant="outline" size="sm" className="px-2 text-xs">
              <ColumnsIcon size={14} />
              컬럼
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => (
                <DropdownMenuCheckboxItem
                  key={column.id}
                  checked={column.getIsVisible()}
                  onCheckedChange={(value) => column.toggleVisibility(!!value)}
                  onSelect={(event) => event.preventDefault()}
                >
                  {typeof column.columnDef.header === "string" ? column.columnDef.header : column.id}
                </DropdownMenuCheckboxItem>
              ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* DndContext/SortableContext는 <Table> 바깥에 둔다 — dnd-kit의 접근성 노드가
          <table> 직속 <div>로 렌더되어 "table cannot contain a nested div" DOM 경고를
          내던 문제(#35)를 피하려면 컨텍스트 경계가 table 밖이어야 한다. 컨텍스트는 순수
          Provider라 DOM을 추가하지 않고, sortable 아이템(행)이 하위에 있으면 그대로 동작한다. */}
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={rowIds} strategy={verticalListSortingStrategy}>
          <div className="overflow-auto rounded-md border" style={{ maxHeight: maxBodyHeight }}>
            <Table className="border-separate border-spacing-0">
              <TableHeader className="sticky top-0 z-20 bg-background">
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id} className="hover:bg-transparent">
                    <TableHead className="sticky top-0 w-8 border-b bg-background p-1" />
                    {headerGroup.headers.map((header) => {
                      const canSort = header.column.getCanSort()
                      const sortDir = header.column.getIsSorted()
                      return (
                        <TableHead key={header.id} className="sticky top-0 border-b bg-background">
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
                {table.getRowModel().rows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={columns.length + 1} className="h-24 text-center text-muted-foreground">
                      데이터가 없습니다.
                    </TableCell>
                  </TableRow>
                ) : (
                  table.getRowModel().rows.map((row) => (
                    <SortableRow
                      key={row.id}
                      rowId={row.id}
                      disabled={isSorted}
                      cells={row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                      ))}
                    />
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </SortableContext>
      </DndContext>
    </div>
  )
}
