import * as React from "react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { RiskGradeBadge } from "@/components/risk-grade-badge"
import type { RiskLevel } from "@/lib/risk-tokens"
import { cn } from "@/lib/utils"

/** 대안 순위. 모형이 계산한 값이며, null 이면 모형이 순위를 매기지 못했다는 뜻이다. */
export type AlternativeRank = number | null

/** 순위가 매겨진 대안 한 건. */
export interface RankedAlternative {
  /** 채택 액션·이력 기록에 쓰는 고유 식별자. */
  id: string
  /** 모형이 계산한 순위. 1이 1순위다. null 이면 순위 없음(대안 산출 실패 등)으로 표시한다. */
  rank: AlternativeRank
  /** true면 같은 rank 값을 가진 다른 대안과 동점임을 표시한다. */
  tied?: boolean
  /** 대안 제목. */
  label: string
  /** 이 대안을 뒷받침하는 근거 요약. */
  evidenceSummary: string
  /** 이 대안을 실행하기 위한 조건. */
  condition: string
  /** 함께 표시할 위험 등급(있을 때만). `--risk-*` 토큰으로만 칠해진다. */
  riskLevel?: RiskLevel
  /** riskLevel의 사람이 읽는 문구. riskLevel이 있으면 필수다(색만으로 등급을 전달하지 않는다). */
  riskLabel?: string
  /** true면 채택할 수 없다. */
  disabled?: boolean
  /** 채택 불가인 이유. disabled일 때 함께 제공한다. */
  disabledReason?: string
}

/** 대안 채택 기록 한 건. 새 채택이 있어도 이전 기록은 지워지지 않는다(감사 이력). */
export interface AdoptionRecord {
  /** 기록 자체의 고유 식별자. */
  id: string
  /** 채택된 RankedAlternative id. */
  alternativeId: string
  /** 기록 시점의 대안 제목(원본이 나중에 바뀌어도 기록은 그대로 남도록 스냅샷한다). */
  alternativeLabel: string
  /** 채택 시각. 사람이 읽는 형태로 미리 포맷해 전달한다(컴포넌트가 직접 Date를 읽지 않는다). */
  adoptedAt: string
  /** 채택 사유·메모. */
  note?: string
}

/**
 * 화면에 보이는 고정 문구 — 전부 한국어 기본값을 갖고, `labels` 로 일부만 덮을 수
 * 있다(부분 지정). 카탈로그 컴포넌트는 소비 프로젝트의 도메인 용어("채택"→"승인")와
 * 다국어를 모르므로 문구를 내부에 가둬 두지 않는다.
 */
export interface RankedAlternativesLabels {
  /** `rank: null` 인 대안의 순위 배지 문구. */
  noRank: string
  /** 순위 배지 문구. `{rank}` 가 순위 숫자로 치환된다. */
  rank: string
  /** 동점(`tied`) 대안의 순위 배지 문구. `{rank}` 가 순위 숫자로 치환된다. */
  rankTied: string
  /** 현재 채택된 대안에 붙는 배지 문구. */
  adopted: string
  /** 채택 버튼 문구. */
  adopt: string
  /** 이미 채택된 대안의 버튼 문구(다시 누르면 재채택). */
  readopt: string
  /** 채택 이력 카드의 제목. */
  historyTitle: string
  /** 채택 이력 카드의 설명 — 이전 기록이 지워지지 않는다는 안내. */
  historyDescription: string
}

export const RANKED_ALTERNATIVES_DEFAULT_LABELS: RankedAlternativesLabels = {
  noRank: "순위 없음",
  rank: "{rank}순위",
  rankTied: "{rank}순위 · 동점",
  adopted: "채택됨",
  adopt: "채택",
  readopt: "재채택",
  historyTitle: "채택 이력",
  historyDescription: "채택을 새로 해도 이전 기록은 지워지지 않습니다.",
}

export interface RankedAlternativesListProps
  extends Omit<React.ComponentProps<"div">, "children" | "title"> {
  /** 화면 맥락을 설명하는 제목. */
  title: React.ReactNode
  /** 제목 아래에 표시할 상황 요약. */
  description?: React.ReactNode
  /** 순위가 매겨진 대안 목록. rank 오름차순으로 정렬해 전달한다(컴포넌트는 재정렬하지 않는다). */
  alternatives: RankedAlternative[]
  /** 현재 강조할 대안 id(가장 최근 채택). */
  adoptedId?: string
  /** 채택 이력. 최신이 먼저 오도록 호출부가 정렬해 전달한다. */
  history?: AdoptionRecord[]
  /** 화면 문구 덮어쓰기. 필요한 키만 골라 주면 나머지는 한국어 기본값을 쓴다. */
  labels?: Partial<RankedAlternativesLabels>
  /** 대안을 채택했을 때 id와 원본 대안을 전달한다. 이력 기록·저장은 호출부가 소유한다. */
  onAdopt?: (id: string, alternative: RankedAlternative) => void
}

