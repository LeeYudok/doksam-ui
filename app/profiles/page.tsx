import { CopyButton } from "@/components/copy-button";
import { TranslatedText } from "@/components/showcase/translated-text";
import { ProfilePreviewButton } from "@/components/profile-preview-button";
import { ProfilePreviewKit } from "@/components/profile-preview-kit";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FONT_PRESETS, getFontPreset } from "@/fonts";
import { generateProfileCode } from "@/lib/profile-css";
import { getPersonalityPreset } from "@/personalities";
import { BRAND_PROFILES } from "@/profiles";
import { THEME_PRESETS, getThemePreset } from "@/themes";

export default function ProfilesPage() {
  return (
    <div className="flex flex-col gap-10">
      <section className="flex flex-col gap-3">
        <Badge variant="secondary" className="w-fit">
          Profiles
        </Badge>
        <h1 className="text-2xl font-semibold tracking-tight"><TranslatedText k="page.profiles.title" ko="브랜드 프로필" /></h1>
        <p className="max-w-prose text-sm text-muted-foreground">
          <TranslatedText
            k="page.profiles.description"
            ko="테마 프리셋 {theme}종 · 폰트 프리셋 {font}종을 프로젝트마다 따로 고르면 조합이 발산합니다. 프로필은 그 선택을 미리 고정해 둔 층입니다 — 프로젝트는 색과 폰트를 개별로 고르지 않고, 아래 {count}종 중 프로필 하나만 지정합니다."
            params={{ theme: THEME_PRESETS.length, font: FONT_PRESETS.length, count: BRAND_PROFILES.length }}
          />
        </p>
      </section>

      <div className="grid gap-4 lg:grid-cols-3">
        {BRAND_PROFILES.map((profile) => (
          <ProfileCard key={profile.name} profile={profile} />
        ))}
      </div>
    </div>
  );
}

function ProfileCard({ profile }: Readonly<{ profile: (typeof BRAND_PROFILES)[number] }>) {
  const theme = getThemePreset(profile.theme);
  const font = getFontPreset(profile.font);
  const personality = getPersonalityPreset(profile.personality);
  const code = generateProfileCode(profile);
  const installCommand = `npx shadcn@latest add https://ui.doksam.com/r/profile-${profile.name}.json`;

  return (
    <Card className="flex h-full flex-col">
      <CardHeader>
        <div className="flex items-center gap-2">
          {theme ? (
            <span
              aria-hidden="true"
              className="size-3.5 rounded-full ring-1 ring-inset ring-border"
              style={{ backgroundColor: theme.swatch }}
            />
          ) : null}
          <CardTitle>{profile.label}</CardTitle>
        </div>
        <CardDescription>
          <TranslatedText k={`profile.${profile.name}.description`} ko={profile.description} />
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-4">
        <ProfilePreviewKit profile={profile} />

        <dl className="flex flex-col gap-1 text-xs text-muted-foreground">
          <div className="flex justify-between gap-2">
            <dt>테마</dt>
            <dd className="text-foreground">{theme?.label ?? profile.theme}</dd>
          </div>
          <div className="flex justify-between gap-2">
            <dt>폰트</dt>
            <dd className="text-foreground">{font?.label ?? profile.font}</dd>
          </div>
          <div className="flex justify-between gap-2">
            <dt>
              <TranslatedText k="page.profiles.meta.radius" ko="Radius" />
            </dt>
            <dd className="text-foreground">{profile.radius}</dd>
          </div>
          <div className="flex justify-between gap-2">
            <dt>
              <TranslatedText k="page.profiles.meta.density" ko="밀도" />
            </dt>
            <dd className="text-foreground">{profile.density}</dd>
          </div>
          <div className="flex justify-between gap-2">
            <dt>
              <TranslatedText k="page.profiles.meta.personality" ko="시각 성격" />
            </dt>
            {/* 레지스트리에 없는 이름이면 raw 키를 그대로 보여 불일치가 눈에 띄게 한다(theme/font 와 동일) */}
            <dd className="text-foreground">{personality?.label ?? profile.personality}</dd>
          </div>
          {profile.shell ? (
            <div className="flex justify-between gap-2">
              <dt>
                <TranslatedText k="page.profiles.meta.shell" ko="권장 셸" />
              </dt>
              <dd className="text-foreground">{profile.shell}</dd>
            </div>
          ) : null}
          <div className="flex justify-between gap-2">
            <dt>적용 대상 예시</dt>
            <dd className="text-right text-foreground">{profile.examples.join(" · ")}</dd>
          </div>
        </dl>

        <div className="flex items-center gap-2 rounded-md border border-border bg-muted/40 px-2 py-1.5">
          <code className="min-w-0 flex-1 truncate font-mono text-[11px] text-muted-foreground">
            {installCommand}
          </code>
          <CopyButton value={installCommand} label="설치 명령 복사" />
        </div>

        <div className="mt-auto flex items-center gap-2">
          <ProfilePreviewButton profile={profile} />
          <CopyButton value={code} label="적용 코드 복사" />
        </div>
      </CardContent>
    </Card>
  );
}
