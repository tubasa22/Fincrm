# FinCRM AI 개발팀 기획서
**버전 1.0 | 2026-05**

---

## 1. 개요

FinCRM 베타 배포 후 사용자 피드백을 수집·분석하고 지속적으로 개선하는 **AI 에이전트 개발팀**을 구성한다. 인간 개발자의 개입 없이도 반복적인 버그 수정·기능 개선 사이클이 돌아가는 구조를 목표로 한다.

---

## 2. 팀 구성

### 오케스트레이터
| 역할 | 플랫폼 | 설명 |
|---|---|---|
| **Jarvice** | n8n + Claude Haiku | 총괄 지휘. 텔레그램으로 명령 수신, 에이전트 라우팅 |

### 코어 에이전트 (CrewAI)

```
Crew: FinCRM DevTeam
├── Collector    — 피드백 수집·분류
├── Analyst      — 데이터 분석·우선순위
├── Developer    — 코드 수정 (Claude Code)
├── QA           — 품질 검증
├── Communicator — 사용자 소통
└── Guardian     — 보안·안정성
```

---

## 3. 에이전트 상세 스펙

### 3-1. Collector (수집 에이전트)
- **플랫폼**: n8n Webhook 트리거
- **입력**: FinCRM `/feedback` 버튼 → Webhook POST
- **처리**:
  - `type` 분류: `feedback` / `bug` / `onboarding` / `ping`
  - `user_code` 기반 사용자 식별 (FC-XX-NNNN 형식)
  - `severity` 기반 긴급도 스코어링
- **출력**: Google Sheets `피드백_로그` 시트에 저장 + Analyst에게 전달
- **알림**: HOT 버그(심각) → Jarvice 즉시 텔레그램 알림

```json
// 수신 데이터 예시
{
  "type": "bug",
  "severity": "심각",
  "user_code": "FC-HG-3821",
  "user_name": "홍길동",
  "page": "고객 상세 페이지",
  "action": "저장 버튼 클릭",
  "desc": "저장 후 데이터가 사라짐",
  "ts": "2026-05-11 14:30"
}
```

### 3-2. Analyst (분석 에이전트)
- **플랫폼**: n8n + Claude Haiku
- **실행 주기**: 매일 오전 9시 (LA 시간) 자동 실행
- **분석 항목**:
  - 버그 패턴 클러스터링 (같은 버그 중복 집계)
  - 기능 요청 빈도 순위
  - 사용자 코드별 활동 패턴
  - 심각도별 미해결 건수
- **출력**: 주간 리포트 → Jarvice → 텔레그램 전달

```
📊 주간 개발 리포트 (2026-05-11)

🐛 버그: 3건 (심각 1 / 보통 2)
💬 피드백: 8건 (개선 5 / 칭찬 2 / 기타 1)
👥 신규 사용자: 4명 (누적 12명)

🔴 긴급: 저장 버그 (3명 보고)
🟡 다음: 달력 날짜 표시 오류
✅ 완료: 전화 버튼 연락일 리셋
```

### 3-3. Developer (개발 에이전트)
- **플랫폼**: Claude Code (MCP)
- **입력**: Analyst가 우선순위 지정한 이슈 목록
- **처리**:
  1. `index.html` 현재 코드 읽기
  2. 버그/기능 수정
  3. 변경사항 diff 생성
  4. QA에게 검증 요청
- **제약**:
  - 고객 데이터에 직접 접근 금지
  - 인증 로직 단독 수정 금지 (Guardian 승인 필요)
  - 배포 전 반드시 QA 통과

### 3-4. QA (검증 에이전트)
- **플랫폼**: n8n + Claude Haiku
- **검증 항목**:
  - 수정된 기능이 실제로 동작하는지 시뮬레이션
  - 기존 핵심 기능 회귀(regression) 체크리스트
  - 코드 문법 오류 검사
- **판정**:
  - PASS → Communicator에게 배포 완료 알림 요청
  - FAIL → Developer에게 재수정 요청 (최대 3회)

### 3-5. Communicator (소통 에이전트)
- **플랫폼**: n8n + Twilio SMS / Gmail
- **역할**:
  - 배포 완료 시 사용자 코드별 SMS 발송
  - 버그 접수 확인 자동 회신
  - 피드백 감사 메시지 발송
  - 월간 업데이트 뉴스레터

```
[FinCRM] 업데이트 완료 🎉
FC-HG-3821 홍길동님이 보고하신
저장 버그가 수정되었습니다.
최신 파일을 다운로드해 주세요.
```

