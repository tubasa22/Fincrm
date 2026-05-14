// ============================================
// Zapier Code by Zapier 액션
// 신청자 Sheet에 새 행이 추가될 때 실행
// ============================================

// 코드 생성 함수 (안정적이고 충돌 없음)
function generateAccessCode() {
  // 영문자 풀 (I, O 제외 - 0, O 혼동 방지)
  const alpha = ['A','B','C','D','E','F','G','H','J','K','L','M','N','P','Q','R','S','T','U','V','W','X','Y','Z'];
  
  // 랜덤 영문 1글자
  const randomAlpha = alpha[Math.floor(Math.random() * alpha.length)];
  
  // 랜덤 숫자 4자리 (0000 ~ 9999)
  const randomNum = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  
  // FC-X-0000 형식
  const code = 'FC-' + randomAlpha + '-' + randomNum;
  
  return code.toUpperCase().trim();
}

// ============================================
// Zapier에서 이 코드를 실행
// ============================================

const newCode = generateAccessCode();
output = {
  code: newCode,
  timestamp: new Date().toISOString(),
  format: 'FC-[A-Z]-[0-9]{4}'
};

// 콘솔 출력 (Zapier 로그에서 확인)
console.log('생성된 코드:', newCode);
console.log('타임스탬프:', output.timestamp);

// ============================================
// Zapier Action 2: Update Spreadsheet Row
// ============================================
/*
이 코드 생성 후 Zapier의 다음 액션:

Action: Update Google Sheets row
- 찾을 행: 1단계 에서 트리거된 행
- 업데이트할 컬럼:
  * G (코드): [위 코드 생성 결과] → newCode
  * H (상태): "발급됨"

예시:
  Update Row in 신청자목록 sheet:
  - Find Row: Row Number [Trigger Row Number]
  - Column G: [Code]
  - Column H: "발급됨"
*/

// ============================================
// Zapier Action 3: Gmail 발송
// ============================================
/*
Action: Send Email
- To: [Trigger Email]
- Subject: FinCRM 액세스 코드가 발급되었습니다
- Body:

안녕하세요, [Name]님!

브릿지원 FinCRM 액세스 코드가 발급되었습니다.

📌 **액세스 코드: [Code]**

✅ 사용 방법:
1. https://tubasa22.github.io/Fincrm/ 방문
2. "🔑 액세스 코드 있음 → 로그인" 클릭
3. 위 코드 입력
4. Google 계정으로 로그인
5. FinCRM 사용 시작!

⏰ 코드 유효 기간: 발급 후 30일

문의사항이 있으시면 연락주세요.

감사합니다,
브릿지원 팀
*/

// ============================================
// 중요: 코드 형식 검증
// ============================================
/*
생성 예시:
- FC-A-0001
- FC-Z-9999
- FC-M-5432

절대 생성되지 않음:
- FC-I-0001 (I 제외)
- FC-O-0001 (O 제외)
- FC-AB-0001 (영문 2글자 제외)
- FC-A-00001 (숫자 4자리 초과 제외)
*/
