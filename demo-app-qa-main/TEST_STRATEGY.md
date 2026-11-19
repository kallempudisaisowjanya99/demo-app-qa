# Test Strategy — Insurance Claims Management App

Scope: the Claims app (Next.js UI → BFF → Claims Service → PostgreSQL, with Keycloak, Redis, Kafka and optional Debezium CDC). See [ARCHITECTURE.md](ARCHITECTURE.md).

## 1. Objectives

Give confidence that a claimant can submit and track claims, an admin can process them correctly, and no user can see or change what they shouldn't, across all three tiers and the event pipeline.

## 2. Risk-Ranked Priorities

| # | Risk | Why it ranks here | Primary coverage |
|---|------|-------------------|------------------|
| R1 | **Authorization / data isolation**: a claimant sees or edits another user's claim, admin data reaches a claimant, an admin can't see all claims, or a non-admin changes status | Security and privacy breach, regulatory impact. Roles are enforced in the BFF (JWT/cookie, CSRF) and again in the Claims Service use cases. Tested with two claimants and two admins, so one user's data is checked against another's. | BFF RBAC integration, API-VIS-01/02/03, API-ADM-03, UI-VIS-01/02/03 |
| R2 | **Claim lifecycle integrity**: illegal status transitions, an admin's decision not reaching the claim's owner, a decision changing the wrong claim | Core business rule: `SUBMITTED→UNDER_REVIEW/REJECTED`, `UNDER_REVIEW→APPROVED/REJECTED/SUBMITTED`, `APPROVED/REJECTED→CLOSED`, `CLOSED` terminal (`ClaimStatus.canTransitionTo`). After an approval or rejection the owner must see the new status. | Unit (full transition matrix), repository integration, API-ADM-01/02, UI-ADM-01/02/03/04 |
| R3 | **BFF ↔ Claims Service contract drift**: generated DTOs/clients diverge from OpenAPI | Both sides are generated from OpenAPI, and a silent break only shows at runtime. | Pact consumer/provider, schema checks, WireMock stubs in `bff-service/mocks` |
| R4 | **Event delivery**: status change not pushed to the UI, or pushed twice | Two modes exist (direct Kafka vs Debezium CDC). Running both duplicates notifications, and `app.events.cdc-enabled` defaults differ between code (`true`) and compose (`false`). | Testcontainers Kafka integration, WebSocket tests, one E2E per mode |
| R5 | Authentication session handling: login, refresh, logout, signup, token expiry | Entry point for every journey. | Unit (exists), integration against Keycloak, E2E |
| R6 | Dashboard stats / cache correctness (Redis) | Stale or wrong numbers mislead admins, and `flush-cache` must work. | Integration, API |
| R7 | Performance under list/dashboard load | Lower business impact for a demo-scale system. | Light k6 baseline |

## 3. Scope

**In scope:** claim create/read/list/update, admin claim list and status change, dashboard stats and cache flush, user create/get/list, login/signup/refresh/logout, CSRF, correlation IDs, WebSocket notifications, DB migrations (Liquibase), both event modes.

**Out of scope:** Keycloak internals and its admin console, Kafka/Postgres/Redis/Debezium product behaviour, Kafka UI, browser/device matrix beyond latest Chromium (plus Firefox smoke), accessibility audit, penetration testing, production hardening (the architecture notes call this out as a demo environment), file/attachment handling (not present).

## 4. Test Levels and Pyramid

```
          /\      E2E (Playwright)         ~10-15 journeys   slowest, full stack
         /  \     Contract (Pact)          every BFF→Claims endpoint
        /----\    Integration (Testcontainers)   Postgres, Kafka, Redis, Keycloak
       /------\   API tests (REST-assured / Playwright request)   per role, per status code
      /--------\  Unit (JUnit5/Mockito/AssertJ, Vitest/Testing Library)   bulk of tests
```

| Level | Tooling | Target | Status today |
|-------|---------|--------|--------------|
| Unit | JUnit 5, Mockito, AssertJ; Vitest | Domain rules, use cases, mappers, adapters, UI components/stores | Provided; one broken test is known to exist, so fix it first (the `UpdateClaimStatusUseCaseTest` area is the first suspect) |
| Architecture | ArchUnit | Hexagonal layering in both services | Provided |
| Integration | Testcontainers (Postgres, Kafka, Redis), Spring Boot Test | Repositories + Liquibase, Kafka publish/consume, cache, RBAC | Partially present (`ClaimRepositoryIntegrationTest`, `RbacIntegrationTest`, `ClaimEventKafkaConsumerIntegrationTest`); extend |
| Contract | Pact (consumer: BFF, provider: Claims Service), `contract-test` profiles | All endpoints and error responses (400/401/403/404/409/500) | Scaffolded, empty |
| API | Swagger-driven checks against running stack | Role matrix, validation, error shape (ProblemDetail) | To build |
| E2E | Playwright (`demo-app-ui/playwright.config.ts`) | Journeys below | Scaffolded, empty |
| Non-functional | k6 | Baseline latency/throughput | To build |
| Manual / exploratory | Charters | Usability, odd state combinations | Per release |

