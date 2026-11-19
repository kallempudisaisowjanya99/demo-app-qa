# Contract Testing — Claims App

Scope: the two API contracts in the Claims app and how they are protected against drift.
Related: risk **R3** in [TEST_STRATEGY.md](TEST_STRATEGY.md) ("BFF ↔ Claims Service contract drift").

> **Status: planned, not implemented.** Review feedback scored this area **0 / 5**: *"No Pact, OpenAPI or schema validation."* That is accurate. This document is the plan to close the gap: what will be tested, with which tool, in what order, and what "done" means.

---

## 1. Which contracts exist

| # | Consumer → Provider | Contract source | Risk if it drifts |
|---|---------------------|-----------------|-------------------|
| C1 | **BFF → Claims Service** | [`claims-api.yml`](code/claims-service/src/main/resources/openapi/claims-api.yml) | The BFF fails at runtime (500s, missing fields) with nothing failing at build time. Both sides are generated from OpenAPI, so a change to one side only can still compile. |
| C2 | **UI → BFF** | [`bff-api.yml`](code/bff-service/src/main/resources/openapi/bff-api.yml) | The UI's generated client (`src/lib/api/generated`) no longer matches what the BFF returns. Pages break or show wrong data. |

C1 is the higher-risk boundary: it is service-to-service, invisible to users until something breaks, and not covered by the E2E suite at field level.

## 2. What is already in the repo

The groundwork exists but has no tests on top of it.

| Asset | Where | Use |
|-------|-------|-----|
| Pact consumer (JUnit 5) `4.6.3` | `bff-service/pom.xml` | Consumer tests in the BFF |
| Pact provider (JUnit 5) `4.6.3` | `claims-service/pom.xml` | Provider verification in the Claims Service |
| Pact output folder | `bff-service/pom.xml` → `pact.rootDir = bff-service/pacts` | Where generated pact files land |
| `swagger-request-validator-core` | both POMs (test scope) | Validate requests/responses against OpenAPI |
| `json-schema-validator` | `claims-service/pom.xml` | JSON Schema checks |
| `contract-test` Spring profile | `application-contract-test.yml` in both services | Claims: H2 + Liquibase, no Kafka, no Keycloak. BFF: points at WireMock |
| `ContractTestSecurityConfiguration` | both services | Permits all requests and injects a fixed test JWT (`sub = 550e8400-…`) |
| WireMock stubs | `bff-service/mocks/claims-service-stubs/` | Claims Service responses per endpoint and status code, generated from the spec |

## 3. Approach — three layers

| Layer | Contract | Tool | Catches |
|-------|----------|------|---------|
| **L1. Response schema validation** | C2 (UI → BFF) | Playwright API tests + Ajv against `bff-api.yml` | BFF responses that don't match its own spec (wrong type, missing required field, unknown enum value) |
| **L2. Provider conforms to its spec** | C1 | `swagger-request-validator` on Claims Service MockMvc tests | Claims Service responses that don't match `claims-api.yml` |
| **L3. Consumer-driven contracts** | C1 | Pact (consumer: `bff-service`, provider: `claims-service`) | Claims Service changes that break what the BFF *actually uses*, even when the spec is still valid |

L1 and L2 check "does the implementation match the spec". L3 checks "does the provider still satisfy the real consumer". Both are needed: the spec can be correct while the BFF relies on a field or status code the spec does not guarantee.

### L1 — Schema validation in the Playwright API tests

- Load `bff-api.yml` once and resolve `$ref`s (e.g. `@apidevtools/swagger-parser`).
- Compile each operation's response schema with **Ajv** (`ajv-formats` for `uuid`, `date`, `date-time`).
- Add an `expectToMatchSchema(response, operationId, status)` helper in `e2e/commons/` and call it in every API test (`API-01` … `API-10`), for success **and** error responses (`ProblemDetail` for 400/401/403/404).
- Set `additionalProperties: false` during validation so new, undocumented fields are flagged too.

Cheapest layer to add, and it turns the existing 10 API tests into contract checks for C2.

### L2 — Claims Service validates its own responses

- Add `swagger-request-validator-mockmvc` (same `com.atlassian.oai` family as the existing core dependency).
- In existing controller/MockMvc tests, add `.andExpect(openApi().isValid("openapi/claims-api.yml"))`.
- Covers every documented status code, including validation errors (400) and conflicts (409 on `createUser`).

### L3 — Pact between BFF and Claims Service

**Consumer side (`bff-service`)**: one Pact test per Claims operation the BFF calls, using `PactConsumerTestExt` and the BFF's generated Claims client. Each test records the request and the *minimum* response the BFF depends on, using type matchers (`PactDslJsonBody`, `uuid()`, `decimalType()`, `stringMatcher` for enums), not fixed values. Running `mvn test` writes `bff-service/pacts/bff-service-claims-service.json`.

