import { ProhibitIcon } from "@phosphor-icons/react/dist/ssr"

import { TranslatedText } from "@/components/showcase/translated-text"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { CORNER_PRESETS, type CornerPreset } from "@/corners"
import { BRAND_PROFILES } from "@/profiles"

/** 이 모서리 계열을 쓰는 브랜드 프로필 이름들. */
function profilesFor(name: string): string[] {
  return BRAND_PROFILES.filter((profile) => profile.corner === name).map((profile) => profile.label)
}

/**
 * /corners — 모서리(corner) 계열 카탈로그(#43).
 * 원형이 뼈대를, 프로필이 색·폰트를 고정한다면, 모서리 계열은 표면(카드·팝오버)과
 * 컨트롤(버튼·입력)의 반경 — "얼마나 각졌는가" — 를 고정한다. 설명 텍스트 나열이
 * 아니라 각 카드 안의 미니어처에 data-corner 를 스코프해 실제 렌더 차이를 비교한다.
 * (app/globals.css 의 모서리 토큰 층은 별도 작업으로 구현 중이라, 이 페이지는
 * 마크업과 data-corner 속성만 올바르게 걸어 둔다 — 그 층이 붙기 전까지는 네 계열
 * 미니어처가 시각적으로 동일해 보이는 것이 정상이다.)
 */
export default function CornersPage() {
  return (
    <div className="flex flex-col gap-10">
      <section className="flex flex-col gap-3">
        <Badge variant="secondary" className="w-fit">
          Corners
        </Badge>
        <h1 className="text-2xl font-semibold tracking-tight">
          <TranslatedText k="page.corners.title" ko="모서리 계열" />
        </h1>
        <p className="max-w-prose text-sm leading-relaxed text-muted-foreground">
          <TranslatedText
            k="page.corners.description"
            ko="원형이 뼈대를, 프로필이 색과 폰트를 고정한다면, 모서리 계열은 표면(카드·팝오버)과 컨트롤(버튼·입력)의 반경 — 얼마나 각졌는가 — 를 고정합니다. 프로젝트마다 radius 를 자유 문자열로 고르지 않고 아래 {count}종 중 하나를 명시적으로 고릅니다."
            params={{ count: CORNER_PRESETS.length }}
          />
        </p>
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        {CORNER_PRESETS.map((preset) => (
          <CornerCard key={preset.name} preset={preset} />
        ))}
      </div>

      <section className="flex flex-col gap-2 rounded-lg border border-border bg-muted/40 p-4 text-sm text-muted-foreground">
        <p className="font-medium text-foreground">
          <TranslatedText k="page.corners.howto-title" ko="고르는 순서" />
        </p>
        <p className="max-w-prose leading-relaxed">
          <TranslatedText
            k="page.corners.howto-description"
            ko="먼저 원형과 프로필로 뼈대와 색을 정한 다음, 화면이 줘야 할 인상으로 모서리 계열을 고릅니다. 모서리 값은 프로필이 참조하는 corners/index.ts 프리셋이 고정합니다 — 프로젝트에서 radius 를 개별 문자열로 재정의하지 않습니다."
          />
        </p>
      </section>
    </div>
  )
}

function CornerCard({ preset }: Readonly<{ preset: CornerPreset }>) {
  const profiles = profilesFor(preset.name)

  return (
    <Card className="flex h-full flex-col">
      <CardHeader>
        <div className="flex items-center gap-2">
          <CardTitle>{preset.label}</CardTitle>
          <code className="ml-auto font-mono text-[11px] text-muted-foreground">{preset.name}</code>
        </div>
        <CardDescription>
          <TranslatedText k={`corner.${preset.name}.description`} ko={preset.description} />
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-4">
        <dl className="flex flex-col gap-2 text-xs">
          <div className="flex flex-col gap-1">
            <dt className="text-muted-foreground">
              <TranslatedText k="page.corners.meta.suited" ko="적합한 화면" />
            </dt>
            <dd className="flex flex-wrap gap-1">
              {preset.suitedFor.map((item, i) => (
                <Badge
                  key={item}
                  variant="outline"
                  className="h-auto max-w-full py-1 text-left text-[11px] font-normal whitespace-normal break-keep"
                >
                  <TranslatedText k={`corner.${preset.name}.suited.${i}`} ko={item} />
                </Badge>
              ))}
            </dd>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <dt className="text-muted-foreground">
              <TranslatedText k="page.corners.meta.tokens" ko="토큰" />
            </dt>
            <dd className="flex flex-wrap gap-1.5">
              <code className="rounded bg-muted px-1.5 py-0.5 text-[11px] text-foreground">
                surface={preset.surface}
              </code>
              <code className="rounded bg-muted px-1.5 py-0.5 text-[11px] text-foreground">
                control={preset.control}
              </code>
            </dd>
          </div>
          {profiles.length > 0 ? (
            <div className="flex flex-wrap items-center gap-2">
              <dt className="text-muted-foreground">
                <TranslatedText k="page.corners.meta.profiles" ko="이 계열을 쓰는 프로필" />
              </dt>
              <dd className="text-foreground">{profiles.join(" · ")}</dd>
            </div>
          ) : null}
        </dl>

        {/* 실측 미니어처 — data-corner 를 이 블록에만 스코프한다. app/globals.css 의
            모서리 토큰 층이 이 안의 카드·버튼·입력 반경을 계열별로 갈라 준다.
            설명 텍스트가 아니라 실제 렌더로 차이를 보여주는 것이 이 블록의 목적이며,
            e2e/shape-axes.spec.ts 가 계산된 border-radius 가 실제로 갈리는지 잠근다.
            스코프 컨테이너에서도 갈리려면 파생 반경 변수를 같은 규칙에서 재계산해야
            한다 — globals.css 의 [data-corner] 블록 주석 참고. */}
        <div
          data-corner={preset.name}
          className="flex flex-col gap-2 rounded-md border border-border bg-muted/30 p-3"
        >
          <p className="text-[10px] text-muted-foreground">
            <TranslatedText k="page.corners.meta.preview" ko="미리보기" />
          </p>
          <div data-slot="card" className="flex flex-col gap-2 rounded-md border border-border bg-card p-3">
            <p className="text-sm font-semibold text-card-foreground">doksam-ui</p>
            <Input placeholder="input" className="h-8 text-xs" readOnly />
            <Button size="sm" className="w-fit">
              <TranslatedText k="page.corners.meta.preview-action" ko="확인" />
            </Button>
          </div>
        </div>

        <div className="mt-auto flex flex-col gap-1.5 rounded-md border border-border bg-muted/40 px-3 py-2">
          <p className="flex items-center gap-1.5 text-xs font-medium text-foreground">
            <ProhibitIcon size={13} className="text-destructive" aria-hidden />
            <TranslatedText k="page.corners.meta.avoid" ko="이럴 때는 쓰지 않는다" />
          </p>
          <ul className="flex flex-col gap-0.5 text-xs text-muted-foreground">
            {preset.avoidWhen.map((item, i) => (
              <li key={item} className="flex gap-1.5">
                <span aria-hidden="true">·</span>
                <span>
                  <TranslatedText k={`corner.${preset.name}.avoid.${i}`} ko={item} />
                </span>
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}
