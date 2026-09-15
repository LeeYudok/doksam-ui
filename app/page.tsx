"use client";

import Link from "next/link";
import {
  ArrowRightIcon,
  BooksIcon,
  CubeIcon,
  IdentificationBadgeIcon,
  PaintBrushIcon,
  PaletteIcon,
  ShapesIcon,
  SparkleIcon,
  SquaresFourIcon,
  StackIcon,
} from "@phosphor-icons/react/dist/ssr";

import { useI18n } from "@/components/i18n-provider";
import { Badge } from "@/components/ui/badge";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { THEME_PRESETS } from "@/themes";

interface SectionCard {
  href: string;
  title: string;
  description: string;
  icon: typeof PaletteIcon;
}

const SECTIONS: SectionCard[] = [
  {
    href: "/profiles",
    title: "Profiles",
    description: "프로젝트는 먼저 프로필을 정한다 — 색·폰트 조합을 고정한 브랜드 프로필 3종",
    icon: IdentificationBadgeIcon,
  },
  {
    href: "/tokens",
    title: "Tokens",
    description: "프리셋별 컬러 토큰 · radius · 간격 · 타이포그래피",
    icon: PaletteIcon,
  },
  {
    href: "/personalities",
    title: "Personalities",
    description: "타입/스페이싱 스케일 · 표면 · 모션 강도를 고정하는 시각 성격 프리셋 4종",
    icon: PaintBrushIcon,
  },
  {
    href: "/icons",
    title: "Icons",
    description: "Phosphor · Lucide · Tabler 사용 규칙과 weight 데모",
    icon: ShapesIcon,
  },
  {
    href: "/components",
    title: "Components",
    description: "shadcn/ui 전 컴포넌트 라이브 데모 + 코드 스니펫",
    icon: CubeIcon,
  },
  {
    href: "/patterns",
    title: "Patterns",
    description: "레이아웃·데이터 시각화·상태·관측성 등 조합 패턴",
    icon: SquaresFourIcon,
  },
  {
    href: "/templates",
    title: "Templates",
    description: "프로필·패턴을 조립한 풀 앱 스캐폴드 5종 (무료)",
    icon: StackIcon,
  },
  {
    href: "/rules",
    title: "Rules",
    description: "AI 프롬프트에 그대로 붙여넣는 사용 규칙 markdown 원문",
    icon: BooksIcon,
  },
];

export default function Home() {
  const { t } = useI18n();

  return (
    <div className="flex flex-col gap-10">
      <section className="flex flex-col gap-3">
        <Badge variant="secondary" className="w-fit">
          doksam-ui
        </Badge>
        <h1 className="text-3xl font-semibold tracking-tight">
          {t("page.home.title", "doksam 프로젝트 공통 UI 표준 사이트")}
        </h1>
        <p className="max-w-prose text-muted-foreground">
          {t(
            "page.home.description",
            "shadcn/ui 기반 디자인 토큰과 전 컴포넌트 쇼케이스를 한곳에 모은 레퍼런스입니다. 사람에게는 눈으로 보는 가이드가 되고, 여러 프로젝트에는 색·타이포그래피·컴포넌트 코드를 그대로 복사해 쓰는 단일 진실원천(SSOT)이 됩니다.",
          )}
        </p>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-medium text-muted-foreground">{t("page.home.presets-title", "프리셋 스위처")}</h2>
        <p className="max-w-prose text-sm text-muted-foreground">
          {t(
            "page.home.presets-description",
            "상단 우측의 프리셋 칩으로 {presets} 중 하나를 고르고, 아래 아이콘으로 라이트/다크를, 폰트 선택으로 서체를 전환할 수 있습니다. 선택은 브라우저에 저장되어 다음 방문 시에도 유지됩니다. 어디서든",
            { presets: THEME_PRESETS.map((p) => p.label).join(" · ") },
          )}{" "}
          <kbd className="rounded border border-border bg-muted px-1 font-mono text-xs">⌘K</kbd>{" "}
          {t("page.home.presets-description-2", "로 원하는 페이지·컴포넌트를 검색해 바로 이동할 수 있습니다.")}
        </p>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-medium text-muted-foreground">{t("page.home.sections-title", "섹션")}</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {SECTIONS.map((section) => {
            const Icon = section.icon;
            return (
              <Link key={section.href} href={section.href} className="group">
                <Card className="h-full transition-colors group-hover:border-primary/50">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <Icon size={22} weight="regular" className="text-primary" />
                      <ArrowRightIcon
                        size={16}
                        weight="regular"
                        className="text-muted-foreground transition-transform group-hover:translate-x-0.5"
                      />
                    </div>
                    <CardTitle>{section.title}</CardTitle>
                    <CardDescription>{t(`page.home.section.${section.href.replace("/", "")}.description`, section.description)}</CardDescription>
                  </CardHeader>
                </Card>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="flex items-start gap-2 rounded-lg border border-border bg-muted/40 p-4 text-sm text-muted-foreground">
        <SparkleIcon size={18} weight="regular" className="mt-0.5 shrink-0 text-primary" />
        <p>
          {t("page.home.ai-callout-1", "AI 에이전트에게는")}{" "}
          <span className="font-medium text-foreground">&ldquo;ui.doksam.com 참고해&rdquo;</span>
          {t("page.home.ai-callout-2", "라고만 지시하면 됩니다 —")} <Link href="/rules" className="underline underline-offset-2">/rules</Link>
          {" "}{t("page.home.ai-callout-3", "페이지가 프롬프트에 그대로 붙여넣을 수 있는 규칙 원문을 제공합니다.")}
        </p>
      </section>

      <section className="flex flex-col gap-3 rounded-lg border border-border p-4">
        <h2 className="text-sm font-medium text-muted-foreground">{t("page.home.install-title", "AI로 설치하는 법")}</h2>
        <p className="max-w-prose text-sm text-muted-foreground">
          {t(
            "page.home.install-description",
            "doksam-ui 고유 컴포넌트·유틸·프로필은 self-host shadcn 커스텀 레지스트리로 직접 설치할 수 있습니다. 전체 목록과 설치 명령은",
          )}{" "}
          <a href="/llms.txt" className="underline underline-offset-2">
            llms.txt
          </a>{" "}
          {t("page.home.install-description-2", "에서 AI가 그대로 읽을 수 있습니다.")}
        </p>
        <pre className="overflow-x-auto rounded-md bg-muted/60 p-3 font-mono text-xs text-foreground">
          npx shadcn add https://ui.doksam.com/r/badge-extended.json
        </pre>
      </section>
    </div>
  );
}
