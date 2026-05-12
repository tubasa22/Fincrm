# 🏦 FinCRM — 한인 보험 에이전트 전용 CRM

> 미국 캘리포니아 한인 보험 에이전트를 위한 올인원 고객 관리 시스템

[![GitHub Pages](https://img.shields.io/badge/배포-GitHub%20Pages-blue)](https://tubasa22.github.io/Fincrm)
[![Version](https://img.shields.io/badge/버전-1.0%20Beta-orange)]()
[![License](https://img.shields.io/badge/라이선스-Private-red)]()

---

## 🚀 바로 시작하기

**👉 [https://tubasa22.github.io/Fincrm](https://tubasa22.github.io/Fincrm)**

별도 설치 없이 브라우저에서 바로 실행됩니다.

---

## ✨ 주요 기능

### 👥 고객 관리
- 고객 등록·수정·삭제 (이름, 연락처, 생년월일, 주소, 플랜 정보)
- 생년월일 기반 나이 자동 계산
- 65세 Medicare 전환 3개월 전 자동 리마인더
- 고객 상세 페이지 (MBI, PCP, 네트워크, 복용약 등)
- Google Drive 파일 업로드·관리

### 📊 대시보드
- KPI 카드 (전체 고객·플랜별·장기 미연락·리퍼)
- 연락 필요 고객 리스트 (D+일수 표시, X로 개별 숨기기)
- 이번 달 생일자 리마인더
- 🏥 Medicare 전환 대상자 알림
- 플랜별 현황 차트 (막대·도넛)

### 📅 일정 관리
- 월별 캘린더 (연락일·생일·상담·수동 일정·미국 공휴일)
- 날짜 클릭으로 수동 일정 추가·삭제
- 일정 종류·시간·대상 입력

### 💬 문자 발송 (Twilio)
- 주소록에서 수신자 일괄 선택 (체크박스)
- 이름·플랜 필터·검색
- 5개 기본 템플릿 (생일·갱신·환영 등)
- 이미지 첨부 (MMS)
- 예약 발송
- 발송 이력 관리

### 🏥 CA 지역 보험 플랜
| 플랜 | 보험사 |
|---|---|
| **MAPD** | Aetna·Anthem·Alignment·Blue Shield·CleverCare·Humana·Molina·SCAN·AARP/UHC·WellCare (HMO/PPO) |
| **PDP** | Aetna SilverScript·Cigna·WellCare·AARP |
| **Medigap** | Aetna·Anthem·Blue Shield·Humana·AARP (Plan F/G/N) |
| **C-SNP** | 만성질환자 HMO |
| **D-SNP** | 메디칼+메디케어 HMO |

### ⚡ 자동화
- Zapier / n8n Webhook 연동
- 생일·연락일·신규 고객 자동 트리거
- 피드백·버그 리포트 수신 Webhook

---

## 🔧 기술 스택

| 구성 | 내용 |
|---|---|
| Frontend | 순수 HTML·CSS·JavaScript (단일 파일) |
| 데이터 저장 | Google Sheets (실시간 동기화) |
| 인증 | Google OAuth 2.0 |
| 파일 관리 | Google Drive API |
| 문자 발송 | Twilio SMS/MMS API |
| 자동화 | Zapier·n8n Webhook |
| 주소 검색 | Photon·US Census Geocoder (키 없음, 무료) |
| 배포 | GitHub Pages |

---

## 🤖 AI 개발팀

FinCRM은 AI 에이전트 팀이 지속적으로 개선합니다.

```
Jarvice (총괄 오케스트레이터 · n8n)
├── Collector   — 피드백·버그 수집
├── Analyst     — 데이터 분석·우선순위
├── Developer   — 코드 수정 (Claude Code)
├── QA          — 품질 검증
├── Communicator— 사용자 소통
└── Guardian    — 보안·안정성
```

자세한 내용: [FinCRM_DevTeam_Plan.md](./FinCRM_DevTeam_Plan.md)

---

## 📱 개발자 패널

앱 실행 중 `Ctrl + Shift + D` → 접근 코드 입력

- 💬 피드백·버그 대시보드
- 🤖 AI 에이전트 협업 로그
- 📊 시스템 상태
- 🔧 개발 도구 (백업·복원·테스트)

---

## 🗂 저장소 구조

```
Fincrm/
├── index.html              # FinCRM 앱 (전체 소스)
├── README.md               # 이 파일
├── FinCRM_DevTeam_Plan.md  # AI 개발팀 기획서
└── Code.gs                 # Google Apps Script (Sheets 연동)
```

---

## 📋 서비스 지역

Los Angeles · Orange County · San Bernardino · Riverside · Ventura · San Diego

---

## 🔄 업데이트 내역

### v1.0 Beta (2026-05)
- 최초 베타 배포
- 온보딩 + 사용자 코드 발급 시스템 (FC-XX-NNNN)
- 피드백·버그 리포트 기능
- 개발자 패널 내장
- 미국 공휴일 달력 표시
- Medicare 리마인더 (65세 3개월 전)
- 예약 문자 발송
- 주소록 일괄 선택 발송
- C-SNP·D-SNP 플랜 추가

---

## 📞 문의

앱 내 **💬 피드백** 또는 **🐛 버그** 버튼으로 직접 보내주세요.

---

*FinCRM은 캘리포니아 한인 보험 에이전트를 위해 특별히 설계되었습니다.*
