import { TrashIcon, DownloadSimpleIcon, FunnelIcon, ArrowsClockwiseIcon, SortAscendingIcon, PencilSimpleIcon, CopyIcon } from "@phosphor-icons/react/dist/ssr"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface DataRow {
  name: string
  cat: string
  qty: number
  status: "active" | "inactive"
  date: string
}

const ROWS: DataRow[] = [
  { name: "뉴스 크롤러", cat: "수집", qty: 1250, status: "active", date: "04-01" },
  { name: "감성 분석기", cat: "분석", qty: 890, status: "active", date: "04-02" },
  { name: "PDF 렌더러", cat: "출력", qty: 32, status: "inactive", date: "03-28" },
  { name: "시세 수집기", cat: "수집", qty: 4100, status: "active", date: "04-05" },
]

function Toolbar() {
  return (
    <div className="flex items-center justify-between gap-2">
      <div className="flex items-center gap-2">
        <Checkbox className="h-3.5 w-3.5" aria-label="전체 선택" />
        <span className="text-[10px] text-muted-foreground">3건 선택</span>
        <Button type="button" variant="outline" size="sm" className="px-2!">
          <TrashIcon size={14} className="text-destructive" />
          삭제
        </Button>
        <Button type="button" variant="outline" size="sm" className="px-2!">
          <DownloadSimpleIcon size={14} />
          내보내기
        </Button>
      </div>
      <div className="flex items-center gap-1">
        <Button type="button" variant="outline" size="icon-sm" aria-label="필터">
          <FunnelIcon size={14} />
        </Button>
        <Button type="button" variant="outline" size="icon-sm" aria-label="새로고침">
          <ArrowsClockwiseIcon size={14} />
        </Button>
      </div>
    </div>
  )
}

function DataTableBody() {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-8 text-[10px]">
            <Checkbox className="h-3.5 w-3.5" aria-label="전체 선택" />
          </TableHead>
          <TableHead className="text-[10px]">
            <button type="button" className="flex items-center gap-0.5 hover:text-foreground">
              이름 <SortAscendingIcon size={10} />
            </button>
          </TableHead>
          <TableHead className="text-[10px]">카테고리</TableHead>
          <TableHead className="text-right text-[10px]">수량</TableHead>
          <TableHead className="text-[10px]">상태</TableHead>
          <TableHead className="text-right text-[10px]">등록일</TableHead>
          <TableHead className="w-20 text-[10px]">액션</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {ROWS.map((row) => (
          <TableRow key={row.name}>
            <TableCell className="py-1.5">
              <Checkbox className="h-3.5 w-3.5" aria-label={`${row.name} 선택`} />
            </TableCell>
            <TableCell className="py-1.5 text-xs font-medium">{row.name}</TableCell>
            <TableCell className="py-1.5">
              <Badge variant="outline" className="px-1.5 py-0 text-[9px]">
                {row.cat}
              </Badge>
            </TableCell>
            <TableCell className="py-1.5 text-right text-xs tabular-nums">{row.qty.toLocaleString()}</TableCell>
            <TableCell className="py-1.5">
              <Badge variant={row.status === "active" ? "default" : "secondary"} className="px-1.5 py-0 text-[9px]">
                {row.status === "active" ? "활성" : "비활성"}
              </Badge>
            </TableCell>
            <TableCell className="py-1.5 text-right text-[10px] text-muted-foreground">{row.date}</TableCell>
            <TableCell className="py-1.5">
              <div className="flex items-center gap-0.5">
                <Button type="button" variant="ghost" size="icon-xs" aria-label="수정">
                  <PencilSimpleIcon size={12} />
                </Button>
                <Button type="button" variant="ghost" size="icon-xs" aria-label="복사">
                  <CopyIcon size={12} />
                </Button>
                <Button type="button" variant="ghost" size="icon-xs" aria-label="삭제">
                  <TrashIcon size={12} className="text-destructive" />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

function Pagination() {
  return (
    <div className="flex items-center justify-between text-[10px] text-muted-foreground">
      <span>1-4 / 128건</span>
      <div className="flex items-center gap-1">
        <Button type="button" size="xs" variant="outline" className="text-[10px]" disabled>
          이전
        </Button>
        <span className="px-2 tabular-nums">1 / 32</span>
        <Button type="button" size="xs" variant="outline" className="text-[10px]">
          다음
        </Button>
      </div>
    </div>
  )
}

/** #39 고급 데이터 테이블 — 필터 + 정렬 헤더 + 일괄 선택 + 페이징 (srope §7.2 이식). */
export function AdvancedDataTable() {
  return (
    <div className="space-y-2">
      <Toolbar />
      <Card>
        <CardContent className="p-0">
          <DataTableBody />
        </CardContent>
      </Card>
      <Pagination />
    </div>
  )
}
