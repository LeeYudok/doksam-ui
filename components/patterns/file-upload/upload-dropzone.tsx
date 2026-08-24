"use client"

import { useId, useRef, useState } from "react"
import type { ChangeEvent, Dispatch, DragEvent, SetStateAction } from "react"
import { CloudArrowUpIcon, FileCsvIcon, FileIcon, FileImageIcon, FilePdfIcon, TrashSimpleIcon } from "@phosphor-icons/react/dist/ssr"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"

type UploadStatus = "진행중" | "완료" | "실패"

interface UploadFile {
  id: string
  name: string
  sizeLabel: string
  progress: number
  status: UploadStatus
}

const MAX_SIZE_LABEL = "최대 10MB"
const ACCEPTED_LABEL = "이미지, PDF, CSV"

function formatSize(bytes: number): string {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))}KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`
}

function fileIcon(name: string) {
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

type UploadTimers = Map<string, ReturnType<typeof setInterval>>

const TICK_MS = 300
const TICK_STEP = 20
const FAIL_AT = 60

/** 진행중 파일 한 건의 다음 상태. 파일명에 "fail"이 있으면 60%에서 실패로 굳는다. */
function advanceUpload(file: UploadFile, willFail: boolean): UploadFile {
  const nextProgress = Math.min(100, file.progress + TICK_STEP)
  if (willFail && nextProgress >= FAIL_AT) return { ...file, progress: FAIL_AT, status: "실패" }
  if (nextProgress >= 100) return { ...file, progress: 100, status: "완료" }
  return { ...file, progress: nextProgress }
}

function tickUploads(
  prev: UploadFile[],
  id: string,
  willFail: boolean,
  onSettled: () => void
): UploadFile[] {
  return prev.map((f) => {
    if (f.id !== id || f.status !== "진행중") return f
    const next = advanceUpload(f, willFail)
    if (next.status !== "진행중") onSettled()
    return next
  })
}

/** 데모 목적의 결정적(random 없는) 진행률 시뮬레이션. */
function startUploadSimulation(
  file: UploadFile,
  setFiles: Dispatch<SetStateAction<UploadFile[]>>,
  timers: UploadTimers
) {
  const willFail = file.name.toLowerCase().includes("fail")
  const stop = () => {
    clearInterval(timer)
    timers.delete(file.id)
  }
  const timer = setInterval(() => {
    setFiles((prev) => tickUploads(prev, file.id, willFail, stop))
  }, TICK_MS)
  timers.set(file.id, timer)
}

/**
 * 드래그앤드롭 드롭존 + 업로드 진행률 리스트 + 삭제.
 * 실제 업로드 API 호출 없이 setTimeout 기반 진행률 시뮬레이션으로 대체한다.
 */
export function UploadDropzone() {
  const inputId = useId()
  const [isDragging, setIsDragging] = useState(false)
  const [files, setFiles] = useState<UploadFile[]>([])
  const timers = useRef<UploadTimers>(new Map())

  function addFiles(fileList: FileList) {
    const next: UploadFile[] = Array.from(fileList).map((file, i) => ({
      id: `${Date.now()}-${i}-${file.name}`,
      name: file.name,
      sizeLabel: formatSize(file.size),
      progress: 0,
      status: "진행중" as const,
    }))
    setFiles((prev) => [...prev, ...next])
    for (const f of next) startUploadSimulation(f, setFiles, timers.current)
  }

  function handleDrop(e: DragEvent<HTMLLabelElement>) {
    e.preventDefault()
    setIsDragging(false)
    if (e.dataTransfer.files.length > 0) addFiles(e.dataTransfer.files)
  }

  function handleInputChange(e: ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files.length > 0) addFiles(e.target.files)
    e.target.value = ""
  }

  function removeFile(id: string) {
    const timer = timers.current.get(id)
    if (timer) {
      clearInterval(timer)
      timers.current.delete(id)
    }
    setFiles((prev) => prev.filter((f) => f.id !== id))
  }

  return (
    <div className="flex w-full flex-col gap-3">
      <label
        htmlFor={inputId}
        onDragOver={(e) => {
          e.preventDefault()
          setIsDragging(true)
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-8 text-center transition-colors ${
          isDragging ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
        }`}
      >
        <CloudArrowUpIcon size={28} weight="regular" className="text-muted-foreground" />
        <p className="text-sm font-medium">파일을 드래그하거나 클릭해서 업로드</p>
        <p className="text-xs text-muted-foreground">
          {ACCEPTED_LABEL} ({MAX_SIZE_LABEL})
        </p>
        <input
          id={inputId}
          type="file"
          multiple
          className="sr-only"
          onChange={handleInputChange}
          accept="image/*,.pdf,.csv"
        />
      </label>

      {files.length > 0 ? (
        <ul className="flex flex-col gap-2">
          {files.map((file) => {
            const Icon = fileIcon(file.name)
            return (
              <li key={file.id} className="flex items-center gap-2.5 rounded-md border p-2.5">
                <Icon size={18} weight="regular" className="shrink-0 text-muted-foreground" />
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
                <Button
                  type="button"
                  size="icon-sm"
                  variant="ghost"
                  aria-label={`${file.name} 삭제`}
                  onClick={() => removeFile(file.id)}
                >
                  <TrashSimpleIcon size={14} weight="regular" />
                </Button>
              </li>
            )
          })}
        </ul>
      ) : null}
    </div>
  )
}
