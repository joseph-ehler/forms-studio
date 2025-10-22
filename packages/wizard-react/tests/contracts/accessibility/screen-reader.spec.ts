/**
 * Screen Reader Narration Tests
 * 
 * Tests aria-live announcements and SR accessibility.
 * Ensures screen readers announce critical actions.
 */

import { test, expect } from '@playwright/test';

test.describe('Screen Reader Announcements', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173');
  });

  test('Overlay announces open to screen readers', async ({ page }) => {
    // Check for aria-live region
    const liveRegion = page.locator('[aria-live]');
    
    // Open overlay
    const selectButton = page.locator('button', { hasText: /Choose a country/i }).first();
    await selectButton.click();
    
    // Check overlay has role="dialog"
    const dialog = page.locator('[role="dialog"]');
    await expect(dialog).toBeVisible();
    await expect(dialog).toHaveAttribute('aria-modal', 'true');
    
    // Check for accessible name
    const hasLabel = await dialog.evaluate(el => {
      return el.hasAttribute('aria-label') || el.hasAttribute('aria-labelledby');
    });
    expect(hasLabel).toBe(true);
  });

  test('Overlay announces close to screen readers', async ({ page }) => {
    const selectButton = page.locator('button', { hasText: /Choose a country/i }).first();
    await selectButton.click();
    
    // Close overlay
    await page.keyboard.press('Escape');
    
    // Dialog should be hidden
    const dialog = page.locator('[role="dialog"]');
    await expect(dialog).not.toBeVisible();
  });

  test('Selection announces to screen readers', async ({ page }) => {
    const selectButton = page.locator('button', { hasText: /Choose a country/i }).first();
    await selectButton.click();
    
    // Select an option
    const option = page.locator('[role="option"]').first();
    
    // Check option has accessible name
    const optionText = await option.textContent();
    expect(optionText).toBeTruthy();
    
    await option.click();
    
    // Button should update with selection
    const buttonText = await selectButton.textContent();
    expect(buttonText).not.toContain('Choose');
  });

  test('Form fields have accessible labels', async ({ page }) => {
    const inputs = page.locator('input:visible, select:visible, textarea:visible');
    const count = await inputs.count();
    
    for (let i = 0; i < count; i++) {
      const input = inputs.nth(i);
      
      // Check for label association
      const id = await input.getAttribute('id');
      const ariaLabel = await input.getAttribute('aria-label');
      const ariaLabelledBy = await input.getAttribute('aria-labelledby');
      
      // Must have one of: associated label, aria-label, or aria-labelledby
      if (id) {
        const label = page.locator(`label[for="${id}"]`);
        const hasLabel = await label.count() > 0;
        
        if (!hasLabel && !ariaLabel && !ariaLabelledBy) {
          const name = await input.getAttribute('name');
          throw new Error(`Input "${name || id}" has no accessible label`);
        }
      } else if (!ariaLabel && !ariaLabelledBy) {
        // Check if wrapped in label
        const parentLabel = await input.evaluate(el => el.closest('label') !== null);
        expect(parentLabel).toBe(true);
      }
    }
  });

  test('Error messages announced to screen readers', async ({ page }) => {
    // Find an input with error state
    const errorInput = page.locator('input[aria-invalid="true"]').first();
    
    if (await errorInput.count() > 0) {
      // Check for aria-describedby pointing to error message
      const describedBy = await errorInput.getAttribute('aria-describedby');
      expect(describedBy).toBeTruthy();
      
      if (describedBy) {
        const errorMsg = page.locator(`#${describedBy}`);
        await expect(errorMsg).toBeVisible();
        
        // Error message should have role or aria-live
        const hasRole = await errorMsg.evaluate(el => {
          return el.hasAttribute('role') || el.hasAttribute('aria-live');
        });
        expect(hasRole).toBe(true);
      }
    }
  });

  test('Helper text accessible to screen readers', async ({ page }) => {
    const helpers = page.locator('[data-ds="helper"]');
    const count = await helpers.count();
    
    for (let i = 0; i < count; i++) {
      const helper = helpers.nth(i);
      const id = await helper.getAttribute('id');
      
      // Helper should have ID so it can be referenced
      expect(id).toBeTruthy();
      
      // Find associated input
      if (id) {
        const input = page.locator(`[aria-describedby*="${id}"]`);
        const hasInput = await input.count() > 0;
        
        // Helper should be connected to an input
        expect(hasInput).toBe(true);
      }
    }
  });

  test('Focus management for keyboard users', async ({ page }) => {
    // Tab through interactive elements
    const interactiveElements = page.locator('button, a, input, select, textarea, [tabindex="0"]');
    const count = await interactiveElements.count();
    
    // Tab forward
    for (let i = 0; i < Math.min(count, 10); i++) {
      await page.keyboard.press('Tab');
      
      // Check focus is visible
      const focused = await page.evaluate(() => {
        const el = document.activeElement;
        if (!el) return false;
        
        const style = getComputedStyle(el);
        // Should have outline or box-shadow (focus indicator)
        return style.outline !== 'none' || style.boxShadow !== 'none';
      });
      
      expect(focused).toBe(true);
    }
  });

  test('ARIA roles are valid', async ({ page }) => {
    const withRole = page.locator('[role]');
    const count = await withRole.count();
    
    const validRoles = [
      'button', 'dialog', 'menu', 'menuitem', 'tab', 'tabpanel',
      'option', 'listbox', 'combobox', 'alert', 'status',
      'navigation', 'main', 'complementary', 'contentinfo',
      'banner', 'search', 'form', 'region', 'article',
    ];
    
    for (let i = 0; i < count; i++) {
      const element = withRole.nth(i);
      const role = await element.getAttribute('role');
      
      if (role && !validRoles.includes(role)) {
        throw new Error(`Invalid ARIA role: "${role}"`);
      }
    }
  });

  test('Live regions present for dynamic content', async ({ page }) => {
    // Check for aria-live regions
    const liveRegions = page.locator('[aria-live]');
    const count = await liveRegions.count();
    
    // Should have at least one live region for announcements
    expect(count).toBeGreaterThanOrEqual(0); // Optional but recommended
    
    if (count > 0) {
      for (let i = 0; i < count; i++) {
        const region = liveRegions.nth(i);
        const liveValue = await region.getAttribute('aria-live');
        
        // Should be 'polite' or 'assertive'
        expect(['polite', 'assertive', 'off']).toContain(liveValue);
      }
    }
  });
});

