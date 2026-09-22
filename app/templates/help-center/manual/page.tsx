import { Badge } from "@/components/ui/badge"

import { ManualIndex } from "../_components/manual-index"
import { MANUAL_CATEGORIES } from "../_data/manual"

const ENTRY_COUNT = MANUAL_CATEGORIES.reduce((sum, category) => sum + category.entries.length, 0)

export default function HelpCenterManualPage() {
  return (
    <div className="flex w-full flex-col gap-4">
      <section className="flex flex-col gap-1">
        <Badge variant="secondary" className="w-fit">
          매뉴얼 색인
        </Badge>
        <p className="max-w-prose text-sm leading-relaxed text-muted-foreground">
          화면·기능 이름으로 매뉴얼을 검색합니다. 카테고리 {MANUAL_CATEGORIES.length}개 · 항목 {ENTRY_COUNT}건이
          담겨 있습니다.
        </p>
      </section>
      <ManualIndex />
    </div>
  )
}
