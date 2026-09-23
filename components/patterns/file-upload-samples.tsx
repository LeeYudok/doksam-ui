import { FileCsvIcon, FileImageIcon, FilePdfIcon } from "@phosphor-icons/react/dist/ssr"

import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import type { PatternSampleData } from "@/components/showcase/pattern-sample"
import { UploadDropzoneDemo } from "@/components/patterns/file-upload/upload-dropzone-demo"

const STATE_FILES = [
  { name: "product_photo.png", pct: 100, status: "완료" as const, icon: FileImageIcon },
  { name: "invoice_2026Q2.csv", pct: 45, status: "진행중" as const, icon: FileCsvIcon },
  { name: "contract_draft.pdf", pct: 60, status: "실패" as const, icon: FilePdfIcon },
]

function statusBadgeVariant(status: (typeof STATE_FILES)[number]["status"]): "default" | "secondary" | "destructive" {
  if (status === "완료") return "default"
  if (status === "진행중") return "secondary"
  return "destructive"
}

export const FILE_UPLOAD_SAMPLES: PatternSampleData[] = [
  {
    num: 1,
    title: "드래그앤드롭 업로드",
    description: "드롭존에 파일을 놓거나 클릭해 선택하면 진행률과 함께 목록에 추가되는 업로드 위젯입니다.",
    demo: <UploadDropzoneDemo />,
    code: `function UploadDropzone() {
  const [files, setFiles] = useState<UploadFile[]>([])

  function handleDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault()
    if (e.dataTransfer.files.length > 0) addFiles(e.dataTransfer.files)
  }

  function addFiles(fileList: FileList) {
    const next = Array.from(fileList).map(toUploadFile)
    setFiles((prev) => [...prev, ...next])
    next.forEach(simulateUpload) // setTimeout/setInterval로 progress 0→100 시뮬레이션
  }

  return (
    <label onDragOver={preventDefault} onDrop={handleDrop} className="border-2 border-dashed p-8 text-center">
      <CloudArrowUpIcon />
      <p>파일을 드래그하거나 클릭해서 업로드</p>
      <input type="file" multiple className="sr-only" onChange={(e) => addFiles(e.target.files!)} />
    </label>
  )
}`,
    notes: [
      "드롭존은 <label htmlFor={inputId}> + sr-only <input type='file'> 로 만들어 클릭·드래그 두 진입 경로를 하나의 시맨틱 요소로 처리한다.",
      "드래그 중(isDragging)에는 border-primary bg-primary/5 로 즉시 피드백을 준다.",
      "실 서비스에서는 simulateUpload 자리에 presigned URL PUT 등 실제 업로드 호출과 progress 이벤트를 연결한다.",
      "파일당 개별 setInterval을 두고, 삭제 시 clearInterval로 정리해야 언마운트 후 잔여 타이머로 인한 상태 업데이트를 막는다.",
    ],
  },
  {
    num: 2,
    title: "업로드 상태 뱃지",
    description: "완료·진행중·실패 3가지 업로드 상태를 파일 아이콘 + Progress + Badge 조합으로 정리한 정적 참고표입니다.",
    demo: (
      <ul className="flex w-full max-w-md flex-col gap-2">
        {STATE_FILES.map((file) => {
          const Icon = file.icon
          return (
            <li key={file.name} className="flex items-center gap-2.5 rounded-md border p-2.5">
              <Icon size={18} weight="regular" className="shrink-0 text-muted-foreground" />
              <div className="min-w-0 flex-1 space-y-1">
                <span className="block truncate text-xs font-medium">{file.name}</span>
                <Progress value={file.pct} className="h-1.5" />
              </div>
              <Badge variant={statusBadgeVariant(file.status)} className="shrink-0 px-1.5 py-0 text-[9px]">
                {file.status}
              </Badge>
            </li>
          )
        })}
      </ul>
    ),
    code: `<li className="flex items-center gap-2.5 rounded-md border p-2.5">
  <FileImageIcon className="text-muted-foreground" />
  <div className="min-w-0 flex-1 space-y-1">
    <span className="truncate text-xs font-medium">{file.name}</span>
    <Progress value={file.pct} className="h-1.5" />
  </div>
  <Badge variant={statusVariant}>{file.status}</Badge>
</li>`,
    notes: [
      "완료=default(primary), 진행중=secondary, 실패=destructive Badge variant로 상태를 색으로도 구분한다.",
      "파일 아이콘은 확장자별로 분기(csv/xlsx→FileCsvIcon, pdf→FilePdfIcon, 이미지→FileImageIcon, 그 외→FileIcon)한다.",
      "실패 항목은 Progress 값이 100%에 도달하지 못한 지점에서 멈춘 상태로 보여줘 실패 시점을 짐작할 수 있게 한다.",
    ],
  },
]
