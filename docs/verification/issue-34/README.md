# #34 검증 — llms.txt 원형 인라인 A/B

2026-08-25, 같은 과제("제철과일 판매 모바일앱, 4화면 정적 목업"), sonnet 에이전트, 이 브랜치의 `public/llms.txt` 한 파일만 제공, 외부 URL 금지.

| 케이스 | DESIGN.md 원형 | 성격 | 내비 / 본문 |
| --- | --- | --- | --- |
| free1 | `feed-timeline` + 보조 `split-pane` | elevated | 필터 칩 + 한 줄 행 스트림, 상세는 뒤로가기 |
| free2 | `dashboard-grid` + 보조 `doc-reader` | elevated | 필터 바 + 2열 카드 격자, 상세는 prose 단일 칼럼 |
| free3 | `feed-timeline` + 보조 `wizard-flow` | elevated | 필터 칩 + 행 스트림, 상세만 하단 CTA |
| forced-feed | `feed-timeline` | elevated | 필터 칩 + 시간순 행, 고정 CTA 없음 |
| forced-wizard | `wizard-flow` | elevated | 상단 stepper + 하단 이전/다음 |
| forced-split | `split-pane` | elevated | 뒤로가기 헤더 + 목록↔상세 교체 |

- (a) 자유 선택: 3/3 레지스트리 이름, 원형 2종 이상으로 갈림 — 통과.
- (b) 강제: 3개 모두 내비 방식·본문 구조가 다름. "하단 탭바 + 카드 그리드 + sticky CTA" 조합 0/3 — 통과.
- 잔여: 성격은 6/6 `elevated` 로 수렴(원형 축은 풀렸으나 성격 축은 아직 브리프가 좁히지 못함).

`ab-contact-sheet.jpg` 는 6케이스 × 4화면(390×844) Playwright 스크린샷.
