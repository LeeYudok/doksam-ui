import * as React from "react"

import { formatBizNo } from "@/lib/bizinfo/format-biz-no"
import { cn } from "@/lib/utils"

/** compact = 테이블 셀 한 줄에 가깝게, default = 상세 헤더용 여백. */
export type PartyIdentityCellDensity = "compact" | "default"

export interface PartyIdentityCellProps extends Omit<React.ComponentProps<"div">, "children"> {
  /** 업체명(1행, 강조). */
  name: React.ReactNode
  /** 업종(2행 첫 항목). 생략하면 2행에서 빠진다. */
  industry?: React.ReactNode
  /** 법인구분(개인·법인 등, 2행 두 번째 항목). 생략하면 2행에서 빠진다. */
  corpType?: React.ReactNode
  /** 사업자등록번호 원본(하이픈 없는 10자리 등). `formatBizNo`(#8)로만 포맷한다 — 이 컴포넌트는 포맷 로직을 다시 만들지 않는다. */
  bizNo?: string | null
  /**
   * 사업자번호 마스킹 여부. 기본 true(뒤 5자리 `*****`) — 목록·요약 화면의 기본값이다.
   * 원본 전체 노출이 필요한 화면(상세·권한 있는 사용자)에서만 false 로 끈다.
   * 저장·전송 값에는 영향이 없다 — 이 prop 은 화면 표시만 바꾼다.
   */
  masked?: boolean
  /** compact 는 테이블 셀, default 는 상세 헤더처럼 여백이 있는 자리에 쓴다. */
  density?: PartyIdentityCellDensity
}

/** `104-81-12345` → `104-81-*****`. 포맷이 10자리 표준형이 아니면(짧은 값 등) 그대로 둔다. */
function maskFormattedBizNo(formatted: string): string {
  return formatted.replace(/^(\d{3}-\d{2}-)\d{5}$/, "$1*****")
}

/**
 * 차주 식별 2줄 셀(#83) — 9화면에서 31회 반복되던 `ews-who` 패턴을 컴포넌트화한다.
 *
 * 1행 업체명 / 2행 업종 · 법인구분 · (마스킹) 사업자번호. 사업자번호 포맷은
 * `formatBizNo`(#8, `lib/bizinfo/format-biz-no.ts`)를 그대로 호출해서 쓴다 — 포맷
 * 로직을 이 컴포넌트가 다시 구현하지 않는다. 마스킹은 표시 전용이며 `masked` prop
 * 으로 끄고 켠다.
 */
function PartyIdentityCell({
  className,
  name,
  industry,
  corpType,
  bizNo,
  masked = true,
  density = "default",
  ...props
}: Readonly<PartyIdentityCellProps>) {
  const formattedBizNo = bizNo ? formatFinalBizNo(bizNo, masked) : null

  const metaParts = [industry, corpType, formattedBizNo].filter(
    (part): part is React.ReactNode => part !== null && part !== undefined && part !== ""
  )

  return (
    <div
      data-slot="party-identity-cell"
      data-density={density}
      className={cn("flex min-w-0 flex-col", density === "compact" ? "gap-0" : "gap-0.5", className)}
      {...props}
    >
      <span className="truncate font-medium text-foreground">{name}</span>
      {metaParts.length > 0 && (
        <span className="flex min-w-0 items-center gap-1 truncate text-xs text-muted-foreground">
          {metaParts.map((part, index) => (
            <React.Fragment key={index}>
              {index > 0 && <span aria-hidden="true">·</span>}
              <span className={cn(index === metaParts.length - 1 && formattedBizNo === part && "font-mono")}>
                {part}
              </span>
            </React.Fragment>
          ))}
        </span>
      )}
    </div>
  )
}

function formatFinalBizNo(bizNo: string, masked: boolean): string {
  const formatted = formatBizNo(bizNo)
  return masked ? maskFormattedBizNo(formatted) : formatted
}

export { PartyIdentityCell }
