function closeDetail(){
  document.getElementById('detailPg').style.display = 'none';
  document.getElementById('app').style.display = 'flex';
  window.scrollTo(0,0);
}

// ══════════════════════════════════════
// FILE UPLOAD
// ══════════════════════════════════════
function openFileUpload(clientName){
  currentUploadClient = clientName;
  pendingFiles = [];
  document.getElementById('fileClientName').textContent = '👤 ' + clientName;
  document.getElementById('pendingFiles').innerHTML = '';
  const btn = document.getElementById('uploadBtn');
  btn.style.display = 'none';
  btn.disabled = false;
  document.getElementById('uploadProgFill').style.width = '0%';
  document.getElementById('uploadStatus').textContent = '';
  document.getElementById('uploadProg').classList.remove('on');
  document.getElementById('fileInput').value = '';
  document.getElementById('fileModal').classList.add('on');
}
function handleDrop(e){e.preventDefault();document.getElementById('fileDrop').classList.remove('drag');handleFiles(e.dataTransfer.files);}
function handleFiles(files){
  for(const f of files){if(f.size>10*1024*1024){toast('❌ '+f.name+' — 10MB 초과');continue;}pendingFiles.push(f);}
  renderPendingFiles();
}
function renderPendingFiles(){
  const el=document.getElementById('pendingFiles');
  if(!pendingFiles.length){el.innerHTML='';document.getElementById('uploadBtn').style.display='none';return;}
  el.innerHTML=pendingFiles.map((f,i)=>`
    <div class="file-item">
      <span class="file-icon">${fileIcon(f.name)}</span>
      <span class="file-name">${f.name}</span>
      <span class="file-size">${(f.size/1024).toFixed(0)}KB</span>
      <button onclick="removePending(${i})" style="border:none;background:none;cursor:pointer;color:var(--text3);font-size:16px">✕</button>
    </div>`).join('');
  document.getElementById('uploadBtn').style.display = 'inline-flex';
}
function removePending(i){ pendingFiles.splice(i,1); renderPendingFiles(); }
async function uploadFiles(){
  if(!pendingFiles.length) return;
  if(isDemo){ toast('데모 모드에서는 실제 업로드가 안 됩니다'); return; }
  const fileType = document.getElementById('fileType').value;
  const progWrap = document.getElementById('uploadProg');
  const progFill = document.getElementById('uploadProgFill');
  const status   = document.getElementById('uploadStatus');
  const btn      = document.getElementById('uploadBtn');
  progWrap.classList.add('on');
  btn.disabled = true;
  let done = 0;
  for(const f of pendingFiles){
    status.textContent = `업로드 중: ${f.name} (${done+1}/${pendingFiles.length})`;
    try{
      await driveUpload(f, currentUploadClient, fileType);
      done++;
      progFill.style.width = Math.round(done/pendingFiles.length*100)+'%';
    }catch(e){
      status.textContent = '❌ 실패: '+e.message;
      btn.disabled = false;
      return;
    }
  }
  status.textContent = `✅ ${done}개 파일 업로드 완료!`;
  btn.style.display = 'none';
  btn.disabled = false;
  pendingFiles = [];
  document.getElementById('pendingFiles').innerHTML = '';
  document.getElementById('fileInput').value = '';
  toast('✅ '+done+'개 파일이 Google Drive에 업로드되었습니다!');
  const c = clients.find(x=>x.name===currentUploadClient);
  if(c) setTimeout(()=>loadClientDocs(currentUploadClient, c.rowIdx), 1000);
}

