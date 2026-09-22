"use client"

import Link from "next/link"
import { ArrowRightIcon } from "@phosphor-icons/react/dist/ssr"

import { useI18n } from "@/components/i18n-provider"
import { Badge } from "@/components/ui/badge"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PATTERN_REGISTRY, PATTERN_SCOPE_LABEL, PATTERN_SCOPE_ORDER, type PatternScope } from "@/lib/patterns/registry"

export default function PatternsPage() {
  const { t } = useI18n()

  return (
    <div className="flex flex-col gap-10">
      <section className="flex flex-col gap-3">
        <Badge variant="secondary" className="w-fit">
          Patterns
        </Badge>
        <h1 className="text-2xl font-semibold tracking-tight">{t("page.patterns.title", "자주 쓰는 UI 패턴 모음")}</h1>
        <p className="max-w-prose text-sm text-muted-foreground">
          {t(
            "page.patterns.description",
            "단일 컴포넌트가 아니라 여러 shadcn 컴포넌트를 조합한 화면 패턴({total}종)을 모았습니다. Common은 어떤 doksam 프로젝트에서든 그대로 재사용할 수 있고, 금융 도메인은 모바일뱅킹·주식 및 Srope에서 이식한 금융 화면 패턴입니다.",
            { total: PATTERN_REGISTRY.length },
          )}
        </p>
      </section>

      {PATTERN_SCOPE_ORDER.map((scope) => (
        <ScopeSection key={scope} scope={scope} />
      ))}
    </div>
  )
}

function ScopeSection({ scope }: Readonly<{ scope: PatternScope }>) {
  const { t } = useI18n()
  const entries = PATTERN_REGISTRY.filter((entry) => entry.scope === scope)

  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-sm font-medium text-muted-foreground">{t(`label.scope.${scope}`, PATTERN_SCOPE_LABEL[scope])}</h2>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {entries.map((entry) => {
          const Icon = entry.icon

          return (
            <Link key={entry.slug} href={`/patterns/${entry.slug}`} className="group">
              <Card className="h-full transition-colors group-hover:border-primary/50">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    {Icon ? (
                      <Icon size={18} weight="regular" className="text-primary" />
                    ) : (
                      <span />
                    )}
                    <ArrowRightIcon
                      size={16}
                      weight="regular"
                      className="text-muted-foreground transition-transform group-hover:translate-x-0.5"
                    />
                  </div>
                  <CardTitle>{t(`pattern.${entry.slug}.title`, entry.title)}</CardTitle>
                  <CardDescription>{t(`pattern.${entry.slug}.description`, entry.description)}</CardDescription>
                </CardHeader>
              </Card>
            </Link>
          )
        })}
      </div>
    </section>
  )
}
