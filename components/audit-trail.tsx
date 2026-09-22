"use client"

import * as React from "react"
import {
  CaretDownIcon,
  CaretUpIcon,
  DesktopIcon,
  RobotIcon,
  UserIcon,
} from "@phosphor-icons/react/dist/ssr"

import { AuditCodeTag } from "@/components/audit-code-tag"
import { useI18n } from "@/components/i18n-provider"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

/** human = 사람이 직접 수행 · system = 배치/워크플로 같은 비-AI 자동화 · model = AI/ML 모형 판단. */
export type AuditActorType = "human" | "system" | "model"

export interface AuditTrailActor {
  /** 주체 구분. 아이콘·라벨(색 외 두 번째 채널)을 이 값이 결정한다. */
  type: AuditActorType
  /** 주체 이름(담당자명·배치 잡 이름·모형 버전 등). */
  name: React.ReactNode
}

export interface AuditTrailEntry {
  /** React key 용 고유 id. */
  id: string
  /** `YYYY-MM-DD HH:MM:SS` 로 이미 포맷된 시각 문자열. 컴포넌트는 포맷하지 않고 그대로 등폭으로 렌더한다. */
  timestamp: string
  /** 이 항목을 수행한 주체. */
  actor: AuditTrailActor
  /** 수행한 행위(예: "위험등급 조정"). */
  action: React.ReactNode
  /** 행위의 대상(예: "차주 A-1042"). */
  target: React.ReactNode
  /** 근거 감사코드. 주면 `AuditCodeTag`(#83) 로 함께 렌더한다. */
  code?: string
  /** `AuditCodeTag` 에 그대로 전달 — 근거 문서로 이동하는 화면에서만 준다. */
  onNavigate?: (entry: AuditTrailEntry) => void
  /** `AuditCodeTag` 에 그대로 전달. 기본 false. */
  copyable?: boolean
}

export interface AuditTrailProps extends Omit<React.ComponentProps<"div">, "children"> {
  /** 시각 역순(최신이 위) 으로 이미 정렬된 이력. 정렬은 컴포넌트가 하지 않는다. */
  entries: AuditTrailEntry[]
  /** 접힘 상태에서 보여줄 개수. 기본 5 — 그 이하는 "더 보기" 자체를 렌더하지 않는다. */
  visibleCount?: number
}

const ACTOR_ICON: Record<AuditActorType, typeof UserIcon> = {
  human: UserIcon,
  system: DesktopIcon,
  model: RobotIcon,
}

function useActorLabel(type: AuditActorType) {
  const { t } = useI18n()
  const labels: Record<AuditActorType, string> = {
    human: t("chrome.auditTrail.actor.human", "사람"),
    system: t("chrome.auditTrail.actor.system", "시스템"),
    model: t("chrome.auditTrail.actor.model", "AI 모형"),
  }
  return labels[type]
}

function AuditTrailActorTag({ actor }: Readonly<{ actor: AuditTrailActor }>) {
  const label = useActorLabel(actor.type)
  const Icon = ACTOR_ICON[actor.type]

  return (
    <span
      data-slot="audit-trail-actor"
      data-actor-type={actor.type}
      className="inline-flex shrink-0 items-center gap-1 rounded-full border border-border bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground"
    >
      <Icon size={12} weight="bold" aria-hidden />
      {label}
      {actor.name ? <span className="text-foreground">{actor.name}</span> : null}
    </span>
  )
}

function AuditTrailRow({ entry, hidden }: Readonly<{ entry: AuditTrailEntry; hidden: boolean }>) {
  return (
    <li
      data-slot="audit-trail-row"
      className={cn(
        "flex flex-col gap-1.5 border-b border-border py-3 last:border-b-0",
        hidden && "hidden print:block"
      )}
    >
      <div className="flex flex-wrap items-center gap-2">
        <span className="shrink-0 font-mono text-xs tabular-nums text-muted-foreground">{entry.timestamp}</span>
        <AuditTrailActorTag actor={entry.actor} />
        {entry.code ? (
          <AuditCodeTag
            code={entry.code}
            onNavigate={entry.onNavigate ? () => entry.onNavigate?.(entry) : undefined}
            copyable={entry.copyable}
            className="ml-auto"
          />
        ) : null}
      </div>
      <p className="text-sm">
        <span className="font-medium">{entry.action}</span>
        <span className="text-muted-foreground"> — {entry.target}</span>
      </p>
    </li>
  )
}

/**
 * 감사 추적 이력(#106) — 판단 근거마다 자료 출처·수집 시각·처리 주체·감사코드가 붙는
 * S-03 의 "진단 근거 및 감사 추적" 섹션을 표준화한다.
 *
 * `timeline` 패턴과의 경계: `timeline` 은 범용 시간순 목록(아이콘 노드 + 제목/설명)이라
 * 출처·주체·코드라는 구조를 갖지 않는다. 이 컴포넌트는 **감사 업무 전용**으로 필드가
 * 고정되어 있다 — 시각(고정폭) + 주체(사람/시스템/모형, 아이콘+라벨) + 행위 + 대상 +
 * 감사코드(`AuditCodeTag`, #83 재사용). 일반 활동 로그에는 `timeline` 을 쓴다.
 *
 * 주체 구분은 색 하나로 두지 않는다 — AI 판단과 사람 확인이 뒤섞인 화면에서 색맹
 * 사용자도 구분할 수 있도록 아이콘(User/Desktop/Robot)과 라벨 문구를 항상 같이 낸다.
 *
 * 긴 이력은 `visibleCount`(기본 5) 를 넘는 항목을 화면에서 `hidden` 으로 접지만,
 * DOM 에서는 지우지 않는다 — 인쇄(`print:block`)에서는 접힘 상태와 무관하게 전부
 * 펼쳐진다. 시각은 컴포넌트 내부에서 `new Date()` 를 읽지 않고 이미 포맷된 문자열을
 * 그대로 받는다(hydration 불일치 방지).
 */
function AuditTrail({ className, entries, visibleCount = 5, ...props }: Readonly<AuditTrailProps>) {
  const { t } = useI18n()
  const [expanded, setExpanded] = React.useState(false)
  const hasOverflow = entries.length > visibleCount

  return (
    <div data-slot="audit-trail" className={cn("flex flex-col", className)} {...props}>
      <ol className="flex flex-col">
        {entries.map((entry, index) => {
          const hidden = hasOverflow && !expanded && index >= visibleCount
          return <AuditTrailRow key={entry.id} entry={entry} hidden={hidden} />
        })}
      </ol>
      {hasOverflow ? (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setExpanded((v) => !v)}
          className="mt-1 self-start text-muted-foreground print:hidden"
        >
          {expanded ? (
            <>
              <CaretUpIcon size={14} aria-hidden />
              {t("chrome.auditTrail.collapse", "접기")}
            </>
          ) : (
            <>
              <CaretDownIcon size={14} aria-hidden />
              {t("chrome.auditTrail.showMore", "더 보기 ({count}건)", { count: entries.length - visibleCount })}
            </>
          )}
        </Button>
      ) : null}
    </div>
  )
}

export { AuditTrail }