**Provider side (`claims-service`)**: one verification class.

```java
@Provider("claims-service")
@PactFolder("../bff-service/pacts")
@SpringBootTest(webEnvironment = RANDOM_PORT)
@ActiveProfiles("contract-test")
class ClaimsServicePactVerificationTest {

  @LocalServerPort int port;

  @BeforeEach
  void target(PactVerificationContext ctx) { ctx.setTarget(new HttpTestTarget("localhost", port)); }

  @TestTemplate
  @ExtendWith(PactVerificationInvocationContextProvider.class)
  void verify(PactVerificationContext ctx) { ctx.verifyInteraction(); }

  @State("a SUBMITTED claim exists for the test user")
  void submittedClaim() { /* insert via repository, owner = contract-test JWT sub */ }

  @State("no claim exists with id 00000000-0000-4000-8000-000000000000")
  void noClaim() { /* clean table */ }
}
```

The `contract-test` profile already supplies H2, Liquibase and a fixed JWT. Provider states seed data owned by that JWT's `sub`, so no Keycloak, Kafka or Postgres is needed.

Both services live in one repo, so pact files are shared by path (`@PactFolder`). No Pact Broker is needed now. Move to a broker (`@PactBroker`, `can-i-deploy`) only if the services are released separately.

## 4. Interactions to cover (C1)

The BFF calls **10** Claims Service operations. `updateClaim` (`PATCH /api/claims/{claimId}`) is in the spec but the BFF doesn't call it, so it has no consumer and is covered only by L2.

| Operation | Endpoint | Success | Error cases the BFF handles |
|-----------|----------|---------|-----------------------------|
| `createClaim` | `POST /api/claims` | 201 | 400 validation |
| `listClaims` | `GET /api/claims` | 200 | — |
| `getClaim` | `GET /api/claims/{claimId}` | 200 | 404 not found |
| `listAllClaims` | `GET /api/admin/claims` | 200 | — |
| `updateClaimStatus` | `PATCH /api/admin/claims/{claimId}/status` | 200 | 400 invalid transition, 404 not found |
| `getDashboardStats` | `GET /api/admin/dashboard/stats` | 200 | — |
| `flushDashboardCache` | `POST /api/admin/dashboard/flush-cache` | 204 | — |
| `listAllUsers` | `GET /api/users` | 200 | — |
| `createUser` | `POST /api/users` | 201 | 409 user exists |
| `getUser` | `GET /api/users/{userId}` | 200 | 404 not found |

Roughly 16 interactions. Every 4xx interaction asserts the `ProblemDetail` shape (`type`, `title`, `status`, `detail`).

**Out of Pact scope:** 401/403. The `contract-test` profile permits all requests, so authorization can't be verified there. Those cases stay in `RbacIntegrationTest` and Playwright `API-06`, `API-07` and `API-10`.

## 5. CI placement

Matches the pipeline in [TEST_STRATEGY.md §9](TEST_STRATEGY.md).

| Stage | Runs | Blocking |
|-------|------|----------|
| Every PR | L1 (with the API tests), L2, Pact consumer tests (regenerate pact file) | Yes |
| Merge to `main` | Pact provider verification against the freshly generated pact | Yes |
| Spec change (`*.yml` under `openapi/`) | Regenerate WireMock stubs and UI client; run all three layers | Yes |

A PR that changes `claims-api.yml` or a Claims controller cannot merge if it breaks a BFF interaction.

## 6. Delivery order

| Step | Work | Closes |
|------|------|--------|
| 1 | L1: Ajv helper + schema check in all 10 Playwright API tests | "No OpenAPI / schema validation" for C2 |
| 2 | Pact consumer tests for `getClaim`, `createClaim`, `updateClaimStatus` (highest-risk paths) + provider verification with states | "No Pact" |
| 3 | Remaining 7 operations and their error interactions | Full C1 coverage |
| 4 | L2: OpenAPI validation on Claims Service MockMvc tests | Provider-side spec conformance |
| 5 | Wire into CI as in §5 | Drift blocked at PR time |

## 7. Definition of done

- Every BFF → Claims call has at least one Pact interaction, plus one per handled error status.
- Provider verification passes on `main` and fails the build on any mismatch.
- Every Playwright API test validates its response body against `bff-api.yml`.
- Claims Service MockMvc tests validate responses against `claims-api.yml`.
- A deliberate break (rename a field in `ClaimResponse`, change an enum value, change a 404 to 400) is caught by at least one layer. Run it once as proof and record the result.
