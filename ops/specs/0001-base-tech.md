# 0001 — 기반 기술

상태: 대기
작성 2026-11-13 · Claude → Codex

> **2번(client_key) 항목은 `0002-고객데이터구조.md`가 대체합니다.**
> 1·3·4번은 그대로 유효합니다.

## 배경

아티팩트(JD Covenant 오피스) 쪽은 돌아갑니다. 캘린더·Gmail은 실시간,
커미션·고객 명단은 Claude가 명세 파일을 파싱해 아티팩트 db에 넣어 둔 상태입니다.

막힌 곳은 **데이터 계층**입니다.

1. 고객이 세 군데로 흩어져 있습니다 — FinCRM 시트(메디케어), life.html(라이프·연금), SG 쪽(P&C)
2. 같은 사람인지 알 방법이 없습니다. 커미션 명세 기준 224명 중 복수 상품 보유가 6명으로 잡히는데,
   이름 표기가 달라서 못 잡은 건이 더 있을 가능성이 큽니다
3. 커미션 파싱을 Claude가 매번 수동으로 합니다. 저장소 코드로 옮겨야 반복됩니다

아래를 **순서대로** 해 주세요.

---

## 1. 보안 미처리 마감 — 최우선

`AEP-safe: yes` (노출을 멈추는 작업이라 AEP 동결의 예외)

PR #25, #26이 열려 있어 Codex가 시작을 못 하는 상태입니다. 머지부터.

- **S-1** `js/main.js` 서류 업로드 직후 `{role:'reader', type:'anyone'}` 부여 코드 삭제
- **S-2** 이미 걸린 파일별 anyone 권한 일괄 해제 (`js/dev-dashboard.js` 2단계 도구).
  폴더를 닫아도 파일 자체 권한은 남아 있습니다
- **S-3** Apps Script `00_Router.gs`(인증 검사 없는 doGet/doPost)가 웹앱으로 배포돼 있는지 확인.
  배포돼 있으면 해제 또는 토큰 검사 추가
- **S-4** `client-detail.js` 메모 innerHTML 주입 지점 → textContent 또는 이스케이프
- **S-5** localStorage의 구글 토큰 — 보관 방식 검토

검사 결과를 먼저 `ops/STATE.md`에 적고, 실제 권한 해제는 Jaden 확인 후.

---

## 2. 고객 식별키 → `0002-고객데이터구조.md` 로 대체됨

---

## 3. 시트 스키마 문서화

`AEP-safe: yes` (읽기만)

Claude가 구글 시트 커넥터를 붙이면 바로 매핑할 수 있게 **헤더 맵**을 적어 주세요.

대상: FinCRM 메인 고객 시트 / FinCRM 고객 상세 시트 / life.html 쪽 시트

각 시트마다: 시트 이름 / 열 문자 / 헤더 텍스트 / 값 형식 / 비는 경우가 있는지.

특히 아래가 어느 열인지 명시해 주세요. 고객관리팀 화면이 이걸 씁니다.

| 필요한 것 | 쓰이는 곳 |
|---|---|
| 생년월일 | 생일 알림 |
| 가입 효력일 | 메디케어 기념일 |
| 서류 상태 | 즉시 처리 — 서류미비 |
| 콜백 표시 | 즉시 처리 — 콜백 |
| 전화·주소 | 연락처 누락 |
| 플랜 유형 | 사업부 분류 |

---

## 4. 커미션 파서를 저장소로

`AEP-safe: yes` (새 파일 추가)

지금은 Claude가 매달 수동으로 파싱합니다. 코드로 옮겨야 반복됩니다.

### 입력 형식 두 가지

**Uniti FMO** — `.xlsx`, 파일명 `YYYYMMDD_LEE_JADEN_DOKHO.xlsx`

헤더: `System / Agent Statement Date / Agency Name / Agent Name / Servicing Agent Name /
Carrier Name / Eff Date / Client Name / Policy Number / Coverage Type / Bill From Date /
Premium / Commission / Commission Entry Note`

맨 아래에 공제 행 2줄(Korea Daily / Korea Times)과 TOTAL 행이 붙습니다.
공제 행은 `Carrier Name`이 비어 있고 `Coverage Type` 자리에 매체명이 들어갑니다.
TOTAL 행은 `Premium` 자리에 문자열 `TOTAL`이 들어갑니다.

**SG Insurance** — `.pdf`, 메일 `acct.sginsurance@gmail.com` 첨부, 파일명 `JADEN LEE.pdf`

헤더에 `<지급처> Payable $금액` 이 여러 줄.
본문 열: `Payable / Carrier / Account Name / New-Renew / Effective Date / Type / Policy # /
Gross Premium / SG Commision Total / Payable to Agent`

주의:
- 지급처 표기에 오타가 섞입니다 (`ALLSTTAE`). 하드코딩하지 마세요
- 2인 이상 카드 섹션처럼 들여쓰기가 다른 블록이 있습니다. 들여쓰기 폭으로 자르지 마세요
- `BROKER FEE`는 폴리시번호 자리에 들어오는 수수료 항목입니다. 계약이 아닙니다

### 반드시 넣을 것

**검산.** 파싱 합계가 명세의 TOTAL(또는 Payable 합계)과 일치하는지 확인하고,
어긋나면 **멈추고 알리세요.** 조용히 틀린 숫자를 넘기면 안 됩니다.

기준: Claude가 돌렸을 때 Uniti 10개월(2026-01~10)·SG 9개월(2026-02~10) 전부
센트 단위로 일치했습니다. 반올림 오차 0.02 이내까지만 허용.

### 사업부 매핑 (그대로 가져가세요)

- **메디케어** — `MEDIC` `MEDIG` `MEDID` `PDP`
- **라이프·연금** — `LIFE` `LIFE - IUL` `LIFE - TERM` `LTCi` `ANNUITY` `ANNUITY - INDEXED`
- **P&C** — `Commercial Package` `Commercial Property` `General Liability` `Personal Auto`
  `Worker's Compensation` `Professional Liability` `Homeowners` `Condo` (+ SG는 전부 P&C)
- **기타 건강** — `HLTH` `GRP HLTH` `DENTAL` `VISION`

새 코드가 `미분류`를 내면 매핑에 빠진 항목이라는 뜻입니다. 로그에 남기세요.

---

## 하지 말 것

- 기존 시트의 행·열 **삭제나 이동** (AEP 동결)
- 고객 데이터를 저장소에 커밋
- 포털 자동 로그인 — Claude도 안 하고 Codex도 하지 않습니다

## 결과

(Codex가 채움)
