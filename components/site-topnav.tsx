"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BlueprintIcon,
  BooksIcon,
  CubeIcon,
  DiamondsFourIcon,
  GithubLogoIcon,
  HouseIcon,
  IdentificationBadgeIcon,
  ListIcon,
  NavigationArrowIcon,
  PaletteIcon,
  ShapesIcon,
  SquaresFourIcon,
  StackIcon,
} from "@phosphor-icons/react/dist/ssr";

import { FontSwitcher } from "@/components/font-switcher";
import { useI18n } from "@/components/i18n-provider";
import { LocaleSwitcher } from "@/components/locale-switcher";
import { CommandTrigger, SiteCommandMenu } from "@/components/site-command-menu";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

interface NavItem {
  /** i18n 안정 키 (chrome.nav.item.<key>.*) — 한글 라벨을 키에 쓰지 않기 위한 슬러그. */
  key: string;
  href: string;
  label: string;
  icon: typeof HouseIcon;
  description?: string;
}

interface NavGroup {
  /** i18n 안정 키 (chrome.nav.group.<key>). */
  key: string;
  label: string;
  items: NavItem[];
}

const HOME: NavItem = { key: "home", href: "/", label: "홈", icon: HouseIcon };
const RULES: NavItem = { key: "rules", href: "/rules", label: "Rules", icon: BooksIcon };

const GROUPS: NavGroup[] = [
  {
    key: "foundation",
    label: "파운데이션",
    items: [
      { key: "profiles", href: "/profiles", label: "Profiles", icon: IdentificationBadgeIcon, description: "브랜드 프로필 — 색·폰트 고정 조합" },
      { key: "archetypes", href: "/archetypes", label: "Archetypes", icon: NavigationArrowIcon, description: "레이아웃 원형 — 화면 뼈대 고정 조합" },
      { key: "tokens", href: "/tokens", label: "Tokens", icon: PaletteIcon, description: "컬러·radius·간격·타이포그래피" },
      { key: "icons", href: "/icons", label: "Icons", icon: ShapesIcon, description: "아이콘 표준과 weight 데모" },
    ],
  },
  {
    key: "catalog",
    label: "카탈로그",
    items: [
      { key: "components", href: "/components", label: "Components", icon: CubeIcon, description: "프리미티브 + 조합 컴포넌트" },
      { key: "patterns", href: "/patterns", label: "Patterns", icon: SquaresFourIcon, description: "화면 단위 조합 패턴" },
      { key: "templates", href: "/templates", label: "Templates", icon: StackIcon, description: "풀 앱 스캐폴드 템플릿" },
      { key: "wireframe", href: "/wireframe", label: "Wireframe", icon: BlueprintIcon, description: "드래그앤드랍 와이어프레임 빌더" },
    ],
  },
];

function isActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

function topLinkClass(active: boolean): string {
  return cn(
    "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm transition-colors",
    active
      ? "bg-accent font-medium text-accent-foreground"
      : "text-muted-foreground hover:bg-muted hover:text-foreground",
  );
}

