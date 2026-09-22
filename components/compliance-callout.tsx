import * as React from "react"
import { InfoIcon, WarningCircleIcon, WarningIcon } from "@phosphor-icons/react/dist/ssr"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

/**
 * 콜아웃 심각도. `notice`(정보) → `warning`(주의) → `critical`(경보) 순서 있는 3단이다.
 *
 * `--risk-*`(#81) 대신 `--warning`/`--destructive` 를 쓴다 — risk-* 는 신용위험처럼
 * **순서 있는 등급**을 매기는 도메인 토큰이라 4단 고정이고, 프리셋 27키(`@theme`)
 * 밖에 있어 소비 프로젝트에서 인라인 `style={{ color: "var(--risk-*)" }}` 로만
 * 칠할 수 있다(`components/risk-grade-badge.tsx` 참고). compliance-callout 은
 * 신용등급과 무관한 임의 업무 규칙 안내이고, warning/destructive 는 이미
 * `@theme` 매핑을 거쳐 `text-warning`/`border-warning`/`bg-warning` 유틸리티로
 * 어떤 doksam 프로젝트에서도 별도 배선 없이 바로 쓸 수 있다(#88 설계 판단,
 * `app/patterns/pipeline` 등 기존 사용례).
 */
export type ComplianceCalloutSeverity = "notice" | "warning" | "critical"

const SEVERITY_ICON: Record<ComplianceCalloutSeverity, React.ElementType> = {
  notice: InfoIcon,
  warning: WarningIcon,
  critical: WarningCircleIcon,
}

/** Alert 변형은 default/destructive 2종뿐이라 warning 은 색 유틸리티로 얹는다. */
const SEVERITY_ALERT_VARIANT: Record<ComplianceCalloutSeverity, "default" | "destructive"> = {
  notice: "default",
  warning: "default",
  critical: "destructive",
}

const SEVERITY_CLASSNAME: Record<ComplianceCalloutSeverity, string> = {
  notice: "",
  warning: "border-warning/50 text-warning *:data-[slot=alert-description]:text-warning/90 *:[svg]:text-current",
  critical: "",
}

export interface ComplianceCalloutAction {
  label: string
  onClick?: () => void
  href?: string
  variant?: React.ComponentProps<typeof Button>["variant"]
}

export interface ComplianceCalloutProps extends Omit<React.ComponentProps<"div">, "children"> {
  /** 콜아웃 심각도. 색 외에 severityLabel·아이콘이 함께 두 번째 채널을 이룬다. */
  severity: ComplianceCalloutSeverity
  /**
   * 심각도의 사람이 읽는 문구(`경보`·`주의`·`안내`). 색만으로 심각도를 전달하지
   * 않기 위한 필수 두 번째 채널이다 — 문구는 도메인마다 달라 컴포넌트가 고정하지 않는다.
   */
  severityLabel: string
  /**
   * 근거 규정 번호(`여신감리 준수 지침 제2024-42호`). 생략 가능하다 — 모든 안내가
   * 규정 근거를 갖지는 않는다.
   */
  regulationRef?: string
  /** 이 안내가 적용되는 대상 조건(`[경보] 등급 차주는`). */
  condition: string
  /** 대상이 취해야 하는 요구 행위(`조치방안을 수립하여 센터장 결재를 득하여야 합니다`). */
  requirement: string
  /** 기한 문구(`제출 기한 D-3 · 2026-09-25`). 없으면 표시하지 않는다. */
  dueLabel?: string
  /** 우측/하단 액션 버튼. 첫 번째가 주 액션이다. */
  actions?: ComplianceCalloutAction[]
}

/**
 * 규정 콜아웃 (#88) — 근거 규정 + 대상 조건 + 요구 행위 + 기한 + 액션을 한 덩어리로
 * 보여주는 업무 규칙 안내다. `alert` 프리미티브 위에 조합한다.
 *
 * `/patterns/state` 의 에러 Alert 와 다르다 — 그쪽은 비동기 실패를 알리고 재시도로
 * 복구하지만, 이쪽은 상태가 아니라 **지켜야 할 규정**을 안내하고 조치 버튼은
 * 재시도가 아니라 업무 액션(결재 상신 등)으로 이어진다.
 */
function ComplianceCallout({
  className,
  severity,
  severityLabel,
  regulationRef,
  condition,
  requirement,
  dueLabel,
  actions,
  ...props
}: Readonly<ComplianceCalloutProps>) {
  const Icon = SEVERITY_ICON[severity]

  return (
    <Alert
      data-slot="compliance-callout"
      data-severity={severity}
      variant={SEVERITY_ALERT_VARIANT[severity]}
      className={cn(SEVERITY_CLASSNAME[severity], className)}
      {...props}
    >
      <Icon size={16} weight="regular" />
      <AlertTitle className="flex flex-wrap items-center gap-1.5">
        <Badge variant="outline" className="border-current text-current">
          {severityLabel}
        </Badge>
        {regulationRef ? <span className="font-mono text-xs text-muted-foreground">{regulationRef}</span> : null}
      </AlertTitle>
      <AlertDescription>
        <p>
          <span className="font-medium text-foreground">{condition}</span> {requirement}
        </p>
        {dueLabel ? <p className="mt-1 text-xs font-medium">{dueLabel}</p> : null}
      </AlertDescription>
      {actions && actions.length > 0 ? (
        <div className="col-start-2 mt-2 flex flex-wrap gap-2">
          {actions.map((action, index) => (
            <Button
              key={action.label}
              size="sm"
              variant={action.variant ?? (index === 0 ? "outline" : "ghost")}
              onClick={action.onClick}
              asChild={Boolean(action.href)}
            >
              {action.href ? <a href={action.href}>{action.label}</a> : action.label}
            </Button>
          ))}
        </div>
      ) : null}
    </Alert>
  )
}

export { ComplianceCallout }
