import type { Metadata } from "next";
import localFont from "next/font/local";
import Script from "next/script";

import { SiteFooter } from "@/components/site-footer";
import { SiteTopNav } from "@/components/site-topnav";
import { TooltipProvider } from "@/components/ui/tooltip";
import { DEFAULT_FONT_PRESET } from "@/fonts";
import { I18nProvider } from "@/components/i18n-provider";
import {
  DENSITY_STORAGE_KEY,
  FONT_STORAGE_KEY,
  LOCALE_STORAGE_KEY,
  PERSONALITY_MOTION_STORAGE_KEY,
  PERSONALITY_SCALE_STORAGE_KEY,
  PERSONALITY_SURFACE_STORAGE_KEY,
  RADIUS_STORAGE_KEY,
  THEME_MODE_STORAGE_KEY,
  THEME_PRESET_STORAGE_KEY,
} from "@/lib/theme-storage";
import { DEFAULT_THEME_PRESET } from "@/themes";

import "./globals.css";

// Google Analytics 측정 ID. 설정된 배포에서만 gtag 를 로드하고, 미설정(포크·로컬)이면
// 외부 리소스를 전혀 부르지 않는다.
const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

// 폐쇄망(금융권) 대응: 전부 next/font/local + 레포 내 woff2(assets/fonts/) —
// next/font/google(빌드 타임 CDN fetch) 대신 이 패턴을 표준으로 쓴다.
// 출처·라이선스는 assets/fonts/<name>/LICENSE 참고, 전부 SIL Open Font License(OFL).
const geistSans = localFont({
  src: "../assets/fonts/geist/geist-latin-wght-normal.woff2",
  variable: "--font-geist-sans",
  display: "swap",
});

const geistMono = localFont({
  src: "../assets/fonts/geist-mono/geist-mono-latin-wght-normal.woff2",
  variable: "--font-geist-mono",
  display: "swap",
});

