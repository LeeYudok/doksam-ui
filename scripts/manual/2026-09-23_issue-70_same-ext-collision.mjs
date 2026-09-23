/**
 * #70 실증 — PR #69 가 "같은 이름 + 다른 확장자" 로 좁힌 이름 충돌 가드의 전제,
 * "shadcn 의 경로 prefix tie-break 가 같은 확장자끼리의 이름 충돌도 올바르게 구분한다"
 * 를 빈 Next 앱에 실제로 설치해 검증한다.
 *
 * 셋업(네트워크 필요, 폐쇄망 CI 대상이 아니다 — 수동 스크립트):
 *   1. `os.tmpdir()` 아래 임시 디렉터리에 `create-next-app` 으로 빈 Next 앱을 만든다.
 *   2. `npx shadcn@latest init -y -b radix -p nova` 로 `components.json` 의 style 을
 *      정식 레포와 동일한 `radix-nova` 로 맞춘다.
 *   3. 아래 FIXTURES 의 레지스트리 항목 JSON 을 각각 `npx shadcn add -y -o <json>` 으로
 *      설치하고, 설치된 파일의 **실제 내용**을 읽어 어느 쪽으로 import 가 이어졌는지 판정한다.
 *
 * 사용: node scripts/manual/2026-09-23_issue-70_same-ext-collision.mjs
 *
 * 2026-09-23 실측 결과 (shadcn 4.21.0, node 26.7.0):
 *   - same-ext(같은 이름 + 같은 확장자, 지정자가 실제 파일 경로와 정확히 일치)
 *     → 올바르게 구분됨. `components/probe-collision-consumer.ts` 의 두 import 가
 *       각각 `lib/probe/a/util`·`lib/probe/b/util` 를 그대로 가리켰고 내용도
 *       설치 전 그대로였다(재작성 자체가 필요 없었다는 뜻).
 *   - same-ext(지정자가 실제 파일과 일치하지 않는 최악의 경우, `@/lib/probe/shared`
 *     — `a/shared.ts`·`b/shared.ts` 둘 다와 basename 만 같음)
 *     → shadcn 이 실제로 재작성을 수행했고(`@/lib/probe/a/shared` 로 바뀜), 두 후보 중
 *       **먼저 선언된 파일**을 결정적으로 골랐다(무작위/오염이 아니다). 다만 이 경로는
 *       실제 registry.json 에는 해당하지 않는다 — 모든 항목의 지정자는
 *       `unresolvedImports()`(scripts/registry/closure.test.ts) 가 이미 "레포 안 실제
 *       파일과 정확히 일치"를 강제하기 때문이다.
 *   - index 파일 충돌(`foo/index.ts` vs `bar/index.ts`, 디렉터리 지정자로 import)
 *     → 올바르게 구분됨. 서로 섞이지 않았다.
 *
 * shadcn 4.21.0 의 실제 재작성 알고리즘(디컴파일: `node_modules/shadcn/dist/chunk-B2MD6U5O.js`
 * 의 `Il()`/`Cl()`/`ci()`)을 `scripts/registry/closure.ts` 의 `simulateShadcnRewrite()` 로
 * 그대로 옮겨 뒀다 — 후보 확장자 우선순위는 `[".tsx", ".ts", ".js", ".jsx", ".css"]` (tsx 가
 * ts 보다 먼저!), 같은 확장자끼리는 지정자 자신의 경로로 시작하는지(prefix)로 갈린다.
 * `scripts/registry/closure.test.ts` 의 "같은 이름 + 같은 확장자 충돌이 있어도 ..." 테스트가
 * 이 알고리즘을 registry.json 전체에 적용해 전제를 고정한다.
 */
import { execFileSync, execSync } from "node:child_process"
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import path from "node:path"

