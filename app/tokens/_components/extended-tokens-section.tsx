import { TranslatedText } from "@/components/showcase/translated-text";
import { CopyButton } from "@/components/copy-button";
import { RISK_LEVELS, RISK_LEVEL_DESCRIPTIONS, riskTintBackground } from "@/lib/risk-tokens";

const SIDEBAR_TOKENS = [
  "sidebar",
  "sidebar-foreground",
  "sidebar-primary",
  "sidebar-primary-foreground",
  "sidebar-accent",
  "sidebar-accent-foreground",
  "sidebar-border",
  "sidebar-ring",
] as const;

const BRAND_EXT_TOKENS = ["bulb", "shell", "shell-foreground", "shell-muted"] as const;

function VarSwatch({ token }: Readonly<{ token: string }>) {
  return (
    <div className="flex flex-col gap-2 rounded-lg border border-border p-3">
      <div
        className="h-10 rounded-md border border-border"
        style={{ backgroundColor: `var(--${token})` }}
      />
      <div className="flex items-center justify-between gap-2">
        <code className="min-w-0 truncate text-xs font-medium">--{token}</code>
        <CopyButton value={`var(--${token})`} label="복사" className="h-6! shrink-0 px-2 text-[11px]" />
      </div>
    </div>
  );
}

/**
 * 위험등급 한 단계의 스와치(#81) — 왼쪽이 solid 채움 + 전경 토큰, 오른쪽이
 * tint 배경 + 값 토큰 글자다. 배지·행 강조 두 용법이 실제로 읽히는지 이
 * 페이지에서 바로 확인할 수 있게 둘 다 렌더한다.
 */
function RiskSwatch({ level }: Readonly<{ level: (typeof RISK_LEVELS)[number] }>) {
  return (
    <div className="flex flex-col gap-2 rounded-lg border border-border p-3">
      <div className="grid grid-cols-2 gap-2">
        <div
          className="flex h-10 items-center justify-center rounded-md text-xs font-medium"
          style={{
            backgroundColor: `var(--risk-${level})`,
            color: `var(--risk-${level}-foreground)`,
          }}
        >
          solid
        </div>
        <div
          className="flex h-10 items-center justify-center rounded-md text-xs font-medium"
          style={{
            backgroundColor: riskTintBackground(level),
            color: `var(--risk-${level})`,
          }}
        >
          tint
        </div>
      </div>
      <div className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 flex-col gap-0.5">
          <code className="text-xs font-medium">--risk-{level}</code>
          <p className="text-xs text-muted-foreground">
            {/* 키가 동적이라 scripts/i18n/extract.mjs 의 리터럴 스캔에는 안 잡힌다 —
                ko 원문은 RISK_LEVEL_DESCRIPTIONS 가 SSOT 이고, 4로케일 번역은
                lib/i18n/messages/*.json 에 page.tokens.risk.level.<level> 로 있다. */}
            <TranslatedText
              k={`page.tokens.risk.level.${level}`}
              ko={RISK_LEVEL_DESCRIPTIONS[level]}
            />
          </p>
        </div>
        <CopyButton
          value={`var(--risk-${level})`}
          label="복사"
          className="h-6! shrink-0 px-2 text-[11px]"
        />
      </div>
    </div>
  );
}

/**
 * 시맨틱 27키 밖의 보조 토큰 층 문서(#66) — sidebar 8종(프리셋별 명시값,
 * #112), 위험등급 4단(#81, 프리셋 무관), 브랜드 확장 토큰(ink-bulb 전용
 * opt-in).
 */
export function ExtendedTokensSection() {
  return (
    <section className="flex flex-col gap-6">
      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-1">
          <h2 className="text-lg font-medium">
            <TranslatedText k="page.tokens.sidebar.title" ko="Sidebar 토큰" />
          </h2>
          <p className="max-w-prose text-sm text-muted-foreground">
            <TranslatedText
              k="page.tokens.sidebar.description"
              ko="shadcn sidebar 프리미티브가 쓰는 8종입니다. 테마 프리셋 27키에는 포함되지 않지만 프리셋마다 명시값을 갖습니다(#112) — 프리셋을 바꾸면 sidebar-primary 등도 그 테마의 primary 를 따라 바뀝니다."
            />
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {SIDEBAR_TOKENS.map((token) => (
            <VarSwatch key={token} token={token} />
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-1">
          <h2 className="text-lg font-medium">
            <TranslatedText k="page.tokens.risk.title" ko="위험등급 토큰" />
          </h2>
          <p className="max-w-prose text-sm text-muted-foreground">
            <TranslatedText
              k="page.tokens.risk.description"
              ko="순서 있는 심각도 4단입니다(정상 → 관찰 → 주의 → 경보). 범주 구분용인 chart-1~5 와 달리 순서가 의미를 갖는 층이라 둘을 바꿔 쓰지 않습니다. gain/loss 와 같은 도메인 토큰이라 테마 프리셋을 바꿔도 값이 바뀌지 않으며, 몇 단계를 쓸지는 프로젝트가 고릅니다. 색만으로 등급을 전달하지 않도록 텍스트·아이콘을 함께 싣습니다."
            />
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {RISK_LEVELS.map((level) => (
            <RiskSwatch key={level} level={level} />
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-1">
          <h2 className="text-lg font-medium">
            <TranslatedText k="page.tokens.extended.title" ko="브랜드 확장 토큰" />
          </h2>
          <p className="max-w-prose text-sm text-muted-foreground">
            <TranslatedText
              k="page.tokens.extended.description"
              ko="특정 브랜드의 시그니처 표면 전용 opt-in 토큰입니다. 현재는 ink-bulb 프리셋만 정의하며(brain의 전구 앰버·잉크 셸), 표준 컴포넌트·프리미티브는 이 토큰에 의존하지 않습니다(themes/types.ts 규칙). 아래 스와치는 ink-bulb 스코프로 렌더한 실색입니다."
            />
          </p>
        </div>
        <div data-theme="ink-bulb" className="grid gap-3 rounded-lg bg-transparent sm:grid-cols-2 lg:grid-cols-4">
          {BRAND_EXT_TOKENS.map((token) => (
            <VarSwatch key={token} token={token} />
          ))}
        </div>
      </div>
    </section>
  );
}
