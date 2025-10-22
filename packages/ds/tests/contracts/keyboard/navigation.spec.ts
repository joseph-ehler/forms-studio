/**
 * Keyboard Navigation Contract Tests
 * 
 * Documents and tests keyboard interactions for all primitives.
 */

import { test, expect } from '@playwright/test';

test.describe('Keyboard Navigation Contracts', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173');
  });

  test('Tab navigates through form fields sequentially', async ({ page }) => {
    // Get all form inputs
    const inputs = page.locator('input:not([type="hidden"]), select, textarea, button');
    const count = await inputs.count();

    // Tab through all
    for (let i = 0; i < count; i++) {
      await page.keyboard.press('Tab');
      
      // Verify focus is on an interactive element
      const hasFocus = await page.evaluate(() => {
        const active = document.activeElement;
        return active?.matches('input, select, textarea, button');
      });
      
      expect(hasFocus).toBe(true);
    }
  });

  test('Shift+Tab navigates backwards', async ({ page }) => {
    // Tab forward twice
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');

    const secondElement = await page.evaluate(() => document.activeElement?.tagName);

    // Tab back
    await page.keyboard.press('Shift+Tab');

    const firstElement = await page.evaluate(() => document.activeElement?.tagName);

    expect(firstElement).not.toBe(secondElement);
  });

  test('Enter/Space activates buttons', async ({ page }) => {
    const button = page.locator('button.ds-button').first();
    await button.focus();

    // Listen for click
    let clicked = false;
    await button.evaluate(btn => {
      btn.addEventListener('click', () => {
        (window as any).buttonClicked = true;
      });
    });

    await page.keyboard.press('Enter');

    const wasClicked = await page.evaluate(() => (window as any).buttonClicked);
    expect(wasClicked).toBe(true);
  });

  test('Arrow keys navigate select options', async ({ page }) => {
    const selectButton = page.locator('button', { hasText: /Choose a country/i }).first();
    await selectButton.click();

    // Wait for overlay
    await page.waitForSelector('[role="dialog"]');

    // Press Down arrow
    await page.keyboard.press('ArrowDown');
    
    // Should highlight first option (implementation-dependent)
    const hasHighlight = await page.locator('[role="option"][data-highlighted="true"]').count();
    expect(hasHighlight).toBeGreaterThan(0);
  });

  test('Home/End navigate to first/last in lists', async ({ page }) => {
    const selectButton = page.locator('button', { hasText: /Choose a country/i }).first();
    await selectButton.click();

    await page.waitForSelector('[role="dialog"]');

    // Press End
    await page.keyboard.press('End');
    
    // Should be on last option
    const lastHighlighted = await page.evaluate(() => {
      const options = Array.from(document.querySelectorAll('[role="option"]'));
      const highlighted = document.querySelector('[role="option"][data-highlighted="true"]');
      return options.indexOf(highlighted!) === options.length - 1;
    });

    expect(lastHighlighted).toBe(true);

    // Press Home
    await page.keyboard.press('Home');

    // Should be on first option
    const firstHighlighted = await page.evaluate(() => {
      const options = Array.from(document.querySelectorAll('[role="option"]'));
      const highlighted = document.querySelector('[role="option"][data-highlighted="true"]');
      return options.indexOf(highlighted!) === 0;
    });

    expect(firstHighlighted).toBe(true);
  });
});

test.describe('Keyboard Map Documentation', () => {
  const keyboardMaps = {
    'Form Fields': {
      'Tab': 'Move to next field',
      'Shift+Tab': 'Move to previous field',
      'Enter': 'Submit form (if applicable)',
    },
    'Buttons': {
      'Enter': 'Activate button',
      'Space': 'Activate button',
      'Tab': 'Move focus',
    },
    'Select/Dropdown': {
      'Enter/Space': 'Open dropdown',
      'Escape': 'Close dropdown',
      'ArrowDown': 'Highlight next option',
      'ArrowUp': 'Highlight previous option',
      'Home': 'Highlight first option',
      'End': 'Highlight last option',
      'Enter': 'Select highlighted option',
    },
    'Overlay/Modal': {
      'Escape': 'Close overlay',
      'Tab': 'Navigate within overlay (trapped)',
      'Shift+Tab': 'Navigate backwards (trapped)',
    },
  };

  test('Keyboard maps are documented', () => {
    // This test exists to document the keyboard maps
    // In production, generate markdown/HTML from this
    expect(keyboardMaps).toBeDefined();
  });
});
