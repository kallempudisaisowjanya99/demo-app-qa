# Test Case Design — Claims App

Companion to [TEST_STRATEGY.md](TEST_STRATEGY.md). The focus is the claim lifecycle: a claimant raises a claim, an admin decides its status, and that decision must show up for the right claimant and nobody else. Login is covered by one UI case only.

The suite is **10 UI tests and 10 API tests**. Each list mixes positive, negative, boundary, data-driven and security cases (security cases are tagged **S**).

## How to read a test case

Every case has the same seven fields:

| Field | Meaning |
|-------|---------|
| **ID** | Unique tag. It goes in the Playwright test title, for example `test('UI-ADM-01 ...')`. |
| **Description** | What the test proves, in one sentence. |
| **Prerequisite** | The state the system must be in before step 1. |
| **Steps** | What the tester does, in order. |
| **Expected result** | What must be true afterwards. |
| **Test data** | The exact values used in this test. |
| **Required test data** | What must be created or exist beforehand (users, claims) and how. |

Types: **P** positive, **N** negative, **B** boundary, **D** data-driven, **S** security.
Priority: P0 = release blocker, P1 = core.

## Environment and Conventions

- UI: `http://localhost:3001`. BFF API: `http://localhost:8090`. Claims Service (direct checks only): `http://localhost:8080`.
- API tests run against the BFF, authenticated as the named persona, with the CSRF token on mutating calls.
- Expected status codes follow the OpenAPI specs: 400 validation, 401 unauthenticated, 403 forbidden, 404 not found.
- Statuses and legal moves (`ClaimStatus`): SUBMITTED → UNDER_REVIEW / REJECTED. UNDER_REVIEW → APPROVED / REJECTED / SUBMITTED. APPROVED → CLOSED. REJECTED → CLOSED. CLOSED → nothing.

## Test Personas

Authorization is tested with different accounts of the same role, not with wrong passwords.

| Persona | Role | How to get it |
|---------|------|---------------|
| `ADMIN_1` | ADMIN | Seeded: `admin@demo.com` / `Admin123!` |
| `USER_A` | CLAIMANT | Seeded: `claimant@demo.com` / `Claimant123!` |
| `USER_B` | CLAIMANT | Signup via `POST /api/auth/signup`: name `QA User B`, email `qa.userb+<runId>@demo.com`, password `Secret123` |
| `USER_C` | CLAIMANT | Same as `USER_B`, with email `qa.userc+<runId>@demo.com`. Never creates claims. |

Passwords come from environment variables in the automated tests, not from the specs.

## Standard Seed Claims

Created through the API before each suite. Every description contains `<runId>` (a timestamp) so tests don't collide and a leak is easy to spot.

| Claim | Owner | Status | Description | Amount |
|-------|-------|--------|-------------|--------|
| `A1` | USER_A | SUBMITTED | `A1-<runId> pipe burst in basement` | 5000.00 |
| `A2` | USER_A | SUBMITTED | `A2-<runId> car hit while parked` | 1200.50 |
| `A3` | USER_A | APPROVED | `A3-<runId> storm damage to roof` | 8000.00 |
| `B1` | USER_B | SUBMITTED | `B1-<runId> kitchen fire damage` | 15000.00 |
| `B2` | USER_B | REJECTED | `B2-<runId> stolen bicycle from garage` | 300.00 |

To create a claim in a target status, an admin walks it through the legal path: SUBMITTED → UNDER_REVIEW → APPROVED, or SUBMITTED → REJECTED.

**Valid claim payload (V)** used where "a valid claim" is needed: `incidentDate=2026-02-15`, `incidentLocation="123 Main St, Springfield"`, `description="Water damage to basement"`, `claimAmount=5000.00`.

---

# Part 1 — UI Test Cases (10)

| ID | Title | Type | Pri |
|----|-------|------|-----|
| UI-AUTH-01 | Login smoke | P, N | P0 |
| UI-CLM-01 | Raise a claim | P | P0 |
| UI-CLM-02 | Claim form validation and script injection | N, B, D, S | P0 |
| UI-VIS-01 | User sees only own claims | P, S | P0 |
| UI-VIS-02 | Admin sees all users' claims | P, S | P0 |
| UI-VIS-03 | User blocked from admin pages and others' claims | N, S | P0 |
| UI-ADM-01 | Approval reflected for the claimant | P | P0 |
| UI-ADM-02 | Rejection reflected, other claims untouched | P, N | P0 |
| UI-ADM-03 | Live update and persistence | P | P0 |
| UI-ADM-04 | Only legal next statuses offered | N, D | P0 |

