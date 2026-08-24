"use client";

import { useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import type { IconWeight } from "@phosphor-icons/react";
import { MagnifyingGlassIcon } from "@phosphor-icons/react/dist/ssr";

import { EmptyState } from "@/components/empty-state";
import { TranslatedText } from "@/components/showcase/translated-text";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ICON_CATEGORIES, searchIcons, type IconCategory } from "@/lib/icons/catalog";
import { cn } from "@/lib/utils";

const WEIGHTS: IconWeight[] = ["thin", "light", "regular", "bold", "fill", "duotone"];
const SIZES = [16, 20, 24, 28] as const;
const COPY_RESET_MS = 1600;

/** 복사 표시 해제 — 그 사이 다른 아이콘을 복사했다면 그대로 둔다. */
function clearCopied(name: string) {
  return (current: string | null) => (current === name ? null : current);
}

function copyIconImport(name: string, setCopiedName: Dispatch<SetStateAction<string | null>>) {
  void navigator.clipboard
    .writeText(`import { ${name} } from "@phosphor-icons/react/dist/ssr"`)
    .then(() => {
      setCopiedName(name);
      globalThis.setTimeout(() => setCopiedName(clearCopied(name)), COPY_RESET_MS);
    });
}

/**
 * 아이콘 검색 갤러리 + 플레이그라운드(#66) — lib/icons/catalog.ts 큐레이션
 * 250+종을 이름·한글 키워드로 검색하고, weight·size 토글이 그리드 전체에
 * 실시간 반영된다. 셀 클릭 시 dist/ssr import 문을 클립보드에 복사한다.
 */
export function IconGallery() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<IconCategory | undefined>(undefined);
  const [weight, setWeight] = useState<IconWeight>("regular");
  const [size, setSize] = useState<(typeof SIZES)[number]>(24);
  const [copiedName, setCopiedName] = useState<string | null>(null);

  const results = searchIcons(query, category);

  const handleCopy = (name: string) => copyIconImport(name, setCopiedName);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3">
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="아이콘 검색 (이름·한글)"
          className="max-w-sm"
        />
        <div className="flex flex-wrap gap-1.5">
          <Button
            type="button"
            size="xs"
            variant={category === undefined ? "default" : "outline"}
            onClick={() => setCategory(undefined)}
          >
            전체
          </Button>
          {ICON_CATEGORIES.map(({ key, label }) => (
            <Button
              key={key}
              type="button"
              size="xs"
              variant={category === key ? "default" : "outline"}
              onClick={() => setCategory(category === key ? undefined : key)}
            >
              {label}
            </Button>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <span>weight</span>
            {WEIGHTS.map((w) => (
              <Button
                key={w}
                type="button"
                size="xs"
                variant={weight === w ? "secondary" : "ghost"}
                onClick={() => setWeight(w)}
              >
                {w}
              </Button>
            ))}
          </div>
          <div className="flex items-center gap-1.5">
            <span>size</span>
            {SIZES.map((s) => (
              <Button
                key={s}
                type="button"
                size="xs"
                variant={size === s ? "secondary" : "ghost"}
                onClick={() => setSize(s)}
              >
                {s}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {results.length === 0 ? (
        <EmptyState message="검색 결과가 없습니다" icon={<MagnifyingGlassIcon size={24} />} />
      ) : (
        <div className="grid grid-cols-4 gap-2 sm:grid-cols-6 lg:grid-cols-8">
          {results.map((icon) => (
            <button
              key={icon.name}
              type="button"
              aria-label={icon.name}
              title={`${icon.name} — 클릭하면 import 문 복사`}
              onClick={() => handleCopy(icon.name)}
              className={cn(
                "flex flex-col items-center gap-1.5 rounded-lg border border-border p-3 transition-colors hover:bg-muted",
                copiedName === icon.name && "border-primary bg-primary/5",
              )}
            >
              <icon.Icon size={size} weight={weight} className="text-foreground" />
              <span className="w-full truncate text-center text-[10px] text-muted-foreground">
                {copiedName === icon.name ? "복사됨" : icon.name.replace(/Icon$/, "")}
              </span>
            </button>
          ))}
        </div>
      )}

      <p className="text-xs text-muted-foreground">
        <TranslatedText
          k="page.icons.gallery.fullCatalogNote"
          ko="여기 없는 아이콘은 phosphoricons.com 전체 카탈로그에서 찾은 뒤 동일한 import 규칙(@phosphor-icons/react/dist/ssr)으로 사용합니다."
        />
      </p>
    </div>
  );
}
