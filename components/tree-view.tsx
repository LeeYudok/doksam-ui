"use client"

import * as React from "react"
import { CaretRightIcon, FileIcon, FolderIcon, FolderOpenIcon } from "@phosphor-icons/react/dist/ssr"

import { cn } from "@/lib/utils"

export interface TreeNode {
  id: string
  label: string
  /** 커스텀 아이콘. 없으면 자식 유무에 따라 폴더/파일 아이콘이 기본으로 붙는다. */
  icon?: React.ReactNode
  children?: TreeNode[]
}

export interface TreeViewProps {
  nodes: TreeNode[]
  /** 선택된 노드 id. 전달하면 selection이 controlled로 동작한다. */
  selectedId?: string
  defaultSelectedId?: string
  onSelectedIdChange?: (id: string) => void
  /** 초기에 펼쳐둘 노드 id 목록. */
  defaultExpandedIds?: string[]
  className?: string
  "aria-label"?: string
}

interface FlatItem {
  node: TreeNode
  depth: number
  parentId: string | null
  hasChildren: boolean
}

function flattenVisible(
  nodes: TreeNode[],
  expandedIds: Set<string>,
  depth = 0,
  parentId: string | null = null
): FlatItem[] {
  const result: FlatItem[] = []
  for (const node of nodes) {
    const hasChildren = Boolean(node.children && node.children.length > 0)
    result.push({ node, depth, parentId, hasChildren })
    if (hasChildren && expandedIds.has(node.id)) {
      result.push(...flattenVisible(node.children as TreeNode[], expandedIds, depth + 1, node.id))
    }
  }
  return result
}

/** 키보드 입력이 만들어내는 트리 조작. 순수 계산과 상태 반영을 분리한다. */
type TreeKeyAction =
  | { type: "focus"; id: string }
  | { type: "expand"; id: string; expand: boolean }
  | { type: "select"; id: string; toggleExpand: boolean }

const HANDLED_KEYS = new Set(["ArrowDown", "ArrowUp", "ArrowRight", "ArrowLeft", "Home", "End", "Enter", " "])

function focusAction(item: FlatItem | undefined): TreeKeyAction | null {
  return item ? { type: "focus", id: item.node.id } : null
}

function arrowRightAction(item: FlatItem, next: FlatItem | undefined, expanded: boolean): TreeKeyAction | null {
  if (!item.hasChildren) return null
  if (!expanded) return { type: "expand", id: item.node.id, expand: true }
  return focusAction(next)
}

function arrowLeftAction(item: FlatItem, expanded: boolean): TreeKeyAction | null {
  if (item.hasChildren && expanded) return { type: "expand", id: item.node.id, expand: false }
  return item.parentId ? { type: "focus", id: item.parentId } : null
}

function resolveTreeKeyAction(
  key: string,
  item: FlatItem,
  flat: FlatItem[],
  index: number,
  expanded: boolean
): TreeKeyAction | null {
  switch (key) {
    case "ArrowDown":
      return focusAction(flat[index + 1])
    case "ArrowUp":
      return focusAction(flat[index - 1])
    case "ArrowRight":
      return arrowRightAction(item, flat[index + 1], expanded)
    case "ArrowLeft":
      return arrowLeftAction(item, expanded)
    case "Home":
      return focusAction(flat[0])
    case "End":
      return focusAction(flat[flat.length - 1])
    default:
      return { type: "select", id: item.node.id, toggleExpand: item.hasChildren }
  }
}

/**
 * 범용 접이식 트리 뷰 — json-tree(JSON 전용)와 별개로, 파일탐색기 형태의
 * 임의 노드 트리(id/label/icon?/children?)를 다룬다(#36). 표시되는 노드만
 * 평탄화해 role="tree"/"treeitem" + roving tabindex로 키보드 이동을 구현한다.
 *
 * 키보드: ↑↓ 로 형제/평탄화된 다음 노드 이동, → 로 펼치기(펼쳐진 상태면 첫
 * 자식으로 이동), ← 로 접기(접힌 상태면 부모로 이동), Home/End 로 처음/끝,
 * Enter/Space 로 선택+토글.
 */
