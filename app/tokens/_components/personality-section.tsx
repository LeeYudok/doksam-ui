import Link from "next/link";

import { TranslatedText } from "@/components/showcase/translated-text";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PERSONALITY_PRESETS, personalityAttrs } from "@/personalities";

/**
 * 프리셋 하나를 스코프 컨테이너에 적용한 실측 데모. personalityAttrs() 가
 * 돌려주는 data-personality/-surface/-motion 속성을 이 div 에 걸어
 * app/globals.css 의 personality 토큰 층을 사이트 전체가 아니라 이 블록에만
 * 스코프한다(ProfilePreviewKit 과 같은 방식).
 */
function PersonalityDemo({ presetName }: Readonly<{ presetName: string }>) {
  const preset = PERSONALITY_PRESETS.find((p) => p.name === presetName)!;
  return (
    <div
      {...personalityAttrs(preset)}
      className="flex flex-1 flex-col gap-2 rounded-lg border border-border p-3"
    >
      <span className="text-xs font-medium text-muted-foreground">{preset.label}</span>
      <Card size="sm">
        <CardHeader>
          <CardTitle className="text-sm">doksam-ui</CardTitle>
        </CardHeader>
        <CardContent className="text-xs text-muted-foreground">
          scale={preset.scale} · surface={preset.surface} · motion={preset.motion}
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * 시각 성격(personality) 토큰 층 문서(#90) — [data-personality]·
 * [data-personality-surface]·[data-personality-motion] 3개 속성의 값 표와
 * 레지스트리 프리셋 실측 비교 데모. DensitySection 과 같은 구조.
 */
export function PersonalitySection() {
  return (
    <section className="flex flex-col gap-3">
      <div className="flex flex-col gap-1">
        <h2 className="text-lg font-medium">
          <TranslatedText k="page.tokens.personality.title" ko="시각 성격 토큰" />
        </h2>
        <p className="max-w-prose text-sm text-muted-foreground">
          <TranslatedText
            k="page.tokens.personality.description"
            ko="브랜드 프로필이 <html data-personality data-personality-surface data-personality-motion>로 지정하는 타입/스페이싱 스케일·표면·모션 강도 층입니다. 속성이 없으면 아무 규칙도 걸리지 않아 기존 렌더와 동일하며, 값은 프로필이 참조하는 personalities/index.ts 프리셋이 고정합니다 — 프로젝트에서 임의 재정의하지 않습니다."
          />{" "}
          <Link href="/profiles" className="underline underline-offset-2">
            /profiles
          </Link>
        </p>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>
              <TranslatedText k="page.tokens.personality.table.preset" ko="프리셋" />
            </TableHead>
            <TableHead>
              <TranslatedText k="page.tokens.personality.table.scale" ko="타입/스페이싱 스케일" />
            </TableHead>
            <TableHead>
              <TranslatedText k="page.tokens.personality.table.surface" ko="표면" />
            </TableHead>
            <TableHead>
              <TranslatedText k="page.tokens.personality.table.motion" ko="모션" />
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {PERSONALITY_PRESETS.map((preset) => (
            <TableRow key={preset.name}>
              <TableCell>
                <span className="font-medium text-foreground">{preset.label}</span>
                <span className="ml-2 text-xs text-muted-foreground">
                  <TranslatedText k={`personality.${preset.name}.description`} ko={preset.description} />
                </span>
              </TableCell>
              <TableCell>
                <code className="text-xs">{preset.scale}</code>
              </TableCell>
              <TableCell>
                <code className="text-xs">{preset.surface}</code>
              </TableCell>
              <TableCell>
                <code className="text-xs">{preset.motion}</code>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <div className="flex flex-col gap-3 sm:flex-row">
        {PERSONALITY_PRESETS.map((preset) => (
          <PersonalityDemo key={preset.name} presetName={preset.name} />
        ))}
      </div>
    </section>
  );
}
