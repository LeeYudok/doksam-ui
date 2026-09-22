"use client";

import { RouteError } from "@/components/route-error";

/**
 * 루트 layout 자신이 던진 에러를 받는다 (#79).
 *
 * `app/error.tsx` 는 layout 안쪽에서 렌더되므로 layout 자신의 에러는 잡지 못한다 —
 * 그 자리는 Next 에서 `global-error.tsx` 몫이고, layout 이 죽은 상태라 `<html>`/`<body>`
 * 를 직접 그려야 한다. 이 카탈로그의 `app/layout.tsx` 는 로컬 폰트 로딩·테마 초기화
 * 인라인 스크립트·관측 로더를 다 들고 있어 실제로 에러가 날 수 있는 자리다.
 *
 * 테마 초기화 스크립트가 돌지 않은 상태이므로 프리셋 토큰에 기대지 않고, 여기서는
 * 라이트/다크 어느 쪽에서도 읽히도록 브라우저 기본 배색(color-scheme)에 맡긴다.
 */
export default function GlobalError({
  error,
  reset,
}: Readonly<{
  error: Error & { digest?: string };
  reset: () => void;
}>) {
  return (
    <html lang="ko" style={{ colorScheme: "light dark" }}>
      <body style={{ margin: 0, padding: "2rem", fontFamily: "system-ui, sans-serif" }}>
        <RouteError error={error} reset={reset} />
      </body>
    </html>
  );
}
