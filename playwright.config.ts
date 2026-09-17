import { defineConfig, devices } from "@playwright/test";

// 이슈 #42 A영역 — Playwright 인프라.
// 프로덕션 빌드를 대상으로 실행: `next dev`가 아니라 `next build && next start`로
// 실제 배포 산출물에 가까운 상태에서 콘솔 에러·레이아웃을 검증한다.
// 포트는 env로 오버라이드 가능 — shell executor 러너(컨테이너 격리 X)에서는
// 파이프라인마다 유니크 포트를 써야 이전 실행 잔여 프로세스와 충돌하지 않는다(#42).
const PORT = Number(process.env.E2E_PORT) || 3100;
const BASE_URL = `http://localhost:${PORT}`;

export default defineConfig({
  testDir: "./e2e",
  // 이슈 #39 PR #51 적대적 리뷰 M2 — `pnpm exec playwright test` 를 생성
  // 스크립트 없이 직접 실행해도 라우트 스냅샷이 항상 최신이도록 강제한다.
  // 자세한 이유는 e2e/global-setup.mjs 참고.
  globalSetup: "./e2e/global-setup.mjs",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  // CI 안정화를 위해 재시도 부여.
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: process.env.CI ? [["line"], ["html", { open: "never" }]] : "list",
  timeout: 30_000,
  expect: {
    timeout: 5_000,
  },
  use: {
    baseURL: BASE_URL,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    actionTimeout: 10_000,
    navigationTimeout: 15_000,
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    command: `pnpm build && pnpm start -p ${PORT}`,
    url: BASE_URL,
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
  },
});
