import { PatternDetail } from "@/components/showcase/pattern-detail"
import { KANBAN_SAMPLES } from "@/components/patterns/kanban-samples"

export default function KanbanPatternsPage() {
  return <PatternDetail slug="kanban" samples={KANBAN_SAMPLES} />
}
