import Link from "next/link"
import { ArrowRightIcon, ProhibitIcon } from "@phosphor-icons/react/dist/ssr"

import { TranslatedText } from "@/components/showcase/translated-text"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { LAYOUT_ARCHETYPES, type LayoutArchetype } from "@/archetypes"
import { BRAND_PROFILES } from "@/profiles"
import { TEMPLATE_REGISTRY } from "@/lib/templates/registry"

function templateTitle(slug: string): string {
  return TEMPLATE_REGISTRY.find((t) => t.href === `/templates/${slug}`)?.title ?? slug
}

/** 이 원형을 기본으로 삼는 브랜드 프로필 이름들. */
function profilesFor(name: string): string[] {
  return BRAND_PROFILES.filter((profile) => profile.archetype === name).map((profile) => profile.label)
}

/**
 * /archetypes — 레이아웃 원형 카탈로그(#89).
 * 프로필이 "무슨 색·무슨 폰트"를 고정한다면, 원형은 "무슨 뼈대"를 고정한다.
 */
export default function ArchetypesPage() {
  return (
    <div className="flex flex-col gap-10">
      <section className="flex flex-col gap-3">
        <Badge variant="secondary" className="w-fit">
          Archetypes
        </Badge>
        <h1 className="text-2xl font-semibold tracking-tight">
          <TranslatedText k="page.archetypes.title" ko="레이아웃 원형" />
        </h1>
        <p className="max-w-prose text-sm leading-relaxed text-muted-foreground">
          <TranslatedText
            k="page.archetypes.description"
            ko="프로필이 색과 폰트를 고정한다면, 원형은 화면의 뼈대 — 내비게이션이 어디에 놓이고 정보가 어떤 순서로 흐르는지 — 를 고정합니다. 스킨만 바꾸면 색만 다르고 구조는 같은 앱이 나옵니다. 프로젝트는 프로필 하나와 아래 {count}종 중 원형 하나를 각각 명시적으로 고릅니다."
            params={{ count: LAYOUT_ARCHETYPES.length }}
          />
        </p>
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        {LAYOUT_ARCHETYPES.map((archetype) => (
          <ArchetypeCard key={archetype.name} archetype={archetype} />
        ))}
      </div>

      <section className="flex flex-col gap-2 rounded-lg border border-border bg-muted/40 p-4 text-sm text-muted-foreground">
        <p className="font-medium text-foreground">
          <TranslatedText k="page.archetypes.howto-title" ko="고르는 순서" />
        </p>
        <p className="max-w-prose leading-relaxed">
          <TranslatedText
            k="page.archetypes.howto-description"
            ko="먼저 화면이 무엇을 하는지로 원형을 고르고, 그 다음 브랜드 성격으로 프로필을 고릅니다. 두 축은 독립이며 한 프로젝트는 원형 하나를 전역 표준으로 고정합니다 — 화면마다 뼈대가 바뀌면 원형을 고른 의미가 사라집니다."
          />
        </p>
      </section>
    </div>
  )
}

function ArchetypeCard({ archetype }: Readonly<{ archetype: LayoutArchetype }>) {
  const Icon = archetype.icon
  const profiles = profilesFor(archetype.name)

  return (
    <Card className="flex h-full flex-col">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Icon size={20} weight="duotone" className="text-primary" aria-hidden />
          <CardTitle>{archetype.label}</CardTitle>
          <code className="ml-auto font-mono text-[11px] text-muted-foreground">{archetype.name}</code>
        </div>
        <CardDescription>
          <TranslatedText k={`archetype.${archetype.name}.description`} ko={archetype.description} />
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-4">
        <dl className="flex flex-col gap-2 text-xs">
          <div className="flex flex-col gap-1">
            <dt className="text-muted-foreground">
              <TranslatedText k="page.archetypes.meta.suited" ko="적합한 화면" />
            </dt>
            <dd className="flex flex-wrap gap-1">
              {archetype.suitedFor.map((item, i) => (
                <Badge key={item} variant="outline" className="text-[11px] font-normal">
                  <TranslatedText k={`archetype.${archetype.name}.suited.${i}`} ko={item} />
                </Badge>
              ))}
            </dd>
          </div>
          <div className="flex flex-col gap-1">
            <dt className="text-muted-foreground">
              <TranslatedText k="page.archetypes.meta.navigation" ko="내비게이션" />
            </dt>
            <dd className="leading-relaxed text-foreground">
              <TranslatedText k={`archetype.${archetype.name}.navigation`} ko={archetype.navigation} />
            </dd>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <dt className="text-muted-foreground">
              <TranslatedText k="page.archetypes.meta.shell" ko="권장 셸" />
            </dt>
            <dd>
              <Link
                href="/patterns/app-shell"
                className="inline-flex items-center gap-1 text-foreground underline underline-offset-2"
              >
                <TranslatedText k={`archetype.${archetype.name}.shell`} ko={archetype.shell} />
                <ArrowRightIcon size={12} aria-hidden />
              </Link>
            </dd>
          </div>
          {profiles.length > 0 ? (
            <div className="flex flex-wrap items-center gap-2">
              <dt className="text-muted-foreground">
                <TranslatedText k="page.archetypes.meta.profiles" ko="이 원형을 쓰는 프로필" />
              </dt>
              <dd className="text-foreground">{profiles.join(" · ")}</dd>
            </div>
          ) : null}
        </dl>

        <div className="flex flex-col gap-1.5">
          <p className="text-xs text-muted-foreground">
            <TranslatedText k="page.archetypes.meta.templates" ko="대표 템플릿" />
          </p>
          <div className="flex flex-wrap gap-1.5">
            {archetype.templates.map((slug) => (
              <Link
                key={slug}
                href={`/templates/${slug}`}
                className="rounded-md border border-border px-2 py-1 text-xs text-foreground transition-colors hover:bg-muted"
              >
                {templateTitle(slug)}
              </Link>
            ))}
          </div>
        </div>

        <div className="mt-auto flex flex-col gap-1.5 rounded-md border border-border bg-muted/40 px-3 py-2">
          <p className="flex items-center gap-1.5 text-xs font-medium text-foreground">
            <ProhibitIcon size={13} className="text-destructive" aria-hidden />
            <TranslatedText k="page.archetypes.meta.avoid" ko="이럴 때는 쓰지 않는다" />
          </p>
          <ul className="flex flex-col gap-0.5 text-xs text-muted-foreground">
            {archetype.avoidWhen.map((item, i) => (
              <li key={item} className="flex gap-1.5">
                <span aria-hidden="true">·</span>
                <span>
                  <TranslatedText k={`archetype.${archetype.name}.avoid.${i}`} ko={item} />
                </span>
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}
