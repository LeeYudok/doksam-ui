import { PatternDetail } from "@/components/showcase/pattern-detail"
import { AUTH_SAMPLES } from "@/components/patterns/auth-samples"

export default function AuthPatternsPage() {
  return <PatternDetail slug="auth" samples={AUTH_SAMPLES} />
}
