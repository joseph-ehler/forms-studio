/**
 * SheetDialog Tests - Modal Behavior
 * 
 * Tests that SheetDialog enforces proper modal semantics:
 * - Opens at 70-90% height
 * - Focus trapped within dialog
 * - Body scroll locked
 * - Background inert
 * - Esc/Cancel/Done behavior
 */

import { test, expect } from '@playwright/test'

test.describe('SheetDialog: Modal Behavior', () => {
  test.beforeEach(async ({ page }) => {
    // TODO: Update with actual demo URL when ready
    await page.goto('/demo/sheet-dialog')
  })

  test('opens at 70-90% viewport height', async ({ page }) => {
    const trigger = page.locator('[data-testid="open-dialog"]')
    await trigger.click()
    
    const dialog = page.locator('[role="dialog"]')
    await expect(dialog).toBeVisible()
    
    // Measure actual height vs viewport
    const heightPercent = await dialog.evaluate(el => {
      const vh = window.innerHeight
      const elHeight = el.getBoundingClientRect().height
      return elHeight / vh
    })
    
    expect(heightPercent).toBeGreaterThanOrEqual(0.7)
    expect(heightPercent).toBeLessThanOrEqual(0.9)
  })

  test('locks body scroll when open', async ({ page }) => {
    await page.click('[data-testid="open-dialog"]')
    
    const bodyOverflow = await page.evaluate(() => 
      window.getComputedStyle(document.body).overflow
    )
    
    expect(bodyOverflow).toBe('hidden')
  })

  test('makes background inert', async ({ page }) => {
    await page.click('[data-testid="open-dialog"]')
    
    // Check inert attribute
    const appInert = await page.evaluate(() => 
      document.querySelector('#app')?.hasAttribute('inert')
    )
    
    expect(appInert).toBe(true)
    
    // Try to click background button (should not work)
    const bgButton = page.locator('[data-testid="bg-button"]')
    await bgButton.click({ force: true })
    
    // Dialog should still be open
    const dialog = page.locator('[role="dialog"]')
    await expect(dialog).toBeVisible()
  })

  test('traps focus within dialog', async ({ page }) => {
    await page.click('[data-testid="open-dialog"]')
    
    const dialog = page.locator('[role="dialog"]')
    const firstButton = dialog.locator('button').first()
    const lastButton = dialog.locator('button').last()
    
    // Focus first button
    await firstButton.focus()
    await expect(firstButton).toBeFocused()
    
    // Tab through all elements multiple times
    for (let i = 0; i < 10; i++) {
      await page.keyboard.press('Tab')
    }
    
    // Focus should cycle back to first or stay within dialog
    const focusedElement = await page.evaluate(() => {
      const el = document.activeElement
      return el?.closest('[role="dialog"]') !== null
    })
    
    expect(focusedElement).toBe(true)
  })

  test('closes and returns focus on Esc', async ({ page }) => {
    const trigger = page.locator('[data-testid="open-dialog"]')
    await trigger.click()
    
    const dialog = page.locator('[role="dialog"]')
    await expect(dialog).toBeVisible()
    
    // Press Esc
    await page.keyboard.press('Escape')
    
    // Dialog should close
    await expect(dialog).toBeHidden()
    
    // Focus should return to trigger
    await expect(trigger).toBeFocused()
  })

  test('Done button commits changes', async ({ page }) => {
    await page.goto('/demo/multi-select-dialog')
    
    await page.click('[data-testid="trigger"]')
    
    // Select items
    await page.click('[data-value="item1"]')
    await page.click('[data-value="item2"]')
    
    // Click Done
    await page.click('[data-testid="done-button"]')
    
    // Verify committed
    const count = await page.locator('[data-testid="selected-count"]').textContent()
    expect(count).toBe('2')
  })

  test('Cancel button reverts changes', async ({ page }) => {
    await page.goto('/demo/multi-select-dialog')
    
    // Open and commit 2 items
    await page.click('[data-testid="trigger"]')
    await page.click('[data-value="item1"]')
    await page.click('[data-value="item2"]')
    await page.click('[data-testid="done-button"]')
    
    // Open again and add one more
    await page.click('[data-testid="trigger"]')
    await page.click('[data-value="item3"]')
    
    // Click Cancel
    await page.click('[data-testid="cancel-button"]')
    
    // Verify reverted (still 2, not 3)
    const count = await page.locator('[data-testid="selected-count"]').textContent()
    expect(count).toBe('2')
  })

  test('has accessible label', async ({ page }) => {
    await page.click('[data-testid="open-dialog"]')
    
    const dialog = page.locator('[role="dialog"]')
    
    // Should have either aria-label or aria-labelledby
    const hasLabel = await dialog.evaluate(el => {
      return el.hasAttribute('aria-label') || el.hasAttribute('aria-labelledby')
    })
    
    expect(hasLabel).toBe(true)
  })

  test('header and footer remain visible with keyboard', async ({ page, isMobile }) => {
    if (!isMobile) test.skip()
    
    await page.click('[data-testid="open-dialog"]')
    
    // Focus an input to trigger keyboard
    await page.click('input[type="text"]')
    
    // Wait for keyboard to appear (visualViewport change)
    await page.waitForTimeout(500)
    
    // Header should still be visible
    const header = page.locator('[data-testid="dialog-header"]')
    await expect(header).toBeVisible()
    
    // Footer should still be visible
    const footer = page.locator('[data-testid="dialog-footer"]')
    await expect(footer).toBeVisible()
  })

  test('throws error in dev mode without aria-label', async ({ page }) => {
    // This test verifies runtime contracts work
    // In production this would be caught during development
    
    const consoleErrors: string[] = []
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text())
      }
    })
    
    await page.goto('/demo/sheet-dialog-no-label')
    
    // Should have error about missing label
    const hasLabelError = consoleErrors.some(err => 
      err.includes('Missing accessibility label')
    )
    
    expect(hasLabelError).toBe(true)
  })
})

