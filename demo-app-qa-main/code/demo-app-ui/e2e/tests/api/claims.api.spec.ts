import { bodyOf, seedClaim } from '../../commons/api-client';
import { expectArraySchema, expectSchema } from '../../commons/api-schema';
import { ApiRoute, ClaimLimits, ClaimStatus, HttpStatus } from '../../commons/constants';
import { expect, test } from '../../fixtures/fixtures';
import type { ClaimResponse, CreateClaimRequest } from '../../commons/api-types';
import { isoDateFromToday } from '../../utils/date.utils';
import { textOfLength } from '../../utils/string.utils';
import { REQUIRED_CLAIM_FIELDS, buildClaim, withoutField } from '../../testdata/claim.data';

/**
 * 10 API tests against the BFF (http://localhost:8090).
 * Each test creates its own claims, so tests do not depend on each other.
 * Every successful response body is checked against its schema in bff-api.yml
 * (the helpers in commons/api-client.ts do this too), and so is every 400 error body.
 * 401 and 403 responses have an empty body today (the spec documents ProblemDetail),
 * so for those the tests check only that no claim data leaks.
 * The tag on each test is its test case ID in TEST_CASES.md.
 */

/** Values that break exactly one rule of SubmitClaimRequest each. */
const INVALID_VALUES: readonly { readonly rule: string; readonly change: Record<string, unknown> }[] = [
  { rule: 'description 9 characters (min 10)', change: { description: textOfLength(ClaimLimits.description.min - 1) } },
  { rule: 'location 4 characters (min 5)', change: { incidentLocation: textOfLength(ClaimLimits.location.min - 1) } },
  { rule: 'amount 1,000,000.01 (max 1,000,000)', change: { claimAmount: ClaimLimits.amount.max + 0.01 } },
  { rule: 'amount 0 (min 0.01)', change: { claimAmount: 0 } },
  { rule: 'amount as text "five"', change: { claimAmount: 'five' } },
];

test.describe('Claims API: create', () => {
  test(
    'API-01: a claimant creates a valid claim; it starts SUBMITTED, matches the schema and reads back unchanged',
    { tag: '@API-CLM-01' },
    async ({ claimantApi }) => {
      const payload = buildClaim('API-01');

      const response = await claimantApi.create(payload);

      expect(response.status()).toBe(HttpStatus.Created);
      const created = await bodyOf<ClaimResponse>(response);
      expectSchema(created, 'ClaimResponse');
      expect(created.status).toBe(ClaimStatus.Submitted);
      expect(created).toMatchObject({ ...payload });

      const readBack = await claimantApi.getOk(created.claimId);
      expect(readBack).toMatchObject({ ...payload, status: ClaimStatus.Submitted, claimId: created.claimId });
    },
  );

  test(
    'API-02: invalid field values are rejected with 400 and a ProblemDetail body, and no claim is created',
    { tag: '@API-CLM-02' },
    async ({ claimantApi }) => {
      test.info().annotations.push({
        type: 'known defect',
        description:
          'A wrong JSON type (claimAmount "five") gets 400 with the Spring default error body {timestamp,status,error,path}, ' +
          'not the ProblemDetail that bff-api.yml documents. The schema check is kept strict on purpose.',
      });
      const sent: CreateClaimRequest[] = [];

      for (const { rule, change } of INVALID_VALUES) {
        await test.step(rule, async () => {
          const payload = { ...buildClaim('API-02'), ...change } as CreateClaimRequest;
          sent.push(payload);

          const response = await claimantApi.create(payload);

          expect.soft(response.status(), rule).toBe(HttpStatus.BadRequest);
          expectSchema(await response.json(), 'ProblemDetail', { soft: true });
        });
      }

      const myDescriptions = (await claimantApi.listOk()).map((claim) => claim.description);
      for (const payload of sent) {
        expect(myDescriptions).not.toContain(payload.description);
      }
    },
  );

  test(
    'API-03: a request missing any required field, or with an empty body, is rejected with 400 and creates nothing',
    { tag: '@API-CLM-02' },
    async ({ claimantApi }) => {
      const complete = buildClaim('API-03');

      for (const field of REQUIRED_CLAIM_FIELDS) {
        await test.step(`without ${field}`, async () => {
          const response = await claimantApi.create(withoutField(complete, field));

          expect.soft(response.status(), `missing ${field}`).toBe(HttpStatus.BadRequest);
          expectSchema(await response.json(), 'ProblemDetail', { soft: true });
        });
      }
      await test.step('empty body {}', async () => {
        const response = await claimantApi.create({});

        expect.soft(response.status(), 'empty body').toBe(HttpStatus.BadRequest);
        expectSchema(await response.json(), 'ProblemDetail', { soft: true });
      });

      const myDescriptions = (await claimantApi.listOk()).map((claim) => claim.description);
      expect(myDescriptions).not.toContain(complete.description);
    },
  );

  test(
    'API-04: an incident date in the future is rejected with 400 and no claim is created',
    { tag: '@API-CLM-02' },
    async ({ claimantApi }) => {
      test.info().annotations.push({
        type: 'known defect',
        description:
          'The Claims Service answers 400, but the BFF wraps it and returns 500 (DEF-01, Medium, so not in defects.md). ' +
          'The test keeps expecting 400, as the OpenAPI spec says.',
      });
      const payload = buildClaim('API-04', { incidentDate: isoDateFromToday(7) });

      const response = await claimantApi.create(payload);

      expect(response.status()).toBe(HttpStatus.BadRequest);
      const myClaims = await claimantApi.listOk();
      expect(myClaims.map((claim) => claim.description)).not.toContain(payload.description);
    },
  );
});

