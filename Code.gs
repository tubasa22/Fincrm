// FinCRM - Google Apps Script 백엔드
// 이 파일을 Google Apps Script에 붙여넣고 배포하세요

const SHEET_NAME_CLIENT = '고객';
const SHEET_NAME_MEMO   = '메모';

function doGet(e)  { return route(e); }
function doPost(e) { return route(e); }

function route(e) {
  try {
    const p    = e.parameter || {};
    const body = e.postData  ? JSON.parse(e.postData.contents || '{}') : {};
    const action = p.action || body.action;
    let result;
    switch (action) {
      case 'initSheets':   result = initSheets();            break;
      case 'getClients':   result = getClients();            break;
      case 'addClient':    result = addClient(body);         break;
      case 'updateClient': result = updateClient(body);      break;
      case 'deleteClient': result = deleteClient(body);      break;
      case 'getMemos':     result = getMemos(body.name);     break;
      case 'addMemo':      result = addMemo(body);           break;
      default:             result = {error:'Unknown: '+action};
    }
    return out(result);
  } catch(err) {
    return out({error: err.toString()});
  }
}

function out(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

function ss() { return SpreadsheetApp.getActiveSpreadsheet(); }

function initSheets() {
  let cs = ss().getSheetByName(SHEET_NAME_CLIENT);
  if (!cs) {
    cs = ss().insertSheet(SHEET_NAME_CLIENT);
    cs.appendRow(['No','고객명','비즈니스','연락처','이메일','플랜구분','가입상품','메모','다음연락일','에이전트리퍼','상세페이지링크']);
    cs.getRange(1,1,1,11).setFontWeight('bold').setBackground('#1a56db').setFontColor('#ffffff');
    cs.setFrozenRows(1);
    cs.setColumnWidth(1,50); cs.setColumnWidth(2,100); cs.setColumnWidth(8,200);
  }
  let ms = ss().getSheetByName(SHEET_NAME_MEMO);
  if (!ms) {
    ms = ss().insertSheet(SHEET_NAME_MEMO);
    ms.appendRow(['ID','고객명','유형','내용','날짜']);
    ms.getRange(1,1,1,5).setFontWeight('bold').setBackground('#059669').setFontColor('#ffffff');
    ms.setFrozenRows(1);
  }
  return {ok:true, message:'시트 준비 완료'};
}

function getClients() {
  const sheet = ss().getSheetByName(SHEET_NAME_CLIENT);
  if (!sheet) return {error:'고객 시트 없음'};
  const rows = sheet.getDataRange().getValues();
  if (rows.length <= 1) return {clients:[]};
  const clients = rows.slice(1).map((r,i) => ({
    rowIdx : i+2,
    no     : String(r[0]||''),
    name   : String(r[1]||''),
    biz    : String(r[2]||''),
    phone  : String(r[3]||''),
    email  : String(r[4]||''),
    plan   : String(r[5]||''),
    prod   : String(r[6]||''),
    memo   : String(r[7]||''),
    next   : r[8] ? Utilities.formatDate(new Date(r[8]),'America/Los_Angeles','yyyy-MM-dd') : '',
    ref    : String(r[9]||'FALSE'),
    durl   : String(r[10]||''),
  })).filter(c => c.name.trim());
  return {clients};
}

function addClient(d) {
  const sheet  = ss().getSheetByName(SHEET_NAME_CLIENT);
  const no     = sheet.getLastRow(); // header row = 1, so no = lastRow before append
  const row    = [no, d.name||'', d.biz||'', d.phone||'', d.email||'',
                  d.plan||'', d.prod||'', d.memo||'', d.next||'',
                  d.ref||'FALSE', d.durl||''];
  sheet.appendRow(row);
  const newRow = sheet.getLastRow();
  // Auto-resize
  sheet.autoResizeColumns(1,11);
  return {ok:true, rowIdx:newRow, no};
}

function updateClient(d) {
  const sheet  = ss().getSheetByName(SHEET_NAME_CLIENT);
  if (!d.rowIdx) return {error:'rowIdx 필요'};
  const row = [d.no||'', d.name||'', d.biz||'', d.phone||'', d.email||'',
               d.plan||'', d.prod||'', d.memo||'', d.next||'',
               d.ref||'FALSE', d.durl||''];
  sheet.getRange(d.rowIdx, 1, 1, row.length).setValues([row]);
  return {ok:true};
}

function deleteClient(d) {
  const sheet = ss().getSheetByName(SHEET_NAME_CLIENT);
  if (!d.rowIdx) return {error:'rowIdx 필요'};
  sheet.deleteRow(Number(d.rowIdx));
  return {ok:true};
}

function getMemos(clientName) {
  const sheet = ss().getSheetByName(SHEET_NAME_MEMO);
  if (!sheet) return {memos:[]};
  const rows  = sheet.getDataRange().getValues();
  const memos = rows.slice(1)
    .filter(r => !clientName || r[1]===clientName)
    .map(r => ({
      id   : String(r[0]||''),
      name : String(r[1]||''),
      type : String(r[2]||''),
      text : String(r[3]||''),
      date : r[4] ? Utilities.formatDate(new Date(r[4]),'America/Los_Angeles','yyyy-MM-dd') : '',
    }));
  return {memos};
}

function addMemo(d) {
  const sheet = ss().getSheetByName(SHEET_NAME_MEMO);
  const id    = new Date().getTime();
  sheet.appendRow([id, d.name||'', d.type||'', d.text||'', new Date()]);
  return {ok:true, id};
}
