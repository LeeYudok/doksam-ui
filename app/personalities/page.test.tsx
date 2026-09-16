import { render, screen, within } from "@testing-library/react"
import { afterEach, describe, expect, it } from "vitest"

import PersonalitiesPage from "@/app/personalities/page"
import { I18nProvider } from "@/components/i18n-provider"
import en from "@/lib/i18n/messages/en.json"
import es from "@/lib/i18n/messages/es.json"
import ja from "@/lib/i18n/messages/ja.json"
import zh from "@/lib/i18n/messages/zh.json"
import { PERSONALITY_PRESETS } from "@/personalities"
import { BRAND_PROFILES } from "@/profiles"

const LOCALES = { en, es, ja, zh } as const

describe("PersonalitiesPage", () => {
  afterEach(() => {
    document.documentElement.lang = ""
  })

  it("페이지 제목을 렌더한다", () => {
    render(<PersonalitiesPage />)
    expect(screen.getByRole("heading", { level: 1, name: "시각 성격" })).toBeInTheDocument()
  })

  it("등록된 성격마다 카드 하나를 렌더한다", () => {
    render(<PersonalitiesPage />)
    for (const preset of PERSONALITY_PRESETS) {
      expect(screen.getByText(preset.label)).toBeInTheDocument()
      expect(screen.getByText(preset.description)).toBeInTheDocument()
      expect(screen.getByText(preset.name)).toBeInTheDocument()
    }
  })

  it("성격마다 scale/surface/motion 토큰과 반례를 함께 보여준다", () => {
    render(<PersonalitiesPage />)
    for (const preset of PERSONALITY_PRESETS) {
      // preset.name(code) 는 카드마다 유일하므로 그 카드로 스코프해 값이 겹치는
      // scale=regular/surface=border/motion=subtle 같은 케이스의 오탐을 피한다.
      const card = screen.getByText(preset.name).closest("[data-slot=card]") as HTMLElement
      expect(card, `${preset.name} 카드 누락`).not.toBeNull()
      const card_ = within(card)
      expect(card_.getByText(`scale=${preset.scale}`)).toBeInTheDocument()
      expect(card_.getByText(`surface=${preset.surface}`)).toBeInTheDocument()
      expect(card_.getByText(`motion=${preset.motion}`)).toBeInTheDocument()
      for (const item of preset.avoidWhen) {
        expect(card_.getByText(item)).toBeInTheDocument()
      }
    }
  })

  it("성격마다 미리보기 미니어처에 data-personality 계열 속성을 스코프한다", () => {
    const { container } = render(<PersonalitiesPage />)
    for (const preset of PERSONALITY_PRESETS) {
      const scoped = container.querySelector(`[data-personality="${preset.scale}"][data-personality-surface="${preset.surface}"][data-personality-motion="${preset.motion}"]`)
      expect(scoped, `${preset.name} 미리보기 스코프 누락`).not.toBeNull()
    }
  })

  it("이 성격을 쓰는 프로필을 함께 노출한다", () => {
    render(<PersonalitiesPage />)
    const labels = BRAND_PROFILES.filter((p) => p.personality === "crisp").map((p) => p.label)
    expect(labels.length).toBeGreaterThan(0)
    expect(screen.getByText(labels.join(" · "))).toBeInTheDocument()
  })

  it.each(Object.keys(LOCALES) as (keyof typeof LOCALES)[])("%s 로케일에서는 카드 문구 전체가 번역돼 렌더된다", (locale) => {
    const messages = LOCALES[locale] as Record<string, string>
    document.documentElement.lang = locale
    render(
      <I18nProvider>
        <PersonalitiesPage />
      </I18nProvider>,
    )
    for (const preset of PERSONALITY_PRESETS) {
      expect(screen.getByText(messages[`personality.${preset.name}.description`])).toBeInTheDocument()
      expect(screen.queryByText(preset.description)).not.toBeInTheDocument()
      for (const [i] of preset.avoidWhen.entries()) {
        expect(screen.getByText(messages[`personality.${preset.name}.avoid.${i}`])).toBeInTheDocument()
      }
      for (const [i] of preset.suitedFor.entries()) {
        expect(screen.getByText(messages[`personality.${preset.name}.suited.${i}`])).toBeInTheDocument()
      }
    }
  })
})