test.describe('Claims API: access control', () => {
  test(
    'API-05: a claimant lists their own claims (schema-valid) and never someone else’s',
    { tag: '@API-VIS-01' },
    async ({ claimantApi, otherUserApi }) => {
      const mine = await seedClaim(claimantApi, 'API-05-mine');
      const someoneElses = await seedClaim(otherUserApi, 'API-05-other');

      const response = await claimantApi.list();

      expect(response.status()).toBe(HttpStatus.Ok);
      const claims: unknown = await response.json();
      expectArraySchema(claims, 'ClaimSummaryResponse');
      const ids = (claims as { claimId: string }[]).map((claim) => claim.claimId);
      expect(ids).toContain(mine.claimId);
      expect(ids).not.toContain(someoneElses.claimId);
    },
  );

  test(
    'API-06: a claimant cannot read the admin claim list (403, no claim data in the response)',
    { tag: '@API-VIS-01' },
    async ({ claimantSession }) => {
      const response = await claimantSession.send('GET', ApiRoute.adminClaims);

      expect(response.status()).toBe(HttpStatus.Forbidden);
      expect(await response.text(), 'a refused request must not leak claims').not.toContain('claimId');
    },
  );

  test(
    'API-07: a request without login is refused (401, no claim data in the response)',
    { tag: '@API-VIS-01' },
    async ({ anonymousSession }) => {
      const response = await anonymousSession.send('GET', ApiRoute.claims);

      expect(response.status()).toBe(HttpStatus.Unauthorized);
      expect(await response.text(), 'a refused request must not leak claims').not.toContain('claimId');
    },
  );
});

test.describe('Claims API: admin status changes', () => {
  test(
    'API-08: the admin moves a claim SUBMITTED → UNDER_REVIEW → APPROVED and the owner sees APPROVED',
    { tag: '@API-ADM-01' },
    async ({ claimantApi, adminApi }) => {
      const claim = await seedClaim(claimantApi, 'API-08');

      await adminApi.updateStatusOk(claim.claimId, ClaimStatus.UnderReview);
      await adminApi.updateStatusOk(claim.claimId, ClaimStatus.Approved);

      expect((await claimantApi.getOk(claim.claimId)).status).toBe(ClaimStatus.Approved);
    },
  );

  test(
    'API-09: an illegal change (SUBMITTED → APPROVED) is refused and the claim is unchanged',
    { tag: '@API-ADM-02' },
    async ({ claimantApi, adminApi }) => {
      test.info().annotations.push({
        type: 'known defect',
        description: 'The API answers 500 here; its OpenAPI spec says 400. This test checks the refusal, not the code.',
      });
      const claim = await seedClaim(claimantApi, 'API-09');

      const response = await adminApi.updateStatus(claim.claimId, ClaimStatus.Approved);

      expect(response.ok(), `illegal change must be refused, got HTTP ${response.status()}`).toBe(false);
      expect((await claimantApi.getOk(claim.claimId)).status).toBe(ClaimStatus.Submitted);
    },
  );

  test(
    'API-10: a status change without the CSRF token is forbidden (403) and changes nothing',
    { tag: '@API-ADM-03' },
    async ({ claimantApi, adminApi }) => {
      const claim = await seedClaim(claimantApi, 'API-10');

      const response = await adminApi.updateStatus(claim.claimId, ClaimStatus.UnderReview, false);

      expect(response.status()).toBe(HttpStatus.Forbidden);
      expect((await claimantApi.getOk(claim.claimId)).status).toBe(ClaimStatus.Submitted);
    },
  );
});