/** 데스크톱(md 이상) 상단 내비 — 드롭다운 그룹 + 검색 + 스위처. */
export function SiteTopNav() {
  const pathname = usePathname();
  const { t } = useI18n();
  const [cmdOpen, setCmdOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-[1400px] items-center gap-2 px-4 sm:px-6">
        <Link href="/" className="flex shrink-0 items-center gap-2">
          <span className="flex size-6 items-center justify-center rounded-md bg-primary/10 text-primary">
            <DiamondsFourIcon size={15} weight="fill" />
          </span>
          <span className="text-sm font-semibold tracking-tight">doksam-ui</span>
        </Link>

        {/* 데스크톱 내비 */}
        <nav className="ml-4 hidden items-center gap-1 md:flex" aria-label={t("chrome.nav.aria", "사이트 내비게이션")}>
          <Link href={HOME.href} className={topLinkClass(isActive(pathname, HOME.href))}>
            {t(`chrome.nav.item.${HOME.key}.label`, HOME.label)}
          </Link>

          <NavigationMenu viewport={false}>
            <NavigationMenuList>
              {GROUPS.map((group) => {
                const groupActive = group.items.some((it) => isActive(pathname, it.href));
                return (
                  <NavigationMenuItem key={group.label}>
                    <NavigationMenuTrigger
                      className={cn("h-auto bg-transparent px-3 py-1.5", groupActive && "text-foreground")}
                    >
                      {t(`chrome.nav.group.${group.key}`, group.label)}
                    </NavigationMenuTrigger>
                    <NavigationMenuContent>
                      <ul className="grid w-[320px] gap-1 p-2">
                        {group.items.map((item) => {
                          const Icon = item.icon;
                          const active = isActive(pathname, item.href);
                          return (
                            <li key={item.href}>
                              <NavigationMenuLink asChild>
                                <Link
                                  href={item.href}
                                  aria-current={active ? "page" : undefined}
                                  className={cn(
                                    "flex items-start gap-2.5 rounded-md p-2.5 transition-colors",
                                    active ? "bg-accent" : "hover:bg-muted",
                                  )}
                                >
                                  <Icon size={18} weight={active ? "duotone" : "regular"} className="mt-0.5 text-primary" />
                                  <span className="flex flex-col gap-0.5">
                                    <span className="text-sm font-medium text-foreground">{t(`chrome.nav.item.${item.key}.label`, item.label)}</span>
                                    <span className="text-xs text-muted-foreground">{t(`chrome.nav.item.${item.key}.description`, item.description ?? "")}</span>
                                  </span>
                                </Link>
                              </NavigationMenuLink>
                            </li>
                          );
                        })}
                      </ul>
                    </NavigationMenuContent>
                  </NavigationMenuItem>
                );
              })}
            </NavigationMenuList>
          </NavigationMenu>

          <Link href={RULES.href} className={topLinkClass(isActive(pathname, RULES.href))}>
            {t(`chrome.nav.item.${RULES.key}.label`, RULES.label)}
          </Link>

          {/* md=768 은 이미 폭이 꽉 참(#48·#49) — 소개는 여유 있는 lg+ 에서만 노출, 그 아래는 모바일 시트가 커버. */}
          <a
            href="https://www.doksam.com"
            target="_blank"
            rel="noreferrer"
            className={cn(topLinkClass(false), "hidden lg:inline-flex")}
          >
            {t("chrome.nav.item.about.label", "소개")}
          </a>
        </nav>

        <div className="ml-auto flex items-center gap-2">
          {/* md~lg 구간은 스위처 3종이 추가돼 폭이 빠듯 — 트리거를 좁혀 가로 오버플로우 방지(#48). */}
          <CommandTrigger onClick={() => setCmdOpen(true)} className="hidden w-40 sm:flex md:w-28 lg:w-40" />
          <Button variant="ghost" size="icon" asChild className="hidden lg:inline-flex">
            <a href="https://github.com/leeyudok" target="_blank" rel="noreferrer" aria-label="GitHub">
              <GithubLogoIcon size={18} />
            </a>
          </Button>
          {/* 헤더 실측(#49): md=768 에선 칩 8개+셀렉트가 물리적으로 안 들어감 —
              칩은 xl+, GitHub 은 lg+, 셀렉트는 w-28 캡. 그 아래 구간은 모바일 시트가 커버. */}
          <div className="hidden items-center gap-1.5 md:flex">
            <LocaleSwitcher />
            <ThemeSwitcher presetChipsClassName="hidden xl:flex" />
            <FontSwitcher className="w-28" />
          </div>

          {/* 모바일 햄버거 */}
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" aria-label={t("chrome.nav.menu-open", "메뉴 열기")} className="md:hidden">
                <ListIcon size={20} />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="flex w-72 flex-col gap-4 overflow-y-auto px-3 py-4">
              <SheetTitle className="flex items-center gap-2 px-2 text-sm font-semibold tracking-tight">
                <span className="flex size-6 items-center justify-center rounded-md bg-primary/10 text-primary">
                  <DiamondsFourIcon size={15} weight="fill" />
                </span>
                doksam-ui
              </SheetTitle>
              <CommandTrigger
                onClick={() => {
                  setMobileOpen(false);
                  setCmdOpen(true);
                }}
              />
              <nav className="flex flex-col gap-4" aria-label={t("chrome.nav.mobile-aria", "모바일 내비게이션")}>
                <MobileLink item={HOME} pathname={pathname} onNavigate={() => setMobileOpen(false)} />
                {GROUPS.map((group) => (
                  <div key={group.label} className="flex flex-col gap-1">
                    <div className="px-2 text-[11px] font-medium uppercase tracking-wider text-muted-foreground/70">
                      {t(`chrome.nav.group.${group.key}`, group.label)}
                    </div>
                    {group.items.map((item) => (
                      <MobileLink key={item.href} item={item} pathname={pathname} onNavigate={() => setMobileOpen(false)} />
                    ))}
                  </div>
                ))}
                <MobileLink item={RULES} pathname={pathname} onNavigate={() => setMobileOpen(false)} />
                <a
                  href="https://www.doksam.com"
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-2.5 rounded-md px-2 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  {t("chrome.nav.item.about.label", "소개")}
                </a>
              </nav>
              <div className="mt-auto flex flex-col gap-2 border-t border-border px-2 pt-4">
                <a
                  href="https://github.com/leeyudok"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2.5 rounded-md px-2 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  <GithubLogoIcon size={17} />
                  GitHub
                </a>
                <LocaleSwitcher />
                <ThemeSwitcher />
                <FontSwitcher />
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      <SiteCommandMenu open={cmdOpen} onOpenChange={setCmdOpen} />
    </header>
  );
}

function MobileLink({
  item,
  pathname,
  onNavigate,
}: Readonly<{ item: NavItem; pathname: string; onNavigate: () => void }>) {
  const { t } = useI18n();
  const Icon = item.icon;
  const active = isActive(pathname, item.href);
  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      aria-current={active ? "page" : undefined}
      className={cn(
        "flex items-center gap-2.5 rounded-md px-2 py-1.5 text-sm transition-colors",
        active
          ? "bg-accent font-medium text-accent-foreground"
          : "text-muted-foreground hover:bg-muted hover:text-foreground",
      )}
    >
      <Icon size={17} weight={active ? "duotone" : "regular"} />
      {t(`chrome.nav.item.${item.key}.label`, item.label)}
    </Link>
  );
}
