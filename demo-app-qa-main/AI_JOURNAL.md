# AI Journal – QA Work on the Claims App

This journal records how I used an AI assistant (Claude Code) during the QA work. For each activity it gives:
- **the prompt** I used, written in the RACE format;
- **what the AI produced**;
- **what I reviewed, rejected or changed** before accepting it.

The AI did the drafting and the typing. The decisions, corrections and final checks were mine.

## The prompt format: RACE

Every prompt below follows **RACE**:

| Letter | Full form | What it tells the AI |
|---|---|---|
| **R** | **Role** | Who the AI should act as, for example "a senior QA engineer" |
| **A** | **Action** | The exact task to do |
| **C** | **Context** | The facts it needs: the app, the architecture, the rules, the files, the limits |
| **E** | **Expectation** | The output: format, size, quality bar and what not to do |

I chose RACE because loose prompts gave generic or oversized output (for example, 122 automated tests when I needed 20). Stating the **Context** and the **Expectation** explicitly fixed that.

## Shared context

Every prompt included this block, referred to below as `[APP CONTEXT]`:

```
App: insurance Claims app.
- UI: Next.js 16 (React 19), port 3001.
- BFF (Backend for Frontend): Spring Boot, port 8090. The browser calls only the BFF.
  Login uses httpOnly cookies (access_token, refresh_token). Every write needs a
  CSRF (Cross-Site Request Forgery) token: the XSRF-TOKEN cookie sent back in the
  X-XSRF-TOKEN header.
- Claims Service: Spring Boot, hexagonal architecture, port 8080, PostgreSQL.
- Keycloak (OAuth2 / JWT, JSON Web Token): roles USER and ADMIN.
- Redis caches the dashboard stats.
- Kafka, with optional Debezium CDC (Change Data Capture), sends status-change events
  to the BFF, which pushes them over WebSocket to the UI.
Claim statuses:
  SUBMITTED -> UNDER_REVIEW or REJECTED
  UNDER_REVIEW -> APPROVED, REJECTED or SUBMITTED
  APPROVED or REJECTED -> CLOSED (CLOSED is final)
Field rules: location 5-200 characters, description 10-1000 characters,
  amount > 0 and <= 1,000,000, incident date not in the future.
Users: claimant@demo.com (USER), admin@demo.com (ADMIN).
API contracts: bff-api.yml and claims-api.yml (OpenAPI).
```

---

## 1. Test strategy

### Prompt
```
ROLE: You are a senior QA lead who writes risk-based test strategies for microservice
web apps.

ACTION: Write a test strategy for the Claims app described below.

CONTEXT: [APP CONTEXT]
Read ARCHITECTURE.md, README.md, both OpenAPI files and the existing tests before
writing.

EXPECTATION:
- Markdown file TEST_STRATEGY.md, about 150 lines, no filler.
- Must contain: objectives; risk-ranked priorities (risk, why it ranks there, which
  tests cover it); in-scope and out-of-scope lists; a test pyramid with tools and the
  current status of each level; key end-to-end journeys; a requirements traceability
  matrix (requirement -> risk -> unit / integration / contract / API / UI test); a test
  data strategy; entry, exit and suspension criteria; a CI/CD (Continuous Integration /
  Continuous Delivery) plan with gates per stage; defect severity definitions;
  environments.
- Base every risk on something real in this code base (file or config), not generic
  textbook risks.
- Push each check to the lowest test level that can prove it.
```

### What the AI produced
A first strategy, with an out-of-scope list, ranked risks R1–R7, a test pyramid and the sections listed above.

### My review and changes
- **Too thin:** the first version had no entry or exit criteria, traceability, data strategy or CI/CD plan. I asked for each of them explicitly, which is why they are listed in the Expectation.
- **Wrong app:** an earlier draft targeted a login demo instead of the Claims app. I pointed the work at the Claims app and its claim lifecycle.
- **Grounded in code:** I checked that each risk points to something real. For example, R4 is based on `app.events.cdc-enabled` defaulting to different values in the code and in Docker Compose.

---

## 2. Test case design

### Prompt
```
ROLE: You are a test designer skilled in boundary-value analysis, equivalence
partitioning, state-transition testing and security testing.

ACTION: Design exactly 10 UI test cases and 10 API test cases for the Claims app.

CONTEXT: [APP CONTEXT]
Highest risks first: (1) data isolation between users, (2) claim status lifecycle,
(3) only admins may change status, (4) the decision reaches the claim owner.

EXPECTATION:
- Markdown file TEST_CASES.md.
- Each case has: ID (UI-AREA-NN / API-AREA-NN), title, priority, preconditions,
  numbered steps, test data, required test data, expected result.
- Each case mixes positive, negative, boundary, data-driven and security checks where
  they fit. Use data tables for boundaries, for example a description of 9, 10, 1000
  and 1001 characters.
- Include the full status transition matrix and token-tampering cases (no token,
  edited signature, edited role, missing CSRF token).
- Test with two users of the same role, not just a wrong password.
- Where the spec is unclear (future date, 3 decimals, UNDER_REVIEW -> SUBMITTED),
  mark the case "record behaviour - ask the product owner" instead of guessing.
- End with a coverage summary table.
```

