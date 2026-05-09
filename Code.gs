// FinCRM - Google Apps Script (CORS 헤더 추가 버전)

const SHEET_CLIENT = '고객';
const SHEET_MEMO   = '메모';

function doGet(e) {
  const action = e.parameter.action || '';
  const data   = e.parameter.data ? JSON.parse(decodeURIComponent(e.parameter.data)) : {};
  return respond(route(action, data));
}

function doPost(e) {
  const body   = JSON.parse(e.postData.contents || '{}');
  const action = body.action || '';
  return respond(route(action, body));
}

function route(action, data) {
  try {
    switch (action) {
      case 'initSheets':   return initSheets();
      case 'getClients':   return getClients();
      case 'addClient':    return addClient(data);
      case 'updateClient': return updateClient(data);
      case 'deleteClient': return deleteClient(data);
      case 'getMemos':     return getMemos(data.name);
      case 'addMemo':      return addMemo(data);
      default:             return {error: 'Unknown: ' + action};
    }
  } catch(err) {
    return {error: err.toString()};
  }
}

// CORS 헤더 포함 응답
function respond(data) {
  const output = ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
  return output;
}

function ss() { return SpreadsheetApp.getActiveSpreadsheet(); }

function initSheets() {
  let cs = ss().getSheetByName(SHEET_CLIENT);
  if (!cs) {
    cs = ss().insertSheet(SHEET_CLIENT);
    cs.appendRow(['No','고객명','비즈니스','연락처','이메일','플랜구분','가입상품','메모','다음연락일','에이전트리퍼','상세페이지링크']);
    cs.getRange(1,1,1,11).setFontWeight('bold').setBackground('#1a56db').setFontColor('#ffffff');
    cs.setFrozenRows(1);
  }
  let ms = ss().getSheetByName(SHEET_MEMO);
  if (!ms) {
    ms = ss().insertSheet(SHEET_MEMO);
    ms.appendRow(['ID','고객명','유형','내용','날짜']);
    ms.getRange(1,1,1,5).setFontWeight('bold').setBackground('#059669').setFontColor('#ffffff');
    ms.setFrozenRows(1);
  }
  return {ok: true};
}

function getClients() {
  const sheet = ss().getSheetByName(SHEET_CLIENT);
  if (!sheet) return {error: '고객 시트 없음'};
  const rows = sheet.getDataRange().getValues();
  if (rows.length <= 1) return {clients: []};
  const clients = rows.slice(1).map((r, i) => ({
    rowIdx : i + 2,
    no     : String(r[0] || ''),
    name   : String(r[1] || ''),
    biz    : String(r[2] || ''),
    phone  : String(r[3] || ''),
    email  : String(r[4] || ''),
    plan   : String(r[5] || ''),
    prod   : String(r[6] || ''),
    memo   : String(r[7] || ''),
    next   : r[8] ? Utilities.formatDate(new Date(r[8]), 'America/Los_Angeles', 'yyyy-MM-dd') : '',
    ref    : String(r[9] || 'FALSE'),
    durl   : String(r[10] || ''),
  })).filter(c => c.name.trim());
  return {clients};
}

function addClient(d) {
  const sheet = ss().getSheetByName(SHEET_CLIENT);
  const no    = sheet.getLastRow();
  const row   = [no, d.name||'', d.biz||'', d.phone||'', d.email||'',
                 d.plan||'', d.prod||'', d.memo||'', d.next||'',
                 d.ref||'FALSE', d.durl||''];
  sheet.appendRow(row);
  return {ok: true, rowIdx: sheet.getLastRow(), no};
}

function updateClient(d) {
  const sheet = ss().getSheetByName(SHEET_CLIENT);
  if (!d.rowIdx) return {error: 'rowIdx 필요'};
  const row = [d.no||'', d.name||'', d.biz||'', d.phone||'', d.email||'',
               d.plan||'', d.prod||'', d.memo||'', d.next||'',
               d.ref||'FALSE', d.durl||''];
  sheet.getRange(d.rowIdx, 1, 1, row.length).setValues([row]);
  return {ok: true};
}

function deleteClient(d) {
  const sheet = ss().getSheetByName(SHEET_CLIENT);
  if (!d.rowIdx) return {error: 'rowIdx 필요'};
  sheet.deleteRow(Number(d.rowIdx));
  return {ok: true};
}

function getMemos(clientName) {
  const sheet = ss().getSheetByName(SHEET_MEMO);
  if (!sheet) return {memos: []};
  const rows  = sheet.getDataRange().getValues();
  const memos = rows.slice(1)
    .filter(r => !clientName || r[1] === clientName)
    .map(r => ({
      id   : String(r[0] || ''),
      name : String(r[1] || ''),
      type : String(r[2] || ''),
      text : String(r[3] || ''),
      date : r[4] ? Utilities.formatDate(new Date(r[4]), 'America/Los_Angeles', 'yyyy-MM-dd') : '',
    }));
  return {memos};
}

function addMemo(d) {
  const sheet = ss().getSheetByName(SHEET_MEMO);
  const id    = new Date().getTime();
  sheet.appendRow([id, d.name||'', d.type||'', d.text||'', new Date()]);
  return {ok: true, id};
}