export function TreeView({
  nodes,
  selectedId: selectedIdProp,
  defaultSelectedId,
  onSelectedIdChange,
  defaultExpandedIds = [],
  className,
  "aria-label": ariaLabel = "트리",
}: Readonly<TreeViewProps>) {
  const [internalSelectedId, setInternalSelectedId] = React.useState(defaultSelectedId)
  const selectedId = selectedIdProp ?? internalSelectedId

  const [expandedIds, setExpandedIds] = React.useState<Set<string>>(() => new Set(defaultExpandedIds))
  const [focusedId, setFocusedId] = React.useState<string | undefined>(defaultSelectedId ?? nodes[0]?.id)
  const itemRefs = React.useRef(new Map<string, HTMLDivElement>())

  const flat = React.useMemo(() => flattenVisible(nodes, expandedIds), [nodes, expandedIds])
  const effectiveFocusedId = flat.some((item) => item.node.id === focusedId) ? focusedId : flat[0]?.node.id

  const isFirstRender = React.useRef(true)

  // 키보드 이동으로 focusedId(roving tabindex 대상)가 바뀌면 실제 DOM 포커스도
  // 옮긴다 — 이건 React state를 외부 시스템(브라우저 포커스)과 동기화하는
  // 전형적인 effect 용례라 useEffect가 적절하다(위 color-picker의 draft
  // 동기화와는 달리 setState를 다시 호출하지 않는다). 마운트 시점에는 아직
  // 사용자가 트리를 조작한 적이 없으므로 포커스를 뺏지 않는다.
  React.useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }
    if (effectiveFocusedId) {
      itemRefs.current.get(effectiveFocusedId)?.focus()
    }
  }, [effectiveFocusedId])

  function selectNode(id: string) {
    if (selectedIdProp === undefined) {
      setInternalSelectedId(id)
    }
    onSelectedIdChange?.(id)
  }

  function setExpanded(id: string, expand: boolean) {
    setExpandedIds((prev) => {
      const next = new Set(prev)
      if (expand) next.add(id)
      else next.delete(id)
      return next
    })
  }

  function applyKeyAction(action: TreeKeyAction | null, expanded: boolean) {
    if (!action) return
    if (action.type === "focus") {
      setFocusedId(action.id)
      return
    }
    if (action.type === "expand") {
      setExpanded(action.id, action.expand)
      return
    }
    selectNode(action.id)
    if (action.toggleExpand) setExpanded(action.id, !expanded)
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLDivElement>, item: FlatItem) {
    if (!HANDLED_KEYS.has(event.key)) return
    event.preventDefault()

    const index = flat.findIndex((flatItem) => flatItem.node.id === item.node.id)
    const expanded = expandedIds.has(item.node.id)
    applyKeyAction(resolveTreeKeyAction(event.key, item, flat, index, expanded), expanded)
  }

  return (
    <div
      role="tree"
      aria-label={ariaLabel}
      className={cn("flex flex-col gap-0.5 rounded-md border border-border bg-card p-1.5 text-sm", className)}
    >
      {flat.map((item) => {
        const { node, depth, hasChildren } = item
        const expanded = expandedIds.has(node.id)
        const selected = node.id === selectedId
        const isFocusable = node.id === effectiveFocusedId

        return (
          <div
            key={node.id}
            role="treeitem"
            aria-level={depth + 1}
            aria-selected={selected}
            aria-expanded={hasChildren ? expanded : undefined}
            tabIndex={isFocusable ? 0 : -1}
            ref={(el) => {
              if (el) itemRefs.current.set(node.id, el)
              else itemRefs.current.delete(node.id)
            }}
            onFocus={() => setFocusedId(node.id)}
            onKeyDown={(event) => handleKeyDown(event, item)}
            onClick={() => {
              selectNode(node.id)
              if (hasChildren) setExpanded(node.id, !expanded)
            }}
            style={{ paddingLeft: `${depth * 1.25}rem` }}
            className={cn(
              "flex cursor-pointer items-center gap-1.5 rounded-md px-1.5 py-1 outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
              selected ? "bg-accent text-accent-foreground" : "hover:bg-muted"
            )}
          >
            {hasChildren ? (
              <CaretRightIcon
                size={12}
                weight="bold"
                className={cn("shrink-0 text-muted-foreground transition-transform", expanded && "rotate-90")}
                aria-hidden
              />
            ) : (
              <span className="inline-block size-3 shrink-0" aria-hidden />
            )}
            {node.icon ??
              (hasChildren ? (
                expanded ? (
                  <FolderOpenIcon size={16} className="shrink-0 text-muted-foreground" aria-hidden />
                ) : (
                  <FolderIcon size={16} className="shrink-0 text-muted-foreground" aria-hidden />
                )
              ) : (
                <FileIcon size={16} className="shrink-0 text-muted-foreground" aria-hidden />
              ))}
            <span className="truncate">{node.label}</span>
          </div>
        )
      })}
    </div>
  )
}
