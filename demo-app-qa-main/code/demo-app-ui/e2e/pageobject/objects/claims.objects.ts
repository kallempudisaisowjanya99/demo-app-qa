import type { Locator, Page } from '@playwright/test';
import { shortId } from '../../utils/string.utils';

export type ClaimDetailField = 'Claim ID' | 'Status' | 'Incident Location' | 'Description' | 'Claim Amount';

/** Elements of the claimant's "My Claims" page and its "Claim Details" dialog. */
export class ClaimsObjects {
  readonly heading: Locator;
  readonly emptyStateHeading: Locator;
  readonly newClaimButton: Locator;
  readonly detailDialog: Locator;
  readonly detailCloseButton: Locator;

  constructor(private readonly page: Page) {
    this.heading = page.getByRole('heading', { name: 'My Claims' });
    this.emptyStateHeading = page.getByRole('heading', { name: 'No claims yet' });
    this.newClaimButton = page.getByRole('button', { name: 'Submit New Claim' });
    this.detailDialog = page.getByRole('dialog', { name: 'Claim Details' });
    this.detailCloseButton = this.detailDialog.getByRole('button', { name: 'Close' });
  }

  /** Any data row of the table (row 0 is the header). */
  readonly firstDataRow = (): Locator => this.page.getByRole('row').nth(1);

  /** The table row of a claim; rows show the first 8 characters of the id. */
  row(claimId: string): Locator {
    return this.page.getByRole('row').filter({ hasText: shortId(claimId) });
  }

  statusBadge(claimId: string): Locator {
    return this.row(claimId).getByRole('status');
  }

  viewDetailsButton(claimId: string): Locator {
    return this.row(claimId).getByRole('button', { name: 'View Details' });
  }

  /** Field labels in the details dialog (`<dt>`, role "term"). */
  get detailLabels(): Locator {
    return this.detailDialog.getByRole('term');
  }

  /** Field values in the details dialog (`<dd>`, role "definition"), in the same order as the labels. */
  get detailValues(): Locator {
    return this.detailDialog.getByRole('definition');
  }
}
