import { describe, expect, it } from "vitest"

import { providedPaths, readRegistry } from "./closure"

const registry = readRegistry()

/**
 * 패턴은 데모 없이 배포된다 (이슈 #58).
 *
 * 카탈로그 코드는 곧 배포 산출물이다. 패턴 항목이 `*-demo.tsx` 나 데모 데이터
 * 파일을 그대로 싣고 나가면 소비 프로젝트는 쓰지도 않을 예시 데이터와 카탈로그
 * 전용 래퍼를 함께 설치한다 — 실물 컴포넌트만 받아야 한다.
 *
 * 템플릿(`template-*`)은 예외다. 템플릿은 컴포넌트가 아니라 **화면의 시작점**이라
 * 렌더되려면 자리를 채울 데이터가 있어야 하고, 소비자가 그 자리를 자기 데이터로
 * 바꾸는 것이 사용법이다. 그래서 `app/templates/<name>/_data/*.ts` 는 의도된
 * 배포물이며 이 게이트의 대상이 아니다.
 */
const DEMO_FILE = /(-demo|-samples|-data)\.tsx?$/

function patternItems() {
  return registry.items.filter((item) =>
    (item.files ?? []).some((file) => file.path.startsWith("components/patterns/"))
  )
}

describe("패턴은 데모를 싣지 않는다 — 이슈 #58", () => {
  it("패턴 항목이 하나 이상 존재한다", () => {
    expect(patternItems().length).toBeGreaterThan(0)
  })

  it("패턴 항목의 파일 목록에 데모·샘플·데모데이터 파일이 없다", () => {
    for (const item of patternItems()) {
      const demo = (item.files ?? []).map((file) => file.path).filter((path) => DEMO_FILE.test(path))
      expect(demo, `${item.name} 이 데모 파일을 배포한다: ${demo.join(", ")}`).toEqual([])
    }
  })

  it("설치 폐포(전이 의존까지)에도 데모 파일이 들어오지 않는다", () => {
    for (const item of patternItems()) {
      const demo = [...providedPaths(item.name, registry)].filter((path) => DEMO_FILE.test(path))
      expect(demo, `${item.name} 의 설치 폐포에 데모 파일이 있다: ${demo.join(", ")}`).toEqual([])
    }
  })
})
