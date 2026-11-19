# Test Strategy – <App name>

Scope: <one line: the app and its main parts>. See <link to architecture doc>.

## 1. Objectives
<2–3 sentences: what confidence this testing must give, and for whom.>

## 2. Risk-Ranked Priorities

| # | Risk | Why it ranks here | Primary coverage |
|---|---|---|---|
| R1 | <highest risk> | <impact and likelihood, with the real rule, file or config behind it> | <test levels and case IDs> |
| R2 | … | … | … |

## 3. Scope
**In scope:** <features, APIs, flows, non-functional areas>
**Out of scope:** <what is not tested, and why>
**Assumptions:** <assumptions made where the input was silent>

## 4. Test Levels and Pyramid

```
        /\      E2E (end-to-end)       few, slowest, full stack
       /  \     Contract               every service-to-service call
      /----\    Integration            real DB, broker, cache, auth
     /------\   API                    per role, per status code
    /--------\  Unit                   most tests
```

| Level | Tooling | Target | Status today |
|---|---|---|---|
| Unit | … | … | … |
| Integration | … | … | … |
| Contract | … | … | … |
| API | … | … | … |
| E2E | … | … | … |
| Non-functional | … | … | … |
| Manual / exploratory | … | … | … |

Guideline: put every check at the lowest level that can prove it.

## 5. Key E2E Journeys
1. <journey, with the case IDs that implement it>

## 6. Requirements Traceability

| Requirement | Risk | Unit | Integration | Contract | API case | UI case |
|---|---|---|---|---|---|---|
| … | R1 | … | … | … | … | … |

## 7. Test Data Strategy
- **Users / personas:** <accounts per role; at least two users of the same role to test isolation>
- **How data is created:** <through the API, factories, seeds; a unique run ID>
- **Isolation and cleanup:** <per test or per suite; teardown; environment reset>
- **Boundary data:** <limits, empty values, unicode, invalid IDs>
- **No real personal data.**

## 8. Entry and Exit Criteria
**Entry:** <build green, stack healthy, test users available, spec frozen>
**Exit:** <pass rate by priority, no open Critical/High defects, coverage %, no unquarantined flaky tests>
**Suspension:** <when to stop testing>

## 9. CI/CD Plan

| Stage | Trigger | Runs | Gate |
|---|---|---|---|
| Pre-commit | local | … | advisory |
| PR | every PR | … | **blocking** |
| Merge to main | push | … | **blocking** |
| Nightly | schedule | … | alert |
| Pre-release | manual | … | sign-off |

## 10. Defect Management
Severity: Critical (<definition>), High (<definition>), Medium (<definition>), Low (<definition>).
Each defect has an ID, steps, expected and actual result, severity, environment, screenshot or log, and a linked test.

## 11. Environments

| Env | Purpose | Notes |
|---|---|---|
| … | … | … |

## 12. Known Observations To Probe First
- <suspicious behaviour or config found while reading the code>

## 13. Roles and Reporting
<who owns what, and what report is produced and when>