// ══════════════════════════════════════
// ★★★ saveClient — 핵심 수정 ★★★
// ══════════════════════════════════════
function togglePlanFields(){
  const plan = document.getElementById('f_plan').value;
  document.getElementById('planExtraFields').style.display = 'block';
  const pdpWrap = document.getElementById('pdpProdWrap');
  if(pdpWrap) pdpWrap.style.display = (plan.toUpperCase()==='MEDIGAP') ? 'block' : 'none';
  updateProdSuggestions();
}
function clearPlanFields(){
  ['f_mbi','f_medical_no','f_pcp','f_pcp_phone','f_network','f_group_no','f_meds','f_conditions']
    .forEach(id=>{const el=document.getElementById(id);if(el)el.value='';});
  document.getElementById('planExtraFields').style.display='none';
}
function openAddClient(){
  currentEditingRowIdx=null;
  resetMbiDuplicateWarning();
  set('mTitle','👤 신규 고객 등록');
  document.getElementById('eRow').value='';document.getElementById('eNo').value='';
  document.getElementById('eActive').value='TRUE';
  document.getElementById('f_prod_name').value='';
  ['fname','mname','lname','address1','city','state','zip','phone','phone2','email','memo'].forEach(f=>{const el=document.getElementById('f_'+f);if(el)el.value='';})
  document.getElementById('f_dob').value='';
  document.getElementById('f_next').value='';
  document.getElementById('f_prod').value='';
  const pdpEl = document.getElementById('f_pdp_prod');
  if(pdpEl) pdpEl.value = '';
  const pdpWrap = document.getElementById('pdpProdWrap');
  if(pdpWrap) pdpWrap.style.display = 'none';
  document.getElementById('f_plan').value='';
  document.getElementById('f_ref').value='FALSE';
  document.getElementById('f_ref_chk').checked=false;
  document.getElementById('f_agent_wrap').style.display='none';
  document.getElementById('f_agent_badge') && (document.getElementById('f_ref_badge').style.display='none');
  const agEl=document.getElementById('f_agent'); if(agEl) agEl.value='';
  clearPlanFields();
  updateProdSuggestions();
  document.getElementById('clientModal').classList.add('on');
}
function openEditClient(rowIdx){
  const c=clients.find(x=>x.rowIdx===rowIdx);if(!c)return;
  currentEditingRowIdx=rowIdx;
  resetMbiDuplicateWarning();
  set('mTitle','✏️ 고객 정보 수정');
  document.getElementById('eRow').value=rowIdx;
  document.getElementById('eNo').value=c.no;
  document.getElementById('eActive').value=c.active||'TRUE';
  document.getElementById('f_prod_name').value=c.prodName||'';
  document.getElementById('f_fname').value=c.fname;
  document.getElementById('f_mname').value=c.mname;
  document.getElementById('f_lname').value=c.lname;
  document.getElementById('f_address1').value=c.address1;
  document.getElementById('f_city').value=c.city;
  document.getElementById('f_zip').value=c.zip;
  document.getElementById('f_phone').value=c.phone;
  document.getElementById('f_phone2').value=c.phone2||'';
  document.getElementById('f_email').value=c.email;
  document.getElementById('f_state').value=c.state||'';
  // dob → DD/MM/YYYY 변환해서 표시
  const parsedDob = parseDob(c.dob);
  document.getElementById('f_dob').value = parsedDob
    ? String(parsedDob.d).padStart(2,'0')+'/'+String(parsedDob.m).padStart(2,'0')+'/'+parsedDob.y
    : (c.dob||'');
  document.getElementById('f_next').value=c.next||'';
  document.getElementById('f_plan').value=c.plan;
  togglePlanFields();
  setProdValue(c.prod||'');
  updateProdSuggestions();
  document.getElementById('f_memo').value=c.memo;
  const isRef = c.ref==='TRUE';
  document.getElementById('f_ref').value=c.ref;
  document.getElementById('f_ref_chk').checked=isRef;
  document.getElementById('f_agent_wrap').style.display=isRef?'block':'none';
  document.getElementById('f_ref_badge').style.display=isRef?'inline-flex':'none';
  const agEl=document.getElementById('f_agent'); if(agEl) agEl.value=c.agent||'';
  if(['MAPD','PDP'].includes(c.plan)){
    document.getElementById('planExtraFields').style.display='block';
    const pi=allPlanInfo.find(p=>p.name.trim()===c.name.trim())||{};
    document.getElementById('f_mbi').value=pi.mbi||'';
    document.getElementById('f_medical_no').value=pi.medical_no||'';
    document.getElementById('f_pcp').value=pi.pcp||'';
    document.getElementById('f_pcp_phone').value=pi.pcp_phone||'';
    document.getElementById('f_network').value=pi.network||'';
    document.getElementById('f_group_no').value=pi.group_no||'';
    const medsEl=document.getElementById('f_meds');
    medsEl.value=pi.meds||'';
    medsEl.dataset.parsed=pi.meds||'';
    if(pi.meds) parseMeds(medsEl);
    document.getElementById('f_conditions').value=pi.conditions||'';
  }
  document.getElementById('clientModal').classList.add('on');
}

