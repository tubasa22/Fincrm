function openSingleSms(name, phone, type='general'){
  if(!phone) return;
  window.location.href = 'sms:' + phone.replace(/[^0-9+]/g,'');
}

// ══════════════════════════════════════
// 마지막 연락일 리셋 (전화/문자 후)
// ══════════════════════════════════════
async function updateLastContact(rowIdx, skipConfirm){
  const c = clients.find(x=>x.rowIdx===rowIdx);
  if(!c) return;
  if(!skipConfirm){
    if(!confirm(`"${c.name}" 고객의 마지막 연락일을 오늘(${new Date().toLocaleDateString('ko-KR')})로 업데이트할까요?`)) return;
  }
  const today = new Date().toISOString().slice(0,10);
  c.next = today;
  // 숨김 목록에서도 제거 (연락했으니 다시 관리 대상)
  fuDismissed = fuDismissed.filter(id=>id!==rowIdx);
  localStorage.setItem('fcrm_fu_dismissed', JSON.stringify(fuDismissed));
  if(!isDemo){
    try{
      await sheetsReq('PUT',`${MAIN_ID}/values/K${rowIdx}?valueInputOption=USER_ENTERED`,{values:[[today]]});
    }catch(e){ toast('⚠️ 시트 저장 실패: '+e.message, 4000); }
  }
  renderAll();
  if(document.getElementById('detailPg').style.display==='block') openDetail(rowIdx);
  toast(`✅ ${c.name} 마지막 연락일 → 오늘로 업데이트`);
}

// 전화 클릭 시 연락일 리셋 확인
function callAndReset(phone, rowIdx){
  window.location.href = 'tel:'+phone;
  // 전화 앱 열린 직후 연락일 업데이트 제안
  setTimeout(()=> updateLastContact(rowIdx, false), 1000);
}

// 문자 탭 열고 수신자 세팅 + 연락일 리셋 확인
function smsAndReset(name, phone, rowIdx, type){
  openSingleSms(name, phone, type);
  setTimeout(()=> updateLastContact(rowIdx, false), 500);
}
