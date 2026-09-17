import { ProhibitIcon } from "@phosphor-icons/react/dist/ssr"

import { TranslatedText } from "@/components/showcase/translated-text"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { TYPE_CONTRAST_PRESETS, type TypeContrastPreset } from "@/type-contrast"
import { BRAND_PROFILES } from "@/profiles"

/** 이 대비를 쓰는 브랜드 프로필 이름들. */
function profilesFor(name: string): string[] {
  return BRAND_PROFILES.filter((profile) => profile.typeContrast === name).map((profile) => profile.label)
}

/**
 * /type-contrast — 타입 대비(type contrast) 카탈로그(#43).
 * 시각 성격(personality)의 scale 이 제목·본문을 같은 비율로 키우는 균등 배율인
 * 것과 달리, 이 축은 제목만 키우고 본문은 그대로 둬 "비례" 자체를 바꾼다. 설명
 * 텍스트 나열이 아니라 각 카드 안의 제목+본문 미니어처에 data-type-contrast 를
 * 스코프해 실제 렌더 차이를 비교한다.
 * (app/globals.css 의 타입 대비 토큰 층은 별도 작업으로 구현 중이라, 이 페이지는
 * 마크업과 data-type-contrast 속성만 올바르게 걸어 둔다 — 그 층이 붙기 전까지는
 * 세 대비 미니어처가 시각적으로 동일해 보이는 것이 정상이다.)
 */
export default function TypeContrastPage() {
  return (
    <div className="flex flex-col gap-10">
      <section className="flex flex-col gap-3">
        <Badge variant="secondary" className="w-fit">
          Type Contrast
        </Badge>
        <h1 className="text-2xl font-semibold tracking-tight">
          <TranslatedText k="page.type-contrast.title" ko="타입 대비" />
        </h1>
        <p className="max-w-prose text-sm leading-relaxed text-muted-foreground">
          <TranslatedText
            k="page.type-contrast.description"
            ko="시각 성격의 스케일이 제목과 본문을 같은 비율로 키우는 균등 배율이라면, 타입 대비는 제목만 키우거나 굵기 격차를 벌려 비례 자체를 바꿉니다. 프로젝트마다 제목 크기를 임의로 정하지 않고 아래 {count}종 중 하나를 명시적으로 고릅니다."
            params={{ count: TYPE_CONTRAST_PRESETS.length }}
          />
        </p>
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        {TYPE_CONTRAST_PRESETS.map((preset) => (
          <TypeContrastCard key={preset.name} preset={preset} />
        ))}
      </div>

      <section className="flex flex-col gap-2 rounded-lg border border-border bg-muted/40 p-4 text-sm text-muted-foreground">
        <p className="font-medium text-foreground">
          <TranslatedText k="page.type-contrast.howto-title" ko="고르는 순서" />
        </p>
        <p className="max-w-prose leading-relaxed">
          <TranslatedText
            k="page.type-contrast.howto-description"
            ko="먼저 원형과 프로필로 뼈대와 색을 정한 다음, 화면이 제목에 줘야 할 무게로 대비를 고릅니다. 대비 값은 프로필이 참조하는 type-contrast/index.ts 프리셋이 고정합니다 — 프로젝트에서 제목 크기·굵기를 개별로 재정의하지 않습니다."
          />
        </p>
      </section>
    </div>
  )
}

function TypeContrastCard({ preset }: Readonly<{ preset: TypeContrastPreset }>) {
  const profiles = profilesFor(preset.name)

  return (
    <Card className="flex h-full flex-col">
      <CardHeader>
        <div className="flex items-center gap-2">
          <CardTitle>{preset.label}</CardTitle>
          <code className="ml-auto font-mono text-[11px] text-muted-foreground">{preset.name}</code>
        </div>
        <CardDescription>
          <TranslatedText k={`type-contrast.${preset.name}.description`} ko={preset.description} />
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-4">
        <dl className="flex flex-col gap-2 text-xs">
          <div className="flex flex-col gap-1">
            <dt className="text-muted-foreground">
              <TranslatedText k="page.type-contrast.meta.suited" ko="적합한 화면" />
            </dt>
            <dd className="flex flex-wrap gap-1">
              {preset.suitedFor.map((item, i) => (
                <Badge
                  key={item}
                  variant="outline"
                  className="h-auto max-w-full py-1 text-left text-[11px] font-normal whitespace-normal break-keep"
                >
                  <TranslatedText k={`type-contrast.${preset.name}.suited.${i}`} ko={item} />
                </Badge>
              ))}
            </dd>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <dt className="text-muted-foreground">
              <TranslatedText k="page.type-contrast.meta.tokens" ko="토큰" />
            </dt>
            <dd className="flex flex-wrap gap-1.5">
              <code className="rounded bg-muted px-1.5 py-0.5 text-[11px] text-foreground">
                headingScale={preset.headingScale}
              </code>
              <code className="rounded bg-muted px-1.5 py-0.5 text-[11px] text-foreground">
                headingWeight={preset.headingWeight}
              </code>
              <code className="rounded bg-muted px-1.5 py-0.5 text-[11px] text-foreground">
                headingTracking={preset.headingTracking}
              </code>
            </dd>
          </div>
          {profiles.length > 0 ? (
            <div className="flex flex-wrap items-center gap-2">
              <dt className="text-muted-foreground">
                <TranslatedText k="page.type-contrast.meta.profiles" ko="이 대비를 쓰는 프로필" />
              </dt>
              <dd className="text-foreground">{profiles.join(" · ")}</dd>
            </div>
          ) : null}
        </dl>

        {/* 실측 미니어처 — data-type-contrast 를 이 블록에만 스코프한다. 제목은
            실제 h3 로 렌더해 app/globals.css 의 타입 대비 토큰 층이 붙으면 헤딩
            선택자가 바로 적용되게 한다. 아직 그 층이 없어 지금은 세 대비가
            동일하게 보인다(정상). */}
        <div
          data-type-contrast={preset.name}
          className="flex flex-col gap-2 rounded-md border border-border bg-muted/30 p-3"
        >
          <p className="text-[10px] text-muted-foreground">
            <TranslatedText k="page.type-contrast.meta.preview" ko="미리보기" />
          </p>
          <div className="flex flex-col gap-1 rounded-md border border-border bg-card p-3">
            <h3 className="font-semibold tracking-tight text-card-foreground">doksam-ui</h3>
            <p className="text-sm text-muted-foreground">
              <TranslatedText
                k="page.type-contrast.meta.preview-body"
                ko="제목과 본문의 크기·굵기 대비를 실제 렌더로 비교합니다."
              />
            </p>
          </div>
        </div>

        <div className="mt-auto flex flex-col gap-1.5 rounded-md border border-border bg-muted/40 px-3 py-2">
          <p className="flex items-center gap-1.5 text-xs font-medium text-foreground">
            <ProhibitIcon size={13} className="text-destructive" aria-hidden />
            <TranslatedText k="page.type-contrast.meta.avoid" ko="이럴 때는 쓰지 않는다" />
          </p>
          <ul className="flex flex-col gap-0.5 text-xs text-muted-foreground">
            {preset.avoidWhen.map((item, i) => (
              <li key={item} className="flex gap-1.5">
                <span aria-hidden="true">·</span>
                <span>
                  <TranslatedText k={`type-contrast.${preset.name}.avoid.${i}`} ko={item} />
                </span>
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}
