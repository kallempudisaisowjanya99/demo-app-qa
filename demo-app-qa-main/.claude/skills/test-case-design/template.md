# Test Case Design – <App or feature name>

Based on: <test strategy / requirements link>. <N> UI cases and <N> API cases.

## How to read a test case

| Field | Meaning |
|---|---|
| ID | Stable ID, used in automated test titles |
| Priority | P0 security or core rule · P1 main flow · P2 edge case · P3 cosmetic |
| Technique | Boundary, equivalence, state transition, data-driven, security, negative |
| Preconditions | What must be true before step 1 |
| Test data | Values used in the steps |
| Required test data | Users and records that must exist beforehand |
| Expected result | Exact, checkable outcome, including what must NOT happen |

## Environment and Conventions
- <URLs, browsers, how auth works, CSRF, expected error codes>

## Test Personas

| Persona | Role | Account | Notes |
|---|---|---|---|
| USER_A | … | … | … |
| USER_B | same role as USER_A | … | used to prove isolation |
| ADMIN_1 | … | … | … |

## Standard Seed Data

| Key | Owner | State | Notes |
|---|---|---|---|
| A1 | USER_A | … | description contains `<runId>` |

---

# Part 1 – UI Test Cases (<N>)

### UI-<AREA>-01 – <Title>
- **Priority:** P0 · **Technique:** <…>
- **Preconditions:** <…>
- **Steps:**
  1. <…>
  2. <…>
- **Test data:** <…>
- **Required test data:** <…>
- **Expected result:** <exact outcome; what is visible and what is not>

<For data-driven cases, add a table:>

| Field | Input | Expected |
|---|---|---|
| … | min−1 | blocked, error "…" |
| … | min | accepted |

---

# Part 2 – API Test Cases (<N>)

### API-<AREA>-01 – <Title>
- **Priority:** P0 · **Technique:** <…>
- **Endpoint:** `<METHOD> <path>` as <persona>
- **Preconditions:** <…>
- **Steps:**
  1. <request with body>
  2. <read back to check the side effects>
- **Test data:** <…>
- **Required test data:** <…>
- **Expected result:** <status code, body fields, error message; nothing changed after a refusal>

---

## Coverage Summary

| Area | Cases | Positive | Negative | Boundary / data-driven | Security |
|---|---|---|---|---|---|
| UI | … | … | … | … | … |
| API | … | … | … | … | … |

(A case can carry more than one type.)

Risk coverage: <risk → case IDs>

## Open Questions for the Product Owner
- <unclear rules marked "Record behaviour">

## Automation Plan
- <which cases run on every PR, which nightly; data set-up through the API; one browser context per user>
