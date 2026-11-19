import type { Locator, Page } from '@playwright/test';
import { shortId } from '../../utils/string.utils';

/** Elements of the admin "Claims Management" page and its confirmation dialog. */
export class AdminClaimsObjects {
  readonly heading: Locator;
  readonly confirmDialog: Locator;
  readonly confirmButton: Locator;
  readonly cancelButton: Locator;

  constructor(private readonly page: Page) {
    this.heading = page.getByRole('heading', { name: 'Claims Management' });
    this.confirmDialog = page.getByRole('dialog', { name: 'Confirm Status Change' });
    this.confirmButton = this.confirmDialog.getByRole('button', { name: 'Confirm' });
    this.cancelButton = this.confirmDialog.getByRole('button', { name: 'Cancel' });
  }

  row(claimId: string): Locator {
    return this.page.getByRole('row').filter({ hasText: shortId(claimId) });
  }

  statusBadge(claimId: string): Locator {
    return this.row(claimId).getByRole('status');
  }

  /** The "Update Status" dropdown in a claim's row. */
  statusSelect(claimId: string): Locator {
    return this.row(claimId).getByRole('combobox', { name: /Update status for claim/ });
  }
}