Guideline: push every check to the lowest level that can prove it. E2E only covers what needs the whole stack.

## 5. Key E2E Journeys

The detailed cases are in [TEST_CASES.md](TEST_CASES.md): 10 UI and 10 API tests, each mixing positive, negative, boundary, data-driven and security checks. The journeys they implement:

1. A claimant raises a claim and sees it as `SUBMITTED` (UI-CLM-01, UI-CLM-02).
2. An admin approves or rejects it, and the owner sees the new status live, after a refresh and after a re-login (UI-ADM-01/02/03).
3. Only legal next statuses are offered, and illegal transitions are refused (UI-ADM-04, API-ADM-02).
4. A claimant sees only their own claims, an admin sees every claimant's claims, and a claimant can't open admin pages or another user's claim (UI-VIS-01/02/03, API-VIS-01/02/03).
5. A decision changes only the target claim, and its event reaches only the owner (API-ADM-01, API-ADM-04).
6. Login is covered by one smoke test (UI-AUTH-01). Deeper session testing is lower priority.

Dashboard stats and flush-cache (R6) are covered by lower-level tests for now and can be added as a later API case.

## 6. Requirements Traceability

Each automated test carries its case ID from TEST_CASES.md in its title (for example `UI-ADM-01`). The matrix below maps requirements to those IDs and is checked at review time.

| Requirement | Risk | Unit | Integration | Contract | API case | UI case |
|-------------|------|------|-------------|----------|----------|---------|
| Create claim (valid and invalid input) | R2 | CreateClaimUseCase | ClaimRepositoryIT | POST /api/claims | API-CLM-01, 02, 03 | UI-CLM-01, 02 |
| User sees only own claims | R1 | ListClaimsUseCase | RbacIT | GET /api/claims | API-VIS-01, 03 | UI-VIS-01, 03 |
| Admin sees all users' claims | R1 | ListAllClaimsUseCase | RbacIT | GET /api/admin/claims | API-VIS-02 | UI-VIS-02 |
| Admin approves or rejects; owner sees the result | R2 | UpdateClaimStatusUseCase | Postgres IT | PATCH …/status | API-ADM-01 | UI-ADM-01, 02, 03 |
| Status transition rules | R2 | full transition matrix | Postgres IT | PATCH …/status (400) | API-ADM-02 | UI-ADM-04 |
| Only admins can change status; forged requests refused | R1 | UpdateClaimStatusUseCase (non-admin) | RbacIT | 401/403 responses | API-ADM-03 | UI-VIS-03 |
| Status event reaches only the owner, once | R4 | DomainEventListener | Kafka IT | AsyncAPI schema | API-ADM-04 | UI-ADM-03 |
| Server sets claim status and owner | R1/R2 | CreateClaimUseCase | – | POST /api/claims | API-CLM-03 | – |
| Script text in claims is displayed as text | R1 | – | – | – | – | UI-CLM-02 |
| Login | R5 | LoginUseCase etc. | Keycloak IT | – | – | UI-AUTH-01 |
| Dashboard stats and cache flush | R6 | GetDashboardStats | Redis IT | GET stats, POST flush-cache | not yet covered | not yet covered |

## 7. Test Data Strategy

