import type { Locator, Page } from '@playwright/test';

/** Elements of the Log In page. */
export class LoginObjects {
  readonly heading: Locator;
  readonly emailField: Locator;
  readonly passwordField: Locator;
  readonly logInButton: Locator;
  readonly invalidCredentialsError: Locator;

  constructor(page: Page) {
    this.heading = page.getByRole('heading', { name: 'Log In' });
    this.emailField = page.getByLabel('Email');
    this.passwordField = page.getByLabel('Password', { exact: true });
    this.logInButton = page.getByRole('button', { name: 'Log In', exact: true });
    this.invalidCredentialsError = page.getByRole('alert').filter({ hasText: 'Invalid email or password' });
  }
}
