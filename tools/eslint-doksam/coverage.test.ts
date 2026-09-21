import { describe, expect, it } from "vitest"

import { RULES_SECTIONS } from "@/lib/rules-markdown"

import { configs, rules } from "./index.mjs"
import { COVERAGE, COVERAGE_STATUSES, RULE_META } from "./meta.mjs"

/**
 * 린트 플러그인이 규칙 원문(lib/rules-markdown.ts)에서 표류하지 않게 잠근다 (이슈 #40).
 *
 * 규칙과 문서가 각자 자라는 것이 이 종류의 도구가 죽는 경로다. 여기서 두 방향을
 * 모두 본다.
 *  - 규칙 → 원문: 모든 규칙이 실재하는 **불변** 절에서 나왔는가.
 *  - 원문 → 규칙: 모든 불변 절이 "어떤 규칙이 막는다" 또는 "왜 기계로 못 잡는다"
 *    중 하나를 갖는가. 불변 절을 새로 쓰면 이 테스트가 먼저 깨진다.
 */

const INVARIANT_TITLES = RULES_SECTIONS.filter((s) => s.kind === "invariant").map((s) => s.title)
const DECISION_TITLES = RULES_SECTIONS.filter((s) => s.kind === "decision").map((s) => s.title)

describe("규칙 ↔ 규칙 원문 정합", () => {
  it("모든 규칙이 RULE_META 에 등록돼 있다", () => {
    expect(Object.keys(rules).sort()).toEqual(Object.keys(RULE_META).sort())
  })

  it("모든 규칙의 section 이 실재하는 불변 절이다", () => {
    for (const [name, meta] of Object.entries(RULE_META)) {
      expect(INVARIANT_TITLES, `${name} 의 section '${meta.section}' 이 불변 절에 없다`).toContain(meta.section)
    }
  })

  it("선택(decision) 절을 강제하는 규칙이 없다 — 프로젝트마다 답이 다르다", () => {
    for (const [name, meta] of Object.entries(RULE_META)) {
      expect(DECISION_TITLES, `${name} 이 선택 절 '${meta.section}' 을 강제한다`).not.toContain(meta.section)
    }
  })

  it("규칙의 meta.docs 가 RULE_META 와 같은 값을 들고 있다", () => {
    for (const [name, rule] of Object.entries(rules)) {
      const docs = rule.meta?.docs as { section?: string; description?: string } | undefined
      expect(docs?.section, `${name} 의 meta.docs.section 불일치`).toBe(RULE_META[name].section)
      expect(docs?.description, `${name} 의 meta.docs.description 불일치`).toBe(RULE_META[name].summary)
    }
  })

  it("규칙 메시지가 출처 절 이름을 담는다 — 위반을 본 사람이 어느 조항인지 바로 안다", () => {
    for (const [name, rule] of Object.entries(rules)) {
      const messages = Object.values(rule.meta?.messages ?? {})
      expect(messages.length, `${name} 에 messages 가 없다`).toBeGreaterThan(0)
      for (const message of messages) {
        expect(message, `${name} 의 메시지에 절 이름이 없다: ${message}`).toContain(RULE_META[name].section)
        expect(message, `${name} 의 메시지에 층 표시가 없다`).toContain("[invariant]")
      }
    }
  })
})

describe("불변 절 전수 판정", () => {
  it("모든 불변 절이 COVERAGE 에 있고, 없는 절이 끼어 있지 않다", () => {
    expect(Object.keys(COVERAGE).sort()).toEqual([...INVARIANT_TITLES].sort())
  })

  it("COVERAGE 의 status 가 정의된 값이다", () => {
    for (const [title, entry] of Object.entries(COVERAGE)) {
      expect(COVERAGE_STATUSES, `${title} 의 status '${entry.status}' 가 정의에 없다`).toContain(entry.status)
    }
  })

  it("status: rules 인 절은 실재하는 규칙을 가리킨다", () => {
    for (const [title, entry] of Object.entries(COVERAGE)) {
      if (entry.status !== "rules") continue
      expect(entry.rules?.length, `${title} 이 규칙을 가리키지 않는다`).toBeGreaterThan(0)
      for (const name of entry.rules ?? []) {
        expect(Object.keys(rules), `${title} 이 없는 규칙 ${name} 을 가리킨다`).toContain(name)
        expect(RULE_META[name].section, `${name} 의 section 이 ${title} 과 다르다`).toBe(title)
      }
    }
  })

  it("기계로 안 잡는 절은 이유를 적는다 — '아직 안 만들었다' 를 조용히 넘기지 않는다", () => {
    for (const [title, entry] of Object.entries(COVERAGE)) {
      if (entry.status === "rules") continue
      expect(entry.note?.length ?? 0, `${title} 에 이유(note)가 없다`).toBeGreaterThan(20)
    }
  })

  it("규칙이 가리키는 절은 COVERAGE 에서도 그 규칙을 가리킨다 (양방향)", () => {
    for (const [name, meta] of Object.entries(RULE_META)) {
      expect(COVERAGE[meta.section]?.rules ?? [], `${meta.section} 이 ${name} 을 안 가리킨다`).toContain(name)
    }
  })
})

describe("기본 설정", () => {
  it("recommended 가 전 규칙을 error 로 켠다", () => {
    const entry = configs.recommended[0]
    expect(Object.keys(entry.rules ?? {}).sort()).toEqual(
      Object.keys(rules)
        .map((n) => `doksam-ui/${n}`)
        .sort(),
    )
    for (const level of Object.values(entry.rules ?? {})) {
      expect(level).toBe("error")
    }
  })
})
