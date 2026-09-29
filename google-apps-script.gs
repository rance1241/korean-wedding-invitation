/*
형주 & Jenna 모바일 청첩장
Google Sheets 수집용 Apps Script

설정:
1. 새 Google Sheet를 만듭니다.
2. Extensions > Apps Script
3. 이 파일 내용을 붙여넣습니다.
4. SHEET_ID에 Google Sheet ID를 입력합니다.
5. Deploy > New deployment > Web app
6. Execute as: Me
7. Who has access: Anyone
8. 배포된 URL을 website의 script.js 안
   WEDDING_FORM_ENDPOINT = "여기에 URL";
   로 입력합니다.
*/

const SHEET_ID = "PASTE_GOOGLE_SHEET_ID_HERE";

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.tryLock(10000);

  try {
    const ss = SpreadsheetApp.openById(SHEET_ID);
    const data = JSON.parse(e.postData.contents || "{}");

    if (data.type === "rsvp") {
      let sheet = ss.getSheetByName("RSVP");
      if (!sheet) {
        sheet = ss.insertSheet("RSVP");
        sheet.appendRow(["제출시간", "참석여부", "성함", "연락처", "기타 전달 내용"]);
      }

      sheet.appendRow([
        new Date(),
        data.attendance || "",
        data.name || "",
        data.phone || "",
        data.note || ""
      ]);
    }

    if (data.type === "message") {
      let sheet = ss.getSheetByName("축하메시지");
      if (!sheet) {
        sheet = ss.insertSheet("축하메시지");
        sheet.appendRow(["제출시간", "성함", "축하 메시지"]);
      }

      sheet.appendRow([
        new Date(),
        data.name || "",
        data.message || ""
      ]);
    }

    return ContentService
      .createTextOutput(JSON.stringify({ ok: true }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ ok: false, error: String(error) }))
      .setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}
