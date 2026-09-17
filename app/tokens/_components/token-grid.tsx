"use client";

import { useState } from "react";

import { CopyButton } from "@/components/copy-button";
import { Input } from "@/components/ui/input";
import { TOKEN_DESCRIPTIONS } from "@/lib/token-descriptions";
import { THEME_TOKEN_KEYS } from "@/themes";
import type { ThemeTokens } from "@/themes";

/**
 * 시맨틱 토큰 스와치 한 장 — 현재 프리셋의 CSS 변수 실색을 렌더한다.
 * app/tokens 페이지(컬러·금융 섹션)가 공유한다(#66에서 page.tsx 에서 이동).
 */
export function TokenSwatch({ tokenKey }: Readonly<{ tokenKey: keyof ThemeTokens }>) {
  const isForeground = tokenKey.endsWith("-foreground");
  return (
    <div className="flex flex-col gap-2 rounded-lg border border-border p-3">
      {isForeground ? (
        <div
          className="flex h-12 items-center justify-center rounded-md border border-border bg-background text-lg font-semibold"
          style={{ color: `var(--${tokenKey})` }}
        >
          Ag
        </div>
      ) : (
        <div
          className="h-12 rounded-md border border-border"
          style={{ backgroundColor: `var(--${tokenKey})` }}
        />
      )}
      <div className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 flex-col gap-0.5">
          <code className="text-xs font-medium">--{tokenKey}</code>
          <p className="text-xs text-muted-foreground">{TOKEN_DESCRIPTIONS[tokenKey]}</p>
        </div>
        <CopyButton value={`var(--${tokenKey})`} label="복사" className="h-6! shrink-0 px-2! text-[11px]" />
      </div>
    </div>
  );
}

/**
 * 컬러 토큰 그리드 + 필터 검색(#66) — 토큰명·설명 부분일치.
 */
export function TokenGrid() {
  const [query, setQuery] = useState("");
  const q = query.trim().toLowerCase();
  const keys = THEME_TOKEN_KEYS.filter(
    (key) => !q || key.toLowerCase().includes(q) || TOKEN_DESCRIPTIONS[key].toLowerCase().includes(q),
  );

  return (
    <div className="flex flex-col gap-3">
      <Input
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="토큰 검색 (이름·설명)"
        className="max-w-sm"
      />
      {keys.length === 0 ? (
        <p className="text-sm text-muted-foreground">일치하는 토큰이 없습니다.</p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {keys.map((key) => (
            <TokenSwatch key={key} tokenKey={key} />
          ))}
        </div>
      )}
    </div>
  );
}