function rankBadgeLabel(alternative: RankedAlternative, labels: RankedAlternativesLabels): string {
  if (alternative.rank === null) return labels.noRank
  const template = alternative.tied ? labels.rankTied : labels.rank
  return template.replace("{rank}", String(alternative.rank))
}

/**
 * RankedAlternativesList는 서열이 있는 대안 후보를 순위·근거·실행 조건과 함께 보여주고,
 * 사람이 채택한 대안만 상위로 전달한다. `evidence-decision-panel`과 달리 단일 선택을
 * 상호배타로 강제하지 않는다 — 채택해도 나머지 대안은 목록에 남고, 과거 채택은
 * `history`로 계속 누적돼 채택 이력 자체가 판단 기록이 된다(S-08 환류 로그로 이어진다).
 * 순위는 장식이 아니라 모형이 계산한 값이므로 동점(`tied`)과 순위 없음(`rank: null`)을
 * 표현할 수 있어야 하고, 채택 순서를 모델링하지 않는 `evidence-decision-panel`의
 * `RadioGroup` 단일 선택 UI로는 그 두 상태를 감출 수 없다.
 *
 * 화면 문구는 전부 `labels` 로 열려 있다(부분 지정, 한국어 기본값) — 순위 배지·채택
 * 배지·버튼·이력 안내 어느 것도 컴포넌트 안에 고정하지 않는다.
 */
function RankedAlternativesList({
  title,
  description,
  alternatives,
  adoptedId,
  history,
  labels: labelOverrides,
  onAdopt,
  className,
  ...props
}: Readonly<RankedAlternativesListProps>) {
  const headingId = React.useId()
  const labels = React.useMemo(
    () => ({ ...RANKED_ALTERNATIVES_DEFAULT_LABELS, ...labelOverrides }),
    [labelOverrides],
  )

  return (
    <div data-slot="ranked-alternatives-list" className={cn("flex flex-col gap-4", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle id={headingId}>{title}</CardTitle>
          {description ? <CardDescription>{description}</CardDescription> : null}
        </CardHeader>
        <CardContent>
          <ol aria-labelledby={headingId} className="flex flex-col gap-3">
            {alternatives.map((alternative) => {
              const isAdopted = adoptedId === alternative.id
              return (
                <li
                  key={alternative.id}
                  className={cn(
                    "rounded-lg border border-border p-3",
                    isAdopted && "border-primary bg-primary/5 ring-1 ring-primary/30",
                    alternative.disabled && "opacity-60",
                  )}
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="flex min-w-0 flex-wrap items-center gap-2">
                      <Badge variant={alternative.rank === null ? "outline" : "secondary"}>
                        {rankBadgeLabel(alternative, labels)}
                      </Badge>
                      <span className="text-sm font-medium">{alternative.label}</span>
                      {alternative.riskLevel && alternative.riskLabel ? (
                        <RiskGradeBadge level={alternative.riskLevel} label={alternative.riskLabel} />
                      ) : null}
                      {isAdopted ? <Badge variant="default">{labels.adopted}</Badge> : null}
                    </div>
                    <Button
                      type="button"
                      size="sm"
                      variant={isAdopted ? "secondary" : "outline"}
                      disabled={alternative.disabled}
                      onClick={() => onAdopt?.(alternative.id, alternative)}
                    >
                      {isAdopted ? labels.readopt : labels.adopt}
                    </Button>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">{alternative.evidenceSummary}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{alternative.condition}</p>
                  {alternative.disabled && alternative.disabledReason ? (
                    <p className="mt-2 text-xs text-destructive">{alternative.disabledReason}</p>
                  ) : null}
                </li>
              )
            })}
          </ol>
        </CardContent>
      </Card>

      {history && history.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">{labels.historyTitle}</CardTitle>
            <CardDescription>{labels.historyDescription}</CardDescription>
          </CardHeader>
          <CardContent>
            <ol className="flex flex-col gap-2">
              {history.map((record) => (
                <li key={record.id} className="flex flex-wrap items-baseline justify-between gap-2 text-sm">
                  <span className="min-w-0">
                    <span className="font-medium">{record.alternativeLabel}</span>
                    {record.note ? <span className="text-muted-foreground"> — {record.note}</span> : null}
                  </span>
                  <span className="shrink-0 tabular-nums text-xs text-muted-foreground">{record.adoptedAt}</span>
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>
      ) : null}
    </div>
  )
}

export { RankedAlternativesList }