### UI-AUTH-01 — Login smoke
- **Description:** USER_A and ADMIN_1 can log in; a wrong password is refused.
- **Prerequisite:** App running, both users exist, browser logged out.
- **Steps:**
  1. Open `/login`.
  2. Enter USER_A email and a wrong password, click Sign in.
  3. Enter the correct password, click Sign in.
  4. Log out.
  5. Log in as ADMIN_1 and open `/admin/claims`.
- **Expected result:** Step 2 shows an error and stays on `/login`. Step 3 lands on `/claims`. Step 5 shows the admin claims page.
- **Test data:** USER_A `claimant@demo.com` with wrong password `WrongPass1` then `Claimant123!`. ADMIN_1 `admin@demo.com` / `Admin123!`.
- **Required test data:** The two seeded users only.

### UI-CLM-01 — Raise a claim
- **Description:** A claimant can submit a claim and see it as SUBMITTED.
- **Prerequisite:** Logged in as USER_A.
- **Steps:**
  1. Open `/claims/new`.
  2. Complete wizard steps 1-3 with the test data.
  3. Review the summary and submit.
  4. Open `/claims` and open the new claim's detail.
- **Expected result:** Success message. The claim is in USER_A's list with status `SUBMITTED`, the entered amount, location and description, and today's date. The detail modal shows the same values.
- **Test data:** V with description `UI-CLM-01-<runId> water damage`.
- **Required test data:** USER_A only. No pre-existing claims needed.

### UI-CLM-02 — Claim form validation and script injection
- **Description:** The form refuses invalid values, accepts boundary values, and displays script text as plain text for both the owner and the admin.
- **Prerequisite:** Logged in as USER_A on `/claims/new`.
- **Steps:**
  1. For each row: fill the form with V, replace the one field with the row value, try to continue or submit.
  2. For the script row, submit, then view the claim as USER_A (list, detail) and as ADMIN_1 (admin list).
- **Expected result:** As in the table. Blocked rows show an inline error and send no request to the server. The script text appears literally, no dialog opens, and no script runs in either session.
- **Test data:**

| Field | Value | Expected |
|-------|-------|----------|
| Location | 4 chars (`abcd`) | Blocked |
| Location | 5 chars (`abcde`) | Accepted |
| Location | 200 / 201 chars | Accepted / blocked |
| Description | 9 chars | Blocked |
| Description | 10 chars | Accepted |
| Description | 1000 / 1001 chars | Accepted / blocked |
| Amount | `0`, `-5` | Blocked |
| Amount | `0.01` | Accepted |
| Amount | `1000000` / `1000000.01` | Accepted / blocked |
| Amount | `abc`, `1e5`, `1,5` | Blocked or normalised, no crash |
| Incident date | empty | Blocked |
| Incident date | a future date | Record behaviour (ask the product owner) |
| Description | `<img src=x onerror=alert(1)>` | Accepted as text, shown escaped |
| Location | `"><script>alert(1)</script>` | Accepted as text, shown escaped |

- **Required test data:** USER_A, ADMIN_1. Long strings are generated by the test (`'x'.repeat(n)`).

### UI-VIS-01 — User sees only own claims
- **Description:** Each claimant's list contains only their own claims.
- **Prerequisite:** Seed claims exist. Two browser contexts available.
- **Steps:**
  1. Context 1: log in as USER_A, open `/claims`.
  2. Context 2: log in as USER_B, open `/claims`.
  3. In each context, filter or search for text from the other user's claim (`B1-<runId>` in USER_A's context, `A1-<runId>` in USER_B's).
  4. Log in as USER_C (no claims) and open `/claims`.
- **Expected result:** USER_A sees `A1`, `A2`, `A3` and none of `B1`, `B2`. USER_B sees `B1`, `B2` only. Counts match. The searches return nothing. USER_C sees the empty state with a "create claim" action and no one else's claims.
- **Test data:** The seed claims.
- **Required test data:** USER_A, USER_B, USER_C, seed claims `A1`-`A3`, `B1`-`B2`.

