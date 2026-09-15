function getLoginLog(){ return JSON.parse(localStorage.getItem('fcrm_login_log')||'[]'); }
function addLoginLog(type, userName){
  const log = getLoginLog();
  log.unshift({type, user: userName||'알 수 없음', time: new Date().toLocaleString('ko-KR')});
  localStorage.setItem('fcrm_login_log', JSON.stringify(log.slice(0,20)));
}

// ══════════════════════════════════════
// 로그인 화면 패널 전환
// ══════════════════════════════════════
function showPanel(id){
  ['lp_main'].forEach(p=>{
    const el = document.getElementById(p);
    if(el) el.style.display = p===id ? 'block' : 'none';
  });
}

function signInClick(){
  const btn = document.getElementById('signInBtn');
  const spinner = document.getElementById('loginSpinner');
  if(btn){ btn.disabled = true; btn.style.opacity = '0.7'; }
  const txtEl = document.getElementById('signInBtnTxt') || btn?.querySelector('span');
  if(txtEl) txtEl.textContent = '로그인 중...';
  if(spinner) spinner.style.display = 'block';
  if(tokenClient) tokenClient.requestAccessToken({prompt:''});
}
function signIn(){ signInClick(); }

// ★ Medicare/Health 제품 관리
function switchProduct(product) {
  localStorage.setItem('fcrm_current_product', product);
  // Medicare/Health만 유지
  localStorage.setItem('fcrm_current_product', 'health');
}

// ★ 페이지 로드 시 Medicare/Health 설정
window.addEventListener('load', () => {
  localStorage.setItem('fcrm_current_product', 'health');
});
function showApplications(){
  const applications = JSON.parse(localStorage.getItem('fcrm_applications') || '[]');
  console.clear();
  console.log('=== FinCRM 신청 목록 (총 ' + applications.length + '건) ===\n');
  
  if(applications.length === 0){
    console.log('아직 신청이 없습니다.');
    return;
  }
  
  applications.forEach((app, idx) => {
    console.log(`${idx+1}. ${app.이름}`);
    console.log(`   이메일: ${app.이메일}`);
    console.log(`   신청일시: ${app.신청일시}`);
    console.log('');
  });
  
  console.log('\n📋 다음 URL에서 Google Sheets에 입력하세요:');
  console.log('https://docs.google.com/spreadsheets/d/16j-DWyzI7GgsbIfKeulYwUluhk1d5-6xguyJbnNvJAs/edit#gid=0');
  console.log('');
  console.log('탭: "신청자목록"');
  console.log('컬럼: A=신청일시, B=이름, C=이메일, D=에이전시명, E=연락처, F=지역, G=코드, H=상태');
}

// 신청 데이터를 CSV 형식으로 복사 (Sheets 붙여넣기 용)
function copyAsCSV(){
  const applications = JSON.parse(localStorage.getItem('fcrm_applications') || '[]');
  let csv = '신청일시\t이름\t이메일\t에이전시명\t연락처\t지역\t코드\t상태\n';
  
  applications.forEach(app => {
    csv += `${app.신청일시}\t${app.이름}\t${app.이메일}\t\t\t\t\t대기\n`;
  });
  
  navigator.clipboard.writeText(csv).then(() => {
    console.log('✅ CSV 형식으로 복사되었습니다!');
    console.log('Google Sheets에서 Ctrl+V로 붙여넣기하세요');
  });
}

function signOut(){
  const userName = document.getElementById('udName')?.textContent || '';
  addLoginLog('logout', userName);
  if(accessToken && !isDemo) google.accounts.oauth2.revoke(accessToken,()=>{});
  accessToken='';
  localStorage.removeItem('fcrm_token');
  localStorage.removeItem('fcrm_exp');
  document.getElementById('app').classList.remove('on');
  document.getElementById('loginScreen').style.display='flex';
  document.getElementById('userWrap').style.display='none';
  clients=[]; allMemos=[]; isDemo=false; isOffline=false;
  renderLastLoginInfo();
  // 로그인 버튼 복구
  const btn = document.getElementById('signInBtn');
  if(btn){ btn.disabled=false; btn.style.opacity='1'; }
  document.getElementById('loginSpinner').style.display='none';
  document.getElementById('signInBtnTxt').textContent='Google 계정으로 로그인';
}
