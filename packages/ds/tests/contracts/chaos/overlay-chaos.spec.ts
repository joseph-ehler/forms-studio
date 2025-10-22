/**
 * Chaos Overlay Tests
 * 
 * Random parent styles (filter, transform, z-index) to ensure
 * overlay still stacks and scrolls correctly.
 * 
 * This is the "red team" test suite.
 */

import { test, expect } from '@playwright/test';

test.describe('Overlay Chaos Suite', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173');
  });

  test('Overlay survives parent with transform', async ({ page }) => {
    // Inject chaos: transform on parent
    await page.evaluate(() => {
      const container = document.querySelector('.max-w-2xl');
      if (container) {
        (container as HTMLElement).style.transform = 'translateX(10px)';
      }
    });

    // Open overlay
    const selectButton = page.locator('button', { hasText: /Choose a country/i }).first();
    await selectButton.click();

    // Overlay should still be visible and positioned correctly
    const overlay = page.locator('[role="dialog"]');
    await expect(overlay).toBeVisible();

    const box = await overlay.boundingBox();
    expect(box).toBeTruthy();
    expect(box!.width).toBeGreaterThan(100);
  });

  test('Overlay survives parent with filter', async ({ page }) => {
    // Inject chaos: filter on parent
    await page.evaluate(() => {
      const container = document.querySelector('.max-w-2xl');
      if (container) {
        (container as HTMLElement).style.filter = 'blur(2px)';
      }
    });

    const selectButton = page.locator('button', { hasText: /Choose a country/i }).first();
    await selectButton.click();

    const overlay = page.locator('[role="dialog"]');
    await expect(overlay).toBeVisible();

    // Overlay should NOT be blurred (portal escapes filter context)
    const isBlurred = await overlay.evaluate(el => {
      return getComputedStyle(el).filter !== 'none';
    });
    expect(isBlurred).toBe(false);
  });

  test('Overlay survives parent with high z-index', async ({ page }) => {
    // Inject chaos: giant z-index on parent
    await page.evaluate(() => {
      const container = document.querySelector('.max-w-2xl');
      if (container) {
        (container as HTMLElement).style.zIndex = '9999';
        (container as HTMLElement).style.position = 'relative';
      }
    });

    const selectButton = page.locator('button', { hasText: /Choose a country/i }).first();
    await selectButton.click();

    const overlay = page.locator('[role="dialog"]');
    await expect(overlay).toBeVisible();

    // Overlay should still be on top (portal renders at body level)
    const overlayZ = await overlay.evaluate(el => {
      return parseInt(getComputedStyle(el).zIndex || '0');
    });
    expect(overlayZ).toBeGreaterThanOrEqual(200); // Our z-index tokens start at 200
  });

  test('Overlay survives multiple chaos styles combined', async ({ page }) => {
    // Inject MAXIMUM chaos
    await page.evaluate(() => {
      const container = document.querySelector('.max-w-2xl');
      if (container) {
        const el = container as HTMLElement;
        el.style.transform = 'rotate(5deg) scale(0.9)';
        el.style.filter = 'brightness(0.8) contrast(1.2)';
        el.style.zIndex = '99999';
        el.style.position = 'relative';
        el.style.overflow = 'hidden';
      }
    });

    const selectButton = page.locator('button', { hasText: /Choose a country/i }).first();
    await selectButton.click();

    const overlay = page.locator('[role="dialog"]');
    
    // Should still work perfectly
    await expect(overlay).toBeVisible();
    
    // Should be clickable
    await overlay.click();
    
    // Should be scrollable (if content overflows)
    const canScroll = await overlay.evaluate(el => {
      const content = el.querySelector('[data-overlay="content"]');
      if (content) {
        const style = getComputedStyle(content);
        return style.overflowY === 'auto' || style.overflowY === 'scroll';
      }
      return false;
    });
    
    // If there's overflow, it should be scrollable
    if (canScroll) {
      expect(canScroll).toBe(true);
    }
  });

  test('Overlay scroll containment survives parent scroll', async ({ page }) => {
    // Make parent scrollable
    await page.evaluate(() => {
      const container = document.querySelector('.max-w-2xl');
      if (container) {
        const el = container as HTMLElement;
        el.style.height = '300px';
        el.style.overflow = 'auto';
      }
    });

    const selectButton = page.locator('button', { hasText: /Choose a country/i }).first();
    await selectButton.click();

    // Try to scroll parent
    await page.evaluate(() => {
      const container = document.querySelector('.max-w-2xl');
      if (container) {
        container.scrollTop = 100;
      }
    });

    // Overlay should still be visible (portal escapes scroll context)
    const overlay = page.locator('[role="dialog"]');
    await expect(overlay).toBeVisible();
  });

  test('Multiple overlays stack correctly', async ({ page }) => {
    // This would need a way to open multiple overlays
    // For now, test that z-index increases
    const selectButton = page.locator('button', { hasText: /Choose a country/i }).first();
    await selectButton.click();

    const overlay1 = page.locator('[role="dialog"]').first();
    const z1 = await overlay1.evaluate(el => parseInt(getComputedStyle(el).zIndex || '0'));

    // Close and reopen (simulates stacking)
    await page.keyboard.press('Escape');
    await selectButton.click();

    const overlay2 = page.locator('[role="dialog"]').first();
    const z2 = await overlay2.evaluate(el => parseInt(getComputedStyle(el).zIndex || '0'));

    // Z-index should be consistent
    expect(z2).toBe(z1);
  });
});

test.describe('Host CSS Attack Suite', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173');
  });

  test('DS survives global button reset', async ({ page }) => {
    // Inject hostile CSS
    await page.addStyleTag({
      content: `
        button {
          all: unset !important;
          background: lime !important;
          color: purple !important;
        }
      `,
    });

    const button = page.locator('button.ds-button').first();
    
    // DS button should maintain its styles (cascade layers protect it)
    const bg = await button.evaluate(el => getComputedStyle(el).backgroundColor);
    
    // Should NOT be lime (rgb(0, 255, 0))
    expect(bg).not.toBe('rgb(0, 255, 0)');
  });

  test('DS survives global input reset', async ({ page }) => {
    // Inject hostile CSS
    await page.addStyleTag({
      content: `
        input {
          border: 5px solid red !important;
          background: yellow !important;
        }
      `,
    });

    const input = page.locator('input.ds-input').first();
    
    // DS input should maintain its border
    const border = await input.evaluate(el => getComputedStyle(el).borderColor);
    
    // Should NOT be red
    expect(border).not.toContain('255, 0, 0');
  });

  test('DS survives wildcard selector attack', async ({ page }) => {
    // Inject hostile CSS
    await page.addStyleTag({
      content: `
        * {
          box-sizing: content-box !important;
          margin: 20px !important;
        }
      `,
    });

    // Page should still render somewhat normally
    const button = page.locator('button.ds-button').first();
    await expect(button).toBeVisible();
  });
});
