import { seedClaim } from '../../commons/api-client';
import { ClaimLimits, ClaimStatus, STATUS_LABEL, UiRoute } from '../../commons/constants';
import { formatUiCurrency } from '../../utils/currency.utils';
import { isoDateFromToday } from '../../utils/date.utils';
import { textOfLength } from '../../utils/string.utils';
import { env } from '../../env';
import { expect, test } from '../../fixtures/fixtures';
import { ClaimsPage } from '../../pageobject/pages/claims.page';
import { UI_CLAIM_FORM, uniqueDescription } from '../../testdata/claim.data';
import { WRONG_PASSWORD } from '../../testdata/login.data';

/**
 * 10 browser tests against the UI (http://localhost:3001).
 * Claims needed as set-up are created through the API, which is faster and more reliable than the UI.
 */

test.describe('Login', () => {
  test('UI-01: a wrong password is refused and the user stays on the login page', async ({ loginPage }) => {
    await loginPage.open();

    await loginPage.signIn({ email: env.claimant.email, password: WRONG_PASSWORD });

    await loginPage.expectRefused();
  });

  test('UI-02: a claimant signs in, lands on My Claims, and can log out', async ({ loginPage, page }) => {
    await loginPage.signInExpectingSuccess(env.claimant);
    const claims = new ClaimsPage(page);
    await claims.expectLoaded();

    await claims.logout();

    await expect(loginPage.el.heading).toBeVisible();
  });

  test('UI-03: opening My Claims without signing in redirects to login and remembers the page', async ({ page }) => {
    await page.goto(UiRoute.claims);

    await expect(page).toHaveURL(/\/login\?redirect=%2Fclaims$/);
  });
});

test.describe('Submit a claim', () => {
  test('UI-04: a claimant submits a claim through the wizard and sees it as Submitted with the entered values', async ({
    claimant,
  }) => {
    const form = {
      incidentDate: isoDateFromToday(-UI_CLAIM_FORM.daysAgo),
      incidentLocation: UI_CLAIM_FORM.incidentLocation,
      claimAmount: UI_CLAIM_FORM.claimAmount,
      description: uniqueDescription('UI-04'),
    };

    const claimId = await claimant.newClaim.raiseClaim(form);

    await claimant.claims.expectClaimListed(claimId);
    await claimant.claims.expectStatus(claimId, ClaimStatus.Submitted);
    await claimant.claims.openDetails(claimId);
    await claimant.claims.expectDetails({
      'Claim ID': claimId,
      Status: STATUS_LABEL.SUBMITTED,
      'Incident Location': form.incidentLocation,
      Description: form.description,
      'Claim Amount': formatUiCurrency(Number(form.claimAmount)),
    });
  });

  test('UI-05: a location shorter than 5 characters is rejected on step 1', async ({ claimant }) => {
    await claimant.newClaim.open();

    await claimant.newClaim.fillIncidentDetails({
      incidentDate: isoDateFromToday(-UI_CLAIM_FORM.daysAgo),
      incidentLocation: textOfLength(ClaimLimits.location.min - 1),
      claimAmount: UI_CLAIM_FORM.smallAmount,
    });

    await claimant.newClaim.expectFieldRejected(claimant.newClaim.el.incidentLocationField);
  });

  test('UI-06: a description shorter than 10 characters is rejected on step 2', async ({ claimant }) => {
    await claimant.newClaim.open();
    await claimant.newClaim.fillIncidentDetails({
      incidentDate: isoDateFromToday(-UI_CLAIM_FORM.daysAgo),
      incidentLocation: UI_CLAIM_FORM.incidentLocation,
      claimAmount: UI_CLAIM_FORM.smallAmount,
    });
    await claimant.newClaim.goToDescriptionStep();

    await claimant.newClaim.el.descriptionField.fill(textOfLength(ClaimLimits.description.min - 1));

    await claimant.newClaim.expectFieldRejected(claimant.newClaim.el.descriptionField);
  });
});

test.describe('Who sees what', () => {
  test('UI-07: My Claims shows the claimant’s own claim and not someone else’s', async ({
    claimant,
    claimantApi,
    otherUserApi,
  }) => {
    const mine = await seedClaim(claimantApi, 'UI-07-mine');
    const someoneElses = await seedClaim(otherUserApi, 'UI-07-other');

    await claimant.claims.open();

    await claimant.claims.expectClaimListed(mine.claimId);
    await claimant.claims.expectClaimNotListed(someoneElses.claimId);
  });

  test('UI-08: a claimant who opens the admin claims page is sent back to My Claims', async ({ claimant }) => {
    await claimant.page.goto(UiRoute.adminClaims);

    await claimant.claims.expectLoaded();
  });
});

test.describe('Admin status changes', () => {
  test('UI-09: the admin moves a claim to Under Review and the claimant sees the new status', async ({
    admin,
    claimant,
    claimantApi,
  }) => {
    const claim = await seedClaim(claimantApi, 'UI-09');
    await admin.adminClaims.open(claim.claimId);

    await admin.adminClaims.changeStatus(claim.claimId, ClaimStatus.UnderReview);

    await claimant.claims.open();
    await claimant.claims.expectStatus(claim.claimId, ClaimStatus.UnderReview);
  });

  test('UI-10: for a Submitted claim the admin is offered only Under Review and Rejected', async ({
    admin,
    claimantApi,
  }) => {
    const claim = await seedClaim(claimantApi, 'UI-10');
    await admin.adminClaims.open(claim.claimId);

    const offered = await admin.adminClaims.offeredStatuses(claim.claimId);

    expect(offered.sort()).toEqual([STATUS_LABEL.REJECTED, STATUS_LABEL.UNDER_REVIEW].sort());
  });
});
