import { defineConfig, devices } from '@playwright/test';
import { env } from './e2e/env';

/**
 * E2E_ARTIFACTS=all keeps the screenshot and video of every test (evidence runs).
 * Default keeps them only for failures, which keeps CI artifacts small.
 * The trace is kept only for failures in both modes: with trace 'on' and the installed
 * Chrome, the tests' own page.screenshot() calls never return and the test times out.
 */
const keepEverything = process.env['E2E_ARTIFACTS'] === 'all';
// Locally the installed Google Chrome is used (no browser download needed); CI uses Playwright's Chromium.
// Override with E2E_BROWSER_CHANNEL=msedge, or E2E_BROWSER_CHANNEL=chromium for the downloaded browser.
const browserChannel = process.env['E2E_BROWSER_CHANNEL'] ?? (process.env['CI'] ? undefined : 'chrome');

export default defineConfig({
  testDir: './e2e',
  outputDir: './test-results',
  fullyParallel: true,
  forbidOnly: !!process.env['CI'],
  retries: process.env['CI'] ? 1 : 0,
  // 2 workers: the UI container runs 'next dev', which is too slow for more parallel browsers.
  workers: 2,
  timeout: 60_000,
  expect: { timeout: 10_000 },
  reporter: [
    ['list'],
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
    ['junit', { outputFile: 'playwright-report/results.xml' }],
  ],
  use: {
    baseURL: env.uiBaseUrl,
    trace: 'retain-on-failure',
    screenshot: keepEverything ? 'on' : 'only-on-failure',
    video: keepEverything ? 'on' : 'retain-on-failure',
    actionTimeout: 10_000,
    navigationTimeout: 20_000,
  },
  projects: [
    {
      name: 'api',
      testDir: './e2e/tests/api',
      testMatch: '**/*.api.spec.ts',
      use: { baseURL: env.apiBaseUrl },
    },
    {
      name: 'ui-chromium',
      testDir: './e2e/tests/ui',
      testMatch: '**/*.ui.spec.ts',
      use: { ...devices['Desktop Chrome'], ...(browserChannel ? { channel: browserChannel } : {}) },
    },
    ...(process.env['CI']
      ? [
          {
            name: 'ui-firefox',
            testDir: './e2e/tests/ui',
            testMatch: '**/*.ui.spec.ts',
            use: { ...devices['Desktop Firefox'] },
          },
        ]
      : []),
  ],
});
