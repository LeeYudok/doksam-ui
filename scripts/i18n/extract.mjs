#!/usr/bin/env node
/**
 * i18n ko 원문 추출 — t("<ns>.<key>", "<ko>") / <TranslatedText k=".." ko=".." />
 * 리터럴 호출과 레지스트리(component/pattern/template) 항목을 긁어
 * scripts/i18n/ko-catalog.json ({ "<ns>.<key>": "<ko원문>" }) 을 생성한다.
 *
 * 사용: node scripts/i18n/extract.mjs
 * 규칙: t() 는 처음 두 인자가 반드시 문자열 리터럴이어야 추출된다(#48 플랜).
 * 레지스트리 설명처럼 동적 키(`component.${slug}.description`)는 여기서
 * 레지스트리 소스를 정규식 파싱해 프로그램적으로 생성한다.
 */
import { readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const SCAN_DIRS = ["app", "components", "lib"];

/** 디렉터리 재귀 순회 — 테스트/스냅샷 제외. */
function* walk(dir) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) {
      if (name === "node_modules" || name === "messages") continue;
      yield* walk(p);
    } else if (/\.(tsx?|mjs)$/.test(name) && !/\.test\./.test(name)) {
      yield p;
    }
  }
}

const catalog = {};

// 1) 정적 t()/TranslatedText 리터럴
const T_RE = /\bt\(\s*\n?\s*"((?:chrome|page|label)\.[^"]+)",\s*\n?\s*"([^"]+)"/g;
const TT_RE = /<TranslatedText\s+k="((?:chrome|page|label)\.[^"]+)"\s+ko="([^"]+)"/g;
for (const dir of SCAN_DIRS) {
  for (const file of walk(join(ROOT, dir))) {
    const src = readFileSync(file, "utf8");
    for (const re of [T_RE, TT_RE]) {
      re.lastIndex = 0;
      let m;
      while ((m = re.exec(src))) catalog[m[1]] = m[2];
    }
  }
}

// 2) 레지스트리 — slug/title/description 을 소스에서 파싱
function parseEntries(file) {
  const src = readFileSync(join(ROOT, file), "utf8");
  const entries = [];
  // 객체 리터럴 단위로 slug/href → title → description 을 추출
  const re = /\{[^{}]*?(?:slug|href):\s*"([^"]+)"[^{}]*?title:\s*"([^"]+)"[^{}]*?description:\s*\n?\s*"([^"]+)"/gs;
  let m;
  while ((m = re.exec(src))) entries.push({ slug: m[1].split("/").pop(), title: m[2], description: m[3] });
  return entries;
}

for (const e of parseEntries("lib/showcase/registry.ts")) {
  catalog[`component.${e.slug}.description`] = e.description;
}
for (const e of parseEntries("lib/patterns/registry.ts")) {
  catalog[`pattern.${e.slug}.title`] = e.title;
  catalog[`pattern.${e.slug}.description`] = e.description;
}
for (const e of parseEntries("lib/templates/registry.ts")) {
  catalog[`template.${e.slug}.description`] = e.description;
}

// 3) 동적 키 — 라벨 상수와 topnav 내비 구조는 소스를 파싱해 키를 생성
function parseLabelRecord(file, constName, ns) {
  const src = readFileSync(join(ROOT, file), "utf8");
  const block = src.match(new RegExp(`${constName}[^=]*=\\s*\\{([\\s\\S]*?)\\n\\}`));
  if (!block) return;
  const re = /(\w+):\s*"([^"]+)"/g;
  let m;
  while ((m = re.exec(block[1]))) catalog[`${ns}.${m[1]}`] = m[2];
}
parseLabelRecord("lib/showcase/types.ts", "COMPONENT_CATEGORY_LABEL", "label.category");
parseLabelRecord("lib/showcase/types.ts", "COMPONENT_LAYER_LABEL", "label.layer");
parseLabelRecord("lib/patterns/registry.ts", "PATTERN_SCOPE_LABEL", "label.scope");

{
  const src = readFileSync(join(ROOT, "components/site-topnav.tsx"), "utf8");
  const groupRe = /key:\s*"(\w+)",\s*\n\s*label:\s*"([^"]+)",\s*\n\s*items:/g;
  let m;
  while ((m = groupRe.exec(src))) catalog[`chrome.nav.group.${m[1]}`] = m[2];
  const itemRe = /\{\s*key:\s*"(\w+)",\s*href:\s*"[^"]+",\s*label:\s*"([^"]+)",\s*icon:\s*\w+(?:,\s*description:\s*"([^"]+)")?/g;
  while ((m = itemRe.exec(src))) {
    // 라벨은 한국어일 때만 번역 대상(영문 고유 라벨 Components 등은 그대로)
    if (/[가-힣]/.test(m[2])) catalog[`chrome.nav.item.${m[1]}.label`] = m[2];
    if (m[3]) catalog[`chrome.nav.item.${m[1]}.description`] = m[3];
  }
}
catalog["chrome.sidebar.index"] = "전체 보기";

// 브랜드 프로필 설명 (profile.<name>.description — app/profiles TranslatedText 동적 키)
{
  const src = readFileSync(join(ROOT, "profiles/index.ts"), "utf8");
  const re = /name:\s*"(\w+)"[\s\S]*?description:\s*\n?\s*"([^"]+)"/g;
  let m;
  while ((m = re.exec(src))) catalog[`profile.${m[1]}.description`] = m[2];
}

// 레이아웃 원형 설명 (archetype.<name>.description — /archetypes TranslatedText 동적 키)
{
  const src = readFileSync(join(ROOT, "archetypes/index.ts"), "utf8");
  const re = /name:\s*"([\w-]+)",[\s\S]*?description:\s*\n?\s*"([^"]+)"/g;
  let m;
  while ((m = re.exec(src))) catalog[`archetype.${m[1]}.description`] = m[2];
}

// 디바이스 프리뷰 모드 라벨 (chrome.preview.mode.<id> — device-preview 동적 키)
{
  const src = readFileSync(join(ROOT, "components/device-preview.tsx"), "utf8");
  const re = /id:\s*"(\w+)",\s*label:\s*"([^"]+)"/g;
  let m;
  while ((m = re.exec(src))) catalog[`chrome.preview.mode.${m[1]}`] = m[2];
}

const sorted = Object.fromEntries(Object.entries(catalog).sort(([a], [b]) => a.localeCompare(b)));
const out = join(ROOT, "scripts", "i18n", "ko-catalog.json");
writeFileSync(out, JSON.stringify(sorted, null, 2) + "\n");
console.log(`extracted ${Object.keys(sorted).length} keys → ${out}`);
