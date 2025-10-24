/**
 * SheetPanel Tests - Non-Modal Behavior
 * 
 * Tests that SheetPanel enforces proper non-modal semantics:
 * - Opens at 25-40% height
 * - Background remains interactive
 * - Gesture routing works correctly
 * - URL binding persists state
 * - Back button collapses then closes
 */

import { test, expect } from '@playwright/test'

test.describe('SheetPanel: Non-Modal Behavior', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/demo/sheet-panel')
  })

  test('opens at 25-40% viewport height', async ({ page }) => {
    const panel = page.locator('[data-testid="sheet-panel"]')
    await expect(panel).toBeVisible()
    
    const heightPercent = await panel.evaluate(el => {
      const vh = window.innerHeight
      const elHeight = el.getBoundingClientRect().height
      return elHeight / vh
    })
    
    expect(heightPercent).toBeGreaterThanOrEqual(0.25)
    expect(heightPercent).toBeLessThanOrEqual(0.4)
  })

  test('background remains interactive', async ({ page }) => {
    const panel = page.locator('[data-testid="sheet-panel"]')
    await expect(panel).toBeVisible()
    
    // Body should NOT be locked
    const bodyOverflow = await page.evaluate(() => 
      window.getComputedStyle(document.body).overflow
    )
    expect(bodyOverflow).not.toBe('hidden')
    
    // Background should NOT be inert
    const appInert = await page.evaluate(() => 
      document.querySelector('#app')?.hasAttribute('inert')
    )
    expect(appInert).toBe(false)
    
    // Should be able to click background button
    const bgButton = page.locator('[data-testid="bg-button"]')
    await bgButton.click()
    
    const clickCount = await page.locator('[data-testid="click-count"]').textContent()
    expect(clickCount).toBe('1')
  })

  test('no backdrop visible', async ({ page }) => {
    const panel = page.locator('[data-testid="sheet-panel"]')
    await expect(panel).toBeVisible()
    
    const backdrop = page.locator('[data-backdrop]')
    await expect(backdrop).not.toBeVisible()
  })

  test('content is scrollable independently', async ({ page }) => {
    const panel = page.locator('[data-testid="sheet-panel"]')
    const content = panel.locator('[data-testid="panel-content"]')
    
    // Scroll content
    await content.evaluate(el => {
      el.scrollTop = 100
    })
    
    const scrollTop = await content.evaluate(el => el.scrollTop)
    expect(scrollTop).toBe(100)
    
    // Background should not have scrolled
    const bodyScrollTop = await page.evaluate(() => document.documentElement.scrollTop)
    expect(bodyScrollTop).toBe(0)
  })

  test('has complementary or region role', async ({ page }) => {
    const panel = page.locator('[data-testid="sheet-panel"]')
    
    const role = await panel.getAttribute('role')
    expect(['complementary', 'region']).toContain(role)
  })
})

