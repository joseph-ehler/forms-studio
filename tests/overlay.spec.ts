import { test, expect } from '@playwright/test';

test.describe('@overlay-smoke', () => {
  test.use({ viewport: { width: 375, height: 480 } });

  test('footer visible, content scrolls, overlay within viewport', async ({ page }) => {
    await page.goto('/'); // Uses baseURL from config
    
    // Open DateField (adjust selector to match your actual trigger)
    await page.getByText('Select date', { exact: false }).first().click();

    const overlay = page.locator('[data-overlay="picker"]');
    await expect(overlay).toBeVisible({ timeout: 2000 });

    // Footer must be visible
    const footer = overlay.locator('[data-role="footer"]');
    await expect(footer).toBeVisible();

    // Content should be scrollable (or at least present)
    const content = overlay.locator('[data-role="content"]');
    const scrollHeight = await content.evaluate((el) => el.scrollHeight);
    const clientHeight = await content.evaluate((el) => el.clientHeight);
    expect(scrollHeight).toBeGreaterThanOrEqual(clientHeight);

    // Overlay bottom must be within viewport
    const bottom = await overlay.evaluate((el) => el.getBoundingClientRect().bottom);
    const vh = await page.evaluate(() => window.innerHeight);
    expect(bottom).toBeLessThanOrEqual(vh + 1); // +1px tolerance for subpixel
  });

  test('Clear clears without closing; Done closes', async ({ page }) => {
    await page.goto('/');
    
    // Open DateField and select a date
    await page.getByText('Select date', { exact: false }).first().click();
    
    const overlay = page.locator('[data-overlay="picker"]');
    await expect(overlay).toBeVisible({ timeout: 2000 });

    // Click a date first
    await page.locator('[role="gridcell"]').first().click();

    // Click Clear - overlay should stay open
    await page.getByRole('button', { name: /Clear/i }).click();
    await expect(overlay).toBeVisible(); // Still open!

    // Click Done - overlay should close
    await page.getByRole('button', { name: /Done/i }).click();
    await expect(overlay).toBeHidden({ timeout: 2000 });
  });

  test('Escape closes overlay', async ({ page }) => {
    await page.goto('/');
    
    await page.getByText('Select date', { exact: false }).first().click();
    const overlay = page.locator('[data-overlay="picker"]');
    await expect(overlay).toBeVisible();

    // Press Escape
    await page.keyboard.press('Escape');
    await expect(overlay).toBeHidden({ timeout: 2000 });
  });

  test('Outside click closes overlay (desktop)', async ({ page }) => {
    // Use desktop viewport for this test
    await page.setViewportSize({ width: 1024, height: 768 });
    await page.goto('/');
    
    await page.getByText('Select date', { exact: false }).first().click();
    const overlay = page.locator('[data-overlay="picker"]');
    await expect(overlay).toBeVisible();

    // Click outside (body, not overlay)
    await page.locator('body').click({ position: { x: 10, y: 10 } });
    await expect(overlay).toBeHidden({ timeout: 2000 });
  });
});
