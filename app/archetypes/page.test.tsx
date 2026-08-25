import { render, screen } from "@testing-library/react"
import { afterEach, describe, expect, it } from "vitest"

import ArchetypesPage from "@/app/archetypes/page"
import { I18nProvider } from "@/components/i18n-provider"
import en from "@/lib/i18n/messages/en.json"
import es from "@/lib/i18n/messages/es.json"
import ja from "@/lib/i18n/messages/ja.json"
import zh from "@/lib/i18n/messages/zh.json"
import { LAYOUT_ARCHETYPES } from "@/archetypes"
import { BRAND_PROFILES } from "@/profiles"

const LOCALES = { en, es, ja, zh } as const

describe("ArchetypesPage", () => {
  afterEach(() => {
    document.documentElement.lang = ""
  })

  it("페이지 제목을 렌더한다", () => {
    render(<ArchetypesPage />)
    expect(screen.getByRole("heading", { level: 1, name: "레이아웃 원형" })).toBeInTheDocument()
  })

  it("등록된 원형마다 카드 하나를 렌더한다", () => {
    render(<ArchetypesPage />)
    for (const archetype of LAYOUT_ARCHETYPES) {
      expect(screen.getByText(archetype.label)).toBeInTheDocument()
      expect(screen.getByText(archetype.description)).toBeInTheDocument()
      expect(screen.getByText(archetype.name)).toBeInTheDocument()
    }
  })

  it("원형마다 내비 방식과 반례를 함께 보여준다", () => {
    render(<ArchetypesPage />)
    for (const archetype of LAYOUT_ARCHETYPES) {
      expect(screen.getByText(archetype.navigation)).toBeInTheDocument()
      for (const item of archetype.avoidWhen) {
        expect(screen.getByText(item)).toBeInTheDocument()
      }
    }
  })

  it("대표 템플릿을 해당 템플릿 경로로 링크한다", () => {
    render(<ArchetypesPage />)
    const hrefs = new Set(screen.getAllByRole("link").map((link) => link.getAttribute("href")))
    for (const archetype of LAYOUT_ARCHETYPES) {
      for (const slug of archetype.templates) {
        expect(hrefs.has(`/templates/${slug}`), `${archetype.name} → ${slug}`).toBe(true)
      }
    }
  })

  it("권장 셸을 앱 셸 패턴 페이지로 링크한다", () => {
    render(<ArchetypesPage />)
    const shellLinks = screen
      .getAllByRole("link")
      .filter((link) => link.getAttribute("href") === "/patterns/app-shell")
    expect(shellLinks).toHaveLength(LAYOUT_ARCHETYPES.length)
  })

  it("원형을 기본으로 삼는 프로필을 함께 노출한다", () => {
    render(<ArchetypesPage />)
    const labels = BRAND_PROFILES.filter((p) => p.archetype === "sidebar-app").map((p) => p.label)
    expect(screen.getByText(labels.join(" · "))).toBeInTheDocument()
  })

  it.each(Object.keys(LOCALES) as (keyof typeof LOCALES)[])("%s 로케일에서는 카드 문구 전체가 번역돼 렌더된다", (locale) => {
    const messages = LOCALES[locale] as Record<string, string>
    // 이 레포의 I18nProvider 는 <html lang> 에서 로케일을 읽는다.
    document.documentElement.lang = locale
    render(
      <I18nProvider>
        <ArchetypesPage />
      </I18nProvider>,
    )
    for (const archetype of LAYOUT_ARCHETYPES) {
      expect(screen.getByText(messages[`archetype.${archetype.name}.description`])).toBeInTheDocument()
      expect(screen.getByText(messages[`archetype.${archetype.name}.navigation`])).toBeInTheDocument()
      // 원형별 적합 화면·반례 칩도 한국어 원문이 남아 있지 않아야 한다.
      expect(screen.queryByText(archetype.navigation)).not.toBeInTheDocument()
      for (const [i] of archetype.avoidWhen.entries()) {
        expect(screen.getByText(messages[`archetype.${archetype.name}.avoid.${i}`])).toBeInTheDocument()
      }
      for (const [i] of archetype.suitedFor.entries()) {
        expect(screen.getByText(messages[`archetype.${archetype.name}.suited.${i}`])).toBeInTheDocument()
      }
    }
  })
})
