import * as React from "react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export interface StickyActionbarAction {
  label: string
  onClick?: () => void
  variant?: React.ComponentProps<typeof Button>["variant"]
  disabled?: boolean
}

export interface StickyActionbarProps extends Omit<React.ComponentProps<"div">, "children"> {
  /** 화면의 주 액션(결재 상신 등). 항상 우측 끝에 놓인다. */
  primaryAction: StickyActionbarAction
  /** 주 액션 왼쪽의 보조 액션(이전 단계로·임시저장 등). */
  secondaryAction?: StickyActionbarAction
  /**
   * 파괴적 액션(반려·삭제 등). 있으면 주 액션과 시각적으로 분리해 **맨 왼쪽**에 둔다 —
   * 주 액션 옆에 붙이면 연속 클릭 동선에서 오조작으로 이어진다.
   */
  destructiveAction?: StickyActionbarAction
  /** 좌측에 보여줄 보조 정보(선택 건수·마지막 저장 시각 등). */
  meta?: React.ReactNode
}

/**
 * 하단 고정 액션바 (#88) — 결재 상신 등 화면의 주 액션을 항상 보이는 위치에 둔다.
 *
 * `fixed` 가 아니라 `sticky bottom-0` 을 쓴다 — iOS Safari 는 소프트 키보드가
 * 올라오면 `fixed` 요소를 시각 뷰포트가 아니라 레이아웃 뷰포트 기준으로 고정해
 * 키보드 뒤에 숨는다. `sticky` 는 스크롤 컨테이너 흐름 안에서 하단에 붙기 때문에
 * 키보드가 올라와도 눌린 입력 필드 옆에 그대로 보인다. 안전영역은
 * `env(safe-area-inset-bottom)` 을 패딩에 더해 흡수한다.
 *
 * 액션 배치 순서(왼쪽 → 오른쪽): 파괴적 액션 → 보조 정보 → 보조 액션 → 주 액션.
 * 주 액션을 항상 오른쪽 끝에 두어 "다음으로 진행"의 방향과 일치시키고, 파괴적
 * 액션은 반대쪽 끝에 떨어뜨려 두 액션이 서로의 클릭 동선에 끼어들지 않게 한다.
 */
function StickyActionbar({
  className,
  primaryAction,
  secondaryAction,
  destructiveAction,
  meta,
  ...props
}: Readonly<StickyActionbarProps>) {
  return (
    <div
      data-slot="sticky-actionbar"
      className={cn(
        "sticky bottom-0 z-10 flex flex-wrap items-center justify-between gap-3 border-t border-border bg-card/95 px-4 py-3 backdrop-blur-sm",
        "pb-[calc(env(safe-area-inset-bottom)+0.75rem)]",
        className
      )}
      {...props}
    >
      <div className="flex min-w-0 flex-wrap items-center gap-3">
        {destructiveAction ? (
          <Button
            variant={destructiveAction.variant ?? "outline"}
            className="text-destructive transition-colors duration-200 hover:bg-destructive/10 hover:text-destructive"
            onClick={destructiveAction.onClick}
            disabled={destructiveAction.disabled}
          >
            {destructiveAction.label}
          </Button>
        ) : null}
        {meta ? <span className="truncate text-xs text-muted-foreground">{meta}</span> : null}
      </div>
      <div className="flex shrink-0 items-center gap-2">
        {secondaryAction ? (
          <Button
            variant={secondaryAction.variant ?? "ghost"}
            onClick={secondaryAction.onClick}
            disabled={secondaryAction.disabled}
          >
            {secondaryAction.label}
          </Button>
        ) : null}
        <Button
          variant={primaryAction.variant ?? "default"}
          onClick={primaryAction.onClick}
          disabled={primaryAction.disabled}
        >
          {primaryAction.label}
        </Button>
      </div>
    </div>
  )
}

export { StickyActionbar }
