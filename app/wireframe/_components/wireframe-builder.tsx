"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  closestCenter,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core"
import { SortableContext, arrayMove, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import {
  DeviceMobileIcon,
  DeviceTabletIcon,
  DotsSixVerticalIcon,
  MonitorIcon,
  PlusIcon,
  TrashIcon,
  XIcon,
} from "@phosphor-icons/react/dist/ssr"

import { useI18n } from "@/components/i18n-provider"
import { CopyButton } from "@/components/showcase/copy-button"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DEMO_LOADERS } from "@/lib/showcase/demo-loaders"
import { COMPONENT_REGISTRY } from "@/lib/showcase/registry"
import {
  COMPONENT_CATEGORY_LABEL,
  COMPONENT_CATEGORY_ORDER,
  type ComponentDemoModule,
  type ComponentEntry,
} from "@/lib/showcase/types"
import { cn } from "@/lib/utils"

/** 팔레트에 노출할 항목 — 데모가 실재하는(status: done + 로더 등록) 컴포넌트만. */
const PALETTE: ComponentEntry[] = COMPONENT_REGISTRY.filter(
  (e) => e.status === "done" && DEMO_LOADERS[e.slug] !== undefined,
)

const PALETTE_BY_SLUG = new Map(PALETTE.map((e) => [e.slug, e]))

const PALETTE_GROUPS = COMPONENT_CATEGORY_ORDER.map((category) => ({
  category,
  label: COMPONENT_CATEGORY_LABEL[category],
  entries: PALETTE.filter((e) => e.category === category),
})).filter((g) => g.entries.length > 0)

type DeviceKey = "mobile" | "tablet" | "desktop"

/** 태블릿/모바일 폭(768/390)은 레포 반응형 검증 기준폭과 동일하게 맞춘다. */
const DEVICE_MODES: {
  key: DeviceKey
  width: number | null
  icon: typeof MonitorIcon
  labelKey: string
  labelKo: string
}[] = [
  { key: "mobile", width: 390, icon: DeviceMobileIcon, labelKey: "chrome.preview.mobile", labelKo: "모바일" },
  { key: "tablet", width: 768, icon: DeviceTabletIcon, labelKey: "chrome.preview.tablet", labelKo: "태블릿" },
  { key: "desktop", width: null, icon: MonitorIcon, labelKey: "chrome.preview.full", labelKo: "전체" },
]

interface CanvasItem {
  uid: string
  slug: string
}

/** beforeUid 앞에 삽입 — 대상이 없으면 맨 뒤에 붙인다. */
function insertItem(list: CanvasItem[], item: CanvasItem, beforeUid?: string): CanvasItem[] {
  const index = beforeUid ? list.findIndex((i) => i.uid === beforeUid) : -1
  if (index < 0) return [...list, item]
  return [...list.slice(0, index), item, ...list.slice(index)]
}

function removeByUid(list: CanvasItem[], uid: string): CanvasItem[] {
  return list.filter((i) => i.uid !== uid)
}

function moveByUid(list: CanvasItem[], fromUid: string, toUid: string): CanvasItem[] {
  const from = list.findIndex((i) => i.uid === fromUid)
  const to = list.findIndex((i) => i.uid === toUid)
  if (from < 0 || to < 0) return list
  return arrayMove(list, from, to)
}

/** 드래그 오버레이에 띄울 이름 — 팔레트 항목이면 slug, 캔버스 항목이면 uid 로 되짚는다. */
function dragTitle(id: string, items: CanvasItem[]): string {
  const slug = id.startsWith("palette:")
    ? id.slice("palette:".length)
    : (items.find((i) => i.uid === id)?.slug ?? "")
  return PALETTE_BY_SLUG.get(slug)?.title ?? id
}

function PaletteItem({ entry, onAdd }: Readonly<{ entry: ComponentEntry; onAdd: (slug: string) => void }>) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id: `palette:${entry.slug}` })

  return (
    <button
      type="button"
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      onClick={() => onAdd(entry.slug)}
      className={cn(
        "flex w-full items-center gap-2 rounded-md border border-border bg-card px-2.5 py-1.5 text-left text-[13px] transition-colors hover:bg-muted",
        isDragging && "opacity-40",
      )}
    >
      <DotsSixVerticalIcon size={14} weight="regular" className="shrink-0 text-muted-foreground" />
      <span className="flex-1 truncate">{entry.title}</span>
      <PlusIcon size={14} weight="regular" className="shrink-0 text-muted-foreground" />
    </button>
  )
}

