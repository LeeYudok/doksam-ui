/** meta.mjs 의 타입 선언 — 카탈로그의 TypeScript 쪽(규칙 표 페이지·정합 테스트)이 읽는다. */

export interface RuleMetaEntry {
  /** 이 규칙이 나온 규칙 원문(lib/rules-markdown.ts)의 절 제목. */
  section: string
  /** 규칙이 무엇을 막는지 한 줄. */
  summary: string
}

export declare const RULE_META: Record<string, RuleMetaEntry>

export type CoverageStatus = "rules" | "delegated" | "judgment" | "catalog-gate" | "aggregate"

export declare const COVERAGE_STATUSES: CoverageStatus[]

export interface CoverageEntry {
  status: CoverageStatus
  /** status 가 "rules" 일 때 그 절을 막는 규칙 이름들. */
  rules?: string[]
  /** 기계로 판정하지 않는 이유, 또는 판정 범위의 한계. */
  note?: string
}

export declare const COVERAGE: Record<string, CoverageEntry>