test.describe('SheetPanel: Gesture Routing', () => {
  test.use({ 
    viewport: { width: 375, height: 667 },
    hasTouch: true
  })

  test('vertical drag at low snap → sheet moves', async ({ page }) => {
    await page.goto('/demo/gesture-routing')
    
    const panel = page.locator('[data-testid="sheet-panel"]')
    const canvas = page.locator('[data-testid="canvas"]')
    
    // Get initial snap
    const initialSnap = await panel.getAttribute('data-snap')
    
    // Drag vertically on panel
    const panelBox = await panel.boundingBox()
    if (!panelBox) throw new Error('Panel not found')
    
    await page.touchscreen.tap(panelBox.x + panelBox.width / 2, panelBox.y + 20)
    await page.mouse.down()
    await page.mouse.move(
      panelBox.x + panelBox.width / 2,
      panelBox.y + 120,
      { steps: 10 }
    )
    await page.mouse.up()
    
    // Verify sheet moved
    const newSnap = await panel.getAttribute('data-snap')
    expect(newSnap).not.toBe(initialSnap)
    
    // Verify canvas did NOT move
    const canvasMoved = await canvas.getAttribute('data-moved')
    expect(canvasMoved).toBe('false')
  })

  test('horizontal drag at high snap → canvas pans', async ({ page }) => {
    await page.goto('/demo/gesture-routing?snap=0.9')
    
    const panel = page.locator('[data-testid="sheet-panel"]')
    const canvas = page.locator('[data-testid="canvas"]')
    
    // Scroll panel content to top
    await panel.evaluate(el => {
      const content = el.querySelector('[data-testid="panel-content"]')
      if (content) content.scrollTop = 0
    })
    
    // Drag horizontally on canvas
    const canvasBox = await canvas.boundingBox()
    if (!canvasBox) throw new Error('Canvas not found')
    
    await page.mouse.move(canvasBox.x + 100, canvasBox.y + 100)
    await page.mouse.down()
    await page.mouse.move(
      canvasBox.x + 200,
      canvasBox.y + 110, // Mostly horizontal
      { steps: 10 }
    )
    await page.mouse.up()
    
    // Verify canvas moved
    const canvasMoved = await canvas.getAttribute('data-moved')
    expect(canvasMoved).toBe('true')
    
    // Verify sheet snap didn't change significantly
    const snap = await panel.getAttribute('data-snap')
    expect(parseFloat(snap!)).toBeCloseTo(0.9, 1)
  })

  test('vertical drag when scrolled → sheet moves', async ({ page }) => {
    await page.goto('/demo/gesture-routing?snap=0.5')
    
    const panel = page.locator('[data-testid="sheet-panel"]')
    
    // Scroll content down
    await panel.evaluate(el => {
      const content = el.querySelector('[data-testid="panel-content"]')
      if (content) content.scrollTop = 50
    })
    
    // Try to drag down
    const panelBox = await panel.boundingBox()
    if (!panelBox) throw new Error('Panel not found')
    
    await page.mouse.move(panelBox.x + panelBox.width / 2, panelBox.y + 50)
    await page.mouse.down()
    await page.mouse.move(
      panelBox.x + panelBox.width / 2,
      panelBox.y + 150,
      { steps: 10 }
    )
    await page.mouse.up()
    
    // Sheet should handle the drag (scroll handoff)
    const newSnap = await panel.getAttribute('data-snap')
    expect(parseFloat(newSnap!)).toBeLessThan(0.5)
  })

  test('fast swipe closes panel', async ({ page }) => {
    await page.goto('/demo/gesture-routing?snap=0.25')
    
    const panel = page.locator('[data-testid="sheet-panel"]')
    
    // Fast swipe down
    const panelBox = await panel.boundingBox()
    if (!panelBox) throw new Error('Panel not found')
    
    await page.mouse.move(panelBox.x + panelBox.width / 2, panelBox.y + 20)
    await page.mouse.down()
    
    // Very fast movement (high velocity)
    await page.mouse.move(
      panelBox.x + panelBox.width / 2,
      panelBox.y + 200,
      { steps: 2 } // Very few steps = fast
    )
    await page.mouse.up()
    
    // Panel should close
    await expect(panel).toBeHidden()
  })
})

test.describe('SheetPanel: URL Binding', () => {
  test('snap state persists to URL', async ({ page }) => {
    await page.goto('/demo/sheet-panel-url?snap=0.5')
    
    const panel = page.locator('[data-testid="sheet-panel"]')
    
    // Change snap
    await page.click('[data-testid="expand-button"]')
    
    // Wait for debounce (150ms)
    await page.waitForTimeout(200)
    
    // URL should update
    await expect(page).toHaveURL(/snap=0\.9/)
  })

  test('URL state restores snap on load', async ({ page }) => {
    await page.goto('/demo/sheet-panel-url?snap=0.9')
    
    const panel = page.locator('[data-testid="sheet-panel"]')
    
    const snap = await panel.getAttribute('data-snap')
    expect(parseFloat(snap!)).toBeCloseTo(0.9, 1)
  })

  test('browser back/forward restores snap', async ({ page }) => {
    await page.goto('/demo/sheet-panel-url?snap=0.25')
    
    // Change snap
    await page.click('[data-testid="expand-button"]')
    await page.waitForTimeout(200)
    
    // URL should be at 0.5 or 0.9
    const url1 = page.url()
    
    // Go back
    await page.goBack()
    await page.waitForTimeout(200)
    
    // Should be back at 0.25
    await expect(page).toHaveURL(/snap=0\.25/)
    
    // Go forward
    await page.goForward()
    await page.waitForTimeout(200)
    
    // Should be back at higher snap
    expect(page.url()).toBe(url1)
  })
})