function CanvasItemView({
  item,
  title,
  mod,
  onRemove,
}: Readonly<{
  item: CanvasItem
  title: string
  mod: ComponentDemoModule | undefined
  onRemove: () => void
}>) {
  const { t } = useI18n()
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.uid })

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn("rounded-md border border-border bg-card", isDragging && "relative z-10 opacity-50")}
    >
      <div className="flex items-center gap-1 border-b border-border/60 bg-muted/30 px-1.5 py-1">
        <button
          type="button"
          {...attributes}
          {...listeners}
          aria-label={`${title} ${t("page.wireframe.item.dragHandle", "순서 이동")}`}
          className="cursor-grab rounded p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <DotsSixVerticalIcon size={14} weight="regular" />
        </button>
        <span className="flex-1 truncate text-xs font-medium">{title}</span>
        <button
          type="button"
          onClick={onRemove}
          aria-label={`${title} ${t("page.wireframe.item.remove", "제거")}`}
          className="rounded p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-destructive"
        >
          <XIcon size={14} weight="regular" />
        </button>
      </div>
      {/* 와이어프레임 배치가 목적이므로 데모 자체의 인터랙션(다이얼로그 오픈 등)은 차단한다. */}
      <div aria-hidden className="pointer-events-none select-none overflow-hidden p-3">
        {mod ? mod.demo : <div className="h-10 animate-pulse rounded-md bg-muted" />}
      </div>
    </div>
  )
}

/**
 * 드래그앤드랍 와이어프레임 빌더.
 * 좌측 팔레트(쇼케이스 레지스트리의 done 항목)에서 컴포넌트를 캔버스로 끌어다
 * 놓거나 클릭해 추가하고, 디바이스 프레임 폭(390/768/전체)에서 배치를 확인한 뒤
 * 데모 코드 기반 JSX 를 복사한다. 상태는 로컬(세션)에만 둔다.
 */
