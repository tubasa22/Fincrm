# AGENTS.md — FinCRM 작업 에이전트 지침

이 파일은 Codex(또는 다른 코딩 에이전트)가 이 저장소에서 작업할 때 매 세션 자동으로 읽는 지침서다.
**작업을 시작하기 전에 이 문서 전체를, 특히 "미해결 이슈"와 "변경 이력"을 반드시 먼저 읽는다.**

---

## 0. 필수 규칙 — 모든 작업에 예외 없이 적용

1. **작업 시작 전**: 이 문서의 "변경 이력"과 "미해결 이슈"를 읽고, 지금 하려는 작업이 이미 되어 있거나 진행 중인 건 아닌지 확인한다.
2. **로직 변경 금지 원칙**: 별도 지시가 없는 한 기존 동작(비즈니스 로직)을 바꾸지 않는다. 구조 개선(파일 분리, 리네이밍, 이동)과 로직 변경은 항상 별개 커밋으로 분리한다.
3. **커밋 전 확인**: git commit은 사용자가 명시적으로 요청하기 전까지 하지 않는다. 변경 후 diff만 보여주고 멈춘다.
4. **작업 완료 후 반드시 아래 두 가지를 수행한다 (이게 이번에 추가된 핵심 규칙이다):**
   - a) 이 문서 하단 **"변경 이력"** 표에 한 줄을 추가한다 (날짜, 작업 내용, 변경된 파일, 남은 후속 작업).
   - b) `README.md`의 **"현재 상태 / 최근 업데이트"** 섹션을 갱신한다 (사용자에게 보이는 기능 목록·상태 기준으로, 기술적 세부사항은 여기 AGENTS.md에만 남긴다).
   - 두 문서 중 하나라도 갱신을 빠뜨린 채로 작업을 "완료"라고 보고하지 않는다.
5. 새로운 미해결 이슈나 임시 조치(TODO, 우회 코드, 임시 하드코딩 등)를 만들면 반드시 "미해결 이슈" 표에 추가한다. 반대로 해결했으면 그 항목을 제거하고 변경 이력에 남긴다.

---

## 1. 프로젝트 개요

- 한인 보험 에이전트용 고객 관리(CRM) 웹앱. 순수 프론트엔드(HTML/CSS/JS, 프레임워크 없음) + Google Sheets/Drive를 백엔드로 사용.
- 배포: GitHub Pages (`https://tubasa22.github.io/Fincrm`).
- 인증: Google Identity Services(OAuth) — `sheetsReq()`가 발급받은 `accessToken`으로 Sheets API를 직접 호출.
- 별도로 `Code.gs`(Google Apps Script)가 존재하나, 현재 index.html의 메인 데이터 흐름과는 별개(액세스 코드 검증 등 일부 기능에만 연동)로 취급한다. 함부로 통합하지 않는다.

## 2. 확정된 아키텍처 원칙 (임의로 바꾸지 말 것)

- **ES 모듈(import/export) 사용 안 함.** 일반 `<script src="...">` 여러 개를 의존 순서대로 로드한다. 이유: `onclick="fn()"` 인라인 이벤트 204개가 전역 함수 참조에 의존하고 있어서, 최상위 `function` 선언이 자동으로 `window`에 등록되는 일반 스크립트 방식이라야 이 인라인 이벤트를 건드리지 않고 파일을 분리할 수 있다.
- 파일 분리 시 스크립트 로드 순서: `config → state → utils → api → auth → features/* → dev-dashboard → main`.
- 인라인 이벤트(`onclick` 등)를 이벤트 위임 방식으로 바꾸는 건 **별도의 향후 작업**이며, 파일 분리 작업과 섞지 않는다.

## 3. 진행 중/완료된 작업