### UI-VIS-02 — Admin sees all users' claims
- **Description:** The admin sees every claimant's claims with their owners, including a claim raised after the admin's page was opened.
- **Prerequisite:** Seed claims exist. ADMIN_1 has `/admin/claims` open in context 1.
- **Steps:**
  1. Note the claims and owners shown to ADMIN_1.
  2. Filter by status `REJECTED`, then by user USER_A.
  3. Context 2: USER_B submits a new claim.
  4. In context 1, watch the admin list (refresh once if live update isn't designed).
  5. In a context logged in as USER_A, open `/claims`.
- **Expected result:** Step 1: `A1`-`A3`, `B1`-`B2` listed with owners. Step 2: `REJECTED` shows `B2`, user filter shows only A's claims. Step 4: the new claim appears as `SUBMITTED` under USER_B. Step 5: USER_A does not see USER_B's new claim.
- **Test data:** The seed claims. New claim: V with description `UI-VIS-02-<runId> new claim from B`.
- **Required test data:** ADMIN_1, USER_A, USER_B, seed claims.

### UI-VIS-03 — User blocked from admin pages and others' claims
- **Description:** A claimant can't open admin pages or another user's claim.
- **Prerequisite:** Logged in as USER_A. `B1` exists.
- **Steps:**
  1. Open `/admin/claims`, `/admin/dashboard`, `/admin/users`.
  2. Try to open the detail of `B1` using its ID (in the app route, or by calling the API route the UI uses from the browser).
  3. Check the navigation menu.
  4. Log out and open `/claims` and `/admin/claims` directly.
- **Expected result:** Admin pages deny access or redirect, and show no data. `B1` is not shown (not found or forbidden). Admin links are not in the menu. Step 4 redirects to `/login` (with the original page in the `redirect` parameter).
- **Test data:** `B1`'s claim ID.
- **Required test data:** USER_A, USER_B, claim `B1`.

### UI-ADM-01 — Approval reflected for the claimant
- **Description:** After the admin approves a claim, its owner sees APPROVED.
- **Prerequisite:** `A1` is SUBMITTED. Context 1: ADMIN_1 on `/admin/claims`. Context 2: USER_A on `/claims`.
- **Steps:**
  1. Admin changes `A1` to `UNDER_REVIEW` and confirms.
  2. Look at both screens.
  3. Admin changes `A1` to `APPROVED` and confirms.
  4. Look at both screens and open `A1`'s detail as USER_A.
- **Expected result:** After step 1, both show `UNDER_REVIEW`. After step 3, both show `APPROVED`. The status badge, progress indicator and detail modal agree. `updatedAt` is later.
- **Test data:** Claim `A1`. Target statuses `UNDER_REVIEW`, then `APPROVED`.
- **Required test data:** ADMIN_1, USER_A, fresh `A1` in SUBMITTED.

### UI-ADM-02 — Rejection reflected, other claims untouched
- **Description:** After the admin rejects a claim, its owner sees REJECTED, and no other claim or user is affected. Cancelling the confirmation changes nothing.
- **Prerequisite:** Seed claims exist (`A1`, `A2`, `B1` SUBMITTED). USER_A and USER_B each have a context open.
- **Steps:**
  1. Admin selects `REJECTED` for `A2`, clicks Cancel in the dialog, then selects it again and closes the dialog with Esc.
  2. Admin selects `REJECTED` for `A2` and confirms.
  3. Look at USER_A's list and `A2`'s detail.
  4. Look at USER_B's list.
  5. Re-read all five claims in the admin list.
- **Expected result:** After step 1, `A2` is still `SUBMITTED` and no request was sent. After step 3, USER_A sees `A2` as `REJECTED` and `A1` still `SUBMITTED`. USER_B sees no change and no notification. Step 5: `A1` SUBMITTED, `A3` APPROVED, `B1` SUBMITTED, `B2` REJECTED.
- **Test data:** Claim `A2`, target `REJECTED`.
- **Required test data:** ADMIN_1, USER_A, USER_B, all five seed claims, fresh.

### UI-ADM-03 — Live update and persistence
- **Description:** The status change reaches the user without a refresh and survives a refresh and a re-login.
- **Prerequisite:** `A1` is SUBMITTED. USER_A has `/claims` open and idle.
- **Steps:**
  1. Admin approves `A1` (through `UNDER_REVIEW`).
  2. Watch USER_A's page without touching it.
  3. Refresh USER_A's page.
  4. Log USER_A out and in again.
- **Expected result:** Step 2: the status updates by itself (WebSocket), with a notification if the UI has one. Steps 3-4: still `APPROVED`. If the live update doesn't arrive, the refresh must still show `APPROVED`, which separates a WebSocket fault from a data fault.
- **Test data:** Claim `A1`.
- **Required test data:** ADMIN_1, USER_A, fresh `A1`.

### UI-ADM-04 — Only legal next statuses offered
- **Description:** The status selector offers only legal transitions.
- **Prerequisite:** Logged in as ADMIN_1. One claim exists in each status.
- **Steps:** For each claim, open its status selector and read the options.
- **Expected result:** As in the table.
- **Test data:**

| Current | Must be offered | Must not be offered |
|---------|-----------------|---------------------|
| SUBMITTED | UNDER_REVIEW, REJECTED | APPROVED, CLOSED |
| UNDER_REVIEW | APPROVED, REJECTED, SUBMITTED (see strategy section 12) | CLOSED |
| APPROVED | CLOSED | all others |
| REJECTED | CLOSED | all others |
| CLOSED | nothing | everything |

- **Required test data:** ADMIN_1 and five claims, one per status, created by walking the legal path (the `CLOSED` one goes SUBMITTED → UNDER_REVIEW → APPROVED → CLOSED).

---

# Part 2 — API Test Cases (10)

| ID | Title | Type | Pri |
|----|-------|------|-----|
| API-CLM-01 | Create claim, valid | P | P0 |
| API-CLM-02 | Create claim: boundaries and invalid input | B, N, D | P0 |
| API-CLM-03 | Status and owner are set by the server | N, S | P0 |
| API-VIS-01 | User lists only own claims | P, S | P0 |
| API-VIS-02 | Admin lists all claims, filters | P, D | P0 |
| API-VIS-03 | Get claim by ID: own, other user's, nonexistent | P, N, S | P0 |
| API-ADM-01 | Approve and reject, visible to the owner, others untouched | P | P0 |
| API-ADM-02 | Status transition matrix | N, D | P0 |
| API-ADM-03 | Status update errors, claimant and token attacks | N, S | P0 |
| API-ADM-04 | One real-time event per change, only to the owner | P, S | P1 |

### API-CLM-01 — Create claim, valid
- **Description:** A valid claim is created and can be read back unchanged.
- **Prerequisite:** USER_A token.
- **Steps:**
  1. `POST /api/claims` with V.
  2. `GET /api/claims/{claimId}` with the returned ID.
- **Expected result:** Step 1: 201, body has `claimId` (UUID), `status=SUBMITTED`, the sent values and `createdAt`. Step 2: identical data.
- **Test data:** V with description `API-CLM-01-<runId> water damage`.
- **Required test data:** USER_A.

### API-CLM-02 — Create claim: boundaries and invalid input
- **Description:** Field limits are enforced exactly at the boundary, and malformed requests give a 400 that names the problem, never a 500.
- **Prerequisite:** USER_A token. Note USER_A's claim count.
- **Steps:** For each row, `POST /api/claims` with V and the one change. Then `GET /api/claims` and count.
- **Expected result:** As in the table. Rejected requests create no claim (the count only goes up for the 201 rows).
- **Test data:**

| Change to V | Expected |
|-------------|----------|
| incidentLocation 4 / 5 / 200 / 201 chars | 400 / 201 / 201 / 400 |
| description 9 / 10 / 1000 / 1001 chars | 400 / 201 / 201 / 400 |
| claimAmount 0 / 0.01 / 1000000 / 1000000.01 | 400 / 201 / 201 / 400 |
| claimAmount -1 | 400 |
| claimAmount 0.001 | Record behaviour (round or reject) |
| remove `incidentDate`, `claimAmount`, `description` or `incidentLocation` | 400, error names the field |
| `incidentDate="15/02/2026"` or `"2026-02-30"` | 400 |
| `claimAmount="five"` | 400 |
| malformed JSON | 400 |
| V sent as `Content-Type: text/plain` | 415 or 400 |

- **Required test data:** USER_A. Long strings generated by the test.

### API-CLM-03 — Status and owner are set by the server
- **Description:** A client cannot choose a new claim's status or owner.
- **Prerequisite:** USER_A and USER_B tokens. USER_B's ID known.
- **Steps:**
  1. As USER_A, `POST /api/claims` with V plus `status="APPROVED"` and `userId=<USER_B id>`.
  2. As USER_B, `GET /api/claims`.
  3. As USER_A, `GET /api/claims`.
- **Expected result:** Claim created as `SUBMITTED`, owned by USER_A. USER_B's list does not contain it. USER_A's list does.
- **Test data:** V plus the two extra fields, description `API-CLM-03-<runId> owner spoof`.
- **Required test data:** USER_A, USER_B (ID from `GET /api/admin/users` as ADMIN_1).

### API-VIS-01 — User lists only own claims
- **Description:** `GET /api/claims` returns the caller's claims and nobody else's.
- **Prerequisite:** Seed claims exist.
- **Steps:**
  1. `GET /api/claims` as USER_A.
  2. Same as USER_B.
  3. Same as USER_C.
  4. As USER_A, `GET /api/claims?userId=<USER_B id>`.
  5. As USER_A, `GET /api/admin/claims`.
- **Expected result:** USER_A gets exactly the IDs of `A1`, `A2`, `A3`. USER_B gets `B1`, `B2`. USER_C gets `[]` with 200. Step 4 still returns only A's claims. Step 5: 403 with no claim data. Compare IDs, not just counts.
- **Test data:** Seed claim IDs.
- **Required test data:** USER_A, USER_B, USER_C, seed claims.

### API-VIS-02 — Admin lists all claims, filters
- **Description:** The admin gets every claim, and the filters narrow correctly.
- **Prerequisite:** Seed claims exist.
- **Steps:** Call `GET /api/admin/claims` for each row.
- **Expected result:** As in the table. Each item identifies its owner.
- **Test data:**

| Caller / query | Expected |
|----------------|----------|
| ADMIN_1, none | `A1`-`A3`, `B1`-`B2` (all) |
| `status=REJECTED` | `B2` |
| `userId=<A>` | `A1`, `A2`, `A3` |
| `status=SUBMITTED&userId=<B>` | `B1` |
| `status=BOGUS` | 400 |
| `userId=<random UUID>` | 200, empty list |

- **Required test data:** ADMIN_1, USER_A, USER_B, seed claims.

### API-VIS-03 — Get claim by ID
- **Description:** A user can read own claims only; admins can read any. Denied responses reveal nothing.
- **Prerequisite:** Seed claims exist.
- **Steps:**
  1. `GET /api/claims/{id}` for each row.
  2. Compare the response for `B1` with the response for a nonexistent ID, both as USER_A.
- **Expected result:** As in the table. Denied responses contain no data from the claim. Step 2: the two responses look the same (the ID's existence isn't revealed).
- **Test data:**

| Caller | ID | Expected |
|--------|----|----------|
| USER_A | `A1` | 200 |
| USER_A | `B1` | 403 or 404 |
| USER_A | random valid UUID `00000000-0000-4000-8000-000000000000` | 404 |
| USER_A | `abc` | 400 |
| ADMIN_1 | `A1`, `B1` | 200 |

- **Required test data:** ADMIN_1, USER_A, USER_B, `A1`, `B1`.

### API-ADM-01 — Approve and reject, visible to the owner, others untouched
- **Description:** An admin's approval and rejection are visible to the owner through the API, and no other claim changes.
- **Prerequisite:** Seed claims exist. Snapshot all five (full JSON) as ADMIN_1.
- **Steps:**
  1. ADMIN_1: `PATCH /api/admin/claims/{A1}/status` `{"status":"UNDER_REVIEW"}`, then `{"status":"APPROVED"}`.
  2. ADMIN_1: `PATCH` `A2` to `REJECTED`.
  3. USER_A: `GET /api/claims/{A1}`, `GET /api/claims/{A2}` and `GET /api/claims`.
  4. USER_B: `GET /api/claims`.
  5. ADMIN_1: `GET /api/admin/claims` and compare with the snapshot.
- **Expected result:** Steps 1-2: 200. USER_A sees `A1` as `APPROVED` and `A2` as `REJECTED`, both with a later `updatedAt`. USER_B's claims are identical to the snapshot. Admin list shows the same statuses. `A3`, `B1`, `B2` are byte-for-byte equal to the snapshot, and the other fields of `A1`/`A2` are unchanged.
- **Test data:** Claims `A1`, `A2`. Status bodies above.
- **Required test data:** ADMIN_1, USER_A, USER_B, all five seed claims, fresh.

### API-ADM-02 — Status transition matrix
- **Description:** Every from/to pair behaves as the rules say.
- **Prerequisite:** ADMIN_1 token. Ability to create a claim in each status.
- **Steps:** For each row, create a fresh claim in the "from" status, PATCH it to the "to" status as ADMIN_1, then read it as its owner.
- **Expected result:** As in the table. After a 200 the owner's read shows the new status. After a 400 the status and `updatedAt` are unchanged.
- **Test data:**

| From → To | Expected |
|-----------|----------|
| SUBMITTED → UNDER_REVIEW / REJECTED | 200 |
| SUBMITTED → APPROVED / CLOSED / SUBMITTED | 400 |
| UNDER_REVIEW → APPROVED / REJECTED | 200 |
| UNDER_REVIEW → SUBMITTED | 200 today (flagged, strategy section 12) |
| UNDER_REVIEW → CLOSED | 400 |
| APPROVED → CLOSED | 200 |
| APPROVED → anything else | 400 |
| REJECTED → CLOSED | 200 |
| REJECTED → anything else | 400 |
| CLOSED → anything | 400 |

- **Required test data:** ADMIN_1, USER_A as owner, a helper that creates a claim in any status.

### API-ADM-03 — Status update errors, claimant and token attacks
- **Description:** Bad, unauthorized or forged status-update requests are refused and change nothing.
- **Prerequisite:** `A1` is SUBMITTED.
- **Steps:** Send each row to `PATCH /api/admin/claims/{id}/status`, then read `A1` as ADMIN_1.
- **Expected result:** As in the table. `A1` is unchanged and no event is emitted after every row. A claimant is refused even for their own claim.
- **Test data:**

| Caller | Request | Expected |
|--------|---------|----------|
| ADMIN_1 | random valid UUID as claim ID | 404 |
| ADMIN_1 | `{"status":"BOGUS"}` | 400 |
| ADMIN_1 | `{}` and empty body | 400 |
| ADMIN_1 | `{"status":"SUBMITTED"}` on a SUBMITTED claim | 400 |
| USER_A (owner) | `UNDER_REVIEW`, `APPROVED`, `REJECTED`, `CLOSED` | 403 each |
| USER_B (not owner) | `UNDER_REVIEW` | 403 |
| USER_A, directly on the Claims Service (port 8080) | `UNDER_REVIEW` | refused ("Only admin users can update claim status") |
| no token | `UNDER_REVIEW` | 401 |
| JWT with one character of the signature edited | `UNDER_REVIEW` | 401 |
| USER_A's JWT with role edited to `ADMIN`, not re-signed | `UNDER_REVIEW` | 401 |
| ADMIN_1 cookies, no CSRF token | `UNDER_REVIEW` | 403 |

- **Required test data:** ADMIN_1, USER_A, USER_B, fresh `A1`, a helper that edits JWTs, CSRF token from `/api/csrf`.

### API-ADM-04 — One real-time event per change, only to the owner
- **Description:** The owner receives exactly one real-time event per decision, and no one else, including unauthenticated clients, receives it.
- **Prerequisite:** `A1` is SUBMITTED. WebSocket clients connected as USER_A and USER_B. An attempt to connect with no token.
- **Steps:**
  1. ADMIN_1 moves `A1` to `UNDER_REVIEW`.
  2. Collect events on all connections for 5 seconds.
  3. Repeat with CDC mode on (`APP_EVENTS_CDC_ENABLED=true`) and off.
- **Expected result:** USER_A gets exactly one event with claim ID, old status `SUBMITTED` and new status `UNDER_REVIEW`. USER_B gets none. The no-token connection is refused. Same in both modes: never zero events, never two.
- **Test data:** Claim `A1`.
- **Required test data:** ADMIN_1, USER_A, USER_B, fresh `A1`, a WebSocket test client with the users' tokens.

---

## Coverage Summary

| Area | Count | Positive | Negative | Boundary / data-driven | Security |
|------|-------|----------|----------|------------------------|----------|
| UI | 10 | 7 | 5 | 2 | 4 |
| API | 10 | 6 | 6 | 5 | 6 |

(A case can carry more than one type.)

Core scenario coverage:
- **Admin decision reflected to the owner:** UI-ADM-01/02/03, API-ADM-01/02, API-ADM-04
- **User sees only own claims:** UI-VIS-01/03, API-VIS-01/03
- **Admin sees all claims:** UI-VIS-02, API-VIS-02
- **Only admins can change status:** UI-ADM-04, API-ADM-03

## Automation Plan

- Each test creates its own claims through the API, using the seed table and a unique `<runId>`. Tests never depend on rows left by other tests.
- Tests that compare users use two or more browser contexts (admin, claimant, other claimant).
- Data tables become parameterised tests.
- The visibility and security cases (UI-VIS-01/03, API-VIS-01/03, API-ADM-03) and UI-ADM-01 run on every PR. The rest run nightly, in both event modes.
- Cases marked "record behaviour" (future incident date, 3-decimal amounts, `UNDER_REVIEW → SUBMITTED`) need a product-owner decision before the expected result is fixed.
