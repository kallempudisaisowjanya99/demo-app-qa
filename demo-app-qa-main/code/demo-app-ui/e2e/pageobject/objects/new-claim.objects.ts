import type { Locator, Page } from '@playwright/test';

/** Elements of the three-step "Submit New Claim" wizard. */
export class NewClaimObjects {
  readonly heading: Locator;
  // Step 1: Incident Details
  readonly incidentDateField: Locator;
  readonly incidentLocationField: Locator;
  readonly claimAmountField: Locator;
  // Step 2: Supporting Details
  readonly descriptionField: Locator;
  // Step 3: Review
  readonly reviewHeading: Locator;
  // Navigation. Scoped to <main>: the header and the Next.js dev overlay have buttons with similar names.
  readonly nextButton: Locator;
  readonly submitClaimButton: Locator;
  // Field error messages
  readonly fieldError: Locator;

  constructor(page: Page) {
    const main = page.getByRole('main');
    this.heading = page.getByRole('heading', { name: 'Submit New Claim' });
    this.incidentDateField = page.getByLabel(/When did the incident occur/);
    this.incidentLocationField = page.getByLabel(/Where did the incident occur/);
    this.claimAmountField = page.getByLabel(/Claim Amount/);
    this.descriptionField = page.getByLabel(/Describe what happened/);
    this.reviewHeading = page.getByRole('heading', { name: 'Review Your Claim' });
    this.nextButton = main.getByRole('button', { name: 'Next', exact: true });
    this.submitClaimButton = main.getByRole('button', { name: 'Submit Claim', exact: true });
    this.fieldError = page.getByRole('alert').filter({ hasText: /\S/ }).first();
  }
}
