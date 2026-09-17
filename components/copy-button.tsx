"use client";

import { useCallback, useState } from "react";
import { CheckIcon, CopyIcon } from "@phosphor-icons/react/dist/ssr";

import { useI18n } from "@/components/i18n-provider";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface CopyButtonProps {
  /** 클립보드에 복사할 텍스트. */
  value: string;
  /** 버튼에 표시할 라벨. 생략하면 "복사". */
  label?: string;
  className?: string;
}

const RESET_DELAY_MS = 1600;

/**
 * navigator.clipboard 로 텍스트를 복사하고 잠깐 "복사됨" 피드백을 보여주는
 * 공용 버튼. /tokens · /icons · /rules 의 모든 코드/토큰 스니펫이 공유한다.
 */
export function CopyButton({ value, label, className }: Readonly<CopyButtonProps>) {
  const { t } = useI18n();
  const [copied, setCopied] = useState(false);

  const handleClick = useCallback(() => {
    void navigator.clipboard.writeText(value).then(() => {
      setCopied(true);
      globalThis.setTimeout(() => setCopied(false), RESET_DELAY_MS);
    });
  }, [value]);

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={handleClick}
      className={cn("gap-1.5", className)}
    >
      {copied ? (
        <CheckIcon size={14} weight="regular" />
      ) : (
        <CopyIcon size={14} weight="regular" />
      )}
      {copied ? t("chrome.copy.done", "복사됨") : (label ?? t("chrome.copy.label", "복사"))}
    </Button>
  );
}
