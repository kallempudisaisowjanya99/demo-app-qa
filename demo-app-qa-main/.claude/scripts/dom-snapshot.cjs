/**
 * Prints the accessibility tree (roles, names, labels) of a page in the Claims app,
 * so locators can be written with getByRole / getByLabel / getByText.
 *
 * Usage (from the project root, demo-app-qa-main):
 *   node .claude/scripts/dom-snapshot.cjs <path> [claimant|admin|anonymous]
 *   e.g. node .claude/scripts/dom-snapshot.cjs claims/new claimant
 *
 * Reads URLs and logins from code/demo-app-ui/e2e/.env.
 * Uses the installed Google Chrome (no browser download needed).
 */
const path = require('node:path');
const fs = require('node:fs');

const uiDir = path.resolve(__dirname, '../../code/demo-app-ui');
const { chromium } = require(path.join(uiDir, 'node_modules/playwright'));

const envFile = path.join(uiDir, 'e2e/.env');
if (fs.existsSync(envFile)) process.loadEnvFile(envFile);

// Accept "claims/new" or "/claims/new". Git Bash turns a leading "/" into a Windows path, so strip that back.
const rawTarget = (process.argv[2] ?? 'login').replace(/^.*\/Program Files\/Git/i, '');
const target = rawTarget.startsWith('/') ? rawTarget : `/${rawTarget}`;
const as = process.argv[3] ?? 'anonymous';
const baseUrl = process.env.UI_BASE_URL ?? 'http://localhost:3001';

(async () => {
  const browser = await chromium.launch({ channel: process.env.E2E_BROWSER_CHANNEL ?? 'chrome' });
  const page = await browser.newPage();
  page.setDefaultTimeout(60_000);

  if (as !== 'anonymous') {
    const user = as === 'admin'
      ? { email: process.env.ADMIN_EMAIL, password: process.env.ADMIN_PASSWORD }
      : { email: process.env.CLAIMANT_EMAIL, password: process.env.CLAIMANT_PASSWORD };
    await page.goto(`${baseUrl}/login`);
    await page.getByRole('textbox', { name: /email/i }).fill(user.email);
    await page.getByRole('textbox', { name: 'Password', exact: true }).fill(user.password);
    await page.getByRole('button', { name: /log in|sign in/i }).click();
    await page.waitForURL((url) => !url.pathname.startsWith('/login'));
  }

  await page.goto(`${baseUrl}${target}`);
  await page.waitForLoadState('networkidle');
  console.log(`# ${page.url()}  (signed in as: ${as})\n`);
  console.log(await page.locator('body').ariaSnapshot());
  await browser.close();
})().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
