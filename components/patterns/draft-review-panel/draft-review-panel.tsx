"use client"

import * as React from "react"
import { CheckIcon, PencilSimpleIcon, RobotIcon, UserIcon } from "@phosphor-icons/react/dist/ssr"
import type { Icon } from "@phosphor-icons/react"

import { BadgeExtended } from "@/components/badge-extended"
import { SectionPanelHeader } from "@/components/section-panel-header"
import { StickyActionbar, type StickyActionbarAction } from "@/components/sticky-actionbar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"

/**
 * 섹션 검토 상태 3단. 순서 있는 위험 등급(`--risk-*`)이 아니라 진행 단계라
 * badge-extended 의 success/warning 매핑(`final`→success, `in_review`→warning)을
 * 쓴다. `draft` 는 아직 검토 전이라 중립(outline)이다.
 */
export type DraftReviewSectionStatus = "draft" | "in_review" | "final"

export interface DraftReviewSection {
  /** 문서 안에서 안정적인 식별자(React key 및 내부 상태 키로 쓴다). */
  key: string
  title: React.ReactNode
  /** 섹션 아이콘. 생략하면 기본 연필 아이콘을 쓴다. */
  icon?: Icon
  status: DraftReviewSectionStatus
  /** 상태의 사람이 읽는 문구. 색만으로 상태를 전달하지 않기 위한 필수 두 번째 채널이다. */
  statusLabel: string
  /** AI 가 생성한 초안 원문. 사람이 편집을 시작하기 전의 기준값이다. */
  content: string
}

export interface DraftReviewDocument {
  /** 문서 종류 탭의 식별자·React key. */
  key: string
  /** 탭에 표시할 문서 종류 라벨(`여신조사보고서` 등). */
  label: string
  sections: DraftReviewSection[]
}

interface SectionState {
  value: string
  editing: boolean
  /** true 가 되면 되돌리지 않는다 — 한 번이라도 고친 섹션은 "AI 초안"으로 되돌아가지 않는다(감사 추적 관점). */
  edited: boolean
}

type SectionStateMap = Record<string, SectionState>

function compoundKey(documentKey: string, sectionKey: string): string {
  return `${documentKey}::${sectionKey}`
}

function buildInitialState(documents: readonly DraftReviewDocument[]): SectionStateMap {
  const map: SectionStateMap = {}
  for (const doc of documents) {
    for (const section of doc.sections) {
      map[compoundKey(doc.key, section.key)] = { value: section.content, editing: false, edited: false }
    }
  }
  return map
}

const STATUS_BADGE: Record<DraftReviewSectionStatus, (label: string) => React.ReactNode> = {
  draft: (label) => <Badge variant="outline">{label}</Badge>,
  in_review: (label) => <BadgeExtended variant="warning">{label}</BadgeExtended>,
  final: (label) => <BadgeExtended variant="success">{label}</BadgeExtended>,
}

export interface DraftReviewPanelProps {
  /** 문서 종류별 섹션 묶음. 탭 하나가 문서 하나에 대응한다. */
  documents: readonly DraftReviewDocument[]
  /** 활성 문서 탭의 `key`. 주지 않으면 내부 상태로 첫 문서를 기본 선택한다. */
  activeDocument?: string
  onDocumentChange?: (key: string) => void
  /** 출력(내려받기·인쇄 등) 등 화면의 주 액션. `sticky-actionbar`(#88) 를 그대로 재사용한다. */
  primaryAction: StickyActionbarAction
  secondaryAction?: StickyActionbarAction
  editLabel?: string
  doneLabel?: string
  aiSourceLabel?: string
  humanEditedLabel?: string
  /** 섹션 값이 바뀔 때마다 알림(저장·감사로그 연동 등). 상태 자체는 컴포넌트가 소유한다. */
  onSectionChange?: (documentKey: string, sectionKey: string, value: string) => void
  className?: string
}

