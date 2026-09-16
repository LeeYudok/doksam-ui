"use client";

import Link from "next/link";
import { ArrowRightIcon } from "@phosphor-icons/react/dist/ssr";

import { DevicePreview } from "@/components/device-preview";
import { useI18n } from "@/components/i18n-provider";
import { CatalogShell } from "@/components/showcase/catalog-shell";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TEMPLATE_REGISTRY } from "@/lib/templates/registry";

// 템플릿 상세는 풀 앱 스캐폴드라 풀폭이 필요 — 사이드바 셸은 인덱스에만 건다.
const SIDEBAR_GROUPS = [
  { links: TEMPLATE_REGISTRY.map((t) => ({ href: t.href, label: t.title })) },
];

export default function TemplatesPage() {
  const { t } = useI18n();

  return (
    <CatalogShell indexHref="/templates" indexLabel="전체 보기" groups={SIDEBAR_GROUPS}>
      <div className="flex flex-col gap-10">
        <section className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="w-fit">
              {t("page.templates.badge", "플래그십 번들")}
            </Badge>
            <Badge className="w-fit bg-success text-primary-foreground">{t("page.templates.free", "무료")}</Badge>
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">{t("page.templates.title", "템플릿")}</h1>
          <p className="max-w-prose text-muted-foreground">
            {t(
              "page.templates.description",
              "브랜드 프로필과 표준 패턴을 조립해 바로 배포할 수 있는 풀 앱 스캐폴드입니다. 각 템플릿은 해당 프로필 토큰을 강제 적용하며, 카탈로그의 컴포넌트를 그대로 사용합니다.",
            )}
          </p>
        </section>

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {TEMPLATE_REGISTRY.map((tpl) => {
            const Icon = tpl.icon;
            return (
              <Link key={tpl.href} href={tpl.href} className="group">
                <Card className="h-full transition-colors group-hover:border-primary/50">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <Icon size={24} weight="duotone" className="text-primary" />
                      <ArrowRightIcon
                        size={16}
                        className="text-muted-foreground transition-transform group-hover:translate-x-0.5"
                      />
                    </div>
                    {/* #37 — 이 템플릿이 실물로 보여주는 레이아웃 원형. 원형을 고른 뒤
                        "그럼 어느 템플릿을 열어보면 되는가"를 목록에서 바로 되짚게 한다. */}
                    <Badge variant="secondary" className="w-fit font-mono text-[11px]">
                      {tpl.archetype}
                    </Badge>
                    <CardTitle>{tpl.title}</CardTitle>
                    <CardDescription>{tpl.profile}</CardDescription>
                  </CardHeader>
                  <CardContent className="flex flex-col gap-3">
                    <p className="text-sm text-muted-foreground">{t(`template.${tpl.href.split("/").pop() ?? ""}.description`, tpl.description)}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {tpl.stack.map((s) => (
                        <Badge key={s} variant="outline" className="font-mono text-[11px]">
                          {s}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </section>

        <section className="flex flex-col gap-3">
          <div>
            <h2 className="text-sm font-medium text-muted-foreground">{t("page.templates.preview-title", "반응형 미리보기")}</h2>
            <p className="max-w-prose text-sm text-muted-foreground">
              {t(
                "page.templates.preview-description",
                "데스크톱·태블릿·모바일 3모드로 실제 반응형 동작을 확인하세요. 모든 템플릿은 모바일에서 사이드바가 드로어로 접히고 그리드·테이블이 리플로우됩니다.",
              )}
            </p>
          </div>
          <DevicePreview src="/templates/trading" title="Trading Dashboard 반응형 미리보기" height={640} />
        </section>

        <section className="flex flex-col gap-2 rounded-lg border border-border bg-muted/40 p-4 text-sm text-muted-foreground">
          <p className="font-medium text-foreground">{t("page.templates.install-title", "설치 · 사용")}</p>
          <p>
            {t("page.templates.install-description", "각 템플릿은 해당 프로필과 표준 컴포넌트로만 구성됩니다. 카탈로그 항목은")}{" "}
            <Link href="/llms.txt" className="underline underline-offset-2">
              llms.txt
            </Link>{" "}
            와 shadcn 커스텀 레지스트리(<code className="break-all font-mono">npx shadcn add https://ui.doksam.com/r/&lt;name&gt;.json</code>)로
            설치할 수 있습니다.
          </p>
        </section>
      </div>
    </CatalogShell>
  );
}
