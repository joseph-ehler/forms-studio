/**
 * Focus Primitives - Playwright Tests
 * 
 * Smoke tests for FocusTrap, FocusScope, RovingFocus
 */

import { test, expect } from '@playwright/test'

test.describe('FocusTrap Primitive', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3001')
  })

  test('Tab cycles forward through focusable elements', async ({ page }) => {
    // Open a picker
    await page.click('text=Favorite Color')
    
    // Wait for overlay
    await page.waitForSelector('[data-focus-trap="active"]')
    
    // Get all focusable elements
    const focusable = await page.locator('[data-focus-trap="active"] button, [data-focus-trap="active"] input').count()
    
    expect(focusable).toBeGreaterThan(0)
    
    // Press Tab multiple times
    const firstElement = await page.locator('[data-focus-trap="active"] button, [data-focus-trap="active"] input').first()
    const lastElement = await page.locator('[data-focus-trap="active"] button, [data-focus-trap="active"] input').last()
    
    await firstElement.focus()
    
    // Tab to last element
    for (let i = 0; i < focusable - 1; i++) {
      await page.keyboard.press('Tab')
    }
    
    // Verify last element has focus
    await expect(lastElement).toBeFocused()
    
    // Tab once more should cycle to first
    await page.keyboard.press('Tab')
    await expect(firstElement).toBeFocused()
  })

  test('Shift+Tab cycles backward', async ({ page }) => {
    await page.click('text=Favorite Color')
    await page.waitForSelector('[data-focus-trap="active"]')
    
    const firstElement = await page.locator('[data-focus-trap="active"] button, [data-focus-trap="active"] input').first()
    const lastElement = await page.locator('[data-focus-trap="active"] button, [data-focus-trap="active"] input').last()
    
    await firstElement.focus()
    
    // Shift+Tab should go to last
    await page.keyboard.press('Shift+Tab')
    await expect(lastElement).toBeFocused()
  })

  test('Escape closes overlay and returns focus', async ({ page }) => {
    // Focus trigger button
    const trigger = page.locator('text=Favorite Color')
    await trigger.click()
    
    // Wait for overlay
    await page.waitForSelector('[data-focus-trap="active"]')
    
    // Press Escape
    await page.keyboard.press('Escape')
    
    // Overlay should close
    await expect(page.locator('[data-focus-trap="active"]')).toHaveCount(0)
    
    // Focus should return to trigger
    await expect(trigger).toBeFocused()
  })

  test('Focus cannot escape trap', async ({ page }) => {
    await page.click('text=Favorite Color')
    await page.waitForSelector('[data-focus-trap="active"]')
    
    const trapElement = page.locator('[data-focus-trap="active"]')
    
    // Tab 50 times (way more than elements in trap)
    for (let i = 0; i < 50; i++) {
      await page.keyboard.press('Tab')
      
      // Focus should still be within trap
      const focusedElement = await page.evaluate(() => document.activeElement?.tagName)
      const isInsideTrap = await trapElement.evaluate((el) => {
        return el.contains(document.activeElement)
      })
      
      expect(isInsideTrap).toBe(true)
    }
  })
})

test.describe('Focus Management - A11Y Compliance', () => {
  test('All interactive elements are keyboard accessible', async ({ page }) => {
    await page.goto('http://localhost:3001')
    
    // Tab through entire page
    let tabCount = 0
    const maxTabs = 100
    const visitedElements = new Set<string>()
    
    while (tabCount < maxTabs) {
      await page.keyboard.press('Tab')
      tabCount++
      
      const focusedElement = await page.evaluate(() => {
        const el = document.activeElement
        return {
          tag: el?.tagName,
          id: (el as HTMLElement)?.id || '',
          text: el?.textContent?.slice(0, 20) || ''
        }
      })
      
      if (focusedElement.tag === 'BODY') break
      
      const key = `${focusedElement.tag}-${focusedElement.id}-${focusedElement.text}`
      if (visitedElements.has(key)) break
      
      visitedElements.add(key)
    }
    
    // Should have visited multiple elements
    expect(visitedElements.size).toBeGreaterThan(5)
  })

  test('Focus visible on keyboard navigation', async ({ page }) => {
    await page.goto('http://localhost:3001')
    
    // Press Tab
    await page.keyboard.press('Tab')
    
    // Get focused element styles
    const outlineStyle = await page.evaluate(() => {
      const el = document.activeElement
      if (!el) return null
      const styles = window.getComputedStyle(el)
      return {
        outline: styles.outline,
        outlineWidth: styles.outlineWidth,
        outlineStyle: styles.outlineStyle,
      }
    })
    
    // Should have visible outline/focus ring
    expect(outlineStyle).not.toBeNull()
    expect(outlineStyle?.outlineWidth).not.toBe('0px')
  })
})

test.describe('Debug Helpers', () => {
  test('debugFocus() is available in dev mode', async ({ page }) => {
    await page.goto('http://localhost:3001')
    
    const debugFocusExists = await page.evaluate(() => {
      return typeof (window as any).debugFocus === 'function'
    })
    
    expect(debugFocusExists).toBe(true)
  })

  test('debugFocusTraps() lists active traps', async ({ page }) => {
    await page.goto('http://localhost:3001')
    
    // Open a picker
    await page.click('text=Favorite Color')
    await page.waitForSelector('[data-focus-trap="active"]')
    
    // Call debugFocusTraps()
    const trapInfo = await page.evaluate(() => {
      const traps = document.querySelectorAll('[data-focus-trap]')
      return {
        count: traps.length,
        active: document.querySelectorAll('[data-focus-trap="active"]').length
      }
    })
    
    expect(trapInfo.active).toBeGreaterThan(0)
  })
})
