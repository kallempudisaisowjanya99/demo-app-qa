import { expect, type Locator, type Page } from '@playwright/test';
import { UiRoute } from '../../commons/constants';
import { NewClaimObjects } from '../objects/new-claim.objects';
import { BasePage } from './base.page';

export interface ClaimForm {
  readonly incidentDate: string;
  readonly incidentLocation: string;
  readonly claimAmount: string;
  readonly description: string;
}

const CLAIM_ID_IN_SUCCESS_TOAST = /Claim ID: ([0-9a-f]{8}-[0-9a-f-]{27})/;

/** The three-step "Submit New Claim" wizard. */
export class NewClaimPage extends BasePage {
  readonly el: NewClaimObjects;

  constructor(page: Page) {
    super(page);
    this.el = new NewClaimObjects(page);
  }

  async open(): Promise<void> {
    await this.page.goto(UiRoute.newClaim);
    await expect(this.el.heading).toBeVisible();
    await expect(this.el.incidentDateField).toBeVisible();
  }

  async fillIncidentDetails(form: Pick<ClaimForm, 'incidentDate' | 'incidentLocation' | 'claimAmount'>): Promise<void> {
    await this.el.incidentDateField.fill(form.incidentDate);
    await this.el.incidentLocationField.fill(form.incidentLocation);
    await this.el.claimAmountField.fill(form.claimAmount);
  }

  async goToDescriptionStep(): Promise<void> {
    await expect(this.el.nextButton).toBeEnabled();
    await this.el.nextButton.click();
    await expect(this.el.descriptionField).toBeVisible();
  }

  async goToReviewStep(): Promise<void> {
    await expect(this.el.nextButton).toBeEnabled();
    await this.el.nextButton.click();
    await expect(this.el.reviewHeading).toBeVisible();
  }

  /** Submits the reviewed claim; returns the id from the success message. */
  async submit(): Promise<string> {
    await this.el.submitClaimButton.click();
    const toast = this.common.toast('Claim submitted successfully').first();
    await expect(toast).toBeVisible();
    const claimId = CLAIM_ID_IN_SUCCESS_TOAST.exec(await toast.innerText())?.[1];
    if (claimId === undefined) {
      throw new Error('The success message did not contain a claim id');
    }
    await expect(this.page).toHaveURL(new RegExp(`${UiRoute.claims}$`));
    return claimId;
  }

  /** Fills all three steps and submits; returns the new claim id. */
  async raiseClaim(form: ClaimForm): Promise<string> {
    await this.open();
    await this.fillIncidentDetails(form);
    await this.goToDescriptionStep();
    await this.el.descriptionField.fill(form.description);
    await this.goToReviewStep();
    return this.submit();
  }

  /** The field is marked invalid, an error is shown, and Next stays disabled. */
  async expectFieldRejected(field: Locator): Promise<void> {
    await field.blur();
    await expect(field).toHaveAttribute('aria-invalid', 'true');
    await expect(this.el.fieldError).toBeVisible();
    await expect(this.el.nextButton).toBeDisabled();
  }
}
