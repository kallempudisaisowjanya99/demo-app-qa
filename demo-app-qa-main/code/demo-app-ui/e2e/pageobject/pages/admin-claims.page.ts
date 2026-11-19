import { expect, type Page } from '@playwright/test';
import { STATUS_LABEL, UiRoute, type ClaimStatus } from '../../commons/constants';
import { AdminClaimsObjects } from '../objects/admin-claims.objects';
import { BasePage } from './base.page';

const STATUS_PLACEHOLDER = 'Update Status';
const ADMIN_LIST_LOAD_TIMEOUT_MS = 30_000;

/** The admin "Claims Management" page, where claim statuses are changed. */
export class AdminClaimsPage extends BasePage {
  readonly el: AdminClaimsObjects;

  constructor(page: Page) {
    super(page);
    this.el = new AdminClaimsObjects(page);
  }

  /**
   * Opens the page and waits until the given claim's row is rendered.
   * The admin list is not paginated (thousands of rows on a shared environment), so it gets a longer wait.
   */
  async open(claimId: string): Promise<void> {
    await this.page.goto(UiRoute.adminClaims);
    await expect(this.el.heading).toBeVisible();
    await expect(this.el.row(claimId)).toBeVisible({ timeout: ADMIN_LIST_LOAD_TIMEOUT_MS });
  }

  async expectStatus(claimId: string, status: ClaimStatus): Promise<void> {
    await expect(this.el.statusBadge(claimId)).toHaveText(STATUS_LABEL[status]);
  }

  /** The statuses offered in the claim's dropdown, as labelled. */
  async offeredStatuses(claimId: string): Promise<string[]> {
    const options = await this.el.statusSelect(claimId).getByRole('option').allInnerTexts();
    return options.map((label) => label.trim()).filter((label) => label !== STATUS_PLACEHOLDER);
  }

  /** Picks a status, confirms, and waits for the success message and the new badge. */
  async changeStatus(claimId: string, status: ClaimStatus): Promise<void> {
    await this.el.statusSelect(claimId).selectOption({ label: STATUS_LABEL[status] });
    await expect(this.el.confirmDialog).toContainText(`Change status to ${STATUS_LABEL[status]}?`);
    await this.el.confirmButton.click();
    await expect(this.el.confirmDialog).toBeHidden();
    await this.expectToast(`Claim status updated to ${STATUS_LABEL[status]}`);
    await this.expectStatus(claimId, status);
  }
}
