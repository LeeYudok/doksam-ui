"use client"

import { useId, useState } from "react"
import type { ChangeEvent, DragEvent } from "react"
import { CloudArrowUpIcon, FileCsvIcon, FileIcon, FileImageIcon, FilePdfIcon, TrashSimpleIcon } from "@phosphor-icons/react/dist/ssr"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"

/** 업로드 진행 상태 3단계 — 완료/진행중/실패. */
export type UploadStatus = "진행중" | "완료" | "실패"

export interface UploadFile {
  id: string
  name: string
  /** 이미 사람이 읽을 수 있게 포맷된 크기 문구(예: "1.2MB"). */
  sizeLabel: string
  /** 0~100. */
  progress: number
  status: UploadStatus
}

export interface UploadDropzoneProps {
  /** 드롭·선택된 파일을 넘겨받아 실제 업로드를 시작하는 콜백. */
  onFiles: (files: FileList) => void
  /** 드롭존 본문 문구. */
  label?: string
  /** 허용 형식·용량 등 보조 문구. */
  hint?: string
  /** <input type="file"> 의 accept 값. */
  accept?: string
  multiple?: boolean
  className?: string
}

export interface UploadFileListProps {
  files: UploadFile[]
  onRemove?: (id: string) => void
  className?: string
}

/** 바이트 수를 KB/MB 문구로 줄인다. */
export function formatUploadSize(bytes: number): string {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))}KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`
}

/** 파일명 확장자로 표시 아이콘을 고른다. */
export function uploadFileIcon(name: string) {
  const ext = name.split(".").pop()?.toLowerCase()
  if (ext === "csv" || ext === "xlsx") return FileCsvIcon
  if (ext === "pdf") return FilePdfIcon
  if (ext === "png" || ext === "jpg" || ext === "jpeg" || ext === "webp") return FileImageIcon
  return FileIcon
}

function statusBadgeVariant(status: UploadStatus): "default" | "secondary" | "destructive" {
  if (status === "완료") return "default"
  if (status === "진행중") return "secondary"
  return "destructive"
}

/**
 * 드래그앤드롭 드롭존 — 클릭·드래그 두 진입 경로를 <label> + sr-only <input type="file">
 * 하나로 처리한다. 업로드 자체는 수행하지 않고 선택된 FileList 를 onFiles 로 넘긴다.
 */
export function UploadDropzone({
  onFiles,
  label = "파일을 드래그하거나 클릭해서 업로드",
  hint,
  accept,
  multiple = true,
  className,
}: Readonly<UploadDropzoneProps>) {
  const inputId = useId()
  const [isDragging, setIsDragging] = useState(false)

  function handleDrop(e: DragEvent<HTMLLabelElement>) {
    e.preventDefault()
    setIsDragging(false)
    if (e.dataTransfer.files.length > 0) onFiles(e.dataTransfer.files)
  }

  function handleInputChange(e: ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files.length > 0) onFiles(e.target.files)
    e.target.value = ""
  }

  return (
    <label
      htmlFor={inputId}
      onDragOver={(e) => {
        e.preventDefault()
        setIsDragging(true)
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
      className={cn(
        "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-8 text-center transition-colors",
        isDragging ? "border-primary bg-primary/5" : "border-border hover:border-primary/50",
        className,
      )}
    >
      <CloudArrowUpIcon size={28} weight="regular" className="text-muted-foreground" />
      <p className="text-sm font-medium">{label}</p>
      {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
      <input id={inputId} type="file" multiple={multiple} className="sr-only" onChange={handleInputChange} accept={accept} />
    </label>
  )
}

/** 업로드 목록 — 파일 아이콘 + 이름/크기 + 진행률 + 상태 배지 + 삭제. */
export function UploadFileList({ files, onRemove, className }: Readonly<UploadFileListProps>) {
  if (files.length === 0) return null

  return (
    <ul className={cn("flex flex-col gap-2", className)}>
      {files.map((file) => {
        const FileTypeIcon = uploadFileIcon(file.name)
        return (
          <li key={file.id} className="flex items-center gap-2.5 rounded-md border p-2.5">
            <FileTypeIcon size={18} weight="regular" className="shrink-0 text-muted-foreground" />
            <div className="min-w-0 flex-1 space-y-1">
              <div className="flex items-center justify-between gap-2">
                <span className="truncate text-xs font-medium">{file.name}</span>
                <span className="shrink-0 text-[10px] text-muted-foreground">{file.sizeLabel}</span>
              </div>
              <Progress value={file.progress} className="h-1.5" />
            </div>
            <Badge variant={statusBadgeVariant(file.status)} className="shrink-0 px-1.5 py-0 text-[9px]">
              {file.status}
            </Badge>
            {onRemove ? (
              <Button type="button" size="icon-sm" variant="ghost" aria-label={`${file.name} 삭제`} onClick={() => onRemove(file.id)}>
                <TrashSimpleIcon size={14} weight="regular" />
              </Button>
            ) : null}
          </li>
        )
      })}
    </ul>
  )
}
