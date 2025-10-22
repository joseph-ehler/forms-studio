/**
 * Behavioral Contract Tests - Overlay Primitives
 * 
 * Enforces behavior contracts for OverlayPicker/OverlaySheet:
 * - Outside click closes
 * - Focus trap works
 * - Return focus works
 * - Escape closes
 * - Content scroll containment
 * - MaxHeight respects viewport
 */

import { test, expect } from '@playwright/test';

test.describe('Overlay Behavioral Contracts', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173');
  });

  test('Outside click closes overlay', async ({ page }) => {
    // Open a select field (uses OverlayPicker)
    const selectButton = page.locator('button', { hasText: /Choose a country/i }).first();
    await selectButton.click();

    // Verify overlay is open
    const overlay = page.locator('[role="dialog"]');
    await expect(overlay).toBeVisible();

    // Click outside
    await page.click('body', { position: { x: 10, y: 10 } });

    // Verify overlay closed
    await expect(overlay).not.toBeVisible();
  });

  test('Escape key closes overlay', async ({ page }) => {
    const selectButton = page.locator('button', { hasText: /Choose a country/i }).first();
    await selectButton.click();

    const overlay = page.locator('[role="dialog"]');
    await expect(overlay).toBeVisible();

    // Press Escape
    await page.keyboard.press('Escape');

    // Verify closed
    await expect(overlay).not.toBeVisible();
  });

  test('Focus trap contains Tab navigation', async ({ page }) => {
    const selectButton = page.locator('button', { hasText: /Choose a country/i }).first();
    await selectButton.click();

    const overlay = page.locator('[role="dialog"]');
    await expect(overlay).toBeVisible();

    // Get first and last focusable elements
    const focusableElements = overlay.locator('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
    const count = await focusableElements.count();

    // Tab through all elements
    for (let i = 0; i < count + 2; i++) {
      await page.keyboard.press('Tab');
    }

    // Focus should still be inside overlay
    const activeElement = await page.evaluate(() => {
      const active = document.activeElement;
      return active?.closest('[role="dialog"]') !== null;
    });

    expect(activeElement).toBe(true);
  });

  test('Return focus to trigger on close', async ({ page }) => {
    const selectButton = page.locator('button', { hasText: /Choose a country/i }).first();
    
    // Focus and open
    await selectButton.focus();
    await selectButton.click();

    const overlay = page.locator('[role="dialog"]');
    await expect(overlay).toBeVisible();

    // Close with Escape
    await page.keyboard.press('Escape');

    // Check focus returned to button
    const isFocused = await selectButton.evaluate(el => el === document.activeElement);
    expect(isFocused).toBe(true);
  });

  test('MaxHeight respects viewport', async ({ page }) => {
    // Set small viewport
    await page.setViewportSize({ width: 375, height: 667 });

    const selectButton = page.locator('button', { hasText: /Choose a country/i }).first();
    await selectButton.click();

    const overlay = page.locator('[role="dialog"]');
    const overlayBox = await overlay.boundingBox();
    const viewportHeight = page.viewportSize()?.height || 667;

    // Overlay should not exceed viewport
    expect(overlayBox?.height).toBeLessThanOrEqual(viewportHeight * 0.9); // 90% max
  });

  test('Content scrolls when overflowing', async ({ page }) => {
    const selectButton = page.locator('button', { hasText: /Choose a country/i }).first();
    await selectButton.click();

    // Find content area
    const content = page.locator('[role="dialog"] [data-overlay="content"]').first();

    // Check if scrollable
    const isScrollable = await content.evaluate(el => {
      return el.scrollHeight > el.clientHeight;
    });

    // If content overflows, it should be scrollable
    if (isScrollable) {
      const hasScroll = await content.evaluate(el => {
        const style = getComputedStyle(el);
        return style.overflowY === 'auto' || style.overflowY === 'scroll';
      });
      expect(hasScroll).toBe(true);
    }
  });
});

test.describe('Overlay Behavioral Contracts - Mobile', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('http://localhost:5173');
  });

  test('Mobile uses sheet instead of popover', async ({ page }) => {
    const selectButton = page.locator('button', { hasText: /Choose a country/i }).first();
    await selectButton.click();

    // On mobile, should render as sheet (bottom-aligned)
    const overlay = page.locator('[role="dialog"]');
    const box = await overlay.boundingBox();
    const viewportHeight = 667;

    // Sheet should be at bottom of viewport
    expect(box?.y).toBeGreaterThan(viewportHeight * 0.5);
  });

  test('Scroll lock prevents body scroll', async ({ page }) => {
    const selectButton = page.locator('button', { hasText: /Choose a country/i }).first();
    await selectButton.click();

    // Check body overflow
    const bodyOverflow = await page.evaluate(() => {
      return getComputedStyle(document.documentElement).overflow;
    });

    expect(bodyOverflow).toBe('hidden');
  });
});
