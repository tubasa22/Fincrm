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
6. **작업 폴더는 `C:\Users\jaden\fincrm-main` 하나다.** 여기서만 작업하고, 작업 전 `git log -1`로 기준 커밋을 확인한 뒤 보고할 때 그 해시를 함께 적는다.

   아래 두 폴더는 **보관용이다. 열지도, 고치지도, 이름을 바꾸지도 않는다.**

   | 폴더 | 상태 |
   |---|---|
   | `C:\Users\jaden\Fincrm` | 2026-09-03. 파일 분리 이전의 300KB 단일 `index.html`. `origin/main`이 `39dbf40`로 오래됨 |
   | `C:\Users\jaden\OneDrive\Documents\ChatGPT\FinCRM 재정비` | 루트 체크아웃은 2026-09-09의 `assets/` 구조 시도. 저장소 자체에는 11월 이력도 있음 |

   2026-11-13에 두 폴더를 검사했고 **main으로 옮길 고유한 기능 수정은 없었다.**
   재정비 쪽에 `origin/main`에 없는 커밋 4개(`c72ccf7`, `d8501cb`, `9e2419e`, `b58c19d`)가
   있지만, 전부 main에 다른 이력으로 반영됐거나 기능 자체가 제거됐다.
   미커밋 변경은 고객번호 생성 로직 수정인데 이미 main에 있다.

   **재정비 폴더는 이름을 바꾸면 안 된다.** 내부 `.worktrees/` 세 개와 외부
   `C:\Users\jaden\.codex\worktrees\3165\FinCRM 재정비` 가 이 저장소에 연결되어 있어,
   탐색기에서 이름만 바꾸면 worktree 경로가 끊긴다. 보관용 이름 변경은 외부 worktree까지
   함께 정리할 때 한 번에 한다.
7. **AEP 기간(~2026-12-07)에는 추가와 읽기만 한다.** 기존 쓰기 경로 변경, 데이터 마이그레이션, 돌아가는 자동화의 순서 변경은 12/7 이후로 미룬다. 예외는 고객 정보 노출을 막는 작업뿐이며, 그때도 변경 범위를 최소로 한다.

---

## ⚠ 긴급 보안 작업 (2026-11-13) — 다른 작업보다 먼저

2026-11-13에 고객 데이터가 외부에 열려 있는 것이 확인됐다. 사용자가 이미 처리한 것과
코드로 고쳐야 하는 것이 나뉜다.

### 이미 처리됨 (사용자, 설정 변경)

- 메인 시트와 고객 상세 시트가 "링크가 있는 모든 사용자 — **편집자**"로 열려 있던 것을 **제한됨**으로 변경
- 드라이브 `FinCRM_고객서류` 폴더 공유 설정 변경

배경: 시트 ID 두 개가 공개 저장소의 `js/config.js` 2~3행에 하드코딩되어 있어서,
저장소를 본 사람은 누구나 그 시트를 열고 고칠 수 있는 상태였다.
**시트 ID가 공개된 것 자체는 문제가 아니다.** 공유 설정이 제한됨이면 ID를 알아도 열리지 않는다.

---

### S-1. 서류 업로드 시 공개 권한 부여 제거

상태: 대기 · 담당: codex · AEP 예외 (고객 정보 노출 차단)

**무엇을**

`js/main.js` 의 `uploadToDrive()` 안, 업로드 성공 직후 블록을 삭제한다.

