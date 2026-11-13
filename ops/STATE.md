# STATE — 2026-11-13

## 지금 누가 무엇을

| 항목 | 담당 | 상태 |
|---|---|---|
| PR #25 (보안 S-1·S-2 지시서) | Jaden | **머지 대기** — 이게 막혀 Codex가 시작 못 함 |
| PR #26 (아티팩트 소스) | Jaden | 머지 대기 |
| spec 0001 — 기반 기술 | Codex | 대기 |
| spec 0002 — 고객 데이터 구조 | Codex | 대기 |
| 아티팩트 오피스 화면 | Claude | 진행 중 (v26) |
| Google Sheets 커넥터 연결 | Jaden | 미착수 — 붙어야 고객관리팀이 시트를 읽음 |

## Codex 다음 차례

1. PR #25·#26 머지 후 `ops/specs/0001` 1번(보안) 검사 → 결과를 이 파일에 적고 Jaden 확인 받기
2. `ops/specs/0002` 1~3단계 (새 시트 생성, seed 적재, clients 역생성)
3. `ops/specs/0001` 3번(스키마 문서화) → 끝나면 Claude가 고객관리팀을 시트에 연결

## Claude 쪽 완료

- 커미션 명세 파싱 — Uniti 10개월 + SG 9개월, 전부 검산 일치. 아티팩트 db에 적재
- 고객 명단 224명 전 사업부 통합 (커미션 기준) — 복수 상품 보유 6명
- `policies_seed.csv` 254건 생성 — Jaden이 전달
- 은행 입금 대조 (9·10월), 카드 지출 분류 (3개월)
- 후원 요청 메일 9통 발송·추적, 일정 4건 등록

## 열린 항목

- 아내 구글 계정을 FinCRM 시트 두 개에 편집자로 추가 — 미처리
- 드라이브 파일별 anyone 권한 일괄 해제 — 미처리 (spec 0001 S-2)
- Apps Script 웹앱 배포 여부 확인 — 미처리 (spec 0001 S-3)
- HRA·장례보험 커미션 채널 미연결. 10월 ATM 수표 입금 $5,500 출처 불명
- 법인 명의 불일치: 커미션 명세 `BRIDGEONE INSURANCE SERVICES, INC`
  ↔ 입금 계좌 `JD COVENANT FINANCIAL`. 1099 EIN 확인 필요
