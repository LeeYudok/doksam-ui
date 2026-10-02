# HANDOFF — doksam-ui

갱신: 2026-09-23 (GitHub·GitLab 열린 이슈 0건 도달 후). 요약이 아니라 **재개 가능한 상태**를 적는다.

## 상태

- **GitHub(SSOT) `LeeYudok/doksam-ui`**: 열린 이슈 0, 열린 PR 0. main = `9c4977d`(PR #117 머지). 배치 PR #115(merge commit `0a9d4d9`)로 #112 #70 #72 #71 #93 #41 #113 #114 를 닫았고, #116/PR #117 은 lint-dogfood 타임아웃 flake.
- **GitLab(배포) `busan/doksam-ui`**: 열린 이슈 0. main = `b15d4dd`(MR !75). !74 = GH 기머지분 7건 이식(GL #101 #106 #102 #108 #109 #110 #111), !75 = PR #115 이식 + GL #93(규칙 절 동기화, SSOT `pnpm gen:rules-mdx` 산출물) + GL #99(i18n-trim). GA 는 `NEXT_PUBLIC_GA_ID` CI 변수로 게이트(값 등록 완료).
- 워크트리·로컬 브랜치 양쪽 모두 정리 완료(정식 클론만 남음).

## 열린 이슈 (2026-09-23 등록, 나중에 처리)

| 레포 | 이슈 | 내용 |
| --- | --- | --- |
| GL busan/doksam-ui | #113 | **[우선]** e2e 가 빈 포트 고르기 전에 kill 해 남의 운영 서비스를 내린다 |
| GL busan/doksam-ui | #114 | CI 흐름 주석이 실제 needs 그래프와 다름 + registry 병렬화 |
| GL busan/doksam-ui | #115 | 이식 코드의 GitHub bare 이슈번호 재매핑 (#82~#89, !74 F6 잔여) |
| GH LeeYudok/doksam-ui | #118 | 패턴 셸·역참조·샘플 스니펫 회귀 게이트 (#41 후속) |
| GL dok123/race | #22 | race-kra 포트 3333 재검토 + 비정상 종료 알림 |

## 다음 세션이 확인할 것

1. GL main 파이프라인(`b15d4dd` push) deploy 성공 여부 — `glab api "projects/busan%2Fdoksam-ui/pipelines?ref=main&per_page=1"`. e2e 가 포트 충돌로 죽으면 CI 의 "점유 시 다음 포트" 루프(!75)가 동작했는지 trace 확인.
2. 라이브 `https://ui.doksam.com/r/sparkline.json` 의 files 에 `-demo` 파일이 없는지(배포 드리프트 해소 확인).
3. review-bot 후속 제안(MR !75 코멘트) 3건은 SSOT 후속 이슈 후보: PatternDetail slug↔registry E2E, usedByPatterns vision, `_samples` 스니펫 정적 검사. 만들지 여부는 사용자 판단.
4. **정정**: pig 의 `race-kra`(viewer, 3333)는 크래시 루프가 아니었다. 정상 상시 서비스인데 **doksam-ui e2e 잡이 `kill -9` 로 3회 죽였고** pm2 autorestart 가 되살린 것이다(race-worker 는 62일 연속 = 우리만 죽였다는 근거). CI 의 빈 포트 탐색이 `kill` **뒤**에 있어 아직 안 고쳐졌다 → GL busan/doksam-ui#113, 정보 공유는 dok123/race#22.

## 이번 배치에서 확정된 절차 (메모리 `parallel-batch-merge-playbook` 에도 기록)

- 결정 이슈는 결정값을 프롬프트에 확정해 넘긴다. 동시 3 에이전트, 각자 build/전체 test 금지, 통합 브랜치에서 전체 게이트.
- themes+globals.css 겹침은 ours 유지 + 팔레트 생성기 재적용. `registry:sync → build → gen:llms → i18n extract` 후 드리프트 0 확인.
- 적대적 리뷰(opus) → finding 별 반영/오탐 표를 PR 본문에. `test:vision` 은 API 키 없으면 스크린샷 육안 대체.
- GL 이식: `git diff <base>..<merge>` → `apply --reject --exclude=public/* ...` → `app/`↔`app/[locale]/` 치환 → rej 병합 → 파생물 GL 에서 재생성. `target` 에 `[locale]` 금지(closure 테스트가 잠금). 규칙 MDX 는 SSOT 생성본. finguard 는 `PASSWORD|SECRET|TOKEN` 식별자 오탐. review-bot 타임아웃 시 별도 리뷰. 러너 Node 20 → TS 스크립트는 `jiti`.

## 표준 절차 (변경 없음)
```
git worktree add ../doksam-ui-<n> -b <type>/issue-<n> origin/main
pnpm typecheck && pnpm lint && pnpm test && pnpm build
E2E_PORT=<3200 이상 전용> pnpm test:e2e
node scripts/lint-probe.mjs
pnpm registry:sync && pnpm registry:build && pnpm gen:llms && node scripts/i18n/extract.mjs
pnpm gen:rules-mdx <출력 디렉터리>   # GitLab content/rules.mdx 산출
```
