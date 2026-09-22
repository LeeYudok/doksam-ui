import { describe, expect, it } from "vitest"

import en from "@/lib/i18n/messages/en.json"
import es from "@/lib/i18n/messages/es.json"
import ja from "@/lib/i18n/messages/ja.json"
import zh from "@/lib/i18n/messages/zh.json"
import { PATTERN_REGISTRY } from "@/lib/patterns/registry"
import { RISK_LEVELS } from "@/lib/risk-tokens"
import { COMPONENT_REGISTRY } from "@/lib/showcase/registry"
import { TEMPLATE_REGISTRY } from "@/lib/templates/registry"

const ALL: Record<string, Record<string, string>> = { en, ja, zh, es }

describe("i18n 메시지 스냅샷 정합성", () => {
  it("4개 로케일이 동일한 키 집합을 가진다", () => {
    const keys = Object.keys(en).sort()
    expect(keys.length).toBeGreaterThan(0)
    for (const [locale, msgs] of Object.entries(ALL)) {
      expect(Object.keys(msgs).sort(), `${locale} 키 집합 불일치`).toEqual(keys)
    }
  })

  it("component.* 키는 실제 레지스트리 slug 와 대응한다", () => {
    const slugs = new Set(COMPONENT_REGISTRY.map((e) => e.slug))
    for (const key of Object.keys(en).filter((k) => k.startsWith("component."))) {
      expect(slugs.has(key.split(".")[1]), `고아 키: ${key}`).toBe(true)
    }
  })

  it("레지스트리 전 항목의 설명 번역이 존재한다 (드리프트 감지)", () => {
    for (const e of COMPONENT_REGISTRY) {
      expect(en, `component.${e.slug}.description 누락`).toHaveProperty([`component.${e.slug}.description`])
    }
    for (const e of PATTERN_REGISTRY) {
      expect(en).toHaveProperty([`pattern.${e.slug}.description`])
      expect(en).toHaveProperty([`pattern.${e.slug}.title`])
    }
    for (const e of TEMPLATE_REGISTRY) {
      const slug = e.href.split("/").pop() ?? ""
      expect(en).toHaveProperty([`template.${slug}.description`])
    }
  })

  it("ko 카탈로그의 모든 키가 4개 로케일에 번역돼 있다 (누락 감지)", async () => {
    // ko 는 코드 인라인 원문이 SSOT 이고, extract.mjs 가 그 원문을 ko-catalog.json 으로
    // 뽑는다. 새 t() 호출을 추가하고 번역을 빠뜨리는 것이 가장 흔한 누락 경로인데,
    // 위 "레지스트리 전 항목" 테스트는 카탈로그 항목의 description 만 보고 chrome.* 같은
    // 나머지 키는 보지 않는다. 여기서 카탈로그 전체를 기준으로 검사한다.
    const ko: Record<string, string> = (await import("@/scripts/i18n/ko-catalog.json")).default
    const koKeys = Object.keys(ko)
    expect(koKeys.length).toBeGreaterThan(0)
    for (const [locale, msgs] of Object.entries(ALL)) {
      const missing = koKeys.filter((k) => !(k in msgs))
      expect(missing, `${locale} 번역 누락 ${missing.length}건`).toEqual([])
    }
  })

  it("위험등급 설명 4단의 번역이 4개 로케일에 존재한다 (#81)", () => {
    // 이 키는 /tokens 스와치가 `page.tokens.risk.level.${level}` 로 **동적 조회**해서
    // extract.mjs 의 리터럴 스캔에 안 잡힌다 — ko-catalog 를 경유하는 위 누락
    // 감지가 닿지 않으므로 등급 목록에서 직접 유도해 검사한다.
    for (const level of RISK_LEVELS) {
      const key = `page.tokens.risk.level.${level}`
      for (const [locale, msgs] of Object.entries(ALL)) {
        expect(msgs[key], `${locale}:${key} 누락`).toBeTruthy()
      }
    }
  })

  it("플레이스홀더가 ko 카탈로그와 일치한다", async () => {
    const ko: Record<string, string> = (await import("@/scripts/i18n/ko-catalog.json")).default
    const holes = (s: string) => [...s.matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort()
    for (const [locale, msgs] of Object.entries(ALL)) {
      for (const [key, value] of Object.entries(msgs)) {
        if (!(key in ko)) continue
        expect(holes(value), `${locale}:${key} 플레이스홀더 불일치`).toEqual(holes(ko[key]))
      }
    }
  })
})
