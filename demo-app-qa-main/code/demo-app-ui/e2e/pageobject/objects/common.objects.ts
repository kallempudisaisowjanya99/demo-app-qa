import type { Locator, Page } from '@playwright/test';

/** Elements shared by every signed-in page: header and toast messages. */
export class CommonObjects {
  readonly header: Locator;
  readonly logoutButton: Locator;

  constructor(private readonly page: Page) {
    this.header = page.getByRole('banner');
    this.logoutButton = this.header.getByRole('button', { name: 'Logout' });
  }

  /** A header navigation link, e.g. "Claims" or "Dashboard". */
  navLink(name: string): Locator {
    return this.header.getByRole('button', { name, exact: true });
  }

  /** A toast notification (react-hot-toast renders them with role="status"). */
  toast(text: string | RegExp): Locator {
    return this.page.getByRole('status').filter({ hasText: text });
  }
}
