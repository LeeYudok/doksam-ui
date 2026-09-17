import type { ReactNode } from "react"
import { CheckCircleIcon, SpinnerGapIcon, XCircleIcon, StopIcon, TrashIcon, WarningCircleIcon } from "@phosphor-icons/react/dist/ssr"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

type RunStatus = "success" | "running" | "failed" | "stopped"

interface HistoryRow {
  id: number
  status: RunStatus
  date: string
  inserted: number
  filtered: number
  skipped: number
  duration: string
  error?: string
}

const ROWS: HistoryRow[] = [
  { id: 1, status: "success", date: "2026-04-08", inserted: 125, filtered: 3, skipped: 0, duration: "2.3s" },
  { id: 2, status: "running", date: "2026-04-08", inserted: 45, filtered: 1, skipped: 0, duration: "1.2s" },
  { id: 3, status: "failed", date: "2026-04-07", inserted: 0, filtered: 0, skipped: 0, duration: "0.5s", error: "Connection timeout" },
  { id: 4, status: "success", date: "2026-04-07", inserted: 130, filtered: 5, skipped: 2, duration: "3.1s" },
  { id: 5, status: "stopped", date: "2026-04-06", inserted: 80, filtered: 2, skipped: 0, duration: "1.8s" },
]

const STATUS_META: Record<RunStatus, { className: string; icon: ReactNode }> = {
  success: { className: "border-success/30 bg-success/10 text-success", icon: <CheckCircleIcon size={10} className="mr-0.5" /> },
  running: { className: "border-chart-1/30 bg-chart-1/10 text-chart-1", icon: <SpinnerGapIcon size={10} className="mr-0.5 animate-spin" /> },
  failed: { className: "border-destructive/30 bg-destructive/10 text-destructive", icon: <XCircleIcon size={10} className="mr-0.5" /> },
  stopped: { className: "border-warning/30 bg-warning/10 text-warning", icon: <StopIcon size={10} className="mr-0.5" /> },
}

function rowHighlightClass(status: RunStatus): string {
  if (status === "running") return "bg-chart-1/5"
  if (status === "failed") return "bg-destructive/5"
  return ""
}

function HistoryRowActions({ row }: Readonly<{ row: HistoryRow }>) {
  return (
    <div className="flex items-center gap-0.5">
      {row.status === "running" && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button type="button" variant="ghost" size="icon-xs" aria-label="중단">
              <StopIcon size={12} className="text-destructive" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>중단</TooltipContent>
        </Tooltip>
      )}
      {row.error && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button type="button" variant="ghost" size="icon-xs" aria-label={row.error}>
              <WarningCircleIcon size={12} className="text-warning" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>{row.error}</TooltipContent>
        </Tooltip>
      )}
      <Tooltip>
        <TooltipTrigger asChild>
          <Button type="button" variant="ghost" size="icon-xs" aria-label="삭제">
            <TrashIcon size={12} className="text-destructive" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>삭제</TooltipContent>
      </Tooltip>
    </div>
  )
}

/** #37 수집 이력 테이블 — 상태별 행 하이라이팅 + 인라인 Tooltip 액션 (srope CrawlHistoryTable 이식). */
export function CollectionHistoryTable() {
  return (
    <TooltipProvider>
      <Card>
        <CardContent className="p-0">
          <ScrollArea className="h-[200px]">
            <Table>
              <TableHeader className="sticky top-0 z-10 bg-background">
                <TableRow>
                  <TableHead className="w-8 text-[10px]">
                    <Checkbox className="h-3.5 w-3.5" aria-label="전체 선택" />
                  </TableHead>
                  <TableHead className="w-8 text-[10px]">#</TableHead>
                  <TableHead className="w-20 text-[10px]">상태</TableHead>
                  <TableHead className="text-[10px]">대상날짜</TableHead>
                  <TableHead className="w-14 text-center text-[10px]">수집</TableHead>
                  <TableHead className="w-14 text-center text-[10px]">필터</TableHead>
                  <TableHead className="w-14 text-center text-[10px]">스킵</TableHead>
                  <TableHead className="w-14 text-right text-[10px]">소요</TableHead>
                  <TableHead className="w-16 text-[10px]">액션</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ROWS.map((row) => (
                  <TableRow key={row.id} className={rowHighlightClass(row.status)}>
                    <TableCell className="py-1">
                      <Checkbox className="h-3.5 w-3.5" aria-label={`${row.id}번 행 선택`} />
                    </TableCell>
                    <TableCell className="py-1 text-[10px] text-muted-foreground">{row.id}</TableCell>
                    <TableCell className="py-1">
                      <Badge variant="outline" className={`text-[10px] ${STATUS_META[row.status].className}`}>
                        {STATUS_META[row.status].icon}
                        {row.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="py-1 font-mono text-xs">{row.date}</TableCell>
                    <TableCell className="py-1 text-center text-xs text-success tabular-nums">{row.inserted}</TableCell>
                    <TableCell className="py-1 text-center text-xs text-chart-1 tabular-nums">{row.filtered}</TableCell>
                    <TableCell className="py-1 text-center text-xs text-destructive tabular-nums">{row.skipped}</TableCell>
                    <TableCell className="py-1 text-right text-xs text-muted-foreground tabular-nums">{row.duration}</TableCell>
                    <TableCell className="py-1">
                      <HistoryRowActions row={row} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>
    </TooltipProvider>
  )
}
