import { test as base, expect, type Page } from '@playwright/test';
import { AdminApi, ClaimsApi } from '../commons/api-client';
import { ApiSession } from '../commons/api-session';
import { env, type Credentials } from '../env';
import { AdminClaimsPage } from '../pageobject/pages/admin-claims.page';
import { ClaimsPage } from '../pageobject/pages/claims.page';
import { LoginPage } from '../pageobject/pages/login.page';
import { NewClaimPage } from '../pageobject/pages/new-claim.page';

/** Page objects for a browser signed in as the claimant. */
export interface ClaimantPages {
  readonly page: Page;
  readonly claims: ClaimsPage;
  readonly newClaim: NewClaimPage;
}

/** Page objects for a browser signed in as the admin. */
export interface AdminPages {
  readonly page: Page;
  readonly adminClaims: AdminClaimsPage;
}

interface Fixtures {
  // API: each is created only when a test asks for it, and disposed afterwards.
  anonymousSession: ApiSession;
  claimantApi: ClaimsApi;
  /** Claims raised by the admin account: "someone else's" claims from the claimant's view. */
  otherUserApi: ClaimsApi;
  adminApi: AdminApi;
  // Browser
  loginPage: LoginPage;
  /** Claimant signed in, on My Claims. */
  claimant: ClaimantPages;
  /** Admin signed in, in its own browser context (separate from `claimant`). */
  admin: AdminPages;
}

interface WorkerFixtures {
  claimantSession: ApiSession;
  adminSession: ApiSession;
}

export const test = base.extend<Fixtures, WorkerFixtures>({
  // One login per worker, shared by its tests, keeps the login load on the BFF low.
  claimantSession: [
    async ({}, use) => {
      const session = await ApiSession.loginAs(env.claimant);
      await use(session);
      await session.dispose();
    },
    { scope: 'worker' },
  ],
  adminSession: [
    async ({}, use) => {
      const session = await ApiSession.loginAs(env.admin);
      await use(session);
      await session.dispose();
    },
    { scope: 'worker' },
  ],

  anonymousSession: async ({}, use) => {
    const session = await ApiSession.anonymous();
    await use(session);
    await session.dispose();
  },
  claimantApi: async ({ claimantSession }, use) => use(new ClaimsApi(claimantSession)),
  otherUserApi: async ({ adminSession }, use) => use(new ClaimsApi(adminSession)),
  adminApi: async ({ adminSession }, use) => use(new AdminApi(adminSession)),

  loginPage: async ({ page }, use) => use(new LoginPage(page)),

  claimant: async ({ browser }, use) => {
    const context = await browser.newContext();
    const page = await signedInPage(await context.newPage(), env.claimant);
    const claims = new ClaimsPage(page);
    await claims.expectLoaded();
    await use({ page, claims, newClaim: new NewClaimPage(page) });
    await context.close();
  },

  admin: async ({ browser }, use) => {
    const context = await browser.newContext();
    const page = await signedInPage(await context.newPage(), env.admin);
    await use({ page, adminClaims: new AdminClaimsPage(page) });
    await context.close();
  },
});

async function signedInPage(page: Page, credentials: Credentials): Promise<Page> {
  await new LoginPage(page).signInExpectingSuccess(credentials);
  return page;
}

export { expect };
