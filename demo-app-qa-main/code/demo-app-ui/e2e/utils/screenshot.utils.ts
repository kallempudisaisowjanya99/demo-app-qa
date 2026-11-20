import { test, type Page } from '@playwright/test';

/**
 * Takes a screenshot of the visible page and attaches it to the HTML report under `name`.
 * Call it right after an assertion so the report shows what the page looked like when the check passed.
 * It runs as its own report step, so the image sits next to the assertion it belongs to.
 * Not fullPage: on the signed-in pages a full-page capture never settles and times out.
 */
export async function attachScreenshot(page: Page, name: string): Promise<void> {
  await test.step(`Screenshot: ${name}`, async () => {
    await test.info().attach(name, {
      body: await page.screenshot(),
      contentType: 'image/png',
    });
  });
}