async function getNextClientNo(){
  try{
    const res = await sheetsReq('GET', `${MAIN_ID}/values/A:A`);
    const rows = res.values || [];
    const maxNo = rows.slice(1).reduce((max, r) => {
      const n = parseInt(r[0]);
      return isNaN(n) ? max : Math.max(max, n);
    }, 0);
    return (maxNo + 1).toString();
  }catch(e){
    // 폴백: API 실패 시 기존 방식(화면에 로드된 목록 기준)으로 대체
    return (Math.max(0, ...clients.map(c=>parseInt(c.no)||0))+1).toString();
  }
}

let mainSheetIdCache=null;

async function getMainSheetId(){
  if(mainSheetIdCache!==null) return mainSheetIdCache;
  const meta=await sheetsReq('GET',`${MAIN_ID}?fields=sheets.properties(sheetId)`);
  const sheetId=meta.sheets?.[0]?.properties?.sheetId;
  if(sheetId===undefined) throw new Error('메인 시트 탭 ID를 확인할 수 없습니다');
  mainSheetIdCache=sheetId;
  return sheetId;
}

function getAppendedRowIdx(result){
  const updatedRange=result?.updates?.updatedRange||'';
  const match=updatedRange.match(/![A-Z]+(\d+)(?::[A-Z]+\d+)?$/i);
  if(!match) throw new Error('추가된 고객 행 번호를 확인할 수 없습니다');
  return Number(match[1]);
}

async function applyDobDateFormat(rowIdx){
  const sheetId=await getMainSheetId();
  await sheetsReq('POST',`${MAIN_ID}:batchUpdate`,{
    requests:[{
      repeatCell:{
        range:{
          sheetId,
          startRowIndex:Number(rowIdx)-1,
          endRowIndex:Number(rowIdx),
          startColumnIndex:9,
          endColumnIndex:10,
        },
        cell:{userEnteredFormat:{numberFormat:{type:'DATE',pattern:'MM/dd/yyyy'}}},
        fields:'userEnteredFormat.numberFormat',
      }
    }]
  });
}

