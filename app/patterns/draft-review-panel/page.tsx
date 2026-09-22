import { notFound } from "next/navigation"

import { Badge } from "@/components/ui/badge"
import { PatternSample } from "@/components/showcase/pattern-sample"
import { DRAFT_REVIEW_PANEL_SAMPLES } from "@/components/patterns/draft-review-panel-samples"
import { getPatternEntry } from "@/lib/patterns/registry"

export default function DraftReviewPanelPatternsPage() {
  const entry = getPatternEntry("draft-review-panel")
  if (!entry) {
    notFound()
  }

  return (
    <div className="flex flex-col gap-8">
      <section className="flex flex-col gap-3">
        <Badge variant="secondary" className="w-fit">
          Patterns
        </Badge>
        <h1 className="text-2xl font-semibold tracking-tight">{entry.title}</h1>
        <p className="max-w-prose text-sm text-muted-foreground">{entry.description}</p>
      </section>

      {DRAFT_REVIEW_PANEL_SAMPLES.map((sample) => (
        <PatternSample key={sample.num} {...sample} />
      ))}
    </div>
  )
}
