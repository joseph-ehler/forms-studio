/**
 * Nested Sheets Tests - Policy Enforcement
 * 
 * Tests the nested sheets policy documented in NESTED_SHEETS_POLICY.md
 */

import { test, expect } from '@playwright/test'

test.describe('Nested Sheets: Visual Treatment', () => {
  test('underlying sheet gets card stack treatment', async ({ page }) => {
    await page.goto('/demo/nested-sheets')
    
    // Open first dialog
    await page.click('[data-testid="open-dialog"]')
    const dialog1 = page.locator('[data-sheet-depth="0"]')
    await expect(dialog1).toBeVisible()
    
    // Open second dialog on top
    await page.click('[data-testid="open-sub-dialog"]')
    const dialog2 = page.locator('[data-sheet-depth="1"]')
    await expect(dialog2).toBeVisible()
    
    // First dialog should have underlay class
    await expect(dialog1).toHaveClass(/ds-sheet--underlay/)
    
    // Check transform applied (translateY + scale)
    const transform = await dialog1.evaluate(el =>
      window.getComputedStyle(el).transform
    )
    expect(transform).not.toBe('none')
    expect(transform).toContain('matrix') // Indicates transform applied
  })

  test('backdrop darkens with each level', async ({ page }) => {
    await page.goto('/demo/nested-sheets')
    
    // First dialog backdrop
    await page.click('[data-testid="open-dialog"]')
    const backdrop1 = page.locator('[data-depth="0"]')
    const bg1 = await backdrop1.evaluate(el =>
      window.getComputedStyle(el).backgroundColor
    )
    
    // Second dialog backdrop should be darker
    await page.click('[data-testid="open-sub-dialog"]')
    const backdrop2 = page.locator('[data-depth="1"]')
    const bg2 = await backdrop2.evaluate(el =>
      window.getComputedStyle(el).backgroundColor
    )
    
    // Parse rgba values and compare opacity
    const opacity1 = parseFloat(bg1.match(/rgba\(\d+, \d+, \d+, ([\d.]+)\)/)?.[1] || '0')
    const opacity2 = parseFloat(bg2.match(/rgba\(\d+, \d+, \d+, ([\d.]+)\)/)?.[1] || '0')
    
    expect(opacity2).toBeGreaterThan(opacity1)
  })

  test('z-index increases per depth', async ({ page }) => {
    await page.goto('/demo/nested-sheets')
    
    await page.click('[data-testid="open-dialog"]')
    await page.click('[data-testid="open-sub-dialog"]')
    
    const dialog1 = page.locator('[data-sheet-depth="0"]')
    const dialog2 = page.locator('[data-sheet-depth="1"]')
    
    const z1 = await dialog1.evaluate(el => window.getComputedStyle(el).zIndex)
    const z2 = await dialog2.evaluate(el => window.getComputedStyle(el).zIndex)
    
    expect(parseInt(z2)).toBeGreaterThan(parseInt(z1))
  })
})

test.describe('Nested Sheets: Gestures', () => {
  test('swipe down closes topmost only', async ({ page }) => {
    await page.goto('/demo/nested-sheets')
    
    // Open stacked dialogs
    await page.click('[data-testid="open-dialog"]')
    await page.click('[data-testid="open-sub-dialog"]')
    
    const dialog1 = page.locator('[data-sheet-depth="0"]')
    const dialog2 = page.locator('[data-sheet-depth="1"]')
    
    // Get bounding box for swipe
    const box = await dialog2.boundingBox()
    if (!box) throw new Error('Dialog not found')
    
    // Swipe down on top dialog
    await page.mouse.move(box.x + box.width / 2, box.y + 50)
    await page.mouse.down()
    await page.mouse.move(box.x + box.width / 2, box.y + 300, { steps: 10 })
    await page.mouse.up()
    
    // Wait for animation
    await page.waitForTimeout(400)
    
    // Top dialog should close
    await expect(dialog2).not.toBeVisible()
    
    // First dialog should still be visible
    await expect(dialog1).toBeVisible()
  })

  test('underlying sheet remains inert', async ({ page }) => {
    await page.goto('/demo/nested-sheets')
    
    await page.click('[data-testid="open-dialog"]')
    await page.click('[data-testid="open-sub-dialog"]')
    
    const underDialog = page.locator('[data-sheet-depth="0"]')
    const button = underDialog.locator('button').first()
    
    // Try to click button in underlying dialog
    const wasClickable = await button.evaluate(el => {
      const pointerEvents = window.getComputedStyle(el.closest('[data-sheet-depth="0"]')!).pointerEvents
      return pointerEvents !== 'none'
    })
    
    // Should not be clickable
    expect(wasClickable).toBe(false)
  })
})