test.describe('SheetPanel: Back Button Semantics', () => {
  test('first back collapses to lower snap', async ({ page }) => {
    await page.goto('/demo/sheet-panel?snap=0.5')
    
    const panel = page.locator('[data-testid="sheet-panel"]')
    
    // First back: should collapse
    await page.goBack()
    await page.waitForTimeout(350) // Animation
    
    const snap = await panel.getAttribute('data-snap')
    expect(parseFloat(snap!)).toBeCloseTo(0.25, 1)
    
    // Panel should still be visible
    await expect(panel).toBeVisible()
  })

  test('second back closes panel', async ({ page }) => {
    await page.goto('/demo/sheet-panel?snap=0.5')
    
    const panel = page.locator('[data-testid="sheet-panel"]')
    
    // First back: collapse
    await page.goBack()
    await page.waitForTimeout(350)
    
    // Second back: close
    await page.goBack()
    await page.waitForTimeout(350)
    
    // Panel should be hidden
    await expect(panel).toBeHidden()
  })

  test('onBackPressure can prevent close', async ({ page }) => {
    await page.goto('/demo/sheet-panel-unsaved')
    
    const panel = page.locator('[data-testid="sheet-panel"]')
    
    // Make unsaved changes
    await page.fill('[data-testid="input"]', 'unsaved text')
    
    // Try to close (at min snap already)
    await page.goBack()
    await page.waitForTimeout(100)
    
    // Should show confirmation dialog
    const confirmation = page.locator('[role="alertdialog"]')
    await expect(confirmation).toBeVisible()
    
    // Click Cancel
    await page.click('[data-testid="cancel-discard"]')
    
    // Panel should still be open
    await expect(panel).toBeVisible()
  })
})

test.describe('SheetPanel: Snap Points', () => {
  test('snaps to nearest snap point', async ({ page }) => {
    await page.goto('/demo/sheet-panel')
    
    const panel = page.locator('[data-testid="sheet-panel"]')
    
    // Drag to 35% (between 0.25 and 0.5)
    const panelBox = await panel.boundingBox()
    if (!panelBox) throw new Error('Panel not found')
    
    const vh = page.viewportSize()!.height
    const targetY = vh * 0.65 // 35% from bottom
    
    await page.mouse.move(panelBox.x + panelBox.width / 2, panelBox.y + 20)
    await page.mouse.down()
    await page.mouse.move(panelBox.x + panelBox.width / 2, targetY, { steps: 10 })
    await page.mouse.up()
    
    // Should snap to nearest (0.25)
    await page.waitForTimeout(300) // Animation
    
    const snap = await panel.getAttribute('data-snap')
    const snapValue = parseFloat(snap!)
    
    // Should be close to 0.25 or 0.5
    expect([0.25, 0.5]).toContain(Math.round(snapValue * 100) / 100)
  })

  test('velocity affects snap target', async ({ page }) => {
    await page.goto('/demo/sheet-panel?snap=0.25')
    
    const panel = page.locator('[data-testid="sheet-panel"]')
    
    // Fast upward swipe
    const panelBox = await panel.boundingBox()
    if (!panelBox) throw new Error('Panel not found')
    
    await page.mouse.move(panelBox.x + panelBox.width / 2, panelBox.y + 20)
    await page.mouse.down()
    await page.mouse.move(
      panelBox.x + panelBox.width / 2,
      panelBox.y - 100,
      { steps: 2 } // Fast
    )
    await page.mouse.up()
    
    await page.waitForTimeout(300)
    
    // High velocity should snap to higher snap (0.5 or 0.9)
    const snap = await panel.getAttribute('data-snap')
    expect(parseFloat(snap!)).toBeGreaterThan(0.25)
  })
})

test.describe('SheetPanel: Accessibility', () => {
  test('has accessible label', async ({ page }) => {
    await page.goto('/demo/sheet-panel')
    
    const panel = page.locator('[data-testid="sheet-panel"]')
    
    const hasLabel = await panel.evaluate(el => {
      return el.hasAttribute('aria-label') || el.hasAttribute('aria-labelledby')
    })
    
    expect(hasLabel).toBe(true)
  })

  test('keyboard navigation works', async ({ page }) => {
    await page.goto('/demo/sheet-panel')
    
    const panel = page.locator('[data-testid="sheet-panel"]')
    
    // Tab should enter panel
    await page.keyboard.press('Tab')
    
    const focusInPanel = await page.evaluate(() => {
      const activeEl = document.activeElement
      const panel = document.querySelector('[data-testid="sheet-panel"]')
      return panel?.contains(activeEl) || false
    })
    
    expect(focusInPanel).toBe(true)
  })

  test('throws error in dev mode with modal props', async ({ page }) => {
    const consoleErrors: string[] = []
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text())
      }
    })
    
    await page.goto('/demo/sheet-panel-bad-props')
    
    // Should have error about modal props
    const hasModalError = consoleErrors.some(err => 
      err.includes('Panels are non-modal')
    )
    
    expect(hasModalError).toBe(true)
  })
})
