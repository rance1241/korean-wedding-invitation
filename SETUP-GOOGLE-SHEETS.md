# RSVP / 축하 메시지를 Google Sheets에 저장하는 방법

웹사이트 자체는 Vercel의 정적 사이트이므로, 하객의 RSVP와 축하 메시지를 **모두 한 곳에 저장하려면** 한 번만 Google Sheets 연결이 필요합니다.

## 1. Google Sheet 만들기
새 Google Sheet를 하나 만드세요.

Sheet URL이 예를 들어:

`https://docs.google.com/spreadsheets/d/ABC123XYZ/edit`

이면 Sheet ID는:

`ABC123XYZ`

입니다.

## 2. Apps Script 열기
Google Sheet 상단에서:

**Extensions → Apps Script**

를 누릅니다.

## 3. 코드 붙여넣기
이 패키지에 들어 있는:

`google-apps-script.gs`

내용을 Apps Script 편집기에 붙여넣습니다.

맨 위의:

`PASTE_GOOGLE_SHEET_ID_HERE`

를 실제 Sheet ID로 바꿉니다.

## 4. Web App으로 배포
Apps Script 오른쪽 위:

**Deploy → New deployment**

- Type: Web app
- Execute as: Me
- Who has access: Anyone

로 설정하고 Deploy 합니다.

Google이 권한 확인을 요구하면 허용합니다.

배포 후 나오는 Web App URL을 복사합니다.

## 5. website의 script.js 수정
`script.js`에서:

`const WEDDING_FORM_ENDPOINT = "";`

를 찾아서:

`const WEDDING_FORM_ENDPOINT = "복사한_Web_App_URL";`

로 바꿉니다.

GitHub에 commit하면 Vercel이 자동 재배포합니다.

## 저장 결과
Google Sheet에 자동으로 다음 시트가 만들어집니다:

- `RSVP`
  - 제출시간
  - 참석여부
  - 성함
  - 연락처
  - 기타 전달 내용

- `축하메시지`
  - 제출시간
  - 성함
  - 축하 메시지