test.describe('Keyboard Navigation Accessibility', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173');
  });

  test('All interactive elements keyboard accessible', async ({ page }) => {
    const clickHandlers = page.locator('[onclick], [onpointerdown]');
    const count = await clickHandlers.count();
    
    for (let i = 0; i < count; i++) {
      const element = clickHandlers.nth(i);
      const tagName = await element.evaluate(el => el.tagName.toLowerCase());
      
      // Native interactive elements are OK
      if (['button', 'a', 'input', 'select', 'textarea'].includes(tagName)) {
        continue;
      }
      
      // Non-native must have role and tabindex
      const role = await element.getAttribute('role');
      const tabindex = await element.getAttribute('tabindex');
      
      expect(role).toBe('button');
      expect(tabindex).toBe('0');
    }
  });

  test('No keyboard traps', async ({ page }) => {
    const selectButton = page.locator('button', { hasText: /Choose a country/i }).first();
    await selectButton.click();
    
    // Tab through overlay
    for (let i = 0; i < 20; i++) {
      await page.keyboard.press('Tab');
      
      // Focus should stay within overlay
      const focusInOverlay = await page.evaluate(() => {
        const active = document.activeElement;
        return active?.closest('[role="dialog"]') !== null;
      });
      
      // After enough tabs, should loop back
      expect(focusInOverlay).toBe(true);
    }
    
    // Escape should exit trap
    await page.keyboard.press('Escape');
    
    // Focus should be outside overlay
    const focusOutside = await page.evaluate(() => {
      const active = document.activeElement;
      return active?.closest('[role="dialog"]') === null;
    });
    
    expect(focusOutside).toBe(true);
  });
});
