/**
 * Design System Contract Tests
 * 
 * Ensures design tokens are applied correctly and states are visually distinct.
 * These tests verify the "contract" between design system and components.
 */

import { test, expect } from '@playwright/test';

test.describe('Design System Contract Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to demo app
    await page.goto('http://localhost:5173');
  });

  test('Typography tokens applied correctly', async ({ page }) => {
    // Find a label
    const label = page.locator('[data-ds="label"]').first();
    
    // Check computed styles match tokens
    const fontSize = await label.evaluate(el => getComputedStyle(el).fontSize);
    const fontWeight = await label.evaluate(el => getComputedStyle(el).fontWeight);
    const color = await label.evaluate(el => getComputedStyle(el).color);
    
    // TYPO_TOKENS.size.md = 16px
    expect(fontSize).toBe('16px');
    
    // TYPO_TOKENS.weight.semibold = 600
    expect(fontWeight).toBe('600');
    
    // COLOR_TOKENS.neutral.text = rgb(17, 24, 39)
    expect(color).toBe('rgb(17, 24, 39)');
  });

  test('Helper text colors are semantically distinct', async ({ page }) => {
    // Create test helpers with different variants
    await page.evaluate(() => {
      const container = document.createElement('div');
      container.innerHTML = `
        <span data-ds="helper" class="ds-helper--success" data-test="success">Success</span>
        <span data-ds="helper" class="ds-helper--error" data-test="error">Error</span>
        <span data-ds="helper" class="ds-helper--warning" data-test="warning">Warning</span>
        <span data-ds="helper" class="ds-helper--hint" data-test="hint">Hint</span>
      `;
      document.body.appendChild(container);
    });

    // Get colors
    const successColor = await page.locator('[data-test="success"]').evaluate(el => getComputedStyle(el).color);
    const errorColor = await page.locator('[data-test="error"]').evaluate(el => getComputedStyle(el).color);
    const warningColor = await page.locator('[data-test="warning"]').evaluate(el => getComputedStyle(el).color);
    const hintColor = await page.locator('[data-test="hint"]').evaluate(el => getComputedStyle(el).color);

    // All must be different
    expect(successColor).not.toBe(errorColor);
    expect(successColor).not.toBe(warningColor);
    expect(errorColor).not.toBe(warningColor);
    expect(hintColor).not.toBe(errorColor);
    
    // Verify semantic colors
    expect(successColor).toContain('22, 163, 74'); // green
    expect(errorColor).toContain('220, 38, 38');   // red
    expect(warningColor).toContain('234, 179, 8'); // yellow
  });

  test('Input states have visual contrast', async ({ page }) => {
    // Find an input
    const input = page.locator('input[type="email"]').first();
    
    // Default state
    const defaultBorder = await input.evaluate(el => getComputedStyle(el).borderColor);
    
    // Focus state
    await input.focus();
    const focusBorder = await input.evaluate(el => getComputedStyle(el).borderColor);
    const focusShadow = await input.evaluate(el => getComputedStyle(el).boxShadow);
    
    // Focus must be visually distinct
    expect(focusBorder).not.toBe(defaultBorder);
    expect(focusShadow).not.toBe('none');
    expect(focusShadow).toContain('59, 130, 246'); // blue-500
  });

  test('Button states have visual contrast', async ({ page }) => {
    // Find submit button
    const button = page.locator('button[type="submit"]').first();
    
    // Default state
    const defaultBg = await button.evaluate(el => getComputedStyle(el).backgroundColor);
    const defaultShadow = await button.evaluate(el => getComputedStyle(el).boxShadow);
    
    // Hover state
    await button.hover();
    await page.waitForTimeout(200); // Wait for transition
    const hoverBg = await button.evaluate(el => getComputedStyle(el).backgroundColor);
    const hoverShadow = await button.evaluate(el => getComputedStyle(el).boxShadow);
    
    // Hover must be visually distinct
    expect(hoverBg).not.toBe(defaultBg);
    expect(hoverShadow).not.toBe(defaultShadow);
  });

  test('Touch targets meet WCAG 2.1 AA (44x44px minimum)', async ({ page }) => {
    // Check all interactive elements
    const buttons = page.locator('button, input[type="submit"], input[type="button"]');
    const inputs = page.locator('input:not([type="hidden"]), select, textarea');
    
    // Buttons
    const buttonCount = await buttons.count();
    for (let i = 0; i < buttonCount; i++) {
      const box = await buttons.nth(i).boundingBox();
      expect(box?.height).toBeGreaterThanOrEqual(44);
    }
    
    // Inputs (mobile)
    const inputCount = await inputs.count();
    for (let i = 0; i < Math.min(inputCount, 5); i++) { // Sample first 5
      const box = await inputs.nth(i).boundingBox();
      expect(box?.height).toBeGreaterThanOrEqual(44);
    }
  });

  test('Border radius is consistent', async ({ page }) => {
    // All inputs should have same radius
    const inputs = page.locator('.ds-input');
    const inputCount = await inputs.count();
    
    let expectedRadius: string | null = null;
    
    for (let i = 0; i < Math.min(inputCount, 5); i++) {
      const radius = await inputs.nth(i).evaluate(el => getComputedStyle(el).borderRadius);
      
      if (expectedRadius === null) {
        expectedRadius = radius;
      } else {
        expect(radius).toBe(expectedRadius);
      }
    }
    
    // Verify it matches RADIUS_TOKENS.md = 6px
    expect(expectedRadius).toBe('6px');
  });

  test('Shadows are applied consistently', async ({ page }) => {
    // Inputs should have xs shadow
    const input = page.locator('.ds-input').first();
    const inputShadow = await input.evaluate(el => getComputedStyle(el).boxShadow);
    expect(inputShadow).not.toBe('none');
    
    // Buttons should have sm shadow
    const button = page.locator('.ds-button').first();
    const buttonShadow = await button.evaluate(el => getComputedStyle(el).boxShadow);
    expect(buttonShadow).not.toBe('none');
    
    // Button shadow should be more prominent than input
    expect(buttonShadow.length).toBeGreaterThan(inputShadow.length);
  });

  test('Transitions are smooth and consistent', async ({ page }) => {
    const input = page.locator('.ds-input').first();
    
    // Check transition property exists
    const transition = await input.evaluate(el => getComputedStyle(el).transition);
    
    // Should have transition
    expect(transition).not.toBe('none');
    expect(transition).not.toBe('all 0s ease 0s');
    
    // Should include border-color (for focus state)
    expect(transition.toLowerCase()).toContain('border-color');
  });

  test('Disabled states are visually distinct', async ({ page }) => {
    // Create disabled input for testing
    await page.evaluate(() => {
      const input = document.createElement('input');
      input.className = 'ds-input';
      input.disabled = true;
      input.setAttribute('data-test', 'disabled-input');
      document.body.appendChild(input);
    });
    
    const disabledInput = page.locator('[data-test="disabled-input"]');
    const enabledInput = page.locator('.ds-input:not([disabled])').first();
    
    const disabledBg = await disabledInput.evaluate(el => getComputedStyle(el).backgroundColor);
    const enabledBg = await enabledInput.evaluate(el => getComputedStyle(el).backgroundColor);
    
    // Disabled should have different background
    expect(disabledBg).not.toBe(enabledBg);
    expect(disabledBg).toContain('249, 250, 251'); // gray-50
  });

  test('Color contrast meets WCAG AA', async ({ page }) => {
    // Helper to calculate relative luminance
    const getLuminance = (rgb: string): number => {
      const [r, g, b] = rgb.match(/\d+/g)!.map(Number);
      const [rs, gs, bs] = [r, g, b].map(c => {
        c = c / 255;
        return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
      });
      return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
    };
    
    // Helper to calculate contrast ratio
    const getContrastRatio = (fg: string, bg: string): number => {
      const l1 = getLuminance(fg);
      const l2 = getLuminance(bg);
      const lighter = Math.max(l1, l2);
      const darker = Math.min(l1, l2);
      return (lighter + 0.05) / (darker + 0.05);
    };
    
    // Check label on background
    const label = page.locator('[data-ds="label"]').first();
    const labelColor = await label.evaluate(el => getComputedStyle(el).color);
    const labelBg = await label.evaluate(el => {
      let el2: Element | null = el;
      while (el2) {
        const bg = getComputedStyle(el2 as HTMLElement).backgroundColor;
        if (bg !== 'rgba(0, 0, 0, 0)' && bg !== 'transparent') return bg;
        el2 = el2.parentElement;
      }
      return 'rgb(255, 255, 255)';
    });
    
    const contrastRatio = getContrastRatio(labelColor, labelBg);
    
    // WCAG AA requires 4.5:1 for normal text
    expect(contrastRatio).toBeGreaterThanOrEqual(4.5);
  });
});

test.describe('Dark Theme Contract Tests', () => {
  test('Dark theme colors are applied when data-theme="dark"', async ({ page }) => {
    await page.goto('http://localhost:5173');
    
    // Apply dark theme
    await page.evaluate(() => {
      document.documentElement.setAttribute('data-theme', 'dark');
    });
    
    // Check if inputs have dark background
    const input = page.locator('.ds-input').first();
    const bgColor = await input.evaluate(el => getComputedStyle(el).backgroundColor);
    
    // Should not be white in dark mode
    expect(bgColor).not.toBe('rgb(255, 255, 255)');
  });
});

test.describe('Responsive Design Contract Tests', () => {
  test('Touch targets are larger on mobile', async ({ page }) => {
    // Mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('http://localhost:5173');
    
    const input = page.locator('.ds-input').first();
    const mobileHeight = await input.evaluate(el => getComputedStyle(el).minHeight);
    
    // Desktop viewport
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.reload();
    
    const desktopHeight = await input.evaluate(el => getComputedStyle(el).minHeight);
    
    // Mobile should be >= desktop
    expect(parseInt(mobileHeight)).toBeGreaterThanOrEqual(parseInt(desktopHeight));
  });
});
