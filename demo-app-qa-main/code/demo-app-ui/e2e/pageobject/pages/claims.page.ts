import { expect, type Page } from '@playwright/test';
import { STATUS_LABEL, UiRoute, type ClaimStatus } from '../../commons/constants';
import { ClaimsObjects, type ClaimDetailField } from '../objects/claims.objects';
import { BasePage } from './base.page';

/** The claimant's "My Claims" page. */
export class ClaimsPage extends BasePage {
  readonly el: ClaimsObjects;

  constructor(page: Page) {
    super(page);
    this.el = new ClaimsObjects(page);
  }

  async open(): Promise<void> {
    await this.page.goto(UiRoute.claims);
    await this.expectLoaded();
  }

  async expectLoaded(): Promise<void> {
    await expect(this.page).toHaveURL(new RegExp(`${UiRoute.claims}$`));
    await expect(this.el.heading).toBeVisible();
    await expect(this.el.firstDataRow().or(this.el.emptyStateHeading).first()).toBeVisible();
  }

  async expectClaimListed(claimId: string): Promise<void> {
    await expect(this.el.row(claimId)).toBeVisible();
  }

  async expectClaimNotListed(claimId: string): Promise<void> {
    await expect(this.el.row(claimId)).toHaveCount(0);
  }

  async expectStatus(claimId: string, status: ClaimStatus): Promise<void> {
    await expect(this.el.statusBadge(claimId)).toHaveText(STATUS_LABEL[status]);
  }

  async openDetails(claimId: string): Promise<void> {
    await this.el.viewDetailsButton(claimId).click();
    await expect(this.el.detailDialog).toBeVisible();
  }

  /** Each label in the details dialog is followed by its value, so a label's position finds its value. */
  async expectDetails(expected: Partial<Record<ClaimDetailField, string>>): Promise<void> {
    await expect(this.el.detailLabels.first()).toBeVisible();
    const labels = (await this.el.detailLabels.allInnerTexts()).map((label) => label.trim());
    for (const [field, text] of Object.entries(expected) as [ClaimDetailField, string][]) {
      const position = labels.indexOf(field);
      expect(position, `"${field}" is shown in the details dialog`).toBeGreaterThanOrEqual(0);
      await expect(this.el.detailValues.nth(position), field).toContainText(text);
    }
  }

  async startNewClaim(): Promise<void> {
    await this.el.newClaimButton.click();
    await expect(this.page).toHaveURL(new RegExp(UiRoute.newClaim));
  }
}
