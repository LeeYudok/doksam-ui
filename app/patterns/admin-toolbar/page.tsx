import { PatternDetail } from "@/components/showcase/pattern-detail"
import { ADMIN_TOOLBAR_SAMPLES } from "./_samples"

export default function AdminToolbarPatternsPage() {
  return <PatternDetail slug="admin-toolbar" samples={ADMIN_TOOLBAR_SAMPLES} className="max-w-3xl" />
}
