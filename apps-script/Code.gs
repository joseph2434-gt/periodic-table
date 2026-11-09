/**
 * Google Apps Script backend for the CSS questionnaire.
 *
 * Setup: see README.md. Summary:
 *  1. Paste this file into Extensions > Apps Script of a new Google Sheet.
 *  2. Project Settings > Script properties > add  ADMIN_KEY = <a secret passphrase>
 *  3. Deploy > New deployment > Web app > Execute as: Me, Who has access: Anyone.
 *  4. Copy the /exec URL into config.js.
 */
const SHEET_NAME = 'Responses';
const HEADERS = ["timestamp", "age", "sex", "employment", "prior_exp", "cu1", "cu2", "cu3", "cu4", "cu5", "te1", "te2", "te3", "te4", "te5", "lf1", "lf2", "lf3", "lf4", "lf5", "cad1", "cad2", "cad3", "cad4", "cad5", "ios1", "ios2", "ios3", "ios4", "ios5", "ht1", "ht2", "ht3", "ht4", "ht5", "net1", "net2", "net3", "net4", "net5", "pm1", "pm2", "pm3", "pm4", "pm5", "comments"];

function getSheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(SHEET_NAME) || ss.insertSheet(SHEET_NAME);
  if (sh.getLastRow() === 0) {
    sh.appendRow(HEADERS);
    sh.setFrozenRows(1);
  }
  return sh;
}

function clean_(v) {
  if (v === undefined || v === null) return '';
  v = String(v).slice(0, 2000);
  // stop spreadsheet formula injection
  return /^[=+\-@]/.test(v) ? "'" + v : v;
}

// Receives a submission from the questionnaire.
function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(15000);
  try {
    const d = JSON.parse(e.postData.contents);
    const row = HEADERS.map(h => h === 'timestamp' ? new Date() : clean_(d[h]));
    getSheet_().appendRow(row);
    return json_({ ok: true });
  } catch (err) {
    return json_({ ok: false, error: String(err) });
  } finally {
    lock.releaseLock();
  }
}

// Returns all responses as JSON, only with the correct ?key=ADMIN_KEY
function doGet(e) {
  const key = PropertiesService.getScriptProperties().getProperty('ADMIN_KEY');
  if (!key || !e.parameter || e.parameter.key !== key) {
    return json_({ ok: false, error: 'unauthorized' });
  }
  const values = getSheet_().getDataRange().getValues();
  const head = values.shift();
  const rows = values.map(r => Object.fromEntries(head.map((h, i) => [h, r[i]])));
  return json_({ ok: true, rows: rows });
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
