import { expect, type Page } from '@playwright/test';
import { UiRoute } from '../../commons/constants';
import type { Credentials } from '../../env';
import { LoginObjects } from '../objects/login.objects';

const SIGN_IN_ATTEMPTS = 5;

export class LoginPage {
  readonly el: LoginObjects;

  constructor(readonly page: Page) {
    this.el = new LoginObjects(page);
  }

  async open(): Promise<void> {
    await this.page.goto(UiRoute.login);
    await expect(this.el.heading).toBeVisible();
  }

  /** One sign-in attempt, whatever the outcome. */
  async signIn(credentials: Credentials): Promise<void> {
    await this.el.emailField.fill(credentials.email);
    await this.el.passwordField.fill(credentials.password);
    await this.el.logInButton.click();
  }

  async expectRefused(): Promise<void> {
    await expect(this.el.invalidCredentialsError).toBeVisible();
    await expect(this.page).toHaveURL(new RegExp(UiRoute.login));
  }

  /**
   * Signs in with valid credentials. The BFF sometimes refuses valid logins that
   * arrive together, so a refusal is retried after a short pause.
   */
  async signInExpectingSuccess(credentials: Credentials): Promise<void> {
    for (let attempt = 1; attempt <= SIGN_IN_ATTEMPTS; attempt++) {
      await this.open();
      await this.signIn(credentials);
      if (await this.leftLoginPage()) {
        return;
      }
      await this.page.waitForTimeout(attempt * 300 + Math.random() * 700);
    }
    throw new Error(`Could not sign in as ${credentials.email} after ${SIGN_IN_ATTEMPTS} attempts`);
  }

  private async leftLoginPage(): Promise<boolean> {
    let signedIn = false;
    await expect(async () => {
      signedIn = !new URL(this.page.url()).pathname.startsWith(UiRoute.login);
      const refused = await this.el.invalidCredentialsError.isVisible();
      expect(signedIn || refused, 'sign-in finished').toBe(true);
    }).toPass({ timeout: 20_000 });
    return signedIn;
  }
}