test.describe('SheetDialog: Mobile Specific', () => {
  test.use({ 
    viewport: { width: 375, height: 667 }
  })

  test('handles safe area insets', async ({ page }) => {
    // Mock safe area insets
    await page.addInitScript(() => {
      Object.defineProperty(window, 'visualViewport', {
        value: {
          width: 375,
          height: 553, // 667 - 44 (status bar) - 70 (home indicator area)
          scale: 1,
          offsetLeft: 0,
          offsetTop: 44,
        }
      })
    })
    
    await page.goto('/demo/sheet-dialog')
    await page.click('[data-testid="open-dialog"]')
    
    const dialog = page.locator('[role="dialog"]')
    
    // Footer should respect safe area
    const footerBottom = await dialog.evaluate(el => {
      const footer = el.querySelector('[data-testid="dialog-footer"]')
      return footer ? window.getComputedStyle(footer).paddingBottom : '0'
    })
    
    // Should have some padding (env(safe-area-inset-bottom))
    expect(footerBottom).not.toBe('0px')
  })

  test('prevents background scroll on iOS', async ({ page }) => {
    await page.goto('/demo/sheet-dialog')
    await page.click('[data-testid="open-dialog"]')
    
    // Check document scroll prevention
    const isScrollPrevented = await page.evaluate(() => {
      return (
        document.documentElement.style.overflow === 'hidden' &&
        document.body.style.overflow === 'hidden'
      )
    })
    
    expect(isScrollPrevented).toBe(true)
  })
})

test.describe('SheetDialog: Accessibility', () => {
  test('announces to screen readers', async ({ page }) => {
    await page.goto('/demo/sheet-dialog')
    
    // Listen for aria-live announcements
    const announcements: string[] = []
    await page.exposeFunction('captureAnnouncement', (text: string) => {
      announcements.push(text)
    })
    
    await page.evaluate(() => {
      const observer = new MutationObserver((mutations) => {
        mutations.forEach(mutation => {
          const target = mutation.target as HTMLElement
          if (target.getAttribute('aria-live')) {
            (window as any).captureAnnouncement(target.textContent || '')
          }
        })
      })
      
      observer.observe(document.body, {
        subtree: true,
        characterData: true,
        childList: true,
      })
    })
    
    await page.click('[data-testid="open-dialog"]')
    await page.waitForTimeout(100)
    
    // Should announce dialog opening
    expect(announcements.length).toBeGreaterThan(0)
  })

  test('respects prefers-reduced-motion', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.goto('/demo/sheet-dialog')
    
    await page.click('[data-testid="open-dialog"]')
    
    const dialog = page.locator('[role="dialog"]')
    
    // Should appear instantly without animation
    const hasTransition = await dialog.evaluate(el => {
      const style = window.getComputedStyle(el)
      return style.transition !== 'none' && style.transition !== ''
    })
    
    expect(hasTransition).toBe(false)
  })
})
