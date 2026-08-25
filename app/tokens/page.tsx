import Link from "next/link";

import { CopyButton } from "@/components/copy-button";
import { TranslatedText } from "@/components/showcase/translated-text";
import { DensitySection } from "@/app/tokens/_components/density-section";
import { ExtendedTokensSection } from "@/app/tokens/_components/extended-tokens-section";
import { PersonalitySection } from "@/app/tokens/_components/personality-section";
import { PresetMatrix } from "@/app/tokens/_components/preset-matrix";
import { TokenGrid, TokenSwatch } from "@/app/tokens/_components/token-grid";
import { BRAND_PROFILES } from "@/profiles";
import { Badge } from "@/components/ui/badge";
import { FONT_LICENSE_NOTE } from "@/fonts";
import { formatWon } from "@/lib/finance/format-won";
import { rateColor, rateText } from "@/lib/finance/rate";
import { generateThemeCss } from "@/lib/theme-css";
import { THEME_PRESETS } from "@/themes";

const RATE_SAMPLES = [1.23, -0.87, 0] as const;
const WON_SAMPLES = [500_000_000, 999_960_000_000, -12_340_000] as const;

const RADIUS_STEPS = [
  { name: "radius-sm", multiplier: 0.6 },
  { name: "radius-md", multiplier: 0.8 },
  { name: "radius-lg (기본)", multiplier: 1 },
  { name: "radius-xl", multiplier: 1.4 },
  { name: "radius-2xl", multiplier: 1.8 },
  { name: "radius-3xl", multiplier: 2.2 },
  { name: "radius-4xl", multiplier: 2.6 },
] as const;

const BASE_RADIUS_PX = 6;

const SPACING_STEPS = [1, 2, 3, 4, 6, 8, 12, 16] as const;

const TYPE_SCALE = [
  {
    label: "페이지 제목",
    className: "text-3xl font-semibold tracking-tight",
    sample: "doksam-ui",
  },
  {
    label: "섹션 제목",
    className: "text-lg font-medium",
    sample: "컬러 토큰",
  },
  {
    label: "본문",
    className: "text-sm",
    sample: "시맨틱 토큰만 사용하고 하드코딩 색은 금지합니다.",
  },
  {
    label: "보조",
    className: "text-xs text-muted-foreground",
    sample: "프리셋 전환 시 자동으로 반영됩니다.",
  },
  {
    label: "코드",
    className: "rounded-sm bg-muted px-1.5 py-0.5 font-mono text-sm",
    sample: "var(--primary)",
  },
] as const;

function ColorTokensSection() {
  return (
    <section className="flex flex-col gap-3">
      <div className="flex flex-col gap-1">
        <h2 className="text-lg font-medium">컬러 토큰</h2>
        <p className="text-sm text-muted-foreground">
          현재 프리셋의 시맨틱 토큰입니다. 우상단 스위처로 프리셋·라이트/다크를 바꾸면 CSS
          변수가 갱신되어 아래 스와치도 자동으로 반영됩니다.
        </p>
      </div>
      <TokenGrid />
    </section>
  );
}

