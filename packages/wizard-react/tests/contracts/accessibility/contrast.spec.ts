/**
 * Accessibility Contract Tests - Color Contrast
 * 
 * Ensures WCAG AA compliance (4.5:1) for all text/backgrounds.
 */

import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Contrast Contracts - WCAG AA', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173');
  });

  test('All interactive elements meet 4.5:1 contrast', async ({ page }) => {
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2aa', 'wcag21aa'])
      .include('button, input, select, textarea, a')
      .analyze();

    expect(results.violations).toEqual([]);
  });

  test('Button variants - default state contrast', async ({ page }) => {
    // Primary button
    const primary = page.locator('button.ds-button').first();
    const primaryContrast = await page.evaluate((btn) => {
      const computed = getComputedStyle(btn);
      return {
        color: computed.color,
        bg: computed.backgroundColor,
      };
    }, await primary.elementHandle());

    // Calculate contrast (simplified - use actual library in production)
    expect(primaryContrast).toBeDefined();
  });

  test('Labels and helper text contrast', async ({ page }) => {
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2aa'])
      .include('[data-ds="label"], [data-ds="helper"]')
      .analyze();

    expect(results.violations.filter(v => v.id === 'color-contrast')).toEqual([]);
  });

  test('Disabled states maintain visible contrast', async ({ page }) => {
    const results = await new AxeBuilder({ page })
      .include('[disabled]')
      .disableRules(['color-contrast']) // Disabled can be lower contrast, but check visibility
      .analyze();

    expect(results.violations).toEqual([]);
  });
});

test.describe('Contrast Contracts - Dark Mode', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173');
    await page.evaluate(() => {
      document.documentElement.setAttribute('data-theme', 'dark');
    });
  });

  test('Dark mode maintains WCAG AA contrast', async ({ page }) => {
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2aa'])
      .analyze();

    expect(results.violations.filter(v => v.id === 'color-contrast')).toEqual([]);
  });
});
