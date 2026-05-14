// ============================================
// 1. DOMContentLoaded 이벤트 핸들러 (라인 1439)
// ============================================

document.addEventListener('DOMContentLoaded', () => {
  // ★ 저장된 액세스 코드가 있으면 자동으로 처리
  checkSavedAccessCode();
  
  const chk = setInterval(() => {
    if (window.google?.accounts?.oauth2) {
      clearInterval(chk);
      tokenClient = google.accounts.oauth2.initTokenClient({
        client_id: CLIENT_ID,
        scope: SCOPES,
        callback: (resp) => {
          if (resp.error) return;
          accessToken = resp.access_token;
          tokenExpiry  = Date.now() + (resp.expires_in-60)*1000;
          localStorage.setItem('fcrm_token', accessToken);
          localStorage.setItem('fcrm_exp', tokenExpiry);
          fetch('https://www.googleapis.com/oauth2/v2/userinfo',{headers:{Authorization:'Bearer '+accessToken}})
            .then(r=>r.json()).then(u=>{
              const name = u.name||u.email||'사용자';
              localStorage.setItem('fcrm_user', JSON.stringify({name, email:u.email||'', picture:u.picture||''}));
              addLoginLog('login', name);
              updateUserUI(u);
            });
          bootApp();
        }
      });
      const btn = document.getElementById('signInBtn');
      if(btn){
        btn.disabled = false;
        btn.style.opacity = '1';
        btn.style.cursor = 'pointer';
        btn.innerHTML = `<svg viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg><span class="signInBtnTxt">Google 계정으로 로그인</span>`;
        renderLastLoginInfo();
      }
    }
  }, 200);
});

// ============================================
// 2. 백그라운드 코드 검증 함수 (라인 1571)
// ============================================

async function verifyAccessCodeInBackground(userCode){
  try {
    // 신청자목록 Sheet에서 발급된 코드 조회
    const sheetId = '16j-DWyzI7GgsbIfKeulYwUluhk1d5-6xguyJbnNvJAs';
    const gasUrl = 'https://script.google.com/macros/s/AKfycby_Ho65Es2yeoxkMf_RmbOMb4ORrDbM4t8mPFlyEgcGJ_IkgymsL7E1QK0sy8ZuNc0s/exec';
    
    const formData = new FormData();
    formData.append('action', 'verifyCode');
    formData.append('code', userCode);

    const response = await fetch(gasUrl, {
      method: 'POST',
      body: formData
    });

    const result = await response.text();
    console.log('코드 검증 결과:', result);

    // 결과 파싱
    if(result.includes('✅')){
      // 코드 유효함 - localStorage에 유효 시간 저장
      localStorage.setItem('fcrm_code_verified', JSON.stringify({
        code: userCode,
        verified_at: new Date().getTime(),
        valid: true
      }));
      console.log('✅ 액세스 코드 유효함');
    } else if(result.includes('❌')){
      // 코드 무효함 - 로그아웃 처리
      console.warn('❌ 액세스 코드 무효');
      localStorage.removeItem('fcrm_access_code');
      localStorage.removeItem('fcrm_code_verified');
      // 30초 후 자동 로그아웃
      setTimeout(()=>{
        alert('❌ 액세스 코드가 유효하지 않습니다.\n\n다시 로그인해주세요.');
        location.reload();
      }, 30000);
    }
  } catch(e) {
    console.error('코드 검증 중 오류:', e);
    // 오류 무시 (네트워크 문제 등)
  }
}

// ============================================
// 3. 저장된 코드 자동 확인 함수 (라인 5207) ⭐
// ============================================

function checkSavedAccessCode(){
  const savedCode = localStorage.getItem('fcrm_access_code');
  
  // 저장된 코드가 없으면 메인 화면 표시
  if(!savedCode){
    document.getElementById('loginScreen').style.display = 'block';
    showPanel('lp_main');
    return;
  }
  
  // 저장된 코드가 있으면 백그라운드에서 검증
  console.log('📝 저장된 코드 발견:', savedCode);
  console.log('🔍 검증 중...');
  
  verifyAccessCodeInBackground(savedCode).then(()=>{
    // 검증 성공 → Google 로그인 화면 바로 표시
    document.getElementById('loginScreen').style.display = 'block';
    document.getElementById('lp_main').style.display = 'none';
    document.getElementById('lp_code').style.display = 'block';
    document.getElementById('lp_code_input').style.display = 'none';
    document.getElementById('lp_code_input').parentElement.style.display = 'none';
    document.querySelector('[onclick="verifyCode()"]').style.display = 'none';
    document.getElementById('lp_google_wrap').style.display = 'block';
    console.log('✅ 검증 성공 - Google 로그인 버튼 표시');
  }).catch(e=>{
    // 검증 실패 → 코드 재입력 요청
    console.warn('❌ 저장된 코드가 유효하지 않음:', e);
    localStorage.removeItem('fcrm_access_code');
    document.getElementById('loginScreen').style.display = 'block';
    showPanel('lp_main');
  });
}