### What the AI produced
20 detailed cases with personas (USER_A, USER_B, ADMIN_1), seed claims, boundary tables, the transition matrix and a coverage summary.

### My review and changes
- **Exactly 20 cases:** I kept the limit at exactly 20 cases and checked that each one maps to a risk in the strategy.
- **Undecided rules left open:** I kept the "ask the product owner" cases open rather than letting the AI decide the business rule. Two of them later became real defects: DEF-01 (future date) and DEF-04 (3 decimals).

---

## 3. Code structure

### Prompt
```
ROLE: You are a test-automation architect who designs maintainable Playwright +
TypeScript frameworks.

ACTION: Propose and create the folder structure for the e2e tests in
code/demo-app-ui/e2e/.

CONTEXT: The suite has 10 API tests and 10 UI tests against the Claims app. Several
people will maintain it, so each kind of code needs one obvious home.

EXPECTATION - follow this structure exactly, do not keep the old one:
- env.ts at the e2e root, reading e2e/.env (URLs and logins; .env is never committed).
- commons/      common methods: API session (login, cookies, CSRF), API client,
                API types, constants.
- fixtures/     Playwright fixtures that hand logged-in sessions and pages to tests.
- testdata/     test values only (valid claim, form values, wrong password).
- utils/        small helpers, one file per kind (date, string, currency), so new
                helpers are added as new files.
- pageobject/   OUTSIDE commons, with objects/ (locators only) and pages/ (page
                object model: actions and checks).
- tests/api and tests/ui for the specs.
Update every import, run tsc --noEmit and run the full suite after each move.
```

### What the AI produced
The structure, built step by step, with all imports updated and the type check and suite re-run after each move.

### My review and changes
This is the area where I corrected the AI most. Each change was my decision:
1. The AI first kept the old layout. I rejected it and gave the structure: commons, then the page objects with objects/ and pages/.
2. **Page objects out of commons:** I moved `pageobject/` out of `commons/`.
3. **Own folders for data and fixtures:** I moved test data into its own `testdata/` folder, `env.ts` to the e2e root, and the fixtures into their own folder.
4. **Utils folder:** I moved the helpers into a `utils/` folder with one file per kind.

---

## 4. Playwright automation

### Prompt
```
ROLE: You are a senior SDET (Software Development Engineer in Test) writing
production-quality Playwright tests in strict TypeScript.

ACTION: Automate exactly 10 API tests and 10 UI tests for the Claims app.
STRICT RULE: no more than 10 of each.

CONTEXT: [APP CONTEXT]
Use the folder structure from the structure prompt. Pick the highest-risk cases from
TEST_CASES.md.

EXPECTATION:
- Page object model: locators in pageobject/objects, actions and checks in
  pageobject/pages.
- Semantic locators only (getByRole, getByLabel, getByText). No CSS or XPath tied to
  styling.
- Each test creates its own data through the API (unique run ID in the description),
  so tests are independent and safe to run in parallel.
- Tests that involve two users use two browser contexts (admin and claimant).
- Keep the test strict when it exposes a real bug. Do not weaken an assertion to make
  it pass; add an annotation instead.
- Keep traces, screenshots and video on failure, plus HTML and JUnit reports.
- Run the suite and report real results, with the error for each failure.
```

### What the AI produced
`claims.api.spec.ts` and `claims.ui.spec.ts` with 10 tests each, plus the page objects, fixtures and a real-login API session with CSRF handling.

### My review and changes
- **Too many tests:** the first attempt produced 73 + 49 tests. I enforced the strict limit of 10 + 10.
- **Bugs kept visible:** I kept API-04 failing because it exposes a real defect (DEF-01), rather than hiding the bug.
- **Failures I investigated:**
  - UI-09 timed out because the admin list has no pagination (5,630 rows). It now waits for the claim's row.
  - All UI tests failed in VS Code because Playwright's browser was missing. The config now uses the installed Chrome locally.
- **Result:** 19 of 20 pass. The one failure is the real bug.

---

## 5. UI testing