async function saveClient(){
  if(window.__savingClient) return;
  window.__savingClient = true;
  const saveBtn = document.querySelector('.btn.pri[onclick="saveClient()"]');
  if(saveBtn){ saveBtn.disabled = true; saveBtn.style.opacity = '0.6'; }
  try{
  const fname=document.getElementById('f_fname').value.trim();
  const lname=document.getElementById('f_lname').value.trim();
  if(!fname||!lname){alert('First Name과 Last Name은 필수입니다');return;}

  // 🔧 오류 수정: 클라이언트 이름에서 특수문자 정규화
  // PAK ANNE... 처럼 마침표 등이 포함되면 저장 실패하는 문제 해결
  const fnameClean = fname.replace(/[.\s]+$/, '').trim();  // 끝의 점이나 공백 제거
  const lnameClean = lname.replace(/[.\s]+$/, '').trim();
  const mnameClean = document.getElementById('f_mname').value.trim().replace(/[.\s]+$/, '').trim();
  
  const rowIdx=document.getElementById('eRow').value;
  const plan=document.getElementById('f_plan').value;
  const mname=mnameClean;
  // 이름 조합: 성 이름 미들
  const name=[lnameClean,fnameClean,mname].filter(Boolean).join(' ');

  // No(A열) 자동 부여 — 수정 시 기존 번호 유지, 신규 시 최대값+1
  const existingNo=document.getElementById('eNo').value.trim();
  let autoNo;
  if(existingNo){
    autoNo = existingNo;
  } else if(isDemo){
    autoNo = (Math.max(0,...clients.map(c=>parseInt(c.no)||0))+1).toString();
  } else {
    autoNo = await getNextClientNo();
  }

  // A~O 컬럼 순서: no, fname, mname, lname, email, address1, city, zip, phone, plan, prod, memo, ref, (N=에이전트 빈칸), (O=durl 빈칸)
  // A=No  B=First  C=Middle  D=Last   E=Email   F=Address  G=City  H=Zip
  // I=State  J=DOB  K=NextContact  L=Phone1  M=Phone2
  // N=Plan  O=Product  P=Memo  Q=Ref  R=에이전트이름  S=상세URL  T=활성상태  U=상품명
  const vals=[[
    autoNo,
    fnameClean, mname, lnameClean,
    document.getElementById('f_email').value.trim(),                // E
    document.getElementById('f_address1').value.trim(),             // F
    document.getElementById('f_city').value.trim(),                 // G
    document.getElementById('f_zip').value.trim(),                  // H
    document.getElementById('f_state').value.trim().toUpperCase(),  // I
    document.getElementById('f_dob').value.trim(),                  // J
    document.getElementById('f_next').value.trim(),                 // K
    document.getElementById('f_phone').value.trim(),                // L Phone1
    document.getElementById('f_phone2').value.trim(),               // M Phone2
    plan,                                                           // N
    getProdValue(),                                                 // O
    document.getElementById('f_memo').value.trim(),                 // P
    document.getElementById('f_ref').value,                         // Q TRUE/FALSE
    document.getElementById('f_agent').value.trim(),                // R 에이전트이름
    '',                                                             // S 상세URL
    document.getElementById('eActive')?.value || 'TRUE',             // T 활성상태
    document.getElementById('f_prod_name').value.trim(),              // U 상품명
  ]];

  // MAPD/PDP 추가정보 수집
  let piVals=null;
  if(['MAPD','PDP'].includes(plan)){
    piVals=[[
      name,
      document.getElementById('f_mbi').value.trim(),
      document.getElementById('f_medical_no').value.trim(),
      document.getElementById('f_pcp').value.trim(),
      document.getElementById('f_pcp_phone').value.trim(),
      document.getElementById('f_network').value.trim(),
      document.getElementById('f_group_no').value.trim(),
      getCleanMeds(),
      document.getElementById('f_conditions').value.trim(),
    ]];
  }

  showLoad('저장 중...');
  try{
    let dobFormatError=null;
    if(isDemo){
      // 데모 모드: 메모리에만 저장
      const obj={
        rowIdx:rowIdx?+rowIdx:clients.length+2,
        no:autoNo, fname:fnameClean, mname:mname, lname:lnameClean, name,
        email:vals[0][4], address1:vals[0][5], city:vals[0][6], zip:vals[0][7],
        state:vals[0][8], dob:vals[0][9], next:vals[0][10],
        phone:vals[0][11], phone2:vals[0][12],
        plan:vals[0][13], prod:vals[0][14],
        memo:vals[0][15], ref:vals[0][16],
        agent:vals[0][17]||'',
        durl:'', active:vals[0][19]||'TRUE', prodName:vals[0][20]||'', biz:''
      };
      if(rowIdx){const i=clients.findIndex(c=>c.rowIdx===+rowIdx);if(i>=0)clients[i]=obj;}
      else clients.push(obj);
      if(piVals){
        const pi={name,mbi:piVals[0][1],medical_no:piVals[0][2],pcp:piVals[0][3],
          pcp_phone:piVals[0][4],network:piVals[0][5],group_no:piVals[0][6],
          meds:piVals[0][7],conditions:piVals[0][8]};
        const idx=allPlanInfo.findIndex(p=>p.name.trim()===name.trim());
        if(idx>=0) allPlanInfo[idx]=pi; else allPlanInfo.push(pi);
      }
    } else {
      // ── 1. 메인 시트 저장 ──
      let savedRowIdx;
      if(rowIdx){
        // 수정: 해당 행 덮어쓰기
        await sheetsReq('PUT',
          `${MAIN_ID}/values/A${rowIdx}:U${rowIdx}?valueInputOption=USER_ENTERED`,
          {values:vals});
        savedRowIdx=Number(rowIdx);
      } else {
        // 신규: 맨 아래 추가 (%3A = 콜론 URL 인코딩)
        const appendResult=await sheetsReq('POST',
          `${MAIN_ID}/values/A%3AU:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`,
          {values:vals});
        savedRowIdx=getAppendedRowIdx(appendResult);
      }

      try{
        await applyDobDateFormat(savedRowIdx);
      }catch(formatErr){
        dobFormatError=formatErr;
        console.warn('DOB 날짜 서식 적용 오류:',formatErr.message);
      }

      // ── 2. PlanInfo 시트 저장 (MAPD/PDP만) ──
      if(piVals){
        try{
          // PlanInfo 탭 존재 여부 확인 → 없으면 자동 생성
          let planInfoExists = true;
          try{
            await sheetsReq('GET',`${DETAIL_ID}/values/PlanInfo!A1`);
          }catch(e){
            planInfoExists = false;
          }
          if(!planInfoExists){
            // 탭 생성
            await sheetsReq('POST',`${DETAIL_ID}:batchUpdate`,{
              requests:[{addSheet:{properties:{title:'PlanInfo'}}}]
            });
            // 헤더 입력
            await sheetsReq('PUT',
              `${DETAIL_ID}/values/PlanInfo!A1:I1?valueInputOption=USER_ENTERED`,
              {values:[['name','mbi','medical_no','pcp','pcp_phone','network','group_no','meds','conditions']]});
          }

          // 기존 행 검색 — A열 전체 읽기
          const existingRows=await sheetsReq('GET',`${DETAIL_ID}/values/PlanInfo!A:A`);
          const rows=(existingRows.values||[]);
          // 헤더(0번) 제외, 이름 일치 행 찾기
          const matchIdx=rows.findIndex((r,i)=>i>0 && String(r[0]||'').trim()===name.trim());

          if(matchIdx>0){
            // 기존 행 업데이트
            const sheetRow=matchIdx+1;
            await sheetsReq('PUT',
              `${DETAIL_ID}/values/PlanInfo!A${sheetRow}:I${sheetRow}?valueInputOption=USER_ENTERED`,
              {values:piVals});
          } else {
            // 신규 행 추가
            await sheetsReq('POST',
              `${DETAIL_ID}/values/PlanInfo!A%3AI:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`,
              {values:piVals});
          }

          // 로컬 allPlanInfo 즉시 반영
          const localIdx=allPlanInfo.findIndex(p=>p.name.trim()===name.trim());
          const piObj={name,mbi:piVals[0][1],medical_no:piVals[0][2],pcp:piVals[0][3],
            pcp_phone:piVals[0][4],network:piVals[0][5],group_no:piVals[0][6],
            meds:piVals[0][7],conditions:piVals[0][8]};
          if(localIdx>=0) allPlanInfo[localIdx]=piObj; else allPlanInfo.push(piObj);
          toast('✅ PlanInfo 저장 완료!');

        } catch(piErr){
          console.warn('PlanInfo 저장 오류:', piErr.message);
          toast('⚠️ 기본정보는 저장됨. PlanInfo 오류: '+piErr.message, 5000);
        }
      }

      // ── 3. 전체 리로드 ──
      await loadAll();
    }

    closeOv('clientModal');
    renderAll();
    if(dobFormatError){
      toast('⚠️ 고객 정보는 저장됐지만 DOB 날짜 서식 적용 실패: '+dobFormatError.message,5000);
    }else{
      toast(rowIdx?'✅ 수정되었습니다':'✅ Google Sheets에 저장됨!');
    }

    // 수정 후 저장 시 → 해당 고객 상세 페이지 자동 갱신
    if(rowIdx){
      const updated = clients.find(c=>c.rowIdx===+rowIdx);
      if(updated) openDetail(updated.rowIdx);
    }

  } catch(e){
    toast('❌ 저장 실패: '+e.message, 5000);
    console.error('saveClient error:', e);
  } finally {
    hideLoad();
  }
  } finally {
    window.__savingClient = false;
    if(saveBtn){ saveBtn.disabled = false; saveBtn.style.opacity = '1'; }
  }
}

