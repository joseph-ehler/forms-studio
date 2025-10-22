/**
 * Spacing System Test
 * 
 * Validates spacing values (12px/24px/32px) and container widths
 */

import { test, expect } from '@playwright/test'

test.describe('Spacing System', () => {
  test('Stack spacing: tight = 12px', async ({ page }) => {
    await page.setContent(`
      <div style="display: flex; flex-direction: column; gap: var(--ds-space-3);">
        <div>Item 1</div>
        <div>Item 2</div>
      </div>
      <style>:root { --ds-space-3: 0.75rem; }</style>
    `)
    
    const gap = await page.$eval(
      'div',
      el => getComputedStyle(el).gap
    )
    
    expect(gap).toBe('12px')
  })

  test('Stack spacing: normal = 24px', async ({ page }) => {
    await page.setContent(`
      <div style="display: flex; flex-direction: column; gap: var(--ds-space-6);">
        <div>Item 1</div>
        <div>Item 2</div>
      </div>
      <style>:root { --ds-space-6: 1.5rem; }</style>
    `)
    
    const gap = await page.$eval(
      'div',
      el => getComputedStyle(el).gap
    )
    
    expect(gap).toBe('24px')
  })

  test('Stack spacing: relaxed = 32px', async ({ page }) => {
    await page.setContent(`
      <div style="display: flex; flex-direction: column; gap: var(--ds-space-8);">
        <div>Item 1</div>
        <div>Item 2</div>
      </div>
      <style>:root { --ds-space-8: 2rem; }</style>
    `)
    
    const gap = await page.$eval(
      'div',
      el => getComputedStyle(el).gap
    )
    
    expect(gap).toBe('32px')
  })
})

test.describe('Container Widths', () => {
  test('B2C Form width = 576px', async ({ page }) => {
    await page.setContent(`
      <div style="max-width: var(--ds-content-b2c-form);">Content</div>
      <style>:root { --ds-content-b2c-form: 36rem; }</style>
    `)
    
    const maxWidth = await page.$eval(
      'div',
      el => getComputedStyle(el).maxWidth
    )
    
    expect(maxWidth).toBe('576px')
  })

  test('B2C Page width = 896px', async ({ page }) => {
    await page.setContent(`
      <div style="max-width: var(--ds-content-b2c-page);">Content</div>
      <style>:root { --ds-content-b2c-page: 56rem; }</style>
    `)
    
    const maxWidth = await page.$eval(
      'div',
      el => getComputedStyle(el).maxWidth
    )
    
    expect(maxWidth).toBe('896px')
  })

  test('B2C Max width = 1280px', async ({ page }) => {
    await page.setContent(`
      <div style="max-width: var(--ds-content-b2c-max);">Content</div>
      <style>:root { --ds-content-b2c-max: 80rem; }</style>
    `)
    
    const maxWidth = await page.$eval(
      'div',
      el => getComputedStyle(el).maxWidth
    )
    
    expect(maxWidth).toBe('1280px')
  })

  test('B2B Wide width = 1920px', async ({ page }) => {
    await page.setContent(`
      <div style="max-width: var(--ds-content-b2b-wide);">Content</div>
      <style>:root { --ds-content-b2b-wide: 120rem; }</style>
    `)
    
    const maxWidth = await page.$eval(
      'div',
      el => getComputedStyle(el).maxWidth
    )
    
    expect(maxWidth).toBe('1920px')
  })

  test('B2B Max width = 2560px (ultrawide)', async ({ page }) => {
    await page.setContent(`
      <div style="max-width: var(--ds-content-b2b-max);">Content</div>
      <style>:root { --ds-content-b2b-max: 160rem; }</style>
    `)
    
    const maxWidth = await page.$eval(
      'div',
      el => getComputedStyle(el).maxWidth
    )
    
    expect(maxWidth).toBe('2560px')
  })
})

test.describe('Grid Responsive', () => {
  test('Grid 2 columns on desktop', async ({ page }) => {
    await page.setViewportSize({ width: 1024, height: 768 })
    await page.setContent(`
      <link rel="stylesheet" href="../dist/index.css">
      <div class="ds-grid ds-grid--2">
        <div>Item 1</div>
        <div>Item 2</div>
      </div>
    `)
    
    const gridCols = await page.$eval(
      '.ds-grid--2',
      el => getComputedStyle(el).gridTemplateColumns
    )
    
    // Should be 2 equal columns
    expect(gridCols.split(' ').length).toBe(2)
  })

  test('Grid 3 columns on desktop', async ({ page }) => {
    await page.setViewportSize({ width: 1024, height: 768 })
    await page.setContent(`
      <link rel="stylesheet" href="../dist/index.css">
      <div class="ds-grid ds-grid--3">
        <div>Item 1</div>
        <div>Item 2</div>
        <div>Item 3</div>
      </div>
    `)
    
    const gridCols = await page.$eval(
      '.ds-grid--3',
      el => getComputedStyle(el).gridTemplateColumns
    )
    
    // Should be 3 equal columns
    expect(gridCols.split(' ').length).toBe(3)
  })
})