### Prompt
```
ROLE: You are a QA engineer testing a web UI as a real user would, and automating
what you test.

ACTION: Test the Claims UI journeys and automate the highest-risk ones.

CONTEXT: [APP CONTEXT]
Pages: Login, My Claims, Submit New Claim (3-step form), Admin Claims Management,
Dashboard. The UI runs `next dev` in Docker, so first page loads are slow.

EXPECTATION - cover:
- Login: wrong password refused; successful login lands on My Claims; logout; an
  unauthenticated deep link redirects to login and remembers the page.
- Claim form: happy path with values checked in the list and the detail view;
  field validation at the boundaries (aria-invalid, error text, Next disabled).
- Visibility: a claimant sees only their own claims; a claimant opening /admin/claims
  is sent back.
- Admin: changes a status in one browser context, and the claimant sees it in
  another; only legal next statuses are offered.
- Also watch for real-time updates (the "Live" indicator) and slow pages, and report
  anything wrong as a defect with a screenshot.
```

### What the AI produced
UI-01 to UI-10, plus the screenshots that proved DEF-06 (about 11 s admin page load) and DEF-07 (status not updated live while the header says "Live").

### My review and changes
- **Checked from the user's side:** I ran the tests in VS Code myself, found they all failed there, and had the cause found and fixed (missing browser, not the tests).
- **Speed:** I agreed to 2 workers because of the slow dev-mode UI.

---

## 6. API testing

### Prompt
```
ROLE: You are an API test engineer who checks status codes, response bodies,
authorization and side effects, not only the "happy" responses.

ACTION: Test the Claims app through the BFF REST API and automate 10 key checks.

CONTEXT: [APP CONTEXT]
Expected codes come from bff-api.yml: 400 validation, 401 not logged in, 403
forbidden, 404 not found. Log in through the real /api/auth/login, keep the cookies,
and send the CSRF header on writes, exactly as the browser does.

EXPECTATION - cover:
- Create: valid (201, status SUBMITTED, reads back unchanged); boundaries for
  description, amount and date.
- Access control: own claims only; claimant -> admin list is 403; no login is 401.
- Lifecycle: legal path SUBMITTED -> UNDER_REVIEW -> APPROVED seen by the owner;
  illegal SUBMITTED -> APPROVED refused with the claim unchanged.
- Security: a write without the CSRF token is 403 and changes nothing.
- After every refused write, read the data back to prove nothing changed.
- Report every response that differs from the spec as a defect.
```

### What the AI produced
API-01 to API-10, and it exposed DEF-01 to DEF-05 (wrong 500 codes, the 3-decimal amount, parallel logins refused).

### My review and changes
- **Retries made visible:** the AI added a login retry to keep the tests stable. I made sure the reason behind it (parallel logins refused) was reported as a defect (DEF-05) rather than hidden.

---

## 7. Defect writing

### Prompt
```
ROLE: You are a QA engineer writing defect reports that a developer can reproduce
and fix without asking questions.

ACTION: Write defects.md for every defect found in the Claims app.

CONTEXT: [APP CONTEXT]
Sources: failing tests, runs against the live stack, and code review of the BFF and
Claims Service.

EXPECTATION:
- One entry per defect, each with: ID (DEF-NN), title, severity (Critical / High /
  Medium / Low, with the scale defined at the top), area, numbered steps, expected
  result, actual result, cause with file:line links, and an embedded screenshot.
- Summary table at the top, sorted by ID, with severity and "how found"
  (Reproduced / Code review).
- Reproduce every runtime defect against the running app before writing it. The
  screenshot must show the real request and response or the real screen. For
  code-review defects, show the exact code lines.
- Put the screenshots in defects/screenshots and embed them in the MD file.
- Drop anything you cannot reproduce, and list it under "Checked and not a defect".
```

### What the AI produced
13 defects (7 reproduced, 6 from code review), each with steps, severity, cause and a screenshot embedded in `defects/defects.md`.

### My review and changes
- **Required fields:** I insisted on IDs, steps, severity and screenshots in the MD file itself. An earlier defects file had none of them.
- **Two claims removed after checking:**
  - "0.001 stored as 0.00" was wrong, because 0.001 is correctly rejected. The real defect is 10.005 being stored as 10.01 (DEF-04).
  - "Stale dashboard cache" did not reproduce, so it was moved to "Checked and not a defect".
- **Only the report is delivered:** the temporary script used to take the screenshots was deleted, so only `defects.md` and its screenshots are committed.

---

## Lessons learned

1. **Scope:** a precise **Expectation** with hard numbers, such as "exactly 10", stops the AI from producing far too much.
2. **Context:** giving real **Context** (ports, roles, the CSRF mechanism, the field rules) turned generic tests into tests of this app.
3. **Verification:** the AI's claims must be checked. Two of its suspected defects were wrong, and it first blamed the tests for what was really a missing browser.
4. **Ownership:** the folder structure, the test limits, the defect format and the decision to keep a failing test were my calls. The AI made them consistent and fast to implement.