```js
try{
  await fetch(`https://www.googleapis.com/drive/v3/files/${data.id}/permissions`,{
    method:'POST',headers:{Authorization:'Bearer '+accessToken,'Content-Type':'application/json'},
    body:JSON.stringify({role:'reader',type:'anyone'})
  });
}catch(e){}
```

이 코드는 업로드되는 모든 고객 서류(신청서·개인 정보)에 "링크가 있는 모든 사용자 읽기"를
직접 부여한다. `catch(e){}` 로 감싸져 있어 성공 여부도 확인하지 않는다.

**하지 말 것**

- 업로드 자체의 동작(폴더 생성, 파일 올리기, 반환값)은 건드리지 말 것
- `webViewLink` 를 쓰는 곳(`js/features/client-detail.js:140` 열기 버튼)은 그대로 둘 것.
  로그인한 사용자는 권한이 있으므로 그 링크로 계속 열린다

**완료 조건**

- 새로 업로드한 서류의 공유 설정이 "제한됨"이다
- 로그인한 상태에서 고객 상세의 "열기" 버튼이 그대로 동작한다

### S-2. 이미 업로드된 서류의 공개 권한 일괄 해제

상태: 대기 · 담당: codex · AEP 예외 · **S-1 먼저**

**왜 따로 필요한가**

드라이브는 폴더 권한과 파일 자체 권한이 별개다. 폴더를 제한됨으로 바꿔도,
업로드 때 **파일마다 직접 걸린** `anyone` 권한은 남아 있다.

**무엇을**

`js/dev-dashboard.js` 에 일회성 도구를 추가한다. 이미 Drive 범위로 로그인되어 있으므로
새 인증은 필요 없다.

1. `FinCRM_고객서류` 폴더를 찾고, 그 아래 모든 하위 폴더와 파일을 재귀로 수집한다
2. 각 항목에 대해 `GET /drive/v3/files/{id}/permissions?fields=permissions(id,type,role)`
3. `type === 'anyone'` 인 권한이 있으면 `DELETE /drive/v3/files/{id}/permissions/{permissionId}`
4. 폴더 자체도 같은 검사를 한다
5. 처리 결과를 화면에 남긴다 — 검사한 수, 해제한 수, 실패한 항목(ID와 사유)

**반드시 지킬 것**

- **먼저 "검사만" 모드로 돌려서 몇 개가 열려 있는지 보고한 뒤**, 사용자가 확인하면 해제한다.
  두 단계를 한 버튼에 묶지 말 것
- `type === 'anyone'` 인 권한만 지운다. `user`, `group`, `domain` 권한은 건드리지 말 것
- API 호출 사이에 간격을 두어 속도 제한에 걸리지 않게 한다
- 실패해도 중단하지 말고 다음 파일로 넘어가되, 실패 목록을 남긴다

**완료 조건**

- 검사 모드가 전체 파일 수와 공개 상태인 수를 정확히 보고한다
- 해제 후 다시 검사하면 공개 상태가 0개다
- 로그인한 사용자는 모든 서류를 그대로 열 수 있다

**끝난 뒤**

이 도구는 일회성이다. 완료 보고 후 제거할지 남길지 사용자에게 묻는다.

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
- ~~별도 작업트리 `fix-save-race-condition`의 `fix/client-filter-reset` 브랜치에 `[DEBUG-A/B/C]` 로그 3줄이 미커밋으로 남아 있다~~ — **2026-11-13 확인 결과 해당 로그는 없다.** 그 worktree의 작업 트리는 깨끗하고, `main`과의 차이는 문서 기록 한 커밋(`e57c573`)뿐이며 코드 변경은 없다. 이 인계 메모는 더 이상 유효하지 않다.

## 4. 미해결 이슈 (건드릴 때 주의)

| 이슈 | 위치 | 비고 |
|---|---|---|
| 이름 변경 전 기존 연결 수동 복구 | 실제 Drive·PlanInfo·상담 이력 | 이번 수정 전에 이름을 바꾼 고객은 기존 이름 폴더·행을 수동으로 새 이름에 맞춰야 함 |
| 기존 상세URL 유실 여부 확인 | 메인 시트 S열 | 이번 수정 전에 수정 저장된 고객은 S열 상세URL이 빈 값으로 덮였을 수 있으므로 확인 필요 |
| 이름 기반 고객 연결 구조 | Drive·PlanInfo·상담 이력 | 이름 변경 연동은 추가했으나 고객번호(No) 기반 전환은 별도 작업으로 검토 |
| 이름 변경 연동 실사용 검증 | 고객 수정 화면·Drive·상세 시트 | 실제 환경에서 이름 변경 후 서류·약/PCP·상담 이력이 유지되는지 확인 필요 |
| SNP·레거시 플랜 약 목록 누락 데이터 확인 | 실제 PlanInfo 시트 | 하용훈 고객은 약 목록 재입력 필요. 과거 D-SNP/C-SNP/Supplement 고객도 입력값 유실 여부 확인 필요 |
| 레거시 플랜 값·분류 확인 | 실제 메인 시트 및 목록 필터·배지 | 과거 수정으로 플랜 값이 빈 고객이 있는지 확인. DUAL PLAN·Supplement는 필터와 배지에서 별도 값으로 유지되며 데이터 정리 여부는 사용자 결정 |
| SNP·레거시 PlanInfo 실사용 검증 | 고객 등록·수정 화면, PlanInfo 시트 | D-SNP 신규 저장 및 DUAL PLAN/Supplement 기존 고객 수정→저장→재열기 확인 필요 |
| Gmail 이메일 작성 링크 실사용 검증 | 고객 목록·상세 화면 | 새 탭의 받는 사람 자동 입력과 계정 서명 적용 확인 필요. 다중 Google 계정에서는 기본 계정으로 열리며 필요 시 `authuser` 지정 검토 |
| Google userinfo 프로필 범위 검토 | `js/config.js` OAuth `SCOPES` | 현재 profile/email 범위가 없어 이름을 받지 못할 수 있음. 수정 후에도 `사용자` 기록이 생기면 재동의를 수반하는 범위 추가 별도 검토 |
| 기존 로그인 이력의 `사용자` 기록 | 브라우저 localStorage `fcrm_login_log` | 과거 기록은 수정하지 않으며 최근 20건 제한에 따라 자연 소멸. 실제 로그인→로그아웃 이름 확인 필요 |
| MEDIGAP 약 목록 누락 데이터 확인 | 실제 PlanInfo 시트 | 박 명이 고객은 약 목록 수동 재입력 필요. 이전 MEDIGAP 고객도 입력값이 유실됐을 수 있으므로 확인 필요 |
| MEDIGAP PlanInfo 저장 실사용 검증 | 고객 등록·수정 화면, PlanInfo 시트 | MEDIGAP 신규 등록 → 약 저장 → 수정 화면 재열기 흐름 확인 필요 |
| 약 목록 추가 입력 전용 흐름 실사용 검증 | 고객 등록·수정 화면, PlanInfo 시트 | 기존 칩 표시 → 신규 추가·중복 제거 → 저장·재열기 → 칩 삭제 저장의 전체 흐름 확인 필요 |
| 약 목록 숫자 쉼표 수정 실사용 검증 | 고객 등록·수정 화면, PlanInfo 시트 | 12줄 붙여넣기 → 저장 → 재열기 후 12개 유지 확인 필요 |
| 기존에 쪼개져 저장된 약 항목 | 실제 PlanInfo 시트 | `000 Unit` 같은 기존 데이터는 자동 복구하지 않으므로 수동 확인 필요 |
| 약 목록 대문자 표기·알파벳 정렬 | `js/utils/ui-and-onboarding.js` | 기존 동작 유지 중이며 변경 여부는 사용자 결정 대기 |
| 기존 고객 캐시 삭제용 1회성 코드 유지 | `js/config.js` | 모든 사용 브라우저에서 정리된 후 제거 가능 |
| 연락 기록 없는 고객의 120일 알림 제외 | `js/features/dashboard.js` `buildNotifs()` | 고객 등록일 필드가 없어 경과 기간을 판정할 수 없음. 향후 등록일 필드 추가 시 재검토 |
| 과거 시트 번호 중복·순서 뒤바뀜 | 실제 시트(예: No.263) | 과거 수동 편집 이력 때문으로 확인됨. saveClient() 경쟁조건 수정 이후 새 중복은 방지되지만 기존 데이터는 자동 정리하지 않음. 필요시 사용자가 COUNTIF로 찾아 수동 정리 |
| 아내 계정 시트 접근 권한 | 구글 시트 공유 설정 | 메인·상세 두 시트가 제한됨으로 바뀌면서 소유자와 Jaden 두 계정만 남음. 아내가 CRM을 쓰려면 그 구글 계정을 두 시트 모두에 편집자로 추가해야 함. 사용자가 나중에 하기로 함 (2026-11-13) |
| 메모를 innerHTML로 삽입 | `js/features/client-detail.js:200` | `newMemo`를 그대로 innerHTML에 넣음. 시트에 쓸 수 있는 사람이 HTML을 넣으면 스크립트가 실행될 수 있고, localStorage의 구글 토큰까지 읽힐 수 있음. textContent 전환 검토 (AEP 이후) |
| 구글 토큰 localStorage 저장 | `js/config.js:58` | 같은 출처의 악성 스크립트가 읽을 수 있음. 위 innerHTML 항목과 묶어서 검토 |
| OAuth 범위가 넓음 | `js/config.js:4` | `spreadsheets` + `drive` 전체를 요청. 실제로는 시트 2개와 서류 폴더만 사용. `drive.file`로 좁히면 기존 폴더 검색·조회·삭제가 깨질 수 있고, 기존 승인이 자동 철회되지 않아 재승인 검증이 필요함. AEP 이후 별도 작업 |
| Apps Script 라우터 배포 여부 | 현 저장소에는 없음 / 보관 폴더 `FinCRM 재정비/apps-script/00_Router.gs` | 2026-11-13 전문 확인: `doGet`·`doPost` → getClients/addClient/updateClient/**deleteClient**/getMemos/addMemo 분기이고 인증 검사가 한 줄도 없음. 소스는 main에서 2026-09-14에 삭제됐으나 **삭제해도 배포는 풀리지 않는다.** 옛 `index.html`과 현재 main 어디에도 `script.google.com` 주소가 없어 배포 여부는 코드로 알 수 없음. script.google.com → 배포 관리에서 활성 웹앱 확인 필요 (사용자). 코드에 인증이 없다는 사실과 지금 외부에 노출되어 있다는 것은 별개 판단임 |
| 고객번호(No.) 고유성 미보장 | `js/features/client-management.js` | A열 최댓값+1 방식이라 동시 저장 시 같은 번호가 생길 수 있고, 조회 실패 시 로드된 배열로 대체됨. 이름 기반 연결을 No. 기반으로 바꾸기 전에 No.를 불변·중복 없는 키로 정비하는 것이 선행 조건 |
| localStorage 19개 키 분산 관리 | 코드 전체 | `utils/storage.js` 래퍼 도입은 계획됐으나 기존 호출부 전수 치환은 아직 범위 밖 |

## 5. 변경 이력

작업을 완료할 때마다 아래 표에 새 행을 **위에** 추가한다 (최신이 위로 오게).

| 날짜 | 작업 내용 | 변경된 파일 | 후속 작업 |
|---|---|---|---|
| 2026-11-13 | 고객 시트·드라이브 폴더의 공개 공유를 제한됨으로 변경(사용자 설정 작업). 에이전트 분담·AEP 동결·결정 기록 절을 추가하고 보안 미해결 이슈 6건 등록. 코드 변경 없음 | `AGENTS.md` | S-1·S-2 구현; 아내 계정 추가; Apps Script 배포 여부 확인 |
| 2026-11-06 | 고객 이름 변경 시 Drive 서류 폴더·PlanInfo·상담 이력 이름을 함께 갱신하고, 옛 이름의 다른 고객번호 고객이 남아 있으면 자동 이동을 중단하며, Drive 조회 범위 제한과 S열 상세URL 보존 적용 | `js/main.js`, `js/features/client-management.js`, `js/features/client-detail.js`, `README.md`, `AGENTS.md` | 기존 연결·S열 유실 데이터 수동 확인; 이름 기반 연결의 고객번호 전환 검토; 실제 이름 변경 흐름 검증 |
| 2026-10-29 | D-SNP·C-SNP 및 레거시 DUAL PLAN·Supplement를 PlanInfo 저장·불러오기 대상으로 확장하고 수정 화면에서 기존 플랜 값을 임시 옵션으로 보존 | `js/features/client-management.js`, `js/features/client-detail.js`, `README.md`, `AGENTS.md` | 하용훈 약 목록 재입력; 과거 누락·빈 플랜 데이터 확인; 실제 저장·재열기 검증 |
| 2026-10-23 | 고객 목록과 상세 화면의 유효한 이메일을 Gmail 작성 링크로 변경하고 목록에서는 행 클릭 이벤트 전파를 차단 | `js/utils/ui-and-onboarding.js`, `js/features/dashboard.js`, `js/features/client-detail.js`, `css/components.css`, `README.md`, `AGENTS.md` | 실제 Gmail 새 탭의 받는 사람·서명 적용 확인; 다중 계정의 `authuser` 지정 필요 여부 검토 |
| 2026-10-23 | 헤더·프로필·로그인·로그아웃 이력의 사용자 이름 출처를 온보딩 프로필 우선 규칙으로 통일하고 Google userinfo 오류 시 기존 캐시를 보존해 사용하도록 개선 | `js/config.js`, `js/auth.js`, `js/utils/ui-and-onboarding.js`, `README.md`, `AGENTS.md` | 실제 로그인→로그아웃→최근 활동 이름 확인; 계속 `사용자`로 기록되면 OAuth profile/email 범위 추가 별도 검토 |
| 2026-10-23 | MEDIGAP 고객도 PlanInfo와 복용 약 목록을 저장·불러오도록 플랜 판정을 통합하고 PlanInfo 저장 실패 경고가 성공 메시지로 덮이지 않도록 수정 | `js/features/client-management.js`, `js/features/client-detail.js`, `README.md`, `AGENTS.md` | 박 명이 고객 약 목록 수동 재입력; 과거 MEDIGAP 누락 데이터 확인; 실제 신규 저장·재열기 검증 |
| 2026-10-16 | 복용 약 textarea를 신규 추가 전용으로 분리하고 저장된 약은 칩으로 표시, 기존·신규 병합·중복 제거·칩 삭제 후 저장 지원 | `js/utils/ui-and-onboarding.js`, `js/features/client-management.js`, `README.md`, `AGENTS.md` | 실제 환경에서 기존 5개+신규 3줄(중복 1개)→7개 저장·재열기 및 칩 삭제 저장 흐름 확인 |
| 2026-10-16 | 약 목록 분리 시 `36,000` 같은 숫자 쉼표를 보존하고 입력·삭제·저장·상세 재표시에 공통 분리 규칙 적용 | `js/utils/ui-and-onboarding.js`, `README.md`, `AGENTS.md` | 실제 환경에서 12줄 저장·재열기 확인; 기존 `000 Unit` 분리 데이터 수동 점검; 대문자·정렬 정책 결정 |
| 2026-10-14 | 오프라인 모드 제거 및 실제 고객 데이터의 브라우저 로컬 저장 중단, 기존 캐시 삭제용 1회성 정리 추가 | `index.html`, `js/config.js`, `js/main.js`, `js/auth.js`, `README.md`, `AGENTS.md` | 실제 로그인 화면·로그인/로그아웃/재로그인 흐름 및 기존 사용 브라우저의 캐시 키 삭제 확인 |
| 2026-09-18 | 마지막 연락 후 120일 이상 지난 활성 고객을 개별 알림으로 표시하고 클릭 시 고객 상세로 이동하도록 추가 | `js/features/dashboard.js`, `README.md`, `AGENTS.md` | 실제 활성 고객 중 120일 이상 미연락 사례로 알림 표시·상세 이동 확인; 등록일 필드 추가 시 연락 기록 없는 고객 처리 재검토 |
| 2026-09-18 | 신규·수정 고객 저장 후 J열(DOB)에 `MM/DD/YYYY` 날짜 표시 형식을 `repeatCell`로 명시 적용해 일련번호 노출 재발 방지 | `js/features/client-management.js`, `README.md`, `AGENTS.md` | 실제 Google Sheets에서 신규 등록·수정 후 J열 표시 형식 확인; 기존 302~307행은 시트에서 서식 수동 복구 |
| 2026-09-18 | 고객 서류 업로드 종류를 신청서·개인 정보·기타로 단순화 (기존 업로드 라벨은 유지) | `index.html`, `README.md`, `AGENTS.md` | 실제 업로드 시 새 종류가 파일명 접두사로 저장되는지 확인 |
| 2026-09-16 | 인라인 메모 수정 버튼에 전달되는 문자열의 백슬래시·따옴표·줄바꿈 이스케이프를 보완해 여러 줄 메모에서 버튼이 무반응이던 문제 수정 | `js/utils/ui-and-onboarding.js`, `README.md`, `AGENTS.md` | 실제 로그인 데이터에서 여러 줄·따옴표 포함 메모 수정 및 저장 확인 |
| 2026-09-15 | 전화하기 버튼의 `tel:` 링크에 사용되는 전화번호에서 하이픈 등 구분 문자를 제거해 Phone Link 호출 문제 수정 | `js/features/sms.js`, `README.md`, `AGENTS.md` | Phone Link가 연결된 실제 Windows 환경에서 전화 앱 호출 확인 |
| 2026-09-14 | MBI 중복 검사 기능 추가 - 등록/수정 시 실시간 감지 + 전체 고객 대상 일괄 검사 도구 | `index.html`, `js/utils/ui-and-onboarding.js`, `js/features/client-management.js`, `js/features/dashboard.js`, `README.md`, `AGENTS.md` | 실제 로그인 환경에서 중복 경고·자기 자신 제외·상세 이동·일괄 검사 확인 |
| 2026-09-14 | 활성/비활성 토글 시 빠른 필터(qfFilter) 상태가 풀리던 버그 수정 - 마지막으로 렌더링된 목록을 기억해뒀다가 그대로 재사용하는 방식으로 변경 | `js/features/dashboard.js`, `README.md`, `AGENTS.md` | 실제 로그인 환경에서 빠른 필터·검색어 적용 후 토글 및 목록 유지 확인 |
| 2026-09-14 | 비활성 고객을 대시보드 카운트·플랜 통계·팔로우업·생일·메디케어 리마인더에서 제외 (고객 목록 자체는 유지), 상세페이지 마지막 연락일 날짜 포맷 통일 누락분 수정 | `js/features/dashboard.js`, `js/features/client-detail.js`, `README.md`, `AGENTS.md` | 실제 로그인 환경에서 비활성 토글 후 각 집계·목록 및 새로고침 유지 확인 |
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

---

## 7. 에이전트 분담 (Claude · Codex)

이 저장소에는 두 에이전트가 관여한다. 작업 공간이 달라 서로의 환경이 보이지 않는다.

**가르는 기준: 결과물이 이 저장소에 파일로 남으면 Codex, 구글 계정이나 아티팩트에 닿으면 Claude.**

| | Codex | Claude |
|---|---|---|
| 저장소 파일 수정, git | ◎ | — |
| 로컬 실행·디버깅 | ◎ | — |
| Apps Script | ◎ | — |
| Gmail·구글 캘린더 읽기·쓰기 | — | ◎ |
| 아티팩트 발행 | — | ◎ |
| 아침 브리핑(스케줄 작업) | — | ◎ |
| Medicare 플랜 조회·고객 리포트 | — | ◎ |
| 설계 검토 | ○ | ○ |

설계 검토는 둘 다에게 시킨다. 서로 다른 것을 잡아낸다.
2026-11-13 검토에서 Claude는 인증 경계만 보다가 업로드 경로의 공개 공유를 놓쳤고,
Codex는 배포되지 않는 로컬 사본을 기준으로 판단했다. 그래서 §0 규칙 6이 있다.

작업 지시는 이 파일에 적는다. 별도 `specs/`나 `ops/` 폴더는 두지 않는다.

## 8. 결정 기록

왜 그렇게 정했는지 남긴다. 생각이 바뀌면 줄을 지우지 말고 `(대체됨: 2026-MM-DD)`를 붙이고
아래에 새 줄을 추가한다.

| 날짜 | 결정 | 이유 | 재검토 조건 |
|---|---|---|---|
| 2026-11-13 | 데이터는 구글 시트에 그대로 둔다 (Postgres 보류) | 2인 운영 규모에서 관리 비용만 늘어남. OAuth + 시트 권한으로 접근 통제가 이미 성립 | 고객이 수천 명을 넘어 시트가 느려질 때 / 고객×신청×커미션 집계가 필요할 때 |
| 2026-11-13 | 대시보드는 `dashboard.html` 별도 파일, GitHub Pages에 둔다 | 5,600줄 단일 파일에 더 넣으면 손대기 어려워짐. 집 서버에 두면 인터넷·전기 끊길 때 안 열림 | 대시보드에 편집 기능이 꼭 필요해질 때 |
| 2026-11-13 | 집계는 Apps Script 시간 트리거로 돌린다 | 구글 데이터만으로 끝나는 일에 NAS·도커·n8n을 끼우면 장애 지점만 늘어남 | 여러 서비스를 엮거나 AI 판단이 들어가는 작업이 생기면 그 부분만 n8n |
| 2026-11-13 | 집계값은 시트의 `대시보드` 탭에 미리 써두고 화면은 그것만 읽는다 | 화면 열 때마다 전체 계산하면 느리고 API 쿼터에 걸림 | — |
| 2026-11-13 | 통계는 15분 캐시, 오늘 일정·서류미비·콜백은 실시간 | 후자를 15분으로 두면 방금 처리한 건이 남아 전화를 두 번 걸게 됨 | — |
| 2026-11-13 | 고객 식별자는 기존 No.를 정비해 쓴다. 새 ID 체계를 만들지 않는다 | 이미 있는 키를 두고 늘릴 이유가 없음 | No. 정비가 불가능하다고 판명될 때 |
| 2026-11-13 | 자동화는 고객 원본 행을 수정하지 않는다. 집계 탭만 쓴다 | 바쁜 시기에 자동화가 고객 데이터를 건드려 생기는 사고가 복구하기 가장 어려움 | 예외 없음 |
| 2026-11-13 | 문서는 `AGENTS.md` 한 파일로 관리한다 | 별도 폴더를 만들면 같은 내용이 두 군데에 생겨 반드시 어긋남 | 긴 설계 문서가 실제로 생겼을 때만 분리 |
