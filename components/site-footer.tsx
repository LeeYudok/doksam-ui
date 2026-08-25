"use client";

import Link from "next/link";

import { useI18n } from "@/components/i18n-provider";

const FOOTER_LINKS = [
  { href: "/profiles", label: "Profiles" },
  { href: "/archetypes", label: "Archetypes" },
  { href: "/tokens", label: "Tokens" },
  { href: "/icons", label: "Icons" },
  { href: "/components", label: "Components" },
  { href: "/patterns", label: "Patterns" },
  { href: "/templates", label: "Templates" },
  { href: "/rules", label: "Rules" },
];

/** 전역 푸터 — hairline 보더 한 줄 구성(사이트명 · 섹션 링크 · 라이선스). */
export function SiteFooter() {
  const { t } = useI18n();

  return (
    <footer className="border-t border-border/60">
      <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-3 px-4 py-8 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <p>
          <span className="font-semibold tracking-tight text-foreground">doksam-ui</span>
          <span className="mx-2 text-border">·</span>
          {t("chrome.footer.tagline", "doksam 프로젝트 공통 UI 표준")}
        </p>
        <nav className="flex flex-wrap items-center gap-x-4 gap-y-1" aria-label={t("chrome.footer.aria", "푸터 내비게이션")}>
          {FOOTER_LINKS.map((link) => (
            <Link key={link.href} href={link.href} className="transition-colors hover:text-foreground">
              {link.label}
            </Link>
          ))}
        </nav>
        <p>{t("chrome.footer.license", "폰트 전부 SIL Open Font License · 코드 MIT")}</p>
      </div>
    </footer>
  );
}