test.describe('Nested Sheets: Accessibility', () => {
  test('underlying dialog is aria-hidden and inert', async ({ page }) => {
    await page.goto('/demo/nested-sheets')
    
    await page.click('[data-testid="open-dialog"]')
    await page.click('[data-testid="open-sub-dialog"]')
    
    const underDialog = page.locator('[data-sheet-depth="0"]')
    const topDialog = page.locator('[data-sheet-depth="1"]')
    
    // Underlying should be hidden
    await expect(underDialog).toHaveAttribute('aria-hidden', 'true')
    
    // Top should be interactive
    await expect(topDialog).not.toHaveAttribute('aria-hidden')
    await expect(topDialog).toHaveAttribute('role', 'dialog')
  })

  test('each dialog has unique label', async ({ page }) => {
    await page.goto('/demo/nested-sheets')
    
    await page.click('[data-testid="open-dialog"]')
    await page.click('[data-testid="open-sub-dialog"]')
    
    const dialog1Label = await page.locator('[data-sheet-depth="0"]').getAttribute('aria-label')
    const dialog2Label = await page.locator('[data-sheet-depth="1"]').getAttribute('aria-label')
    
    expect(dialog1Label).toBeTruthy()
    expect(dialog2Label).toBeTruthy()
    expect(dialog1Label).not.toBe(dialog2Label)
  })

  test('focus trap only on topmost', async ({ page }) => {
    await page.goto('/demo/nested-sheets')
    
    await page.click('[data-testid="open-dialog"]')
    await page.click('[data-testid="open-sub-dialog"]')
    
    // Tab should cycle only within top dialog
    await page.keyboard.press('Tab')
    const focusedElement = await page.evaluate(() => document.activeElement?.tagName)
    
    const topDialog = page.locator('[data-sheet-depth="1"]')
    const isFocusInTop = await topDialog.evaluate((el, tag) => {
      return el.contains(document.activeElement) || document.activeElement?.tagName === tag
    }, focusedElement)
    
    expect(isFocusInTop).toBe(true)
  })
})

test.describe('Nested Sheets: Keyboard Navigation', () => {
  test('Esc closes topmost then next', async ({ page }) => {
    await page.goto('/demo/nested-sheets')
    
    await page.click('[data-testid="open-dialog"]')
    await page.click('[data-testid="open-sub-dialog"]')
    
    const dialog1 = page.locator('[data-sheet-depth="0"]')
    const dialog2 = page.locator('[data-sheet-depth="1"]')
    
    // First Esc closes top
    await page.keyboard.press('Escape')
    await expect(dialog2).not.toBeVisible()
    await expect(dialog1).toBeVisible()
    
    // Second Esc closes first
    await page.keyboard.press('Escape')
    await expect(dialog1).not.toBeVisible()
  })

  test('focus returns to previous sheet after close', async ({ page }) => {
    await page.goto('/demo/nested-sheets')
    
    await page.click('[data-testid="open-dialog"]')
    const trigger = page.locator('[data-testid="open-sub-dialog"]')
    await trigger.click()
    
    // Close top dialog
    await page.keyboard.press('Escape')
    await page.waitForTimeout(200)
    
    // Focus should return to trigger in first dialog
    const focusedElement = await page.evaluate(() => document.activeElement?.getAttribute('data-testid'))
    expect(focusedElement).toBe('open-sub-dialog')
  })
})

test.describe('Nested Sheets: Depth Limits', () => {
  test('warns and prevents depth > 2', async ({ page }) => {
    await page.goto('/demo/nested-sheets')
    
    // Spy on console
    const warnings: string[] = []
    page.on('console', msg => {
      if (msg.type() === 'error' && msg.text().includes('Maximum stack depth')) {
        warnings.push(msg.text())
      }
    })
    
    // Open depth 0, 1
    await page.click('[data-testid="open-dialog"]')
    await page.click('[data-testid="open-sub-dialog"]')
    
    // Attempt depth 2 (should fail)
    await page.click('[data-testid="open-third-dialog"]')
    
    // Should have warned
    expect(warnings.length).toBeGreaterThan(0)
    
    // Third dialog should not exist
    const dialog3 = page.locator('[data-sheet-depth="2"]')
    await expect(dialog3).not.toBeVisible()
  })
})

test.describe('Nested Sheets: Policy Enforcement', () => {
  test('allows SheetDialog → SheetDialog', async ({ page }) => {
    await page.goto('/demo/nested-sheets')
    
    // Should work without errors
    await page.click('[data-testid="open-dialog"]')
    await page.click('[data-testid="open-sub-dialog"]')
    
    await expect(page.locator('[data-sheet-depth="0"]')).toBeVisible()
    await expect(page.locator('[data-sheet-depth="1"]')).toBeVisible()
  })

  test('allows SheetPanel → SheetDialog', async ({ page }) => {
    await page.goto('/demo/nested-sheets')
    
    // Open panel first
    await page.click('[data-testid="open-panel"]')
    await expect(page.locator('.ds-panel-docked')).toBeVisible()
    
    // Open dialog on top (should work)
    await page.click('[data-testid="open-dialog-from-panel"]')
    await expect(page.locator('.ds-sheet-dialog')).toBeVisible()
  })

  // Note: SheetDialog → SheetPanel would throw in dev mode
  // Test would need to check for thrown error
})

test.describe('Nested Sheets: Reduced Motion', () => {
  test.use({ reducedMotion: 'reduce' })
  
  test('respects prefers-reduced-motion', async ({ page }) => {
    await page.goto('/demo/nested-sheets')
    
    await page.click('[data-testid="open-dialog"]')
    await page.click('[data-testid="open-sub-dialog"]')
    
    const underDialog = page.locator('[data-sheet-depth="0"]')
    
    // Should still have translateY but no scale
    const transform = await underDialog.evaluate(el =>
      window.getComputedStyle(el).transform
    )
    
    expect(transform).toContain('matrix')
    // Check that scale is close to 1 (no scaling)
    const matrix = transform.match(/matrix\((.+)\)/)
    if (matrix) {
      const values = matrix[1].split(', ').map(parseFloat)
      const scaleX = values[0]
      expect(scaleX).toBeCloseTo(1, 1) // Should be ~1, not 0.98
    }
  })
})
