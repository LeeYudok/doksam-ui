import * as React from "react"
import type { Icon } from "@phosphor-icons/react"

import { CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

export interface SectionPanelHeaderProps extends Omit<React.ComponentProps<typeof CardHeader>, "title"> {
  /** 좌측 아이콘. Phosphor(`@phosphor-icons/react/dist/ssr`)만 쓰고 이모지는 쓰지 않는다. */
  icon: Icon
  /** 섹션 제목. */
  title: React.ReactNode
  /** 제목 아래 보조 설명. 생략 가능. */
  description?: React.ReactNode
  /** 우측에 놓는 메타 텍스트(건수·기준일 등). 텍스트만 필요하면 이쪽을 쓴다. */
  meta?: React.ReactNode
  /** 우측에 놓는 인터랙티브 요소(필터·링크·버튼). 여러 개면 호출부가 gap 을 관리한다. */
  actions?: React.ReactNode
}

/**
 * 섹션 패널 헤더 (#88) — `card` 헤더 자리에 들어가는 아이콘 + 제목 + 우측 슬롯 조합이다.
 *
 * 얇은 래퍼가 되지 않도록 정렬·줄바꿈 규칙을 여기서 고정한다: 좁은 폭에서는
 * 우측 슬롯(`meta`/`actions`)이 제목 아래로 줄바꿈되고, 넓은 폭에서는 제목과
 * 한 줄에서 끝에 정렬된다. 제목이 길어도 좌측 아이콘 폭은 줄어들지 않는다
 * (`shrink-0`), 우측 슬롯도 줄어들지 않아 필터·버튼이 찌그러지지 않는다.
 *
 * `CardHeader` 를 그대로 감싸 쓴다 — `card-header` 의 패딩·라운딩을 재구현하지 않는다.
 */
function SectionPanelHeader({
  className,
  icon: IconComponent,
  title,
  description,
  meta,
  actions,
  ...props
}: Readonly<SectionPanelHeaderProps>) {
  const hasRightSlot = Boolean(meta || actions)

  return (
    <CardHeader
      data-slot="section-panel-header"
      className={cn("flex flex-row flex-wrap items-start justify-between gap-x-3 gap-y-2", className)}
      {...props}
    >
      <div className="flex min-w-0 items-start gap-2">
        <IconComponent size={18} weight="duotone" className="mt-0.5 shrink-0 text-muted-foreground" aria-hidden />
        <div className="flex min-w-0 flex-col gap-0.5">
          <CardTitle className="truncate">{title}</CardTitle>
          {description ? <CardDescription>{description}</CardDescription> : null}
        </div>
      </div>
      {hasRightSlot ? (
        <div className="flex shrink-0 flex-wrap items-center justify-end gap-2 text-xs text-muted-foreground">
          {meta ? <span data-slot="section-panel-header-meta">{meta}</span> : null}
          {actions ? (
            <div data-slot="section-panel-header-actions" className="flex flex-wrap items-center gap-2">
              {actions}
            </div>
          ) : null}
        </div>
      ) : null}
    </CardHeader>
  )
}

export { SectionPanelHeader }