// 전부 무료(SIL Open Font License) 폰트 — fonts/index.ts FONT_PRESETS 와
// 1:1 대응. 새 프리셋을 추가하려면 여기서 로드하고 variable 을 등록한 뒤
// fonts/index.ts + app/globals.css [data-font] 블록을 같이 갱신할 것.
// 한글 서브셋은 각 woff2 파일에 라틴/숫자/한글이 함께 포함돼 있어 별도
// latin 서브셋 파일이 필요 없다(fontsource korean 서브셋 기준으로 확인).
const notoSansKR = localFont({
  src: [
    { path: "../assets/fonts/noto-sans-kr/noto-sans-kr-korean-400.woff2", weight: "400", style: "normal" },
    { path: "../assets/fonts/noto-sans-kr/noto-sans-kr-korean-500.woff2", weight: "500", style: "normal" },
    { path: "../assets/fonts/noto-sans-kr/noto-sans-kr-korean-700.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-noto-sans-kr",
  display: "swap",
});

const ibmPlexSansKR = localFont({
  src: [
    { path: "../assets/fonts/ibm-plex-sans-kr/ibm-plex-sans-kr-korean-400.woff2", weight: "400", style: "normal" },
    { path: "../assets/fonts/ibm-plex-sans-kr/ibm-plex-sans-kr-korean-500.woff2", weight: "500", style: "normal" },
    { path: "../assets/fonts/ibm-plex-sans-kr/ibm-plex-sans-kr-korean-600.woff2", weight: "600", style: "normal" },
    { path: "../assets/fonts/ibm-plex-sans-kr/ibm-plex-sans-kr-korean-700.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-ibm-plex-kr",
  display: "swap",
});

const nanumGothic = localFont({
  src: [
    { path: "../assets/fonts/nanum-gothic/nanum-gothic-korean-400.woff2", weight: "400", style: "normal" },
    { path: "../assets/fonts/nanum-gothic/nanum-gothic-korean-700.woff2", weight: "700", style: "normal" },
    { path: "../assets/fonts/nanum-gothic/nanum-gothic-korean-800.woff2", weight: "800", style: "normal" },
  ],
  variable: "--font-nanum-gothic",
  display: "swap",
});

// Space Grotesk 는 라틴 전용(variable) — 한글 글리프가 없어 한글은 self-host 한
// Noto Sans KR 로 폴백된다(app/globals.css 의 --font-active 체인). mono
// 페어링(Space Mono)과 함께 fonts/index.ts "space-grotesk" 프리셋에서만 쓰인다.
const spaceGrotesk = localFont({
  src: "../assets/fonts/space-grotesk/space-grotesk-latin-wght-normal.woff2",
  variable: "--font-space-grotesk",
  display: "swap",
});

const spaceMono = localFont({
  src: [
    { path: "../assets/fonts/space-mono/space-mono-latin-400.woff2", weight: "400", style: "normal" },
    { path: "../assets/fonts/space-mono/space-mono-latin-700.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-space-mono",
  display: "swap",
});

// 블루프린트 템플릿(#59) 전용 타이포 — Noto Serif KR(제목) · Gowun Dodum(본문)
// · JetBrains Mono(라벨/코드) 조합. 이 3종은 "한 벌"로 함께 써야 룩이 성립하는
// 템플릿 전속 폰트라, 단일 body 폰트를 고르는 전역 스위처(FONT_PRESETS)에는
// 넣지 않는다. 변수만 전역 등록하고 app/templates/(k8s-firewall|docker-container)
// 서브트리에서 CSS 변수로 직접 참조한다. 전부 OFL(assets/fonts/<name>/LICENSE).
const notoSerifKR = localFont({
  src: [{ path: "../assets/fonts/noto-serif-kr/noto-serif-kr-korean-900.woff2", weight: "900", style: "normal" }],
  variable: "--font-noto-serif-kr",
  display: "swap",
});

const gowunDodum = localFont({
  src: [{ path: "../assets/fonts/gowun-dodum/gowun-dodum-korean-400.woff2", weight: "400", style: "normal" }],
  variable: "--font-gowun-dodum",
  display: "swap",
});

const jetBrainsMono = localFont({
  src: [
    { path: "../assets/fonts/jetbrains-mono/jetbrains-mono-latin-400.woff2", weight: "400", style: "normal" },
    { path: "../assets/fonts/jetbrains-mono/jetbrains-mono-latin-600.woff2", weight: "600", style: "normal" },
  ],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "doksam-ui",
  description: "doksam 프로젝트 공통 UI 표준 사이트 — 디자인 토큰 · 컴포넌트 레퍼런스",
};

// FOUC(깜빡임) 방지: hydration 전에 localStorage 값을 읽어 <html> 에
// data-theme / data-font / dark 클래스를 바로 세팅한다.
// hooks/use-theme-preset.ts · hooks/use-font-preset.ts 가 쓰는 것과 동일한
// 키를 사용 — lib/theme-storage.ts 상수를 문자열로 인라인.
const THEME_INIT_SCRIPT = `
(function () {
  try {
    var presetKey = ${JSON.stringify(THEME_PRESET_STORAGE_KEY)};
    var modeKey = ${JSON.stringify(THEME_MODE_STORAGE_KEY)};
    var fontKey = ${JSON.stringify(FONT_STORAGE_KEY)};
    var preset = window.localStorage.getItem(presetKey) || ${JSON.stringify(DEFAULT_THEME_PRESET)};
    var storedMode = window.localStorage.getItem(modeKey);
    var mode = storedMode || (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    var font = window.localStorage.getItem(fontKey) || ${JSON.stringify(DEFAULT_FONT_PRESET)};
    var localeKey = ${JSON.stringify(LOCALE_STORAGE_KEY)};
    var locale = window.localStorage.getItem(localeKey) || "ko";
    var root = document.documentElement;
    root.setAttribute("lang", locale);
    root.setAttribute("data-theme", preset);
    root.setAttribute("data-font", font);
    if (mode === "dark") root.classList.add("dark");
    // 브랜드 프로필 미리보기(#65)가 저장한 radius·density — 값이 있을 때만 반영.
    var density = window.localStorage.getItem(${JSON.stringify(DENSITY_STORAGE_KEY)});
    if (density) root.setAttribute("data-density", density);
    var radius = window.localStorage.getItem(${JSON.stringify(RADIUS_STORAGE_KEY)});
    if (radius) root.style.setProperty("--radius", radius);
    // 시각 성격(personality) 토큰 층(#90) — 밀도와 동일한 패턴으로 raw 값을
    // 그대로 저장/반영한다(레지스트리 preset 이름이 아니라 scale/surface/motion
    // 3값). 값이 없으면 아무것도 세팅하지 않는다.
    var personalityScale = window.localStorage.getItem(${JSON.stringify(PERSONALITY_SCALE_STORAGE_KEY)});
    if (personalityScale) root.setAttribute("data-personality", personalityScale);
    var personalitySurface = window.localStorage.getItem(${JSON.stringify(PERSONALITY_SURFACE_STORAGE_KEY)});
    if (personalitySurface) root.setAttribute("data-personality-surface", personalitySurface);
    var personalityMotion = window.localStorage.getItem(${JSON.stringify(PERSONALITY_MOTION_STORAGE_KEY)});
    if (personalityMotion) root.setAttribute("data-personality-motion", personalityMotion);
  } catch (e) {}
})();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ko"
      data-theme={DEFAULT_THEME_PRESET}
      data-font={DEFAULT_FONT_PRESET}
      className={`${geistSans.variable} ${geistMono.variable} ${notoSansKR.variable} ${ibmPlexSansKR.variable} ${nanumGothic.variable} ${spaceGrotesk.variable} ${spaceMono.variable} ${notoSerifKR.variable} ${gowunDodum.variable} ${jetBrainsMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body className="min-h-full">
        {/* Google Analytics (gtag.js) — NEXT_PUBLIC_GA_ID 가 설정된 배포에서만 로드된다.
            로더는 구글 CDN, 초기화(dataLayer/config)는 public/gtag.js. 폐쇄망
            "외부 리소스 0건" 원칙의 명시적 예외 — test/helpers/scan-build-output.ts
            ANALYTICS_ALLOWED_HOSTS 참고. */}
        {GA_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
              strategy="afterInteractive"
            />
            <Script id="ga-id" strategy="afterInteractive">{`window.__GA_ID=${JSON.stringify(GA_ID)}`}</Script>
            <Script src="/gtag.js" strategy="afterInteractive" />
          </>
        )}
        <I18nProvider>
        <TooltipProvider>
          <div className="flex min-h-screen flex-col">
            <SiteTopNav />
            <main className="mx-auto w-full max-w-[1400px] flex-1 px-4 py-8 sm:px-6 sm:py-10">
              {children}
            </main>
            <SiteFooter />
          </div>
        </TooltipProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
