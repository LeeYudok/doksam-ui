"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  BlueprintIcon,
  BooksIcon,
  CubeIcon,
  HouseIcon,
  IdentificationBadgeIcon,
  MagnifyingGlassIcon,
  NavigationArrowIcon,
  PaletteIcon,
  ShapesIcon,
  SquaresFourIcon,
  StackIcon,
} from "@phosphor-icons/react/dist/ssr";

import { useI18n } from "@/components/i18n-provider";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { COMPONENT_REGISTRY } from "@/lib/showcase/registry";
import { TEMPLATE_REGISTRY } from "@/lib/templates/registry";
import { PATTERN_REGISTRY } from "@/lib/patterns/registry";
import { cn } from "@/lib/utils";

const PAGES = [
  { href: "/", label: "홈", icon: HouseIcon },
  { href: "/profiles", label: "Profiles", icon: IdentificationBadgeIcon },
  { href: "/archetypes", label: "Archetypes", icon: NavigationArrowIcon },
  { href: "/tokens", label: "Tokens", icon: PaletteIcon },
  { href: "/icons", label: "Icons", icon: ShapesIcon },
  { href: "/components", label: "Components", icon: CubeIcon },
  { href: "/patterns", label: "Patterns", icon: SquaresFourIcon },
  { href: "/templates", label: "Templates", icon: StackIcon },
  { href: "/wireframe", label: "Wireframe", icon: BlueprintIcon },
  { href: "/rules", label: "Rules", icon: BooksIcon },
];

/**
 * ⌘K 커맨드 팔레트 — 페이지·컴포넌트·패턴·템플릿으로 바로 점프한다.
 * 사이드바 검색 버튼(open prop)과 전역 단축키(⌘K / Ctrl+K) 둘 다로 열린다.
 */
export function SiteCommandMenu({
  open,
  onOpenChange,
}: Readonly<{ open: boolean; onOpenChange: (open: boolean) => void }>) {
  const router = useRouter();
  const { t } = useI18n();

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        onOpenChange(!open);
      }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onOpenChange]);

  function go(href: string) {
    onOpenChange(false);
    router.push(href);
  }

  return (
    <CommandDialog
      open={open}
      onOpenChange={onOpenChange}
      title={t("chrome.cmd.title", "검색")}
      description={t("chrome.cmd.description", "페이지·컴포넌트·패턴·템플릿을 검색해 바로 이동합니다.")}
    >
      <CommandInput placeholder={t("chrome.cmd.placeholder", "페이지·컴포넌트·패턴 검색...")} />
      <CommandList>
        <CommandEmpty>{t("chrome.cmd.empty", "결과가 없습니다.")}</CommandEmpty>
        <CommandGroup heading={t("chrome.cmd.group.pages", "페이지")}>
          {PAGES.map((p) => {
            const Icon = p.icon;
            return (
              <CommandItem key={p.href} value={`page ${p.label}`} onSelect={() => go(p.href)}>
                <Icon size={16} />
                {p.href === "/" ? t("chrome.nav.item.home.label", p.label) : p.label}
              </CommandItem>
            );
          })}
        </CommandGroup>
        <CommandGroup heading={t("chrome.cmd.group.templates", "템플릿")}>
          {TEMPLATE_REGISTRY.map((t) => (
            <CommandItem
              key={t.href}
              value={`template ${t.title}`}
              onSelect={() => go(t.href)}
            >
              <StackIcon size={16} />
              {t.title}
            </CommandItem>
          ))}
        </CommandGroup>
        <CommandGroup heading={t("chrome.cmd.group.components", "컴포넌트")}>
          {COMPONENT_REGISTRY.map((c) => (
            <CommandItem
              key={c.slug}
              value={`component ${c.title} ${c.slug}`}
              onSelect={() => go(`/components/${c.slug}`)}
            >
              <CubeIcon size={16} />
              {c.title}
            </CommandItem>
          ))}
        </CommandGroup>
        <CommandGroup heading={t("chrome.cmd.group.patterns", "패턴")}>
          {PATTERN_REGISTRY.map((p) => (
            <CommandItem
              key={p.slug}
              value={`pattern ${p.title} ${p.slug}`}
              onSelect={() => go(`/patterns/${p.slug}`)}
            >
              <SquaresFourIcon size={16} />
              {p.title}
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}

/** 사이드바 상단 검색 트리거 버튼(⌘K 힌트 포함). */
export function CommandTrigger({
  onClick,
  className,
}: Readonly<{ onClick: () => void; className?: string }>) {
  const { t } = useI18n();

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex w-full items-center gap-2 rounded-md border border-border bg-muted/40 px-2.5 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted",
        className,
      )}
    >
      <MagnifyingGlassIcon size={15} />
      <span className="flex-1 text-left">{t("chrome.cmd.title", "검색")}</span>
      <kbd className="rounded border border-border bg-background px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
        ⌘K
      </kbd>
    </button>
  );
}
