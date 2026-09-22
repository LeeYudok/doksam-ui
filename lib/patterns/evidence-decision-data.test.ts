import { describe, expect, it } from "vitest"

import { EVIDENCE_DECISION_EVIDENCE, EVIDENCE_DECISION_OPTIONS } from "@/lib/patterns/evidence-decision-data"

describe("evidence-decision pattern data", () => {
  it("keeps every selectable decision traceable to existing evidence", () => {
    const ids = new Set(EVIDENCE_DECISION_EVIDENCE.map((item) => item.id))

    for (const decision of EVIDENCE_DECISION_OPTIONS.filter((item) => !item.disabled)) {
      expect(decision.evidenceIds.length, decision.id).toBeGreaterThan(0)
      for (const evidenceId of decision.evidenceIds) {
        expect(ids.has(evidenceId), `${decision.id} -> ${evidenceId}`).toBe(true)
      }
    }
  })

  it("marks an available recommendation and makes disabled decisions explain why", () => {
    expect(EVIDENCE_DECISION_OPTIONS.some((item) => item.recommended && !item.disabled)).toBe(true)
    for (const decision of EVIDENCE_DECISION_OPTIONS.filter((item) => item.disabled)) {
      expect(decision.constraint, decision.id).toBeTruthy()
    }
  })
})