| 작업 | 상태 |
|---|---|
| index.html 함수→파일 매핑표 작성 (37개 배너 구역 기준) | 완료 |
| 오프라인 모드 추가 (실제 동기화 데이터를 localStorage 캐시로 저장 후 오프라인에서 조회) | 완료 |
| CSS 4개 파일 분리 (variables/base/layout/components) | 완료 |
| JS 기능별 모듈 분리 (features/*) | 완료 (일반 script 로드 순서 유지) |
| 제목 형식 함수 충돌 해소 | 완료 |
| `sendToWebhook` 오버라이드 병합 | 완료 |
| 죽은 함수·무효 호출 정리 | 완료 |
| 신규 고객 번호(No.) 시트 직접 조회 | 완료 |

## 4. 미해결 이슈 (건드릴 때 주의)

| 이슈 | 위치 | 비고 |
|---|---|---|
| 액세스 코드 검증 취약점 | `verifyCode()` | 정규식 형식만 검사, 시트 조회로 실존 여부 확인 안 함. 보안 이슈, 파일 분리와 별개로 처리 예정 |
| 과거 시트 번호 중복·순서 뒤바뀜 | 실제 시트(예: No.263) | 과거 수동 편집 이력 때문으로 확인됨. saveClient() 경쟁조건 수정 이후 새 중복은 방지되지만 기존 데이터는 자동 정리하지 않음. 필요시 사용자가 COUNTIF로 찾아 수동 정리 |
| localStorage 19개 키 분산 관리 | 코드 전체 | `utils/storage.js` 래퍼 도입은 계획됐으나 기존 호출부 전수 치환은 아직 범위 밖 |

## 5. 변경 이력

작업을 완료할 때마다 아래 표에 새 행을 **위에** 추가한다 (최신이 위로 오게).

| 날짜 | 작업 내용 | 변경된 파일 | 후속 작업 |
|---|---|---|---|
| 2026-09-14 | 전화/메시지 버튼 클릭 시 Phone Link 등 외부 앱이 열리지 않으면 안내 메시지 표시 | `js/features/sms.js` | Phone Link 연결 환경에서 경고 미표시 재확인 |
| 2026-09-14 | Twilio 기반 문자발송 탭·생일 일괄문자·주소록 기능 전체 제거, 메시지 버튼은 `sms:` 링크(Phone Link 등 OS 기본 문자 앱 호출)로 대체 | `index.html`, `js/features/sms.js`, `js/main.js`, `js/features/demo.js`, `js/dev-dashboard.js`, `js/utils/ui-and-onboarding.js` | OS에 SMS 프로토콜 처리 앱이 설치된 실제 환경에서 호출 확인 |
| 2026-09-14 | 로그아웃 시 `isOffline` 플래그가 초기화되지 않아 재로그인 후 데이터를 불러오지 못하는 버그 수정 | `js/auth.js` | 실제 Google 로그인 환경에서 오프라인→로그아웃→재로그인 동작 재확인 |
| 2026-09-14 | 자동화 탭(Zapier 연동) 및 고객 상세페이지 카톡 버튼 전체 제거 | `index.html`, `js/features/automation.js`, `js/features/client-detail.js`, `js/utils/ui-and-onboarding.js` | 없음 |
| 2026-09-14 | 피드백/버그 신고 기능(헤더 버튼, 모달 2개, feedback.js, automation.js의 웹훅/미전송리포트 함수) 전체 제거 완료 — Zapier 자동화는 그대로 유지 | `index.html`, `js/features/automation.js`, `js/features/feedback.js` | 없음 |
| 2026-09-14 | fix/save-race-condition → main 병합 완료. saveClient() 중복 실행 방지로 신규 고객번호 중복 생성 버그 해결. | `js/features/client-management.js`, `AGENTS.md`, `README.md` | 실제 로그인 환경에서 빠른 연속 저장 동작 확인 필요 |
| 2026-09-14 | saveClient() 중복 실행 방지 잠금 추가 - 신규 고객번호 중복 발생 버그(더블클릭 경쟁 조건) 수정 | `js/features/client-management.js` | 브라우저에서 빠른 연속 저장 동작 확인 필요 |
| 2026-09-09 | fix/cleanup-batch → main 병합 완료 (PR, 충돌 없음). 오프라인 모드 + 정리 작업 4건(toTitleCase 충돌, sendToWebhook 병합, 죽은 함수 삭제, 고객번호 버그)이 main에 전부 반영됨. | `index.html`, `js/*`, `AGENTS.md`, `README.md` | 실제 로그인·오프라인 전환 및 시트 번호 생성 확인 필요 |
| 2026-09-09 | 죽은 함수 5개와 무효 호출 3곳 삭제 (진입점 자체가 없어 안전 확인됨) | `js/utils/ui-and-onboarding.js`, `js/dev-dashboard.js` | 없음 |
| 2026-09-09 | 신규 고객 번호(No.)를 시트 A열 직접 조회 방식으로 변경 | `js/features/client-management.js` | 실제 로그인·시트 환경에서 번호 생성 확인 필요 |
| 2026-09-09 | 죽은 함수 5개 상태 확인 | `js/utils/ui-and-onboarding.js`, `js/dev-dashboard.js` | `renderDevTab` 호출 3곳 처리 방안 결정 후 삭제 여부 재검토 |
| 2026-09-09 | `sendToWebhook` 3중 오버라이드를 단일 함수로 병합 | `js/features/feedback.js`, `js/dev-dashboard.js`, `js/utils/ui-and-onboarding.js` | 실제 로그인 프로필로 피드백 전송 확인 필요 |
| 2026-09-09 | 고객 입력용 제목 형식 함수 이름 충돌 해소 | `index.html`, `js/utils/ui-and-onboarding.js` | 브라우저 고객 등록 화면에서 입력 동작 재확인 |
| 2026-09-03 | CSS·JavaScript 파일 분리 및 오프라인 스냅샷 모드 추가 | `index.html`, `css/*`, `js/*`, `README.md`, `AGENTS.md` | 랩탑 브라우저에서 온라인 동기화·오프라인 조회 테스트 후 사용자 확인 시 커밋 |
| (예시, 아직 미적용) | 오프라인 모드 추가 (loadOfflineSnapshot, 스냅샷 캐시 저장) | `index.html` | 로컬 반영 여부 확인, README 업데이트 |

---

## 6. 작업 완료 보고 형식

작업을 마치면 아래 형식으로 요약해서 보고한다:
```
- 작업: (무엇을 했는지 한 줄)
- 변경 파일: (파일 목록)
- AGENTS.md 변경 이력: 추가함 / 추가 안 함 (이유)
- README.md: 갱신함 / 갱신 안 함 (이유)
- 남은 이슈: (있으면)
```
