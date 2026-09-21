"use client"

import type { ColumnDef } from "@tanstack/react-table"
import Link from "next/link"

import { Badge } from "@/components/ui/badge"
import { TableSortable } from "@/components/table-sortable"
import { Sparkline } from "@/components/patterns/dataviz/sparkline"
import { formatWon } from "@/lib/finance/format-won"
import { rateColor, rateText } from "@/lib/finance/rate"
import type { Holding } from "@/lib/templates/trading-data"

const columns: ColumnDef<Holding, unknown>[] = [
  {
    accessorKey: "name",
    header: "종목",
    enableHiding: false,
    cell: ({ row }) => (
      <Link href={`/templates/trading/${row.original.symbol}`} className="flex flex-col hover:underline">
        <span className="text-sm font-medium">{row.original.name}</span>
        <span className="text-[10px] text-muted-foreground">
          {row.original.symbol} · {row.original.market}
        </span>
      </Link>
    ),
  },
  {
    accessorKey: "shares",
    header: "보유수량",
    cell: ({ getValue }) => <span className="tabular-nums">{getValue<number>().toLocaleString()}주</span>,
  },
  {
    accessorKey: "currentPrice",
    header: "현재가",
    cell: ({ getValue }) => <span className="tabular-nums">{getValue<number>().toLocaleString()}원</span>,
  },
  {
    accessorKey: "changePercent",
    header: "등락률",
    cell: ({ getValue }) => {
      const rate = getValue<number>()
      return <span className={`font-semibold tabular-nums ${rateColor(rate)}`}>{rateText(rate)}%</span>
    },
  },
  {
    id: "evalAmount",
    header: "평가금액",
    accessorFn: (row) => row.currentPrice * row.shares,
    cell: ({ getValue }) => <span className="tabular-nums">{formatWon(getValue<number>())}</span>,
  },
  {
    id: "gain",
    header: "평가손익",
    accessorFn: (row) => (row.currentPrice - row.avgPrice) * row.shares,
    cell: ({ getValue }) => {
      const gain = getValue<number>()
      return <span className={`font-semibold tabular-nums ${rateColor(gain)}`}>{gain >= 0 ? "+" : ""}{formatWon(gain)}</span>
    },
  },
  {
    id: "sparkline",
    header: "추이",
    enableSorting: false,
    cell: ({ row }) => (
      <div className="w-24">
        <Sparkline values={row.original.priceHistory} height={28} />
      </div>
    ),
  },
  {
    accessorKey: "sector",
    header: "섹터",
    cell: ({ getValue }) => (
      <Badge variant="secondary" className="text-[10px]">
        {getValue<string>()}
      </Badge>
    ),
  },
]

interface HoldingsTableProps {
  holdings: Holding[]
}

/** 보유 종목 테이블 — table-sortable 조립(정렬 헤더 + 드래그 재정렬 + 컬럼 토글). */
export function HoldingsTable({ holdings }: Readonly<HoldingsTableProps>) {
  return <TableSortable data={holdings} columns={columns} getRowId={(row) => row.symbol} maxBodyHeight="22rem" />
}