export function WireframeBuilder() {
  const { t } = useI18n()
  const [items, setItems] = useState<CanvasItem[]>([])
  const [mods, setMods] = useState<Record<string, ComponentDemoModule>>({})
  const [deviceKey, setDeviceKey] = useState<DeviceKey>("mobile")
  const [activeDrag, setActiveDrag] = useState<{ id: string; title: string } | null>(null)
  const uidRef = useRef(0)

  // 클릭-추가가 곧 키보드 접근 경로다 — KeyboardSensor 를 붙이면 Enter/Space 가
  // 드래그 시작으로 가로채져 팔레트 버튼의 클릭-추가가 깨진다.
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }))

  useEffect(() => {
    const missing = [...new Set(items.map((i) => i.slug))].filter((slug) => mods[slug] === undefined)
    if (missing.length === 0) return
    let cancelled = false
    for (const slug of missing) {
      DEMO_LOADERS[slug]?.().then((mod) => {
        if (!cancelled) setMods((prev) => (prev[slug] ? prev : { ...prev, [slug]: mod }))
      })
    }
    return () => {
      cancelled = true
    }
  }, [items, mods])

  const device = DEVICE_MODES.find((m) => m.key === deviceKey) ?? DEVICE_MODES[0]
  const { setNodeRef: setCanvasRef, isOver } = useDroppable({ id: "canvas" })

  const exportCode = useMemo(() => {
    if (items.length === 0) return ""
    return items
      .map(({ slug }, i) => {
        const title = PALETTE_BY_SLUG.get(slug)?.title ?? slug
        const code = mods[slug]?.code.trim() ?? `{/* ${slug} — 데모 코드 로딩 전 */}`
        return `{/* ${i + 1}. ${title} */}\n${code}`
      })
      .join("\n\n")
  }, [items, mods])

  function addItem(slug: string, beforeUid?: string) {
    const uid = `wf-${++uidRef.current}`
    setItems((prev) => insertItem(prev, { uid, slug }, beforeUid))
  }

  function removeItem(uid: string) {
    setItems((prev) => removeByUid(prev, uid))
  }

  function handleDragStart(e: DragStartEvent) {
    const id = String(e.active.id)
    setActiveDrag({ id, title: dragTitle(id, items) })
  }

  function handleDragEnd(e: DragEndEvent) {
    setActiveDrag(null)
    const { active, over } = e
    if (!over) return
    const activeId = String(active.id)
    const overId = String(over.id)

    if (activeId.startsWith("palette:")) {
      addItem(activeId.slice("palette:".length), overId === "canvas" ? undefined : overId)
      return
    }
    if (activeId !== overId) {
      setItems((prev) => moveByUid(prev, activeId, overId))
    }
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={() => setActiveDrag(null)}
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:gap-6">
        {/* 팔레트 */}
        <aside className="flex flex-col gap-3 rounded-lg border border-border p-3 lg:sticky lg:top-20 lg:max-h-[75vh] lg:w-60 lg:shrink-0 lg:overflow-y-auto">
          <div className="flex items-center justify-between px-0.5">
            <h2 className="text-sm font-medium">{t("page.wireframe.palette.title", "컴포넌트 팔레트")}</h2>
            <Badge variant="secondary">{PALETTE.length}</Badge>
          </div>
          <p className="px-0.5 text-xs text-muted-foreground">
            {t("page.wireframe.palette.hint", "클릭하거나 캔버스로 끌어다 놓으면 추가됩니다.")}
          </p>
          {PALETTE_GROUPS.map((group) => (
            <div key={group.category} className="flex flex-col gap-1">
              <div className="px-0.5 pt-1 text-[11px] font-medium uppercase tracking-wider text-muted-foreground/70">
                {t(`label.category.${group.category}`, group.label)}
              </div>
              {group.entries.map((entry) => (
                <PaletteItem key={entry.slug} entry={entry} onAdd={addItem} />
              ))}
            </div>
          ))}
        </aside>

        {/* 캔버스 + 익스포트 */}
        <div className="flex min-w-0 flex-1 flex-col gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <div
              role="group"
              aria-label={t("chrome.preview.aria", "디바이스 프리뷰 폭 전환")}
              className="flex items-center gap-1"
            >
              {DEVICE_MODES.map(({ key, icon: Icon, labelKey, labelKo }) => (
                <Button
                  key={key}
                  type="button"
                  size="sm"
                  variant={key === deviceKey ? "secondary" : "ghost"}
                  aria-pressed={key === deviceKey}
                  onClick={() => setDeviceKey(key)}
                >
                  <Icon size={16} weight="regular" />
                  {t(labelKey, labelKo)}
                </Button>
              ))}
            </div>
            <span className="text-xs text-muted-foreground">
              {device.width ? `${device.width}px` : t("page.wireframe.device.fluid", "가변 폭")}
            </span>
            <div className="ml-auto flex items-center gap-2">
              <Badge variant="outline">{items.length}</Badge>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                disabled={items.length === 0}
                onClick={() => setItems([])}
              >
                <TrashIcon size={16} weight="regular" />
                {t("page.wireframe.toolbar.clear", "비우기")}
              </Button>
            </div>
          </div>

          <div className="overflow-x-auto rounded-lg border border-border bg-muted/20 p-4 sm:p-6">
            <section
              ref={setCanvasRef}
              aria-label={t("page.wireframe.canvas.aria", "와이어프레임 캔버스")}
              data-testid="wireframe-canvas"
              style={device.width ? { width: device.width } : undefined}
              className={cn(
                "mx-auto flex min-h-[480px] max-w-full flex-col gap-2 rounded-lg border border-border bg-background p-3 shadow-sm",
                isOver && "ring-2 ring-ring",
              )}
            >
              <SortableContext items={items.map((i) => i.uid)} strategy={verticalListSortingStrategy}>
                {items.length === 0 ? (
                  <div className="flex flex-1 items-center justify-center rounded-md border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
                    {t("page.wireframe.canvas.empty", "팔레트에서 컴포넌트를 끌어다 놓거나 클릭해 추가하세요.")}
                  </div>
                ) : (
                  items.map((item) => (
                    <CanvasItemView
                      key={item.uid}
                      item={item}
                      title={PALETTE_BY_SLUG.get(item.slug)?.title ?? item.slug}
                      mod={mods[item.slug]}
                      onRemove={() => removeItem(item.uid)}
                    />
                  ))
                )}
              </SortableContext>
            </section>
          </div>

          {items.length > 0 && (
            <section className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-medium">{t("page.wireframe.export.title", "JSX 내보내기")}</h2>
                <CopyButton value={exportCode} />
              </div>
              <p className="text-xs text-muted-foreground">
                {t("page.wireframe.export.hint", "각 블록은 해당 컴포넌트 데모 코드와 동일합니다. import 는 카탈로그 상세 페이지를 참고하세요.")}
              </p>
              <pre className="max-h-80 overflow-auto rounded-md border border-border bg-muted/30 p-3 text-xs">
                <code>{exportCode}</code>
              </pre>
            </section>
          )}
        </div>
      </div>

      <DragOverlay>
        {activeDrag ? (
          <div className="rounded-md border border-border bg-card px-3 py-2 text-[13px] shadow-md">
            {activeDrag.title}
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}
