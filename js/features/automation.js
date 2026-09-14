let zapBaseUrl = localStorage.getItem('zap_url')||'';
function initAutomation(){
  if(zapBaseUrl){ document.getElementById('zapUrl').value=zapBaseUrl; updateZapUrls(zapBaseUrl); }
  updateZapCounts();
}
function saveZapUrl(){
  if(isDemo){ toast('🚫 데모 모드에서는 저장되지 않습니다'); return; }
  zapBaseUrl=document.getElementById('zapUrl').value.trim();
  localStorage.setItem('zap_url',zapBaseUrl);
  updateZapUrls(zapBaseUrl);
  document.getElementById('zapSaved').style.display='block';
  setTimeout(()=>document.getElementById('zapSaved').style.display='none',2000);
}
function updateZapUrls(base){
  const suffs={bday:'?event=birthday',contact:'?event=contact_reminder',new:'?event=new_client',expire:'?event=plan_expire'};
  Object.entries(suffs).forEach(([k,s])=>{const el=document.getElementById('wh_'+k);if(el) el.textContent=base+s;});
}
function updateZapCounts(){
  set('zapContactCnt',clients.filter(c=>{const d=elapsed(c.next);return d!==null&&d>=30;}).length);
  set('zapBdayCnt',getBirthdays().filter(c=>c.daysLeft<=7).length);
}
async function triggerZap(type, label){
  const el=document.getElementById('zapTestResult');
  if(isDemo){
    el.textContent='✅ [데모] '+label+' 시뮬레이션 완료! (실제 전송 안 됨)';
    toast('데모 모드에서는 실제 Zapier 전송이 비활성화됩니다');
    return;
  }
  if(!zapBaseUrl){toast('웹훅 URL을 먼저 등록해주세요');return;}
  const suffs={bday:'?event=birthday',contact:'?event=contact_reminder',new:'?event=new_client'};
  const url=zapBaseUrl+(suffs[type]||'');
  el.textContent='발송 중...';
  try{
    await fetch(url,{method:'POST',mode:'no-cors',headers:{'Content-Type':'application/json'},
      body:JSON.stringify({event:type,test:true,timestamp:new Date().toISOString(),clients:clients.slice(0,2).map(c=>({name:c.name,phone:c.phone,plan:c.plan}))})
    });
    el.textContent='✅ '+label+' 전송 완료! Zapier에서 확인하세요.';
  }catch(e){el.textContent='❌ '+e.message;}
}
function copyWh(id){
  const txt=document.getElementById(id)?.textContent||'';
  navigator.clipboard.writeText(txt).then(()=>toast('📋 복사됨')).catch(()=>{});
}

// ══════════════════════════════════════
// TAB / UI
// ══════════════════════════════════════