// ============================================
// 4. 코드 검증 함수 (verifyCode) 수정 (라인 1616)
// ============================================

function verifyCode(){
  const raw   = document.getElementById('lp_code_input').value.trim().toUpperCase();
  const errEl = document.getElementById('lp_code_err');
  // 형식 체크: FC-X-NNNN 또는 FC-XX-NNNN (영문 1-2글자, 숫자 4자리)
  if(!/^FC-[A-Z]{1,2}-\d{4}$/.test(raw)){
    errEl.textContent = '❌ 코드 형식이 올바르지 않습니다 (예: FC-H-3821 또는 FC-HG-3821)';
    errEl.style.display = 'block';
    return;
  }
  
  // 백그라운드에서 Sheet 검증
  verifyAccessCodeInBackground(raw).then(()=>{
    // 검증 성공하면 로그인 진행
    localStorage.setItem('fcrm_access_code', raw);  // ★ 코드 저장!
    errEl.style.display = 'none';

    // 구글 로그인 wrap 표시
    const wrap = document.getElementById('lp_google_wrap');
    wrap.style.display = 'block';
    document.getElementById('lp_code_input').style.borderColor = 'var(--green)';
    document.getElementById('lp_code_input').disabled = true;

    // 버튼 강제 활성화 — SDK 이미 로드됐을 수 있으므로 즉시 활성화
    const btn = document.getElementById('signInBtn');
    if(btn){
      btn.disabled = false;
      btn.style.opacity = '1';
      btn.style.cursor = 'pointer';
      const txt = btn.querySelector('#signInBtnTxt, .signInBtnTxt, span');
      if(txt) txt.textContent = 'Google 계정으로 로그인';
    }
  }).catch(e=>{
    errEl.textContent = '❌ 코드 검증 중 오류가 발생했습니다. 다시 시도해주세요.';
    errEl.style.display = 'block';
  });
}

// ============================================
// 5. fmtAccessCode 함수 개선 (라인 1650)
// ============================================

function fmtAccessCode(el){
  let v = el.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
  
  // FC-X-NNNN 또는 FC-XX-NNNN 형식
  if(v.startsWith('FC')){
    v = v.substring(2); // FC 제거
  }
  
  // 정확한 포맷팅
  if(v.length >= 1){
    // 영문자 부분 (1-2글자) 추출
    let alpha = '';
    let i = 0;
    for(i = 0; i < v.length && i < 2; i++){
      if(/[A-Z]/.test(v[i])){
        alpha += v[i];
      } else {
        break;
      }
    }
    
    // 숫자 부분 (최대 4자리)
    let nums = v.substring(i).replace(/[^0-9]/g, '').substring(0, 4);
    
    // 최종 형식: FC-{alpha}-{nums}
    if(alpha && nums.length === 4){
      el.value = 'FC-' + alpha + '-' + nums;
    } else if(alpha){
      el.value = 'FC-' + alpha + (nums ? '-' + nums : '');
    } else {
      el.value = 'FC-';
    }
  } else {
    el.value = 'FC-';
  }
}

// ============================================
// 실행 흐름 정리
// ============================================

/*
1. 페이지 로드 시 DOMContentLoaded 이벤트 발생
   ↓
2. checkSavedAccessCode() 즉시 실행
   ↓
3. localStorage에서 'fcrm_access_code' 조회
   ├─ 있으면: verifyAccessCodeInBackground()로 검증
   │         ├─ 성공: Google 로그인 버튼만 표시
   │         └─ 실패: 메인 화면으로 돌아가기
   └─ 없으면: 메인 화면 표시 (코드 입력 버튼)

4. 사용자가 코드 입력 & 확인
   ↓
5. verifyCode() 함수 실행
   ├─ 형식 검증
   ├─ Sheet에서 코드 확인 (verifyAccessCodeInBackground)
   ├─ 성공: localStorage에 저장 ★
   └─ Google 로그인 버튼 표시

6. 다음 방문 시 (같은 PC)
   ↓
7. checkSavedAccessCode()가 자동으로 실행
   ├─ localStorage에서 코드 읽기
   ├─ 검증
   └─ Google 로그인 버튼 바로 표시!
*/
