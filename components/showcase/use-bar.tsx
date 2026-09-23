"use client";

import { useI18n } from "@/components/i18n-provider";
import { CopyButton } from "@/components/copy-button";
import { buildLlmMarkdown, shadcnAddCommand } from "@/lib/showcase/llm-markdown";

interface UseBarProps {
  slug: string;
  title: string;
  description: string;
  code: string;
  dos: string[];
  donts: string[];
  /** registry.json 편입 여부 — 설치 버튼 vs 배지 분기. */
  inRegistry: boolean;
  /**
   * 설치 커맨드를 만들 registry.json 항목 이름들. 생략하면 slug 하나를 쓴다.
   * 패턴처럼 항목 여러 개로 배포되는 경우 항목별 복사 버튼이 나간다.
   */
  installNames?: string[];
}

/** 상세 페이지 상단 "가져다 쓰기" 바 — 코드·설치 커맨드·LLM용 마크다운 복사. */
export function UseBar({
  slug,
  title,
  description,
  code,
  dos,
  donts,
  inRegistry,
  installNames,
}: Readonly<UseBarProps>) {
  const { t } = useI18n();
  const names = installNames && installNames.length > 0 ? installNames : [slug];
  const llm = buildLlmMarkdown({ slug, title, description, code, dos, donts, inRegistry, installNames: names });
  const single = names.length === 1;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <CopyButton value={code} label={t("chrome.detail.copyCode", "코드 복사")} />
      {inRegistry ? (
        names.map((name) => (
          <CopyButton
            key={name}
            value={shadcnAddCommand(name)}
            label={
              single
                ? t("chrome.detail.copyInstall", "설치 커맨드 복사")
                : t("chrome.detail.copyInstallNamed", "{name} 설치 커맨드 복사", { name })
            }
          />
        ))
      ) : (
        <span className="rounded-md border border-dashed border-border px-2.5 py-1 text-xs text-muted-foreground">
          {t("chrome.detail.registryPending", "레지스트리 편입 예정")}
        </span>
      )}
      <CopyButton value={llm} label={t("chrome.detail.copyLlm", "LLM용 복사")} />
    </div>
  );
}
