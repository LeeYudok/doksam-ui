import { act, fireEvent, render, screen, within } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import FileUploadPatternsPage from "@/app/patterns/file-upload/page"
import { FILE_UPLOAD_SAMPLES } from "@/components/patterns/file-upload-samples"

function getDropzoneSection() {
  const heading = screen.getByRole("heading", { level: 2, name: "드래그앤드롭 업로드" })
  const section = heading.closest("section")
  if (!section) throw new Error("드래그앤드롭 업로드 section을 찾을 수 없습니다.")
  return within(section)
}

describe("FileUploadPatternsPage", () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it("renders the page heading", () => {
    render(<FileUploadPatternsPage />)
    expect(screen.getByRole("heading", { level: 1, name: "파일 업로드" })).toBeInTheDocument()
  })

  it("renders every file-upload sample as a numbered section", () => {
    render(<FileUploadPatternsPage />)
    for (const sample of FILE_UPLOAD_SAMPLES) {
      expect(screen.getByRole("heading", { level: 2, name: sample.title })).toBeInTheDocument()
      expect(screen.getByText(`#${sample.num}`)).toBeInTheDocument()
    }
  })

  it("renders 2 samples", () => {
    render(<FileUploadPatternsPage />)
    expect(FILE_UPLOAD_SAMPLES.length).toBe(2)
  })

  it("adds a dropped file, progresses it to completion, then removes it", () => {
    render(<FileUploadPatternsPage />)
    const dropzone = getDropzoneSection()

    const file = new File(["hello"], "report.csv", { type: "text/csv" })
    const input = dropzone.getByLabelText("파일을 드래그하거나 클릭해서 업로드", { exact: false }) as HTMLInputElement

    act(() => {
      fireEvent.change(input, { target: { files: [file] } })
    })

    expect(dropzone.getByText("report.csv")).toBeInTheDocument()
    expect(dropzone.getByText("진행중")).toBeInTheDocument()

    act(() => {
      vi.advanceTimersByTime(1500)
    })

    expect(dropzone.getByText("완료")).toBeInTheDocument()

    fireEvent.click(dropzone.getByRole("button", { name: "report.csv 삭제" }))
    expect(dropzone.queryByText("report.csv")).not.toBeInTheDocument()
  })

  it("transitions a file whose name contains 'fail' to the failed state", () => {
    render(<FileUploadPatternsPage />)
    const dropzone = getDropzoneSection()

    const file = new File(["hello"], "will-fail.pdf", { type: "application/pdf" })
    const input = dropzone.getByLabelText("파일을 드래그하거나 클릭해서 업로드", { exact: false }) as HTMLInputElement

    act(() => {
      fireEvent.change(input, { target: { files: [file] } })
    })

    act(() => {
      vi.advanceTimersByTime(900)
    })

    expect(dropzone.getByText("실패")).toBeInTheDocument()
  })

  it("shows the static state-badge reference with all three statuses", () => {
    render(<FileUploadPatternsPage />)
    expect(screen.getByText("완료")).toBeInTheDocument()
    expect(screen.getByText("진행중")).toBeInTheDocument()
    expect(screen.getByText("실패")).toBeInTheDocument()
  })
})
