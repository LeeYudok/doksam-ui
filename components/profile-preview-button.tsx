"use client";

import { useCallback, useEffect, useState } from "react";
import { EyeIcon } from "@phosphor-icons/react/dist/ssr";

import { Button } from "@/components/ui/button";
import {
  DENSITY_STORAGE_KEY,
  FONT_STORAGE_KEY,
  PERSONALITY_MOTION_STORAGE_KEY,
  PERSONALITY_SCALE_STORAGE_KEY,
  PERSONALITY_SURFACE_STORAGE_KEY,
  RADIUS_STORAGE_KEY,
  THEME_MODE_STORAGE_KEY,
  THEME_PRESET_STORAGE_KEY,
} from "@/lib/theme-storage";
import { getPersonalityPreset } from "@/personalities";
import type { BrandProfile } from "@/profiles";

interface ProfilePreviewButtonProps {
  profile: BrandProfile;
}

/**
 * 사이트 전체 테마/폰트/모드를 클릭한 프로필 조합으로 즉시 전환한다.
 * 카드마다 독립된 useThemePreset/useFontPreset 훅을 쓰면 stale local state의
 * setState bail-out으로 DOM 갱신이 씹히는 문제가 있어(#42), 여기서는 <html>
 * 속성·localStorage에 직접 적용한다 — 상태 의존이 없어 항상 반영된다.
 */
export function ProfilePreviewButton({ profile }: Readonly<ProfilePreviewButtonProps>) {
  const [active, setActive] = useState(false);

  const syncActive = useCallback(() => {
    const root = document.documentElement;
    // personality 가 undefined(레지스트리 불일치)면 아래 비교는 <html> 에 속성이
    // 없을 때만 참 — 프로필 무결성 테스트가 이 경우를 사전에 막는다.
    const personality = getPersonalityPreset(profile.personality);
    const surface = root.getAttribute("data-personality-surface");
    const motion = root.getAttribute("data-personality-motion");
    setActive(
      root.dataset.theme === profile.theme &&
        root.dataset.font === profile.font &&
        (root.dataset.density === undefined || root.dataset.density === profile.density) &&
        (root.dataset.personality === undefined || root.dataset.personality === personality?.scale) &&
        // scale 이 같아도 surface/motion 이 다른 프리셋일 수 있어(#90 CodeRabbit
        // finding) 존재하는 속성은 모두 비교한다 — 속성이 없으면(레지스트리
        // 불일치 등) 기존과 동일하게 비교를 건너뛴다.
        (surface === null || surface === personality?.surface) &&
        (motion === null || motion === personality?.motion) &&
        (root.classList.contains("dark") ? "dark" : "light") === profile.defaultMode,
    );
  }, [profile]);

  useEffect(() => {
    // mount 직후 1회 <html> 상태로 동기화(의도된 mount-sync).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    syncActive();
    // 다른 프로필 미리보기·스위처가 <html>을 바꾸면 활성 상태도 갱신.
    const observer = new MutationObserver(syncActive);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: [
        "data-theme",
        "data-font",
        "data-density",
        "data-personality",
        "data-personality-surface",
        "data-personality-motion",
        "class",
      ],
    });
    return () => observer.disconnect();
  }, [syncActive]);

  const handleClick = useCallback(() => {
    const root = document.documentElement;
    const personality = getPersonalityPreset(profile.personality);
    root.dataset.theme = profile.theme;
    root.dataset.font = profile.font;
    root.dataset.density = profile.density;
    root.style.setProperty("--radius", profile.radius);
    root.classList.toggle("dark", profile.defaultMode === "dark");
    window.localStorage.setItem(THEME_PRESET_STORAGE_KEY, profile.theme);
    window.localStorage.setItem(FONT_STORAGE_KEY, profile.font);
    window.localStorage.setItem(THEME_MODE_STORAGE_KEY, profile.defaultMode);
    window.localStorage.setItem(DENSITY_STORAGE_KEY, profile.density);
    window.localStorage.setItem(RADIUS_STORAGE_KEY, profile.radius);
    // 프리셋을 못 찾으면 personality 속성·키를 건드리지 않는다(밀도 층과 동일한 opt-in).
    if (personality) {
      root.dataset.personality = personality.scale;
      root.setAttribute("data-personality-surface", personality.surface);
      root.setAttribute("data-personality-motion", personality.motion);
      window.localStorage.setItem(PERSONALITY_SCALE_STORAGE_KEY, personality.scale);
      window.localStorage.setItem(PERSONALITY_SURFACE_STORAGE_KEY, personality.surface);
      window.localStorage.setItem(PERSONALITY_MOTION_STORAGE_KEY, personality.motion);
    }
  }, [profile]);

  return (
    <Button type="button" variant={active ? "default" : "outline"} size="sm" onClick={handleClick}>
      <EyeIcon size={14} weight="regular" />
      {active ? "적용됨" : "이 프로필 미리보기"}
    </Button>
  );
}
