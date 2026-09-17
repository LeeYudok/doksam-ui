import { TranslatedText } from "@/components/showcase/translated-text";
import { CopyButton } from "@/components/copy-button";

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
        <CopyButton value={`var(--${token})`} label="복사" className="h-6! shrink-0 px-2! text-[11px]" />
      </div>
    </div>
  );
}

/**
 * 시맨틱 27키 밖의 보조 토큰 층 문서(#66) — sidebar 8종(프리셋 무관,
 * globals.css :root/.dark 정의)과 브랜드 확장 토큰(ink-bulb 전용 opt-in).
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
              ko="shadcn sidebar 프리미티브가 쓰는 8종입니다. 테마 프리셋 27키에 포함되지 않고 globals.css의 :root/.dark에만 정의된 층이라, 프리셋을 바꿔도 값이 바뀌지 않습니다."
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
