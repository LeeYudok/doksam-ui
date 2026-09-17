import { render, screen, within } from "@testing-library/react"
import { afterEach, describe, expect, it } from "vitest"

import TypeContrastPage from "@/app/type-contrast/page"
import { I18nProvider } from "@/components/i18n-provider"
import en from "@/lib/i18n/messages/en.json"
import es from "@/lib/i18n/messages/es.json"
import ja from "@/lib/i18n/messages/ja.json"
import zh from "@/lib/i18n/messages/zh.json"
import { TYPE_CONTRAST_PRESETS } from "@/type-contrast"
import { BRAND_PROFILES } from "@/profiles"

const LOCALES = { en, es, ja, zh } as const

describe("TypeContrastPage", () => {
  afterEach(() => {
    document.documentElement.lang = ""
  })

  it("페이지 제목을 렌더한다", () => {
    render(<TypeContrastPage />)
    expect(screen.getByRole("heading", { level: 1, name: "타입 대비" })).toBeInTheDocument()
  })

  it("등록된 대비마다 카드 하나를 렌더한다", () => {
    render(<TypeContrastPage />)
    for (const preset of TYPE_CONTRAST_PRESETS) {
      expect(screen.getByText(preset.label)).toBeInTheDocument()
      expect(screen.getByText(preset.description)).toBeInTheDocument()
      expect(screen.getByText(preset.name)).toBeInTheDocument()
    }
  })

  it("대비마다 헤딩 토큰과 반례를 함께 보여준다", () => {
    render(<TypeContrastPage />)
    for (const preset of TYPE_CONTRAST_PRESETS) {
      // preset.name(code) 는 카드마다 유일하므로 그 카드로 스코프한다.
      const card = screen.getByText(preset.name).closest("[data-slot=card]") as HTMLElement
      expect(card, `${preset.name} 카드 누락`).not.toBeNull()
      const card_ = within(card)
      expect(card_.getByText(`headingScale=${preset.headingScale}`)).toBeInTheDocument()
      expect(card_.getByText(`headingWeight=${preset.headingWeight}`)).toBeInTheDocument()
      expect(card_.getByText(`headingTracking=${preset.headingTracking}`)).toBeInTheDocument()
      for (const item of preset.avoidWhen) {
        expect(card_.getByText(item)).toBeInTheDocument()
      }
    }
  })

  it("대비마다 미리보기 미니어처에 data-type-contrast 속성을 스코프하고 실제 헤딩 태그로 렌더한다", () => {
    const { container } = render(<TypeContrastPage />)
    for (const preset of TYPE_CONTRAST_PRESETS) {
      const scoped = container.querySelector(`[data-type-contrast="${preset.name}"]`)
      expect(scoped, `${preset.name} 미리보기 스코프 누락`).not.toBeNull()
      expect(scoped?.querySelector("h3")).not.toBeNull()
    }
  })

  it("이 대비를 쓰는 프로필을 함께 노출한다", () => {
    render(<TypeContrastPage />)
    const labels = BRAND_PROFILES.filter((p) => p.typeContrast === "flat").map((p) => p.label)
    expect(labels.length).toBeGreaterThan(0)
    expect(screen.getByText(labels.join(" · "))).toBeInTheDocument()
  })

  it.each(Object.keys(LOCALES) as (keyof typeof LOCALES)[])("%s 로케일에서는 카드 문구 전체가 번역돼 렌더된다", (locale) => {
    const messages = LOCALES[locale] as Record<string, string>
    document.documentElement.lang = locale
    render(
      <I18nProvider>
        <TypeContrastPage />
      </I18nProvider>,
    )
    for (const preset of TYPE_CONTRAST_PRESETS) {
      expect(screen.getByText(messages[`type-contrast.${preset.name}.description`])).toBeInTheDocument()
      expect(screen.queryByText(preset.description)).not.toBeInTheDocument()
      for (const [i] of preset.avoidWhen.entries()) {
        expect(screen.getByText(messages[`type-contrast.${preset.name}.avoid.${i}`])).toBeInTheDocument()
      }
      for (const [i] of preset.suitedFor.entries()) {
        expect(screen.getByText(messages[`type-contrast.${preset.name}.suited.${i}`])).toBeInTheDocument()
      }
    }
  })
})