### 3-6. Guardian (보안 에이전트)
- **플랫폼**: n8n 스케줄러
- **실행 주기**: 매일 자정
- **점검 항목**:
  - Webhook URL 노출 여부
  - 비정상 피드백 패턴 (스팸/공격 시도)
  - LocalStorage 데이터 무결성
  - 개발자 패널 접근 로그

---

## 4. 운영 플로우

### 버그 신고 → 수정 → 배포 사이클

```
사용자 🐛 클릭
    ↓
Collector 수집 (즉시)
    ↓
심각도 심각? ──Yes──→ Jarvice 즉시 알림 → 긴급 처리
    ↓ No
Sheets 저장 (누적)
    ↓
Analyst 일일 분석 (오전 9시)
    ↓
Developer 수정 착수
    ↓
QA 검증 PASS?
    ↓ Yes
Communicator 사용자 알림
    ↓
배포 완료 → Jarvice 보고
```

### 피드백 → 기능 개선 사이클

```
피드백 누적 (7일)
    ↓
Analyst 패턴 분석
    ↓
동일 요청 3건 이상? ──Yes──→ Developer 기능 추가 착수
    ↓ No
보류 목록 유지
```

---

## 5. 기술 스택

| 구성 요소 | 기술 | 용도 |
|---|---|---|
| 오케스트레이터 | n8n + Claude Haiku | Jarvice 총괄 |
| 에이전트 팀 | CrewAI (Python) | 역할 기반 협업 |
| 개발 에이전트 | Claude Code | 코드 수정·배포 |
| 데이터 저장 | Google Sheets | 피드백 로그·이슈 트래킹 |
| 알림 | Twilio SMS | 사용자 소통 |
| 배포 | GitHub + GitHub Pages | 자동 배포 |
| 모니터링 | 개발자 패널 (FinCRM 내장) | 실시간 확인 |

---

## 6. 구현 로드맵

### Phase 1 — 지금 (1~2주)
- [x] FinCRM 피드백·버그 버튼 추가
- [x] 사용자 온보딩 + 코드 발급 시스템
- [x] 개발자 패널 (Ctrl+Shift+D)
- [ ] n8n Collector 워크플로우 구성
- [ ] Google Sheets 피드백 로그 시트 생성
- [ ] Jarvice에 CRM 팀 연동

### Phase 2 — 1개월
- [ ] CrewAI Analyst 에이전트 구성
- [ ] 일일 자동 리포트 스케줄러
- [ ] Developer 에이전트 (Claude Code MCP 연동)
- [ ] QA 체크리스트 자동화

### Phase 3 — 2~3개월
- [ ] Communicator SMS 자동화
- [ ] Guardian 보안 스캔
- [ ] GitHub Pages 자동 배포 파이프라인
- [ ] 사용자 코드 기반 개인화 업데이트 발송

---

## 7. 사용자 코드 시스템

### 코드 형식
```
FC - [이름이니셜2자] - [랜덤4자리]
예: FC-HG-3821 (홍길동)
    FC-KJ-5492 (김철수)
```

### 활용
- 피드백·버그 리포트에 자동 포함
- 수정 완료 시 해당 코드 사용자에게 SMS 발송
- 개발자 패널에서 사용자별 활동 추적
- 추후 유료화 시 라이선스 키로 활용 가능

---

## 8. n8n Collector 워크플로우 구성 가이드

```
Webhook Trigger (POST /crm-feedback)
    ↓
Code Node — 타입 분류 & 우선순위 스코어링
    ↓
Switch Node
├── bug + 심각 → 텔레그램 즉시 알림 + Sheets 저장
├── bug + 보통/낮음 → Sheets 저장
├── feedback → Sheets 저장
└── onboarding → 신규 사용자 Sheets 등록 + 환영 SMS
```

### Sheets 컬럼 구조
| 컬럼 | 내용 |
|---|---|
| A | 수신 일시 |
| B | 타입 (bug/feedback/onboarding) |
| C | 사용자 코드 |
| D | 사용자명 |
| E | 에이전시 |
| F | 심각도 |
| G | 화면 |
| H | 내용 |
| I | 상태 (미검토/검토중/완료) |
| J | 처리 메모 |

---

*이 문서는 FinCRM AI 개발팀 구성을 위한 초기 기획서입니다. 실제 구현 과정에서 지속적으로 업데이트됩니다.*
