"use client";

import { useState } from "react";
import { MoonIcon, SunIcon } from "@phosphor-icons/react/dist/ssr";

import { cn } from "@/lib/utils";
import type { ThemeMode } from "@/lib/theme-storage";
import { getPersonalityPreset, personalityAttrs } from "@/personalities";
import type { BrandProfile } from "@/profiles";

interface ProfilePreviewKitProps {
  profile: BrandProfile;
}

/**
 * 프로필 카드 안의 미니 앱 미니어처 — data-theme/data-font/data-density 와
 * --radius 오버라이드를 이 컨테이너에 직접 걸어 app/globals.css 의 선택자를
 * (사이트 전체가 아니라) 이 블록 하나에만 스코프한다. 프로필을 실제로 사이트에
 * 적용하지 않고도 색·타이포·radius·밀도 조합을 그대로 미리 볼 수 있다.
 * 모드 토글은 이 미니어처에만 적용되는 로컬 상태다(사이트 전체 전환은
 * ProfilePreviewButton 담당).
 */
export function ProfilePreviewKit({ profile }: Readonly<ProfilePreviewKitProps>) {
  const [mode, setMode] = useState<ThemeMode>(profile.defaultMode);
  const dark = mode === "dark";
  const personality = getPersonalityPreset(profile.personality);

  return (
    <div
      data-theme={profile.theme}
      data-font={profile.font}
      data-density={profile.density}
      // personality 토큰 층(#90) — 프리셋을 못 찾으면 속성이 방출되지 않아 층 비활성
      {...personalityAttrs(personality)}
      style={{ "--radius": profile.radius } as React.CSSProperties}
      className={cn(
        "flex flex-col overflow-hidden rounded-lg border border-border bg-background font-sans text-foreground",
        dark && "dark",
      )}
    >
      {/* 상단바 */}
      <div className="flex items-center justify-between border-b border-border bg-card px-3 py-2">
        <span className="text-sm font-semibold text-card-foreground">{profile.label}</span>
        <button
          type="button"
          aria-label={dark ? "라이트 모드 미리보기" : "다크 모드 미리보기"}
          onClick={() => setMode(dark ? "light" : "dark")}
          className="rounded-md border border-border p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          {dark ? <SunIcon className="size-3.5" /> : <MoonIcon className="size-3.5" />}
        </button>
      </div>

      <div className="flex">
        {/* 사이드 내비 — examples 를 메뉴 항목으로 재활용 */}
        <nav className="flex w-24 shrink-0 flex-col gap-1 border-r border-border bg-card/50 p-2">
          {[profile.label, ...profile.examples].slice(0, 3).map((item, index) => (
            <span
              key={item}
              className={cn(
                "truncate rounded-md px-1.5 py-1 text-[10px]",
                index === 0
                  ? "bg-primary font-medium text-primary-foreground"
                  : "text-muted-foreground",
              )}
            >
              {item}
            </span>
          ))}
        </nav>

        {/* 본문: 통계 카드 2 + 테이블 행 2 */}
        <div className="flex flex-1 flex-col gap-2 p-2">
          <div className="grid grid-cols-2 gap-2">
            {/* data-slot="card" — personality surface 토큰 층([data-personality-surface="shadow"|"flat"] [data-slot="card"])이
                이 타일을 실제 Card 로 인식하게 한다(CodeRabbit #90 finding). */}
            <div data-slot="card" className="rounded-md border border-border bg-card p-2">
              <p className="text-[10px] text-muted-foreground">오늘 처리</p>
              <p className="text-sm font-semibold text-card-foreground">1,284</p>
            </div>
            <div data-slot="card" className="rounded-md border border-border bg-card p-2">
              <p className="text-[10px] text-muted-foreground">성공률</p>
              <p className="text-sm font-semibold text-card-foreground">99.2%</p>
            </div>
          </div>
          <div className="overflow-hidden rounded-md border border-border">
            <div className="flex items-center justify-between border-b border-border bg-muted/50 px-2 py-1">
              <span className="text-[10px] text-muted-foreground">{profile.examples[0]}</span>
              <span className="rounded-full bg-secondary px-1.5 text-[10px] text-secondary-foreground">
                {dark ? "다크" : "라이트"}
              </span>
            </div>
            <div className="flex items-center justify-between px-2 py-1">
              <span className="text-[10px] text-foreground">배치 #241</span>
              <span className="text-[10px] text-muted-foreground">완료</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
