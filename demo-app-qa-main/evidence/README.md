# Test evidence

Video recordings of the 10 Playwright UI tests from the evidence run on 23 Nov 2026 (all 10 passed, 1.8 min, 2 workers, installed Google Chrome).

How they were made (from `code/demo-app-ui`, with the app running):

```bash
E2E_ARTIFACTS=all npx playwright test --project=ui-chromium --reporter=line,html
```

`E2E_ARTIFACTS=all` keeps the video and the end screenshot of every test. The default run keeps them only for failures. The HTML report (`npx playwright show-report`) also shows the screenshot that each test takes after each key check.

| Test | Case | Video |
|---|---|---|
| UI-01 | UI-AUTH-01 | [UI-01-wrong-password-refused.webm](ui-videos/UI-01-wrong-password-refused.webm) |
| UI-02 | UI-AUTH-01 | [UI-02-sign-in-and-log-out.webm](ui-videos/UI-02-sign-in-and-log-out.webm) |
| UI-03 | UI-VIS-03 | [UI-03-signed-out-redirect-to-login.webm](ui-videos/UI-03-signed-out-redirect-to-login.webm) |
| UI-04 | UI-CLM-01 | [UI-04-submit-claim.webm](ui-videos/UI-04-submit-claim.webm) |
| UI-05 | UI-CLM-02 | [UI-05-short-location-rejected.webm](ui-videos/UI-05-short-location-rejected.webm) |
| UI-06 | UI-CLM-02 | [UI-06-short-description-rejected.webm](ui-videos/UI-06-short-description-rejected.webm) |
| UI-07 | UI-VIS-01 | [UI-07-own-claims-only.webm](ui-videos/UI-07-own-claims-only.webm) |
| UI-08 | UI-VIS-03 | [UI-08-claimant-blocked-from-admin.webm](ui-videos/UI-08-claimant-blocked-from-admin.webm) |
| UI-09 | UI-ADM-01 | [admin browser](ui-videos/UI-09-admin-changes-status-admin.webm), [claimant browser](ui-videos/UI-09-admin-changes-status-claimant.webm) |
| UI-10 | UI-ADM-04 | [UI-10-status-options-offered.webm](ui-videos/UI-10-status-options-offered.webm) |

UI-09 uses two browsers (admin and claimant) at the same time, so it has two videos.

Screenshots for the defects are in [../defects/screenshots](../defects/screenshots).
