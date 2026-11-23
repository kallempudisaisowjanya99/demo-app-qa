import { expect, type Page } from '@playwright/test';
import { UiRoute } from '../../commons/constants';
import type { Credentials } from '../../env';
import { LoginObjects } from '../objects/login.objects';
import { jitteredIntervals } from '../../utils/retry.utils';

/** Base waits between refused sign-in attempts, used by `toPass` (jitter is added). */
const SIGN_IN_RETRY_INTERVALS_MS = [500, 1_000, 2_000, 3_000];
const SIGN_IN_TIMEOUT_MS = 45_000;

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
   * arrive together (DEF-05), so a refused attempt is retried by Playwright's
   * `toPass` with growing, jittered intervals; there is no fixed sleep.
   */
  async signInExpectingSuccess(credentials: Credentials): Promise<void> {
    await expect(async () => {
      await this.open();
      await this.signIn(credentials);
      expect(await this.leftLoginPage(), `sign-in as ${credentials.email} accepted`).toBe(true);
    }).toPass({ intervals: jitteredIntervals(SIGN_IN_RETRY_INTERVALS_MS), timeout: SIGN_IN_TIMEOUT_MS });
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