function FinanceTokensSection() {
  return (
    <section className="flex flex-col gap-3">
      <div className="flex flex-col gap-1">
        <h2 className="text-lg font-medium">금융 토큰</h2>
        <p className="text-sm text-muted-foreground">
          한국식 시세 등락 색(<code>--gain</code>=이익/상승, <code>--loss</code>=손실/하락)입니다.
          다른 시맨틱 색과 동일하게 모든 프리셋에서 같은 값을 쓰며(브랜드가 아닌 도메인 관례),{" "}
          <code>lib/finance/rate.ts</code>의 <code>rateColor</code>/<code>rateText</code>,{" "}
          <code>lib/finance/format-won.ts</code>의 <code>formatWon</code>과 함께 씁니다. 자세한
          데모는{" "}
          <Link href="/components/rate-color" className="underline underline-offset-2">
            /components/rate-color
          </Link>
          ·{" "}
          <Link href="/components/format-won" className="underline underline-offset-2">
            /components/format-won
          </Link>
          를 참고하세요.
        </p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <TokenSwatch tokenKey="gain" />
        <TokenSwatch tokenKey="loss" />
      </div>
      <div className="flex flex-col gap-2 rounded-lg border border-border p-4">
        <p className="text-xs font-medium text-muted-foreground">rateColor / rateText</p>
        <div className="flex flex-wrap gap-4 font-mono text-sm">
          {RATE_SAMPLES.map((n) => (
            <span key={n} className={rateColor(n)}>
              {rateText(n)}%
            </span>
          ))}
        </div>
        <p className="mt-2 text-xs font-medium text-muted-foreground">formatWon</p>
        <div className="flex flex-wrap gap-4 font-mono text-sm">
          {WON_SAMPLES.map((won) => (
            <span key={won} className={rateColor(won)}>
              {formatWon(won)}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

function RadiusSection() {
  return (
    <section className="flex flex-col gap-3">
      <div className="flex flex-col gap-1">
        <h2 className="text-lg font-medium">Radius</h2>
        <p className="max-w-prose text-sm text-muted-foreground">
          기본 radius는 {BASE_RADIUS_PX}px(절제된 곡선)이고, 나머지 스텝은 여기에 비례합니다. 브랜드
          프로필은 <code>&lt;html style=&quot;--radius:…&quot;&gt;</code>로 이 값을 오버라이드합니다 —{" "}
          {BRAND_PROFILES.map((p) => `${p.label} ${p.radius}`).join(" · ")} (
          <Link href="/profiles" className="underline underline-offset-2">
            /profiles
          </Link>
          ).
        </p>
      </div>
      <div className="flex flex-wrap gap-4">
        {RADIUS_STEPS.map((step) => (
          <div key={step.name} className="flex flex-col items-center gap-2">
            <div
              className="size-16 border border-border bg-muted"
              style={{ borderRadius: `${BASE_RADIUS_PX * step.multiplier}px` }}
            />
            <div className="text-center text-xs text-muted-foreground">
              <div className="font-medium text-foreground">{step.name}</div>
              <div>{(BASE_RADIUS_PX * step.multiplier).toFixed(1)}px</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function SpacingSection() {
  return (
    <section className="flex flex-col gap-3">
      <div className="flex flex-col gap-1">
        <h2 className="text-lg font-medium">간격</h2>
        <p className="text-sm text-muted-foreground">
          Tailwind 기본 4px 그리드 중 권장 스텝입니다. 클래스는 <code>p-{"{n}"}</code>,{" "}
          <code>gap-{"{n}"}</code> 등으로 그대로 사용합니다.
        </p>
      </div>
      <div className="flex flex-col gap-2">
        {SPACING_STEPS.map((step) => (
          <div key={step} className="flex items-center gap-3">
            <code className="w-10 shrink-0 text-xs text-muted-foreground">{step}</code>
            <div
              className="h-3 rounded-sm bg-primary"
              style={{ width: `${step * 4}px` }}
            />
            <span className="text-xs text-muted-foreground">{step * 4}px</span>
          </div>
        ))}
      </div>
    </section>
  );
}

function TypographySection() {
  return (
    <section className="flex flex-col gap-3">
      <div className="flex flex-col gap-1">
        <h2 className="text-lg font-medium">타이포그래피</h2>
        <p className="text-sm text-muted-foreground">
          페이지 제목 · 섹션 · 본문 · 보조 · 코드 5단 스케일입니다. 사이드바 상단
          스위처로 폰트 프리셋을 바꾸면 사이트 전체 본문 서체가 즉시 반영됩니다. 모든
          폰트는 next/font/local로 레포에 self-host되어 있어 폐쇄망 환경에서도 외부
          CDN 요청 없이 동작합니다.
        </p>
      </div>
      <div className="flex flex-col gap-4">
        {TYPE_SCALE.map((item) => (
          <div key={item.label} className="flex flex-col gap-1 border-b border-border pb-3 last:border-b-0">
            <div className="flex items-center gap-2">
              <Badge variant="outline">{item.label}</Badge>
              <code className="text-xs text-muted-foreground">{item.className}</code>
            </div>
            <p className={item.className}>{item.sample}</p>
          </div>
        ))}
      </div>
      <p className="text-xs text-muted-foreground">{FONT_LICENSE_NOTE}</p>
    </section>
  );
}

function CopyPresetsSection() {
  return (
    <section className="flex flex-col gap-3">
      <div className="flex flex-col gap-1">
        <h2 className="text-lg font-medium">복사해 쓰는 법</h2>
        <p className="text-sm text-muted-foreground">
          소비 프로젝트의 <code>globals.css</code>에 붙여넣을 프리셋별 CSS 변수 블록입니다.
        </p>
      </div>
      <div className="flex flex-col gap-2">
        {THEME_PRESETS.map((preset) => (
          <div
            key={preset.name}
            className="flex items-center justify-between gap-3 rounded-lg border border-border p-3"
          >
            <div className="flex items-center gap-2">
              <span
                aria-hidden="true"
                className="size-3.5 rounded-full ring-1 ring-inset ring-border"
                style={{ backgroundColor: preset.swatch }}
              />
              <span className="text-sm font-medium">{preset.label}</span>
            </div>
            <CopyButton value={generateThemeCss(preset)} label={`${preset.label} CSS 복사`} />
          </div>
        ))}
      </div>
    </section>
  );
}

export default function TokensPage() {
  return (
    <div className="flex flex-col gap-10">
      <div className="flex flex-col gap-3">
        <Badge variant="secondary" className="w-fit">
          Tokens
        </Badge>
        <h1 className="text-2xl font-semibold tracking-tight">Tokens</h1>
        <p className="max-w-prose text-sm text-muted-foreground">
          <TranslatedText k="page.tokens.description" ko="프리셋별 컬러 토큰, radius, 간격, 타이포그래피 스케일입니다. 하드코딩 색 대신 항상 이 시맨틱 토큰을 사용하세요." />
        </p>
      </div>
      <ColorTokensSection />
      <PresetMatrix />
      <ExtendedTokensSection />
      <FinanceTokensSection />
      <RadiusSection />
      <DensitySection />
      <PersonalitySection />
      <SpacingSection />
      <TypographySection />
      <CopyPresetsSection />
    </div>
  );
}
