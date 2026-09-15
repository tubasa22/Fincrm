# AGENTS.md — MedCare CRM 작업 에이전트 지침

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
| Medigap PDP 상품 입력·결합 저장 | 완료 |
| 고객 활성/비활성 상태 관리 | 완료 |
| 가입상품(회사)과 구체적 상품명 분리 관리 | 완료 |
| 로그인 화면 죽은 코드 전체 정리 | 완료 |

### 다음 세션 인계 메모 (2026-09-14)

- `feat/prod-free-input`의 가입상품 자유 입력 + 기존 고객 데이터 기반 자동완성 변경은 main에 병합됐다.
- 이 작업의 실제 로그인 검증은 아직 필요하다: 등록·수정 모달에서 기존 상품값 표시, 플랜 변경 시 해당 플랜 상품 우선 추천, 저장 동작을 확인한다.
- 별도 작업트리 `fix-save-race-condition`의 `fix/client-filter-reset` 브랜치에는 필터 재현용 `[DEBUG-A/B/C]` 로그 3줄이 **커밋되지 않은 채 남아 있다**. 사용자가 결과를 검토할 때까지 삭제하거나 커밋하지 않는다.

## 4. 미해결 이슈 (건드릴 때 주의)

| 이슈 | 위치 | 비고 |
|---|---|---|
| 과거 시트 번호 중복·순서 뒤바뀜 | 실제 시트(예: No.263) | 과거 수동 편집 이력 때문으로 확인됨. saveClient() 경쟁조건 수정 이후 새 중복은 방지되지만 기존 데이터는 자동 정리하지 않음. 필요시 사용자가 COUNTIF로 찾아 수동 정리 |
| localStorage 19개 키 분산 관리 | 코드 전체 | `utils/storage.js` 래퍼 도입은 계획됐으나 기존 호출부 전수 치환은 아직 범위 밖 |

## 5. 변경 이력

작업을 완료할 때마다 아래 표에 새 행을 **위에** 추가한다 (최신이 위로 오게).

| 날짜 | 작업 내용 | 변경된 파일 | 후속 작업 |
|---|---|---|---|
| 2026-09-14 | DOB 플레이스홀더 오타(DD/MM→MM/DD) 수정, 이름/도시 자동 대문자 추가, 화면에 표시되는 날짜를 MM/DD/YYYY로 통일(입력값 자체는 ISO 유지) | `index.html`, `js/utils/ui-and-onboarding.js`, `js/features/dashboard.js`, `js/features/client-detail.js`, `js/features/client-management.js`, `README.md`, `AGENTS.md` | 실제 로그인 환경에서 신규 메모 작성 시각과 날짜 입력·재수정 확인 |
| 2026-09-14 | 고객 목록의 상세/수정/전화/문자 버튼을 제거 (상세 페이지에 이미 존재), 목록에는 활성 토글/파일/삭제만 남김 — 토글 추가로 인한 레이아웃 깨짐 해결 | `js/features/dashboard.js`, `README.md`, `AGENTS.md` | 실제 사이트에서 목록 액션 배치와 상세 페이지 진입·기존 액션 확인 |
| 2026-09-14 | 가입상품(회사)과 별개로 구체적 상품명 필드 추가 (메인 시트 U열, 자동완성 포함) | `index.html`, `js/main.js`, `js/features/client-management.js`, `js/features/dashboard.js`, `js/utils/ui-and-onboarding.js`, `README.md`, `AGENTS.md` | 실제 로그인 환경에서 U열 저장·자동완성·목록 표시 확인 |
| 2026-09-14 | 고객 활성/비활성 상태 추가 (메인 시트 T열, 목록에서 토글로 즉시 전환, 비활성은 회색 처리+배지로 구분) | `index.html`, `js/main.js`, `js/features/client-management.js`, `js/features/dashboard.js`, `README.md`, `AGENTS.md` | 실제 로그인 환경에서 T열 저장·새로고침 후 상태 유지 확인 |
| 2026-09-14 | MAPD 가입상품 목록에서 PPO 옵션 제거 (HMO만 취급) | `js/features/client-management.js` | 실제 등록 화면에서 MAPD 선택 목록 확인 |
| 2026-09-14 | 가입상품을 하드코딩 드롭다운에서 자유입력+자동완성(기존 데이터 기반)으로 변경 — 상품명 목록 유지보수 불필요해짐 | `index.html`, `js/utils/ui-and-onboarding.js`, `js/features/client-management.js` | 실제 고객 데이터로 플랜별 자동완성·수정 화면 값 확인 |
| 2026-09-14 | Medigap 선택 시 PDP 상품 입력칸 자동 표시, 저장 시 `메디갭 / PDP` 형태로 합쳐서 기록, 수정 시 자동 분리 | `index.html`, `js/features/client-management.js`, `js/utils/ui-and-onboarding.js`, `README.md`, `AGENTS.md` | 실제 로그인 환경에서 시트 O열 저장 결과 확인 |
| 2026-09-14 | 로그인 화면 죽은 코드 전체 정리: 신청 기능(API 키 포함), 액세스 코드 패널(백도어 코드 포함), `Code.gs`, `CODE_REVIEW_REPORT.md` 삭제 | `index.html`, `js/auth.js`, `Code.gs`, `CODE_REVIEW_REPORT.md`, `README.md`, `AGENTS.md` | 없음 |
| 2026-09-14 | 플랜 상세 입력창(약 리스트 포함)을 플랜 종류와 무관하게 항상 표시하도록 변경 (MAPD/PDP 하드코딩 제거 - C-SNP/D-SNP 등도 Part D 필요) | `js/features/client-management.js` | 실제 등록·수정 화면에서 Medigap 선택 시 상세 입력창 표시 확인 |
| 2026-09-14 | 플랜별 현황: 도넛 뷰 제거, 막대만 유지, 플랜명 대문자 통일, 클릭 시 고객 목록 필터링 추가 | `index.html`, `js/features/dashboard.js` | 실제 로그인 데이터에서 LIFE 항목 클릭 결과 확인 |
| 2026-09-14 | 메모 읽기/쓰기가 '왼쪽 첫 탭' 암묵 의존 → '상담 이력' 탭 이름 명시적 참조로 변경 | `js/main.js`, `js/features/client-management.js` | 실제 로그인 환경에서 기존 메모 조회·새 메모 저장 탭 확인 |
| 2026-09-14 | 가입상품 드롭다운을 실제 취급 보험사(Aetna, AARP, Anthem, Blue Shield, Health Springs/구 Cigna, WellCare)로 축소, 나머지는 기타(직접입력)로 처리 | `index.html` | 기존 고객의 드롭다운 미등록 상품 수정 시 직접 입력 동작 확인 |
| 2026-09-14 | 브랜드명을 MedCare CRM으로, 아이콘을 ⚕️로 변경 (배포 URL은 유지) | `index.html`, `README.md`, `AGENTS.md` | 없음 |
| 2026-09-14 | 고객 수정 후 목록 새로고침 시 플랜/검색 필터가 풀리던 버그 수정 (`renderClients` → `filterClients` 호출로 변경) | `js/main.js` | 브라우저에서 수정 저장 후 필터 유지 재확인 |
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
