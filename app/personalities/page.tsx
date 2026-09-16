import { ProhibitIcon } from "@phosphor-icons/react/dist/ssr"

import { TranslatedText } from "@/components/showcase/translated-text"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BRAND_PROFILES } from "@/profiles"
import { PERSONALITY_PRESETS, personalityAttrs, type PersonalityPreset } from "@/personalities"

/** 이 성격을 쓰는 브랜드 프로필 이름들. */
function profilesFor(name: string): string[] {
  return BRAND_PROFILES.filter((profile) => profile.personality === name).map((profile) => profile.label)
}

/**
 * /personalities — 시각 성격(personality) 카탈로그(#37 RC1).
 * 원형이 뼈대를, 프로필이 색·폰트를 고정한다면, 성격은 타입/스페이싱 스케일 ·
 * 표면(surface) 성향 · 모션 강도라는 "어떤 느낌으로"를 고정한다. 설명 텍스트
 * 나열이 아니라 각 카드 안의 미니어처를 personalityAttrs() 로 스코프해 실제
 * 렌더 차이(테두리/그림자/평면 표면, 타입 스케일, 모션)를 눈으로 비교한다.
 */
export default function PersonalitiesPage() {
  return (
    <div className="flex flex-col gap-10">
      <section className="flex flex-col gap-3">
        <Badge variant="secondary" className="w-fit">
          Personalities
        </Badge>
        <h1 className="text-2xl font-semibold tracking-tight">
          <TranslatedText k="page.personalities.title" ko="시각 성격" />
        </h1>
        <p className="max-w-prose text-sm leading-relaxed text-muted-foreground">
          <TranslatedText
            k="page.personalities.description"
            ko="원형이 뼈대를, 프로필이 색과 폰트를 고정한다면, 성격은 타입·스페이싱 스케일과 표면 성향, 모션 강도 — 어떤 느낌으로 보이는가 — 를 고정합니다. 프로필마다 personality 를 개별로 고르지 않고 아래 {count}종 중 하나를 참조합니다."
            params={{ count: PERSONALITY_PRESETS.length }}
          />
        </p>
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        {PERSONALITY_PRESETS.map((preset) => (
          <PersonalityCard key={preset.name} preset={preset} />
        ))}
      </div>

      <section className="flex flex-col gap-2 rounded-lg border border-border bg-muted/40 p-4 text-sm text-muted-foreground">
        <p className="font-medium text-foreground">
          <TranslatedText k="page.personalities.howto-title" ko="고르는 순서" />
        </p>
        <p className="max-w-prose leading-relaxed">
          <TranslatedText
            k="page.personalities.howto-description"
            ko="먼저 원형으로 뼈대를, 프로필로 색과 폰트를 정한 다음, 화면이 줘야 할 인상으로 성격을 고릅니다. 세 축은 독립이며, 성격 값은 프로필이 참조하는 personalities/index.ts 프리셋이 고정합니다 — 프로젝트에서 scale/surface/motion 을 개별로 재정의하지 않습니다."
          />
        </p>
      </section>
    </div>
  )
}

function PersonalityCard({ preset }: Readonly<{ preset: PersonalityPreset }>) {
  const profiles = profilesFor(preset.name)

  return (
    <Card className="flex h-full flex-col">
      <CardHeader>
        <div className="flex items-center gap-2">
          <CardTitle>{preset.label}</CardTitle>
          <code className="ml-auto font-mono text-[11px] text-muted-foreground">{preset.name}</code>
        </div>
        <CardDescription>
          <TranslatedText k={`personality.${preset.name}.description`} ko={preset.description} />
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-4">
        <dl className="flex flex-col gap-2 text-xs">
          <div className="flex flex-col gap-1">
            <dt className="text-muted-foreground">
              <TranslatedText k="page.personalities.meta.suited" ko="적합한 화면" />
            </dt>
            <dd className="flex flex-wrap gap-1">
              {preset.suitedFor.map((item, i) => (
                <Badge key={item} variant="outline" className="text-[11px] font-normal">
                  <TranslatedText k={`personality.${preset.name}.suited.${i}`} ko={item} />
                </Badge>
              ))}
            </dd>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <dt className="text-muted-foreground">
              <TranslatedText k="page.personalities.meta.tokens" ko="토큰" />
            </dt>
            <dd className="flex flex-wrap gap-1.5">
              <code className="rounded bg-muted px-1.5 py-0.5 text-[11px] text-foreground">scale={preset.scale}</code>
              <code className="rounded bg-muted px-1.5 py-0.5 text-[11px] text-foreground">
                surface={preset.surface}
              </code>
              <code className="rounded bg-muted px-1.5 py-0.5 text-[11px] text-foreground">
                motion={preset.motion}
              </code>
            </dd>
          </div>
          {profiles.length > 0 ? (
            <div className="flex flex-wrap items-center gap-2">
              <dt className="text-muted-foreground">
                <TranslatedText k="page.personalities.meta.profiles" ko="이 성격을 쓰는 프로필" />
              </dt>
              <dd className="text-foreground">{profiles.join(" · ")}</dd>
            </div>
          ) : null}
        </dl>

        {/* 실측 미니어처 — personalityAttrs() 로 이 블록에만 scale/surface/motion
            을 스코프한다. 텍스트 설명이 아니라 렌더 결과로 차이를 보여준다. */}
        <div
          {...personalityAttrs(preset)}
          className="flex flex-col gap-2 rounded-md border border-border bg-muted/30 p-3"
        >
          <p className="text-[10px] text-muted-foreground">
            <TranslatedText k="page.personalities.meta.preview" ko="미리보기" />
          </p>
          <div data-slot="card" className="rounded-md border border-border bg-card p-3">
            <p className="text-sm font-semibold text-card-foreground">doksam-ui</p>
            <p className="text-xs text-muted-foreground">scale · surface · motion</p>
            <Button size="sm" className="mt-2 w-fit">
              <TranslatedText k="page.personalities.meta.preview-action" ko="확인" />
            </Button>
          </div>
        </div>

        <div className="mt-auto flex flex-col gap-1.5 rounded-md border border-border bg-muted/40 px-3 py-2">
          <p className="flex items-center gap-1.5 text-xs font-medium text-foreground">
            <ProhibitIcon size={13} className="text-destructive" aria-hidden />
            <TranslatedText k="page.personalities.meta.avoid" ko="이럴 때는 쓰지 않는다" />
          </p>
          <ul className="flex flex-col gap-0.5 text-xs text-muted-foreground">
            {preset.avoidWhen.map((item, i) => (
              <li key={item} className="flex gap-1.5">
                <span aria-hidden="true">·</span>
                <span>
                  <TranslatedText k={`personality.${preset.name}.avoid.${i}`} ko={item} />
                </span>
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}
