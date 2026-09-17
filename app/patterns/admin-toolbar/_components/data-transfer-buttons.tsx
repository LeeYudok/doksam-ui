"use client"

import * as React from "react"
import { DownloadSimpleIcon, UploadSimpleIcon } from "@phosphor-icons/react/dist/ssr"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface DataTransferButtonsProps {
  onExport: () => void
  onImport: (file: File) => Promise<void> | void
  exportLabel?: string
  importLabel?: string
  className?: string
}

/**
 * JSON 데이터 내보내기/가져오기 버튼 — 모바일은 아이콘만, sm+ 는 아이콘+텍스트.
 * dok3node customs/data-transfer-buttons.tsx 이식 — blue/amber 하드코딩을
 * chart-1/warning 토큰으로 치환. 숨김 file input 은 이 컴포넌트가 소유한다.
 */
export function DataTransferButtons({
  onExport,
  onImport,
  exportLabel = "JSON",
  importLabel = "JSON",
  className,
}: DataTransferButtonsProps) {
  const fileInputRef = React.useRef<HTMLInputElement>(null)
  const [importing, setImporting] = React.useState(false)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setImporting(true)
    try {
      await onImport(file)
    } finally {
      setImporting(false)
      if (fileInputRef.current) fileInputRef.current.value = ""
    }
  }

  return (
    <div className={cn("flex gap-1 sm:gap-2", className)}>
      <Button size="sm" variant="outline" onClick={onExport} title="데이터 내보내기" className="px-2 sm:px-3">
        <DownloadSimpleIcon weight="duotone" className="text-chart-1" aria-hidden />
        <span className="hidden sm:inline">{exportLabel}</span>
      </Button>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".json"
        className="hidden"
        aria-label="JSON 파일 선택"
      />

      <Button
        size="sm"
        variant="outline"
        onClick={() => fileInputRef.current?.click()}
        disabled={importing}
        title="데이터 가져오기"
        className="px-2 sm:px-3"
      >
        <UploadSimpleIcon weight="duotone" className="text-warning" aria-hidden />
        <span className="hidden sm:inline">{importing ? "로딩…" : importLabel}</span>
      </Button>
    </div>
  )
}
