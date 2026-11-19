# Test Strategy — Insurance Claims Management App

Scope: the Claims app (Next.js UI → BFF → Claims Service → PostgreSQL, with Keycloak, Redis, Kafka and optional Debezium CDC). See [ARCHITECTURE.md](ARCHITECTURE.md).

## 1. Objectives

Give confidence that a claimant can submit and track claims, an admin can process them correctly, and no user can see or change what they shouldn't, across all three tiers and the event pipeline.

## 2. Risk-Ranked Priorities

| # | Risk | Why it ranks here | Primary coverage |
|---|------|-------------------|------------------|
| R1 | **Authorization / data isolation**: a claimant reads or edits another user's claim, or a non-admin calls `/api/admin/*` or changes status | Security and privacy breach, regulatory impact. Roles are enforced in the BFF (JWT/cookie, CSRF) and again in the Claims Service use cases. | BFF RBAC integration, API tests per role, Playwright role journeys |
| R2 | **Claim lifecycle integrity**: illegal status transitions, lost updates, wrong audit data | Core business rule: `SUBMITTED→UNDER_REVIEW/REJECTED`, `UNDER_REVIEW→APPROVED/REJECTED/SUBMITTED`, `APPROVED/REJECTED→CLOSED`, `CLOSED` terminal (`ClaimStatus.canTransitionTo`). | Unit (full transition matrix), repository integration, API |
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

1. Claimant logs in, creates a claim, sees it as `SUBMITTED` in their list.
2. Admin logs in, sees the claim, moves `SUBMITTED→UNDER_REVIEW→APPROVED→CLOSED`; the claimant sees each status update live (WebSocket).
3. Admin rejects a claim; invalid transitions (e.g. `CLOSED→*`) are refused with a clear message.
4. Claimant cannot open an admin route or another user's claim (UI redirect and API 403/404).
5. Session expiry/refresh and logout invalidate access.
6. Dashboard stats change after a status change; flush-cache works.

## 6. Requirements Traceability

Each test carries a tag (`@R1`, `@R2`, …, or a requirement ID such as `CLM-STATUS-03`) in its name or annotation. The matrix below is maintained in this file and checked at review time.

| Requirement | Risk | Unit | Integration | Contract | API | E2E |
|-------------|------|------|-------------|----------|-----|-----|
| Create claim (valid and invalid input) | R2 | CreateClaimUseCase | ClaimRepositoryIT | POST /api/claims | 201/400/401/403 | Journey 1 |
| View own claims only | R1 | ListClaimsUseCase | RbacIT | GET /api/claims | claimant A vs B | Journey 4 |
| Admin lists all claims | R1 | ListAllClaimsUseCase | RbacIT | GET /api/admin/claims | 200 admin, 403 claimant | Journey 2 |
| Status transition rules | R2 | UpdateClaimStatusUseCase + full matrix | Postgres IT | PATCH …/status | 400 on illegal | Journeys 2-3 |
| Status change event reaches UI | R4 | DomainEventListener | Kafka IT | AsyncAPI schema | n/a | Journey 2 (both modes) |
| Login, refresh, logout, signup | R5 | LoginUseCase etc. | Keycloak IT | n/a | auth endpoints | Journey 5 |
| Dashboard stats and cache flush | R6 | GetDashboardStats | Redis IT | GET stats, POST flush-cache | admin-only | Journey 6 |
| CSRF and correlation ID propagation | R1/R5 | filters | RbacIT | headers | missing/invalid token | n/a |

## 7. Test Data Strategy

- **Users:** the two seeded Keycloak users (`admin@demo.com`, `claimant@demo.com`) plus tests that create extra users via the API with unique, timestamped emails. Credentials come from environment variables, not hardcoded in specs.
- **Claims:** each test creates its own claims through the API (not the UI) for setup, so tests are independent and parallel-safe. No test relies on pre-existing rows or ordering.
- **Status coverage:** helper factories create a claim in any target status by walking the legal transition path.
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
| Merge to main | push | all of the above, Pact provider verification, docker compose stack up, API tests, Playwright smoke (journeys 1, 2, 4), JaCoCo/Vitest coverage report | **blocking** |
| Nightly | schedule | full Playwright (Chromium + Firefox), both event modes (CDC off and on), k6 baseline, full status transition matrix | alert on failure |
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