async function delClient(rowIdx,name){
  if(!confirm(`"${name}" 고객을 삭제할까요?`))return;
  if(isDemo){clients=clients.filter(c=>c.rowIdx!==rowIdx);renderAll();toast('삭제됨');return;}
  showLoad('삭제 중...');
  try{
    await sheetsReq('POST',`${MAIN_ID}:batchUpdate`,{requests:[{deleteDimension:{range:{sheetId:0,dimension:'ROWS',startIndex:rowIdx-1,endIndex:rowIdx}}}]});
    await loadAll();toast('🗑 삭제되었습니다');
  }catch(e){toast('❌ '+e.message,4000);}
  finally{hideLoad();}
}

// ══════════════════════════════════════
// MEMO
// ══════════════════════════════════════
function openAddMemoFor(name){
  document.getElementById('m_client').value=name;
  document.getElementById('m_client_label').textContent='👤 '+name;
  document.getElementById('m_text').value='';
  document.getElementById('m_type').value='전화 상담';
  document.getElementById('m_date').value=new Date().toISOString().slice(0,10);
  document.getElementById('memoModal').classList.add('on');
}
async function saveMemo(){
  const name=document.getElementById('m_client').value;
  const text=document.getElementById('m_text').value.trim();
  if(!name){alert('고객 정보 오류');return;}
  if(!text){alert('내용을 입력해주세요');return;}
  const type=document.getElementById('m_type').value;
  const date=document.getElementById('m_date').value||new Date().toISOString().slice(0,10);
  const now=new Date();
  const ts=`${String(now.getMonth()+1).padStart(2,'0')}/${String(now.getDate()).padStart(2,'0')}/${now.getFullYear()} ${now.toLocaleTimeString('en-US',{hour:'2-digit',minute:'2-digit'})}`;
  showLoad('메모 저장 중...');
  try{
    if(!isDemo) await sheetsReq('POST',`${DETAIL_ID}/values/${encodeURIComponent('상담 이력!A:F')}:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`,{values:[[Date.now(),name,type,text,date,ts]]});
    allMemos.unshift({name,type,text,date,ts});
    const ci=clients.findIndex(c=>c.name===name);
    if(ci>=0){
      clients[ci].next=date;
      if(!isDemo){
        const rIdx=clients[ci].rowIdx;
        await sheetsReq('PUT',`${MAIN_ID}/values/K${rIdx}?valueInputOption=USER_ENTERED`,{values:[[date]]});
      }
    }
    closeOv('memoModal');
    renderAll();
    if(document.getElementById('detailPg').style.display === 'block'){
      const c=clients.find(x=>x.name===name);
      if(c) openDetail(c.rowIdx);
    }
    toast('✅ 메모 저장 완료!');
  }catch(e){toast('❌ '+e.message,4000);}
  finally{hideLoad();}
}

