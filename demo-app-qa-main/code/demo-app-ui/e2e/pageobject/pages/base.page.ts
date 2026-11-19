import { expect, type Page } from '@playwright/test';
import { UiRoute } from '../../commons/constants';
import { CommonObjects } from '../objects/common.objects';

/** Actions available on every signed-in page. */
export abstract class BasePage {
  protected readonly common: CommonObjects;

  constructor(readonly page: Page) {
    this.common = new CommonObjects(page);
  }

  async logout(): Promise<void> {
    await this.common.logoutButton.click();
    await expect(this.page).toHaveURL(new RegExp(UiRoute.login));
  }

  async expectToast(text: string | RegExp): Promise<void> {
    await expect(this.common.toast(text).first()).toBeVisible();
  }
}
