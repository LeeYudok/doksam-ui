"use client"

import { ShuffleIcon, TrashIcon } from "@phosphor-icons/react/dist/ssr"

import { Button } from "@/components/ui/button"

import { DataTransferButtons } from "./data-transfer-buttons"

export interface AdminGenToolbarProps {
  genCount?: number
  onChangeGenCount?: (n: number) => void
  generating: boolean
  onGenerate: () => void
  onExport: () => void
  onImport: (file: File) => Promise<void> | void
  onDeleteAll?: () => void
  deleting?: boolean
}

const MAX_SIZE = 100_000
const STEP = 1_000

/**
 * 관리자 더미 데이터 생성 툴바 — 건수 스피너(±1/±1000) + 랜덤 생성 + JSON 전송 + 전체삭제.
 * dok3node customs/admin-toolbar-user.tsx(AdminGenToolbar) 이식 — emerald 하드코딩을
 * success 토큰으로 치환.
 */
export function AdminGenToolbar({
  genCount,
  onChangeGenCount,
  generating,
  onGenerate,
  onExport,
  onImport,
  onDeleteAll,
  deleting = false,
}: AdminGenToolbarProps) {
  const hasCountControl = genCount !== undefined && onChangeGenCount !== undefined

  return (
    <div className="flex items-center overflow-x-auto rounded border bg-muted p-2">
      {hasCountControl ? (
        <div className="flex shrink-0 items-center rounded border">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onChangeGenCount(Math.max(1, genCount - STEP))}
            className="rounded-none rounded-l px-1.5! text-xs"
          >
            -{STEP}
          </Button>
          <Button size="sm" variant="ghost" onClick={() => onChangeGenCount(Math.max(1, genCount - 1))} className="rounded-none border-x px-1.5!">
            -
          </Button>
          <span className="min-w-10 px-2 text-center font-mono text-xs" aria-live="polite">
            {genCount}
          </span>
          <Button size="sm" variant="ghost" onClick={() => onChangeGenCount(Math.min(MAX_SIZE, genCount + 1))} className="rounded-none border-x px-1.5!">
            +
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onChangeGenCount(Math.min(MAX_SIZE, genCount + STEP))}
            className="rounded-none rounded-r px-1.5! text-xs"
          >
            +{STEP}
          </Button>
        </div>
      ) : null}

      <div className="flex-1" />
      <div className="mx-2 h-5 w-px shrink-0 bg-border" aria-hidden />

      <div className="flex shrink-0 items-center gap-1 sm:gap-2">
        <Button size="sm" variant="outline" onClick={onGenerate} disabled={generating} title="랜덤 생성" className="px-2! sm:px-3!">
          <ShuffleIcon weight="duotone" className="text-success" aria-hidden />
          <span className="hidden sm:inline">{generating ? "생성 중…" : "생성"}</span>
        </Button>

        <DataTransferButtons onExport={onExport} onImport={onImport} />

        {onDeleteAll ? (
          <Button size="sm" variant="destructive" onClick={onDeleteAll} disabled={deleting} title="전체삭제" className="px-2! sm:px-3!">
            <TrashIcon weight="duotone" aria-hidden />
            <span className="hidden sm:inline">{deleting ? "삭제 중…" : "전체삭제"}</span>
          </Button>
        ) : null}
      </div>
    </div>
  )
}