// ══════════════════════════════════════
// BIRTHDAY
// ══════════════════════════════════════
function parseDob(raw) {
  if (!raw) return null;
  const s = String(raw).trim();
  if (!s) return null;
  
  // DD/MM/YYYY (새 입력 형식 — 최우선, 엄격한 검증)
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(s)) {
    const [dd, mm, yyyy] = s.split('/').map(Number);
    // 첫 번째가 31을 초과하거나 두 번째가 12를 초과하면 명확한 DD/MM
    // 그 외에는 엄격하게 DD/MM으로 해석 (일반적인 입력 순서)
    if (dd>=1&&dd<=31&&mm>=1&&mm<=12) return {m:mm, d:dd, y:yyyy};
    // 오류 데이터면 스왑 시도
    if (mm>=1&&mm<=31&&dd>=1&&dd<=12) return {m:dd, d:mm, y:yyyy};
  }
  
  // MM/DD/YYYY (구 형식 호환 — 더 이상 사용 금지하지만 호환성 유지)
  if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(s)) {
    const parts = s.split('/').map(Number);
    const [a, b, yyyy] = parts;
    if (a > 12) return {m:b, d:a, y:yyyy}; // DD/MM
    if (b > 12) return {m:a, d:b, y:yyyy}; // MM/DD (역함수)
    // 둘 다 12 이하면 DD/MM으로 해석 (새 기본값)
    return {m:b, d:a, y:yyyy}; 
  }
  
  // YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) {
    const [yyyy, mm, dd] = s.split('-').map(Number);
    if (mm>=1&&mm<=12&&dd>=1&&dd<=31) return {m:mm, d:dd, y:yyyy};
  }
  
  // 2자리 연도 처리
  if (/^\d{1,2}\/\d{1,2}\/\d{2}$/.test(s)) {
    const [a, b, yy] = s.split('/').map(Number);
    const yyyy = yy > 30 ? 1900+yy : 2000+yy;
    if (a > 12) return {m:b, d:a, y:yyyy};
    if (b > 12) return {m:a, d:b, y:yyyy};
    return {m:b, d:a, y:yyyy}; // 기본값 DD/MM
  }
  
  // 엑셀 시리얼
  if (/^\d+$/.test(s)) {
    const serial = parseInt(s);
    if (serial > 1000 && serial < 80000) {
      const base = new Date(1899, 11, 30);
      const date = new Date(base.getTime() + serial * 86400000);
      return {m:date.getMonth()+1, d:date.getDate(), y:date.getFullYear()};
    }
  }
  return null;
}
function getBirthdays() {
  return clients.map(c => {
    const parsed = parseDob(c.dob);
    if (!parsed) return null;
    const {m, d, y} = parsed;
    const today = new Date(); today.setHours(0,0,0,0);
    const thisYear = today.getFullYear();
    let bday = new Date(thisYear, m-1, d); bday.setHours(0,0,0,0);
    if (bday < today) bday = new Date(thisYear+1, m-1, d);
    const daysLeft = Math.ceil((bday - today) / 864e5);
    const age = thisYear - y - (bday.getFullYear()===thisYear && bday>today ? 1 : 0);
    return {...c, bdMonth:m, bdDay:d, daysLeft, age};
  }).filter(Boolean).sort((a,b) => a.daysLeft - b.daysLeft);
}
function renderBirthday() {
  const filter = document.getElementById('bdFilter')?.value || '30';
  const all = getBirthdays();
  set('bdToday', all.filter(c=>c.daysLeft===0).length);
  set('bdWeek',  all.filter(c=>c.daysLeft<=7).length);
  set('bdMonth', all.filter(c=>c.daysLeft<=30).length);
  set('zapBdayCnt', all.filter(c=>c.daysLeft<=7).length);
  let data = filter==='all' ? all : all.filter(c=>c.daysLeft<=(+filter||30));
  const el = document.getElementById('bdList');
  if (!clients.some(c=>c.dob)) {
    el.innerHTML = `<div class="dc" style="text-align:center;padding:24px;box-shadow:var(--sh)">
      <p style="font-size:14px;font-weight:600;margin-bottom:8px">생일 정보가 없습니다</p>
      <p style="font-size:13px;color:var(--text2);line-height:1.7">고객 수정(✏️)에서 생일을 입력해주세요</p>
    </div>`;
    return;
  }
  if (!data.length) { el.innerHTML=`<div style="text-align:center;padding:30px;color:var(--text3)">해당 기간 생일 없음</div>`; return; }
  el.innerHTML = data.map(c => {
    const isToday = c.daysLeft === 0;
    const isSoon  = c.daysLeft <= 7;
    const color   = isToday ? 'var(--red)' : isSoon ? 'var(--amber)' : 'var(--green)';
    const ddText  = isToday ? '🎂 오늘!' : `D-${c.daysLeft}`;
    return `<div class="bday-item" style="${isToday?'border-color:var(--red);background:#fff5f5':''}">
      <div class="bday-cake">${isToday?'🎂':'🎈'}</div>
      <div class="bday-meta">
        <div class="bday-name">${c.name}
          ${c.ref==='TRUE'?'<span class="badge bpu" style="font-size:10px;margin-left:4px">리퍼</span>':''}
          ${c.plan?`<span class="badge ${pb(c.plan)}" style="font-size:10px;margin-left:4px">${c.plan}</span>`:''}
        </div>
        <div class="bday-info">📞 ${c.phone||'—'} &nbsp;·&nbsp; 생일: ${c.bdMonth}월 ${c.bdDay}일${c.age?' &nbsp;·&nbsp; 만 '+c.age+'세':''}</div>
      </div>
      <div class="bday-acts">
        ${c.phone?`<a href="tel:${c.phone}" class="btn sm grn">📞</a>`:''}
        <button class="btn sm pri" onclick="openSingleSms('${esc(c.name)}','${c.phone}','birthday')">💬 문자</button>
      </div>
      <div class="bday-dd" style="color:${color}">${ddText}</div>
    </div>`;
  }).join('');
}

// ══════════════════════════════════════
// SMS
// ══════════════════════════════════════
