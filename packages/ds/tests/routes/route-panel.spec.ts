/**
 * RoutePanel E2E Tests
 * 
 * Covers:
 * - Non-modal behavior (background interactive)
 * - Focus management
 * - Keyboard (Esc) close
 * - Mobile responsive (collapses to sheet)
 * - RTL layout
 */

import { test, expect } from '@playwright/test';

test.describe('RoutePanel', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/demo/routes/panel');
  });

  test('renders as side panel on desktop', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.click('[data-testid="open-panel"]');
    
    const panel = page.locator('.ds-route-panel');
    await expect(panel).toBeVisible();
    
    // Check it's on the side
    const box = await panel.boundingBox();
    expect(box?.width).toBeLessThan(500);
  });

  test('has correct ARIA attributes', async ({ page }) => {
    await page.click('[data-testid="open-panel"]');
    
    const panel = page.locator('.ds-route-panel');
    await expect(panel).toHaveAttribute('role', 'complementary');
    await expect(panel).toHaveAttribute('aria-label');
    await expect(panel).toHaveAttribute('tabindex', '-1');
    
    // Should NOT have aria-modal
    await expect(panel).not.toHaveAttribute('aria-modal');
  });

  test('focuses panel on mount', async ({ page }) => {
    await page.click('[data-testid="open-panel"]');
    
    const panel = page.locator('.ds-route-panel');
    await expect(panel).toBeFocused();
  });

  test('background remains interactive (non-modal)', async ({ page }) => {
    const backgroundButton = page.locator('[data-testid="background-button"]');
    
    await page.click('[data-testid="open-panel"]');
    
    const panel = page.locator('.ds-route-panel');
    await expect(panel).toBeVisible();
    
    // Should be able to click background
    let clicked = false;
    await backgroundButton.evaluate(el => {
      el.addEventListener('click', () => { clicked = true; });
    });
    
    await backgroundButton.click();
    expect(clicked).toBe(true);
  });

  test('Esc closes panel', async ({ page }) => {
    await page.click('[data-testid="open-panel"]');
    
    const panel = page.locator('.ds-route-panel');
    await expect(panel).toBeVisible();
    
    await page.keyboard.press('Escape');
    await page.waitForTimeout(200);
    
    await expect(panel).not.toBeVisible();
  });

  test('close button closes panel', async ({ page }) => {
    await page.click('[data-testid="open-panel"]');
    
    const panel = page.locator('.ds-route-panel');
    await expect(panel).toBeVisible();
    
    await page.click('.ds-route-panel__close');
    await page.waitForTimeout(200);
    
    await expect(panel).not.toBeVisible();
  });

  test('returns focus on close', async ({ page }) => {
    const trigger = page.locator('[data-testid="open-panel"]');
    await trigger.click();
    
    const panel = page.locator('.ds-route-panel');
    await expect(panel).toBeVisible();
    
    await page.keyboard.press('Escape');
    await page.waitForTimeout(200);
    
    // Focus should return to trigger
    await expect(trigger).toBeFocused();
  });

  test('collapses to bottom sheet on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.click('[data-testid="open-panel"]');
    
    const panel = page.locator('.ds-route-panel');
    await expect(panel).toBeVisible();
    
    // Check it's full width
    const box = await panel.boundingBox();
    const viewport = page.viewportSize();
    expect(box?.width).toBe(viewport?.width);
    
    // Check it's at bottom
    expect(box?.y).toBeGreaterThan(100); // Not at top
  });

  test('respects position prop (left)', async ({ page }) => {
    await page.goto('/demo/routes/panel?position=left');
    await page.click('[data-testid="open-panel-left"]');
    
    const panel = page.locator('.ds-route-panel--left');
    await expect(panel).toBeVisible();
    
    const box = await panel.boundingBox();
    expect(box?.x).toBe(0); // Attached to left
  });

  test('respects position prop (right)', async ({ page }) => {
    await page.goto('/demo/routes/panel?position=right');
    await page.click('[data-testid="open-panel-right"]');
    
    const panel = page.locator('.ds-route-panel--right');
    await expect(panel).toBeVisible();
    
    const box = await panel.boundingBox();
    const viewport = page.viewportSize();
    expect(box?.x).toBeGreaterThan((viewport?.width ?? 0) - 500);
  });

  test('RTL: panel attaches to correct side', async ({ page }) => {
    await page.setContent(`
      <html dir="rtl">
        <body>
          <button data-testid="open-panel">Open</button>
          <div class="ds-route-panel ds-route-panel--right"></div>
        </body>
      </html>
    `);
    
    await page.click('[data-testid="open-panel"]');
    
    const panel = page.locator('.ds-route-panel--right');
    const box = await panel.boundingBox();
    
    // In RTL, "right" panel should be on left side
    expect(box?.x).toBe(0);
  });

  test('browser back closes panel', async ({ page }) => {
    await page.click('[data-testid="open-panel"]');
    
    const panel = page.locator('.ds-route-panel');
    await expect(panel).toBeVisible();
    
    await page.goBack();
    await page.waitForTimeout(200);
    
    await expect(panel).not.toBeVisible();
  });

  test('content scrolls independently', async ({ page }) => {
    await page.click('[data-testid="open-panel-with-long-content"]');
    
    const content = page.locator('.ds-route-panel__content');
    await expect(content).toBeVisible();
    
    // Check scrollable
    const isScrollable = await content.evaluate(el => {
      return el.scrollHeight > el.clientHeight;
    });
    
    expect(isScrollable).toBe(true);
  });

  test('no backdrop rendered', async ({ page }) => {
    await page.click('[data-testid="open-panel"]');
    
    const panel = page.locator('.ds-route-panel');
    await expect(panel).toBeVisible();
    
    // Should not have backdrop sibling
    const backdrop = page.locator('.ds-sheet-backdrop, .ds-overlay-backdrop');
    await expect(backdrop).not.toBeVisible();
  });
});
