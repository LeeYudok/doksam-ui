"use client"

import Link from "next/link"
import { InfoIcon } from "@phosphor-icons/react/dist/ssr"

import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

interface InlineHelpLinkBaseProps {
  /** 사용법 설명. 툴팁 텍스트와 aria-label/title 로 동시에 쓴다 — 라벨 없는 아이콘 단독이라 필수다. */
  label: string
  className?: string
}

interface InlineHelpLinkOpenProps extends InlineHelpLinkBaseProps {
  /** 같은 화면의 도움말 다이얼로그(예: ScreenHelpDialog)를 특정 항목으로 여는 콜백. */
  onOpen: () => void
  href?: never
}

interface InlineHelpLinkNavigateProps extends InlineHelpLinkBaseProps {
  /** 별도 도움말 화면으로 이동할 경로. */
  href: string
  onOpen?: never
}

export type InlineHelpLinkProps = InlineHelpLinkOpenProps | InlineHelpLinkNavigateProps

/**
 * 섹션 제목(h2) 옆에 붙는 인라인 사용법 링크 (#97, EWS v2 `ews-helplink` 이식).
 *
 * `ScreenHelpDialog`((?) 버튼 → 화면 전체 매뉴얼)와 역할이 다르다 — 그쪽은 **화면 단위**,
 * 이쪽은 **지금 보고 있는 섹션 하나**의 사용법만 가리킨다. 항상 둘 중 하나만 준다:
 * `onOpen` 은 같은 화면의 도움말 다이얼로그를 특정 항목으로 열 때, `href` 는 별도
 * 도움말 화면으로 이동할 때 쓴다.
 *
 * 아이콘 단독(장식이 아니라 기능을 가리키는 자리)이라 `label` 을 툴팁·aria-label·title
 * 세 곳 모두에 강제로 채운다. 클릭 표적은 `icon-xs`(24px)로 제목 옆 최소 표적 크기를
 * 만족한다.
 */
function InlineHelpLink({ label, className, ...props }: Readonly<InlineHelpLinkProps>) {
  const icon = <InfoIcon className="size-3.5" weight="bold" aria-hidden />

  const trigger = props.href ? (
    <Button asChild variant="ghost" size="icon-xs" className={className} aria-label={label} title={label}>
      <Link href={props.href}>{icon}</Link>
    </Button>
  ) : (
    <Button
      type="button"
      variant="ghost"
      size="icon-xs"
      className={className}
      aria-label={label}
      title={label}
      onClick={props.onOpen}
    >
      {icon}
    </Button>
  )

  return (
    <Tooltip>
      <TooltipTrigger asChild>{trigger}</TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  )
}

export { InlineHelpLink }
