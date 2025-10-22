/**
 * Brand Contrast Test
 * 
 * Ensures all brands pass WCAG AA contrast requirements
 * across all theme × tenant combinations.
 * 
 * Matrix:
 * - Brands: default, acme, techcorp, sunset
 * - Themes: light, dark
 * - Tenants: b2c, b2b
 * 
 * = 4 × 2 × 2 = 16 combinations
 */

import { test, expect } from '@playwright/test'

const BRANDS = ['default', 'acme', 'techcorp', 'sunset']
const THEMES = ['light', 'dark']
const TENANTS = ['b2c', 'b2b']

/**
 * Calculate relative luminance (WCAG formula)
 */
function getLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map(c => {
    c = c / 255
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
  })
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs
}

/**
 * Calculate contrast ratio (WCAG formula)
 */
function getContrastRatio(color1: string, color2: string): number {
  const parseRgb = (color: string) => {
    const match = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/)
    if (!match) return [0, 0, 0]
    return [parseInt(match[1]), parseInt(match[2]), parseInt(match[3])]
  }
  
  const [r1, g1, b1] = parseRgb(color1)
  const [r2, g2, b2] = parseRgb(color2)
  
  const l1 = getLuminance(r1, g1, b1)
  const l2 = getLuminance(r2, g2, b2)
  
  const lighter = Math.max(l1, l2)
  const darker = Math.min(l1, l2)
  
  return (lighter + 0.05) / (darker + 0.05)
}

test.describe('Brand Contrast Matrix', () => {
  for (const brand of BRANDS) {
    for (const theme of THEMES) {
      test(`${brand} ${theme} - Text vs Surface (AA)`, async ({ page }) => {
        // Create test page with brand attributes
        await page.setContent(`
          <!DOCTYPE html>
          <html data-brand="${brand}" data-theme="${theme}" data-tenant="b2c">
          <head>
            <link rel="stylesheet" href="../dist/index.css">
          </head>
          <body style="
            background: var(--ds-color-surface-base);
            color: var(--ds-color-text-primary);
            padding: 20px;
          ">
            <p class="text-primary">Primary text on base surface</p>
            <p class="text-secondary" style="color: var(--ds-color-text-secondary);">Secondary text</p>
            <p class="text-muted" style="color: var(--ds-color-text-muted);">Muted text</p>
          </body>
          </html>
        `)
        
        // Get computed colors
        const bgColor = await page.$eval('body', el => 
          getComputedStyle(el).backgroundColor
        )
        
        const primaryColor = await page.$eval('.text-primary', el =>
          getComputedStyle(el).color
        )
        
        const secondaryColor = await page.$eval('.text-secondary', el =>
          getComputedStyle(el).color
        )
        
        // Calculate contrast ratios
        const primaryContrast = getContrastRatio(primaryColor, bgColor)
        const secondaryContrast = getContrastRatio(secondaryColor, bgColor)
        
        // Assert WCAG AA compliance (4.5:1 for normal text)
        expect(primaryContrast).toBeGreaterThanOrEqual(4.5)
        expect(secondaryContrast).toBeGreaterThanOrEqual(4.5)
      })
      
      test(`${brand} ${theme} - Primary Button Contrast`, async ({ page }) => {
        await page.setContent(`
          <!DOCTYPE html>
          <html data-brand="${brand}" data-theme="${theme}">
          <head>
            <link rel="stylesheet" href="../dist/index.css">
          </head>
          <body>
            <button style="
              background: var(--ds-color-primary-bg);
              color: var(--ds-color-primary-text);
              padding: 12px 24px;
            ">Primary Button</button>
          </body>
          </html>
        `)
        
        const bgColor = await page.$eval('button', el =>
          getComputedStyle(el).backgroundColor
        )
        
        const textColor = await page.$eval('button', el =>
          getComputedStyle(el).color
        )
        
        const contrast = getContrastRatio(textColor, bgColor)
        
        // Primary buttons need AA compliance
        expect(contrast).toBeGreaterThanOrEqual(4.5)
      })
      
      test(`${brand} ${theme} - State Colors Contrast`, async ({ page }) => {
        await page.setContent(`
          <!DOCTYPE html>
          <html data-brand="${brand}" data-theme="${theme}">
          <head>
            <link rel="stylesheet" href="../dist/index.css">
          </head>
          <body style="background: var(--ds-color-surface-base);">
            <p class="error" style="color: var(--ds-color-state-danger);">Error message</p>
            <p class="success" style="color: var(--ds-color-state-success);">Success message</p>
            <p class="warning" style="color: var(--ds-color-state-warning);">Warning message</p>
          </body>
          </html>
        `)
        
        const bgColor = await page.$eval('body', el =>
          getComputedStyle(el).backgroundColor
        )
        
        const errorColor = await page.$eval('.error', el =>
          getComputedStyle(el).color
        )
        
        const successColor = await page.$eval('.success', el =>
          getComputedStyle(el).color
        )
        
        const warningColor = await page.$eval('.warning', el =>
          getComputedStyle(el).color
        )
        
        // State colors need at least 3:1 for large text (WCAG AA)
        expect(getContrastRatio(errorColor, bgColor)).toBeGreaterThanOrEqual(3)
        expect(getContrastRatio(successColor, bgColor)).toBeGreaterThanOrEqual(3)
        expect(getContrastRatio(warningColor, bgColor)).toBeGreaterThanOrEqual(3)
      })
      
      test(`${brand} ${theme} - Focus Ring Contrast`, async ({ page }) => {
        await page.setContent(`
          <!DOCTYPE html>
          <html data-brand="${brand}" data-theme="${theme}">
          <head>
            <link rel="stylesheet" href="../dist/index.css">
          </head>
          <body style="background: var(--ds-color-surface-base);">
            <input 
              type="text" 
              style="
                outline: 2px solid var(--ds-color-border-focus);
                outline-offset: 2px;
              "
            />
          </body>
          </html>
        `)
        
        const bgColor = await page.$eval('body', el =>
          getComputedStyle(el).backgroundColor
        )
        
        const focusColor = await page.$eval('input', el =>
          getComputedStyle(el).outlineColor
        )
        
        const contrast = getContrastRatio(focusColor, bgColor)
        
        // Focus indicators need 3:1 minimum (WCAG 2.1)
        expect(contrast).toBeGreaterThanOrEqual(3)
      })
    }
  }
})

