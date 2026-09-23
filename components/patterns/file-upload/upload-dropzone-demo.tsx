"use client"

import { useRef, useState } from "react"
import type { Dispatch, SetStateAction } from "react"

import {
  UploadDropzone,
  UploadFileList,
  formatUploadSize,
  type UploadFile,
} from "@/components/patterns/file-upload/upload-dropzone"

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

function tickUploads(prev: UploadFile[], id: string, willFail: boolean, onSettled: () => void): UploadFile[] {
  return prev.map((f) => {
    if (f.id !== id || f.status !== "진행중") return f
    const next = advanceUpload(f, willFail)
    if (next.status !== "진행중") onSettled()
    return next
  })
}

/** 데모 목적의 결정적(random 없는) 진행률 시뮬레이션. */
function startUploadSimulation(file: UploadFile, setFiles: Dispatch<SetStateAction<UploadFile[]>>, timers: UploadTimers) {
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

/** /patterns/file-upload 데모용 — 실제 업로드 API 대신 진행률 시뮬레이션을 붙인다. */
export function UploadDropzoneDemo() {
  const [files, setFiles] = useState<UploadFile[]>([])
  const timers = useRef<UploadTimers>(new Map())

  function addFiles(fileList: FileList) {
    const next: UploadFile[] = Array.from(fileList).map((file, i) => ({
      id: `${Date.now()}-${i}-${file.name}`,
      name: file.name,
      sizeLabel: formatUploadSize(file.size),
      progress: 0,
      status: "진행중" as const,
    }))
    setFiles((prev) => [...prev, ...next])
    for (const f of next) startUploadSimulation(f, setFiles, timers.current)
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
      <UploadDropzone onFiles={addFiles} hint="이미지, PDF, CSV (최대 10MB)" accept="image/*,.pdf,.csv" />
      <UploadFileList files={files} onRemove={removeFile} />
    </div>
  )
}
