import type { ReactNode } from "react"
import {
  PlayIcon,
  StopIcon,
  PencilSimpleIcon,
  CopyIcon,
  TrashIcon,
  DownloadSimpleIcon,
  ArrowsClockwiseIcon,
  EyeIcon,
} from "@phosphor-icons/react/dist/ssr"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface IconAction {
  tip: string
  icon: ReactNode
}

const ICON_ACTIONS: IconAction[] = [
  { tip: "수정", icon: <PencilSimpleIcon size={14} /> },
  { tip: "복사", icon: <CopyIcon size={14} /> },
  { tip: "삭제", icon: <TrashIcon size={14} className="text-destructive" /> },
  { tip: "다운로드", icon: <DownloadSimpleIcon size={14} /> },
  { tip: "새로고침", icon: <ArrowsClockwiseIcon size={14} /> },
  { tip: "상세보기", icon: <EyeIcon size={14} /> },
]

function TooltipIconButton({
  tip,
  icon,
  size = "icon-sm",
}: Readonly<IconAction & { size?: "icon-sm" | "icon-xs" }>) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button type="button" variant="ghost" size={size} aria-label={tip}>
          {icon}
        </Button>
      </TooltipTrigger>
      <TooltipContent>{tip}</TooltipContent>
    </Tooltip>
  )
}

/** #35 툴팁 액션 버튼 — 모든 아이콘 전용 버튼에 Tooltip 필수. */
export function TooltipActionButtons() {
  return (
    <TooltipProvider>
      <Card>
        <CardContent className="space-y-3 p-4">
          <p className="text-[11px] font-bold">아이콘 버튼 (h-7 w-7)</p>
          <div className="flex items-center gap-1">
            {ICON_ACTIONS.map((action) => (
              <TooltipIconButton key={action.tip} tip={action.tip} icon={action.icon} />
            ))}
          </div>

          <p className="text-[11px] font-bold">테이블 행 액션 (h-6 w-6)</p>
          <div className="flex items-center justify-between rounded border border-border p-2">
            <span className="text-xs">삼성전자 005930</span>
            <div className="flex items-center gap-0.5">
              <TooltipIconButton tip="수정" icon={<PencilSimpleIcon size={12} />} size="icon-xs" />
              <TooltipIconButton tip="복사" icon={<CopyIcon size={12} />} size="icon-xs" />
              <TooltipIconButton tip="삭제" icon={<TrashIcon size={12} className="text-destructive" />} size="icon-xs" />
            </div>
          </div>

          <p className="text-[11px] font-bold">텍스트 + 아이콘 버튼</p>
          <div className="flex items-center gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button size="sm" variant="outline">
                  <PlayIcon size={14} />
                  실행
                </Button>
              </TooltipTrigger>
              <TooltipContent>파이프라인 실행</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button size="sm" variant="destructive">
                  <StopIcon size={14} />
                  중단
                </Button>
              </TooltipTrigger>
              <TooltipContent>실행 중인 작업 중단</TooltipContent>
            </Tooltip>
          </div>
        </CardContent>
      </Card>
    </TooltipProvider>
  )
}