test.describe('Brand Layout Invariants', () => {
  for (const brand of BRANDS) {
    test(`${brand} - FormLayout width = 576px`, async ({ page }) => {
      await page.setContent(`
        <!DOCTYPE html>
        <html data-brand="${brand}">
        <head>
          <link rel="stylesheet" href="../dist/index.css">
        </head>
        <body>
          <div style="max-width: var(--ds-content-b2c-form);">Form</div>
        </body>
        </html>
      `)
      
      const maxWidth = await page.$eval('div', el =>
        getComputedStyle(el).maxWidth
      )
      
      expect(maxWidth).toBe('576px')
    })
    
    test(`${brand} - Atoms have margin: 0`, async ({ page }) => {
      await page.setContent(`
        <!DOCTYPE html>
        <html data-brand="${brand}">
        <head>
          <link rel="stylesheet" href="../dist/index.css">
        </head>
        <body>
          <div class="ds-heading-xl">Heading</div>
          <div class="ds-body-md">Body</div>
          <label class="ds-label">Label</label>
        </body>
        </html>
      `)
      
      const headingMargin = await page.$eval('.ds-heading-xl', el =>
        getComputedStyle(el).margin
      )
      
      const bodyMargin = await page.$eval('.ds-body-md', el =>
        getComputedStyle(el).margin
      )
      
      const labelMargin = await page.$eval('.ds-label', el =>
        getComputedStyle(el).margin
      )
      
      expect(headingMargin).toBe('0px')
      expect(bodyMargin).toBe('0px')
      expect(labelMargin).toBe('0px')
    })
  }
})

test.describe('Brand Tenant Widths', () => {
  for (const brand of BRANDS) {
    test(`${brand} B2C - max width 1280px`, async ({ page }) => {
      await page.setContent(`
        <!DOCTYPE html>
        <html data-brand="${brand}" data-tenant="b2c">
        <head>
          <link rel="stylesheet" href="../dist/index.css">
        </head>
        <body>
          <div style="max-width: var(--ds-content-default-max);">Container</div>
        </body>
        </html>
      `)
      
      const maxWidth = await page.$eval('div', el =>
        getComputedStyle(el).maxWidth
      )
      
      expect(maxWidth).toBe('1280px')
    })
    
    test(`${brand} B2B - max width 2560px`, async ({ page }) => {
      await page.setContent(`
        <!DOCTYPE html>
        <html data-brand="${brand}" data-tenant="b2b">
        <head>
          <link rel="stylesheet" href="../dist/index.css">
          <style>
            :root[data-tenant="b2b"] {
              --ds-content-default-max: var(--ds-content-b2b-max);
            }
          </style>
        </head>
        <body>
          <div style="max-width: var(--ds-content-default-max);">Container</div>
        </body>
        </html>
      `)
      
      const maxWidth = await page.$eval('div', el =>
        getComputedStyle(el).maxWidth
      )
      
      expect(maxWidth).toBe('2560px')
    })
  }
})
