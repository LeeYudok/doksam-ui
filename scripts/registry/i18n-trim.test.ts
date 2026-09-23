import { describe, expect, it } from "vitest"

import { readRegistry } from "./closure"
import { trimMessages, usedMessageKeys } from "./i18n-trim"

const registry = readRegistry()
const used = usedMessageKeys(registry)

describe("usedMessageKeys — GitHub #113", () => {
  it("배포 클로저가 실제로 쓰는 chrome 키는 남는다", () => {
    // copy-button/audit-code-tag/contribution-meter 등은 template-admin·
    // template-ews-diagnosis 가 registryDependencies 로 딸고 오는 실제 배포 컴포넌트다.
    expect(used).toContain("chrome.copy.label")
    expect(used).toContain("chrome.auditCodeTag.copy")
  })

  it("카탈로그 사이트 전용 문구는 배포 클로저에 없다", () => {
    // page/component/archetype/pattern 은 /components, /archetypes 같은 카탈로그
    // 라우트(app/*/page.tsx, 레지스트리 밖)에서만 쓰인다.
    for (const key of used) {
      expect(key.startsWith("page.")).toBe(false)
      expect(key.startsWith("component.")).toBe(false)
      expect(key.startsWith("archetype.")).toBe(false)
      expect(key.startsWith("pattern.")).toBe(false)
    }
  })

  it("사이트 챙(topnav·sidebar·command menu·상세 페이지) 문구는 배포 클로저에 없다", () => {
    // 이 서브네임스페이스는 site-topnav/site-command-menu/component-detail 등
    // 카탈로그 셸 전용 컴포넌트에서만 쓰이고, 그 컴포넌트들은 어떤 registry.json
    // 항목에도 실리지 않는다.
    const catalogOnlyChrome = [
      "chrome.nav.",
      "chrome.cmd.",
      "chrome.detail.",
      "chrome.footer.",
      "chrome.sidebar.",
      "chrome.preview.",
      "chrome.theme.",
      "chrome.font.",
      "chrome.locale.",
    ]
    for (const key of used) {
      for (const prefix of catalogOnlyChrome) {
        expect(key.startsWith(prefix), `${key} 는 카탈로그 셸 전용 네임스페이스인데 배포 클로저에 있다`).toBe(false)
      }
    }
  })

  it("template.* 는 템플릿 블록 자체가 아니라 /templates 카탈로그 인덱스 문구다 — 배포 클로저에 없다", () => {
    for (const key of used) {
      expect(key.startsWith("template.")).toBe(false)
    }
  })

  it("전체 사전(568키)보다 훨씬 작다", () => {
    expect(used.size).toBeGreaterThan(0)
    expect(used.size).toBeLessThan(50)
  })
})

describe("trimMessages", () => {
  it("사용된 키만 남기고 정렬한다", () => {
    const full = { "b.two": "2", "a.one": "1", "c.three": "3" }
    const result = trimMessages(full, new Set(["a.one", "c.three"]))
    expect(Object.keys(result)).toEqual(["a.one", "c.three"])
    expect(result).toEqual({ "a.one": "1", "c.three": "3" })
  })

  it("전체 사전에 없는 키는 조용히 무시한다", () => {
    expect(trimMessages({ "a.one": "1" }, new Set(["a.one", "z.missing"]))).toEqual({ "a.one": "1" })
  })
})