const FIXTURES = [
  {
    label: "same-ext (지정자가 실제 파일과 정확히 일치)",
    file: "collision-same-ext.json",
    json: {
      $schema: "https://ui.shadcn.com/schema/registry-item.json",
      name: "probe-collision-same-ext",
      type: "registry:component",
      title: "Probe: same-extension name collision",
      files: [
        { path: "lib/probe/a/util.ts", type: "registry:lib", content: 'export const A_MARK = "from-a" as const\n' },
        { path: "lib/probe/b/util.ts", type: "registry:lib", content: 'export const B_MARK = "from-b" as const\n' },
        {
          path: "components/probe-collision-consumer.ts",
          type: "registry:component",
          content:
            'import { A_MARK } from "@/lib/probe/a/util"\nimport { B_MARK } from "@/lib/probe/b/util"\n\nexport const CONSUMER_RESULT = { a: A_MARK, b: B_MARK }\n',
        },
      ],
    },
    check: (dir) => {
      const consumer = readFileSync(path.join(dir, "components/probe-collision-consumer.ts"), "utf8")
      const a = readFileSync(path.join(dir, "lib/probe/a/util.ts"), "utf8")
      const b = readFileSync(path.join(dir, "lib/probe/b/util.ts"), "utf8")
      const ok =
        consumer.includes('from "@/lib/probe/a/util"') &&
        consumer.includes('from "@/lib/probe/b/util"') &&
        a.includes("from-a") &&
        b.includes("from-b")
      return { ok, evidence: { consumer, a, b } }
    },
  },
  {
    label: "same-ext (지정자가 실제 파일과 불일치 — 최악의 경우)",
    file: "collision-ambiguous.json",
    json: {
      $schema: "https://ui.shadcn.com/schema/registry-item.json",
      name: "probe-collision-ambiguous",
      type: "registry:component",
      title: "Probe: ambiguous same-extension collision",
      files: [
        {
          path: "lib/probe/a/shared.ts",
          type: "registry:lib",
          content: 'export const A_MARK = "from-a" as const\n',
        },
        {
          path: "lib/probe/b/shared.ts",
          type: "registry:lib",
          content: 'export const B_MARK = "from-b" as const\n',
        },
        {
          path: "components/probe-ambiguous-consumer.ts",
          type: "registry:component",
          content: 'import { X_MARK } from "@/lib/probe/shared"\n\nexport const CONSUMER_RESULT = { x: X_MARK }\n',
        },
      ],
    },
    check: (dir) => {
      const consumer = readFileSync(path.join(dir, "components/probe-ambiguous-consumer.ts"), "utf8")
      const rewritten = consumer.match(/from "([^"]+)"/)?.[1]
      return { ok: rewritten !== "@/lib/probe/shared", evidence: { consumer, rewritten } }
    },
  },
  {
    label: "index 파일 충돌",
    file: "collision-index.json",
    json: {
      $schema: "https://ui.shadcn.com/schema/registry-item.json",
      name: "probe-collision-index",
      type: "registry:component",
      title: "Probe: index.ts collision",
      files: [
        {
          path: "lib/probe/foo/index.ts",
          type: "registry:lib",
          content: 'export const FOO_MARK = "from-foo" as const\n',
        },
        {
          path: "lib/probe/bar/index.ts",
          type: "registry:lib",
          content: 'export const BAR_MARK = "from-bar" as const\n',
        },
        {
          path: "components/probe-index-consumer.ts",
          type: "registry:component",
          content:
            'import { FOO_MARK } from "@/lib/probe/foo"\nimport { BAR_MARK } from "@/lib/probe/bar"\n\nexport const CONSUMER_RESULT = { foo: FOO_MARK, bar: BAR_MARK }\n',
        },
      ],
    },
    check: (dir) => {
      const consumer = readFileSync(path.join(dir, "components/probe-index-consumer.ts"), "utf8")
      const foo = readFileSync(path.join(dir, "lib/probe/foo/index.ts"), "utf8")
      const bar = readFileSync(path.join(dir, "lib/probe/bar/index.ts"), "utf8")
      const ok =
        consumer.includes('from "@/lib/probe/foo"') &&
        consumer.includes('from "@/lib/probe/bar"') &&
        foo.includes("from-foo") &&
        bar.includes("from-bar")
      return { ok, evidence: { consumer, foo, bar } }
    },
  },
]

function main() {
  const workDir = mkdtempSync(path.join(tmpdir(), "doksam-ui-issue-70-"))
  const appDir = path.join(workDir, "probe")
  console.log(`[1/3] 빈 Next 앱 생성 — ${appDir}`)
  execSync(
    `npx --yes create-next-app@latest probe --typescript --tailwind --eslint --app --src-dir=false --import-alias "@/*" --use-pnpm --yes`,
    { cwd: workDir, stdio: "inherit" },
  )

  console.log("[2/3] shadcn init -b radix -p nova (정식 레포와 같은 style: radix-nova)")
  execSync(`npx --yes shadcn@latest init -y -b radix -p nova`, { cwd: appDir, stdio: "inherit" })
  const componentsJson = JSON.parse(readFileSync(path.join(appDir, "components.json"), "utf8"))
  console.log(`  components.json style = ${componentsJson.style}`)

  console.log("[3/3] 충돌 레지스트리 항목 설치 및 판정")
  let allOk = true
  for (const fixture of FIXTURES) {
    const jsonPath = path.join(workDir, fixture.file)
    writeFileSync(jsonPath, JSON.stringify(fixture.json, null, 2))
    execFileSync("npx", ["--yes", "shadcn@latest", "add", "-y", "-o", jsonPath], { cwd: appDir, stdio: "inherit" })
    const { ok, evidence } = fixture.check(appDir)
    console.log(`\n=== ${fixture.label} — ${ok ? "PASS" : "FAIL"} ===`)
    console.log(JSON.stringify(evidence, null, 2))
    allOk &&= ok
  }

  rmSync(workDir, { recursive: true, force: true })
  console.log(`\n결과: ${allOk ? "모두 예상대로 통과" : "예상과 다른 결과 있음 — 위 로그 확인"}`)
  process.exitCode = allOk ? 0 : 1
}

if (!existsSync(process.cwd())) {
  throw new Error("실행 디렉터리를 찾을 수 없다.")
}

main()