- **Users (personas):** authorization is tested with different accounts of the same role, not with wrong passwords. `ADMIN_1` and `USER_A` are the seeded users (`admin@demo.com`, `claimant@demo.com`). `USER_B` and `USER_C` are claimants created through signup with unique, timestamped emails. `ADMIN_2` is a second admin created in Keycloak and registered in the Claims Service (`POST /api/users` with the admin role), which still has to be verified because signup only creates claimants. Credentials come from environment variables, not hardcoded in specs.
- **Standard seed claims:** five claims created through the API before each suite: `A1`, `A2` (USER_A, SUBMITTED), `A3` (USER_A, APPROVED), `B1` (USER_B, SUBMITTED), `B2` (USER_B, REJECTED). Each description contains a unique `<runId>`, so tests don't collide and a leak between users is easy to spot. The exact values are in TEST_CASES.md.
- **Claims:** each test creates its own claims through the API (not the UI) for setup, so tests are independent and parallel-safe. No test relies on pre-existing rows or ordering.
- **Status coverage:** helper factories create a claim in any target status by walking the legal transition path.
- **Each test case lists its own data:** TEST_CASES.md gives the values used (test data) and what must exist beforehand (required test data) for every case.
- **Isolation:** Testcontainers give a fresh DB per integration suite. E2E runs use a unique prefix per run and clean up their claims in teardown. `stop-infra.sh -v` resets the shared environment.
- **Contract/mocks:** BFF component tests use the WireMock stubs in `bff-service/mocks/claims-service-stubs`, regenerated when the OpenAPI changes.
- **Boundary data:** empty, max-length and unicode text, zero or negative amounts, and invalid UUIDs.
- **No real personal data**, only synthetic values.

## 8. Entry and Exit Criteria

**Entry (start a test cycle when):**
- The build is green: `mvn verify` (including Checkstyle/PMD) and `npm test` pass.
- The stack starts via `start-infra.sh` and `start-app.sh`, and `/actuator/health` is UP on 8080 and 8090.
- Keycloak realm and seed users are available.
- The OpenAPI spec version under test is frozen and the generated clients are up to date.

**Exit (release is acceptable when):**
- 100% of P0/P1 tests (R1-R4) pass. No open Critical or High defects.
- No known flaky tests left unquarantined (a test that fails then passes on retry is logged and fixed, not ignored).
- Line coverage of the domain and application layers is at least 80% (JaCoCo), and Vitest coverage on `features/` at least 70%.
- All Pact contracts verified on the provider side.
- Every R1-R4 requirement in section 6 has at least one automated test.
- Remaining Medium/Low defects are triaged with owners.

**Suspension:** stop testing if the stack won't start, Keycloak login fails for the seeded users, or more than 20% of smoke tests fail.

## 9. CI/CD Plan

| Stage | Trigger | Runs | Gate |
|-------|---------|------|------|
| Pre-commit | local | lint, unit tests for changed module | advisory |
| PR | every PR | build, Checkstyle/PMD, unit + ArchUnit (both services, UI), Pact consumer tests, Testcontainers integration | **blocking** |
| Merge to main | push | all of the above, Pact provider verification, docker compose stack up, the visibility and security cases (UI-VIS-01/03, API-VIS-01/03, API-ADM-03), the approval case UI-ADM-01, JaCoCo/Vitest coverage report | **blocking** |
| Nightly | schedule | all 10 UI and 10 API cases in Chromium (UI smoke in Firefox), both event modes (CDC off and on, for API-ADM-04 and UI-ADM-03), k6 baseline, full status transition matrix (API-ADM-02) | alert on failure |
| Pre-release | manual | exploratory charters, regression of open defects | sign-off |

Practices: Playwright traces, screenshots and reports and JUnit XML are kept as artifacts. A failed E2E test is retried once, and a retry that passes is reported as flaky. Test results are published per run.

## 10. Defect Management

Severity: Critical (security, data loss, cannot log in or submit), High (core flow broken, no workaround), Medium (workaround exists), Low (cosmetic). Each defect gets repro steps, expected vs actual result, environment, correlation ID from the logs and a linked test.

## 11. Environments

| Env | Purpose | Notes |
|-----|---------|-------|
| Local / CI | Unit, integration (Testcontainers), contract | Docker needed |
| Compose stack | API + E2E | `docker-compose.infra.yml` + `docker-compose.apps.yml`; `docker-compose.cdc.yml` for CDC mode |

## 12. Known Observations To Probe First

- `ClaimStatus` allows `UNDER_REVIEW → SUBMITTED` (a backward move). Confirm whether that is intended before writing the matrix test.
- `UpdateClaimStatusUseCase` defaults `app.events.cdc-enabled` to `true`, while compose sets `false`. Test both and check that no duplicate or missing events occur.
- The status-change metric tags `adminUserId` on a counter, which creates unbounded metric cardinality (a non-functional finding to log).
- The README notes a deliberately broken unit test. Fix it before baselining coverage.

## 13. Roles and Reporting

The QA owner maintains this document and the traceability matrix. Developers own unit tests for their changes. A short summary (pass/fail by risk, defects, coverage, flaky list) is produced after each nightly and each release candidate.
