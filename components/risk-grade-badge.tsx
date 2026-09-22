import * as React from "react"

import { badgeVariants } from "@/components/ui/badge"
import { riskTintBackground, type RiskLevel } from "@/lib/risk-tokens"
import { cn } from "@/lib/utils"

/** solid = 값 토큰으로 채우고 전경 토큰으로 쓴다 · tint = 14% 틴트 면에 값 토큰으로 쓴다. */
export type RiskGradeBadgeFill = "tint" | "solid"

export interface RiskGradeBadgeProps extends Omit<React.ComponentProps<"span">, "children"> {
  /** 위험 등급. 값은 `--risk-<level>` 토큰이 정한다. */
  level: RiskLevel
  /**
   * 등급 표기 문구(`경보`·`주의`…). 색 말고 반드시 있어야 하는 두 번째 채널이라
   * 필수다 — 등급 색은 hue 하나로만 구분되어 색각 이상 사용자에게 전달되지 않는다.
   * 문구를 컴포넌트가 고정하지 않는 것은 등급 이름이 도메인마다 다르기 때문이다.
   */
  label: React.ReactNode
  /** 함께 표기할 등급 번호. 주면 `Tier 4 경보`, 없으면 `경보` 로 렌더한다. */
  tier?: number
  /** 등급 번호 앞에 붙는 말. 로케일에 따라 `단계` 등으로 바꾼다. */
  tierPrefix?: string
  /** 기본 tint. 이미 틴트된 표면(accent·secondary) 위에서는 solid 를 쓴다. */
  fill?: RiskGradeBadgeFill
}

/**
 * 위험 등급 배지 (#82) — 순서 있는 심각도 4단을 `--risk-*` 토큰(#81)으로만 칠한다.
 *
 * `badge-extended` 의 success/warning/danger 3단과 바꿔 쓰지 않는다. 그쪽은 결과
 * 상태(성공·실패)이고 이쪽은 **순서 있는 등급**이라, 4단을 3단에 접어 넣으면
 * 관찰과 주의가 같은 색이 된다.
 *
 * 색은 Tailwind 유틸리티(`bg-risk-severe`)가 아니라 인라인 `style` 의
 * `var(--risk-*)` 로 넣는다. 프로필 설치는 소비 프로젝트의 `:root`/`.dark` 에
 * **값만** 넣기 때문에, 유틸리티를 쓰면 소비측 `globals.css` 에
 * `--color-risk-*` 매핑을 따로 적지 않는 한 색이 통째로 빠진다.
 *
 * `fill="tint"` 의 본문 대비 4.5:1 은 `lib/risk-tokens.ts` 의
 * `RISK_TINT_SAFE_SURFACES`(background·card·muted) 위에서만 약속된다 — accent·secondary 처럼
 * 이미 틴트된 표면 위에서는 `fill="solid"` 를 쓴다.
 */
function RiskGradeBadge({
  className,
  level,
  label,
  tier,
  tierPrefix = "Tier",
  fill = "tint",
  style,
  ...props
}: Readonly<RiskGradeBadgeProps>) {
  const tinted = fill === "tint"

  return (
    <span
      data-slot="badge"
      data-risk-level={level}
      data-fill={fill}
      className={cn(badgeVariants({ variant: "outline" }), "border-transparent", className)}
      style={{
        backgroundColor: tinted ? riskTintBackground(level) : `var(--risk-${level})`,
        color: tinted ? `var(--risk-${level})` : `var(--risk-${level}-foreground)`,
        ...style,
      }}
      {...props}
    >
      {tier === undefined ? null : (
        <span className="font-normal opacity-80">
          {tierPrefix} {tier}
        </span>
      )}
      {label}
    </span>
  )
}

export { RiskGradeBadge }
