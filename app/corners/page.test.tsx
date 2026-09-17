import { render, screen, within } from "@testing-library/react"
import { afterEach, describe, expect, it } from "vitest"

import CornersPage from "@/app/corners/page"
import { I18nProvider } from "@/components/i18n-provider"
import en from "@/lib/i18n/messages/en.json"
import es from "@/lib/i18n/messages/es.json"
import ja from "@/lib/i18n/messages/ja.json"
import zh from "@/lib/i18n/messages/zh.json"
import { CORNER_PRESETS } from "@/corners"
import { BRAND_PROFILES } from "@/profiles"

const LOCALES = { en, es, ja, zh } as const

describe("CornersPage", () => {
  afterEach(() => {
    document.documentElement.lang = ""
  })

  it("페이지 제목을 렌더한다", () => {
    render(<CornersPage />)
    expect(screen.getByRole("heading", { level: 1, name: "모서리 계열" })).toBeInTheDocument()
  })

  it("등록된 모서리 계열마다 카드 하나를 렌더한다", () => {
    render(<CornersPage />)
    for (const preset of CORNER_PRESETS) {
      expect(screen.getByText(preset.label)).toBeInTheDocument()
      expect(screen.getByText(preset.description)).toBeInTheDocument()
      expect(screen.getByText(preset.name)).toBeInTheDocument()
    }
  })

  it("계열마다 surface/control 토큰과 반례를 함께 보여준다", () => {
    render(<CornersPage />)
    for (const preset of CORNER_PRESETS) {
      // preset.name(code) 는 카드마다 유일하므로 그 카드로 스코프한다.
      const card = screen.getByText(preset.name).closest("[data-slot=card]") as HTMLElement
      expect(card, `${preset.name} 카드 누락`).not.toBeNull()
      const card_ = within(card)
      expect(card_.getByText(`surface=${preset.surface}`)).toBeInTheDocument()
      expect(card_.getByText(`control=${preset.control}`)).toBeInTheDocument()
      for (const item of preset.avoidWhen) {
        expect(card_.getByText(item)).toBeInTheDocument()
      }
    }
  })

  it("계열마다 미리보기 미니어처에 data-corner 속성을 스코프한다", () => {
    const { container } = render(<CornersPage />)
    for (const preset of CORNER_PRESETS) {
      const scoped = container.querySelector(`[data-corner="${preset.name}"]`)
      expect(scoped, `${preset.name} 미리보기 스코프 누락`).not.toBeNull()
    }
  })

  it("이 계열을 쓰는 프로필을 함께 노출한다", () => {
    render(<CornersPage />)
    const labels = BRAND_PROFILES.filter((p) => p.corner === "sharp").map((p) => p.label)
    expect(labels.length).toBeGreaterThan(0)
    expect(screen.getByText(labels.join(" · "))).toBeInTheDocument()
  })

  it.each(Object.keys(LOCALES) as (keyof typeof LOCALES)[])("%s 로케일에서는 카드 문구 전체가 번역돼 렌더된다", (locale) => {
    const messages = LOCALES[locale] as Record<string, string>
    document.documentElement.lang = locale
    render(
      <I18nProvider>
        <CornersPage />
      </I18nProvider>,
    )
    for (const preset of CORNER_PRESETS) {
      expect(screen.getByText(messages[`corner.${preset.name}.description`])).toBeInTheDocument()
      expect(screen.queryByText(preset.description)).not.toBeInTheDocument()
      for (const [i] of preset.avoidWhen.entries()) {
        expect(screen.getByText(messages[`corner.${preset.name}.avoid.${i}`])).toBeInTheDocument()
      }
      for (const [i] of preset.suitedFor.entries()) {
        expect(screen.getByText(messages[`corner.${preset.name}.suited.${i}`])).toBeInTheDocument()
      }
    }
  })
})