/**
 * 섹션형 초안 검토·편집 패널 (#104) — LLM 이 섹션 단위로 생성한 산출물을 사람이
 * 검토·가필해 확정하는 화면의 공통형이다. 문서 종류 전환은 탭, 섹션 편집은
 * 인라인 읽기↔편집 토글이다.
 *
 * **편집 상태의 소유권**: 각 섹션의 값·편집 여부·수정 여부를 `documentKey::sectionKey`
 * 로 키를 합친 하나의 map 으로 이 컴포넌트가 직접 들고 있는다. 문서 탭을 전환하면
 * Radix `Tabs` 가 비활성 문서의 DOM 을 걷어내지만, 그 값은 DOM 이 아니라 이 map 에
 * 있으므로 다시 탭을 눌러도 그대로 복원된다. 섹션도 접었다 펴는 아코디언이 아니라
 * 모든 섹션을 항상 렌더한 채 읽기/편집 모드만 토글하므로, 다른 섹션을 편집한다고
 * 해서 앞서 고치던 섹션이 사라지지 않는다.
 *
 * **AI/사람 구분 표기(#104 설계 판단)**: 문장·단어 단위 diff 는 하지 않는다 — LLM
 * 산출물은 문장을 재구성하며 수정되기 일쑤라 문자 단위 대조가 근거 없는 강조를
 * 만든다. 대신 **섹션 단위**로 한 번이라도 고치면 그 섹션 전체를 "사람 수정"으로
 * 표기하고 되돌리지 않는다 — 감사 추적에서 "이 섹션은 사람이 검토·개입했다"는
 * 사실만 확실하면 충분하고, 그 이상의 세분화는 별도 이슈(감사 추적)의 몫이다.
 */
function DraftReviewPanel({
  documents,
  activeDocument,
  onDocumentChange,
  primaryAction,
  secondaryAction,
  editLabel = "편집",
  doneLabel = "완료",
  aiSourceLabel = "AI 초안",
  humanEditedLabel = "사람 수정",
  onSectionChange,
  className,
}: Readonly<DraftReviewPanelProps>) {
  const [sectionState, setSectionState] = React.useState<SectionStateMap>(() => buildInitialState(documents))
  const [internalActiveDocument, setInternalActiveDocument] = React.useState<string | undefined>(
    () => documents[0]?.key,
  )

  const currentDocumentKey = activeDocument ?? internalActiveDocument

  function handleDocumentChange(key: string) {
    setInternalActiveDocument(key)
    onDocumentChange?.(key)
  }

  function updateSection(documentKey: string, sectionKey: string, patch: Partial<SectionState>) {
    setSectionState((prev) => {
      const key = compoundKey(documentKey, sectionKey)
      const base = prev[key] ?? { value: "", editing: false, edited: false }
      return { ...prev, [key]: { ...base, ...patch } }
    })
  }

  function renderSection(documentKey: string, section: DraftReviewSection) {
    const key = compoundKey(documentKey, section.key)
    const state: SectionState = sectionState[key] ?? {
      value: section.content,
      editing: false,
      edited: false,
    }
    const SectionIcon = section.icon ?? PencilSimpleIcon

    return (
      <div
        key={section.key}
        data-slot="draft-review-section"
        data-status={section.status}
        className="rounded-lg border border-border bg-card"
      >
        <SectionPanelHeader
          icon={SectionIcon}
          title={section.title}
          meta={
            <div className="flex items-center gap-1.5">
              {STATUS_BADGE[section.status](section.statusLabel)}
              <Badge variant="ghost" className="gap-1">
                {state.edited ? <UserIcon size={12} weight="regular" /> : <RobotIcon size={12} weight="regular" />}
                {state.edited ? humanEditedLabel : aiSourceLabel}
              </Badge>
            </div>
          }
          actions={
            <Button
              type="button"
              size="sm"
              variant={state.editing ? "default" : "outline"}
              onClick={() => updateSection(documentKey, section.key, { editing: !state.editing })}
            >
              {state.editing ? (
                <>
                  <CheckIcon size={14} weight="bold" /> {doneLabel}
                </>
              ) : (
                <>
                  <PencilSimpleIcon size={14} weight="regular" /> {editLabel}
                </>
              )}
            </Button>
          }
        />
        <div className="px-4 pb-4">
          {state.editing ? (
            <Textarea
              aria-label={typeof section.title === "string" ? section.title : section.key}
              value={state.value}
              onChange={(event) => {
                const value = event.target.value
                updateSection(documentKey, section.key, {
                  value,
                  edited: state.edited || value !== section.content,
                })
                onSectionChange?.(documentKey, section.key, value)
              }}
              rows={4}
            />
          ) : (
            <p className="whitespace-pre-wrap text-sm text-foreground">{state.value}</p>
          )}
        </div>
      </div>
    )
  }

  return (
    <div data-slot="draft-review-panel" className={cn("flex flex-col gap-4", className)}>
      <Tabs value={currentDocumentKey} onValueChange={handleDocumentChange}>
        <TabsList>
          {documents.map((doc) => (
            <TabsTrigger key={doc.key} value={doc.key}>
              {doc.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {documents.map((doc) => (
          <TabsContent key={doc.key} value={doc.key} className="flex flex-col gap-4">
            {doc.sections.map((section) => renderSection(doc.key, section))}
          </TabsContent>
        ))}
      </Tabs>

      <StickyActionbar primaryAction={primaryAction} secondaryAction={secondaryAction} />
    </div>
  )
}

export { DraftReviewPanel }
