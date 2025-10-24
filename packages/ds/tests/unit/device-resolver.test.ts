/**
 * Device Resolver Unit Tests
 * 
 * Fast, deterministic tests for mode resolution logic.
 * No browser required.
 */

import { describe, it, expect } from 'vitest'
import { 
  resolveOverlayMode, 
  getViewportInfo,
  DEFAULT_DEVICE_POLICY,
  type DevicePolicy,
  type ViewportInfo 
} from '../../src/components/overlay/device-resolver'

describe('resolveOverlayMode', () => {
  const createViewport = (width: number, isTouch = false): ViewportInfo => ({
    width,
    height: 800,
    isTouch,
    isMobile: width <= 768,
    isTablet: width > 768 && width <= 1024,
    isDesktop: width > 1024,
  })

  describe('Mobile (≤768px)', () => {
    const viewport = createViewport(375, true)

    it('field → sheet', () => {
      const result = resolveOverlayMode({
        kind: 'field',
        userMode: 'auto',
        viewport,
        policy: DEFAULT_DEVICE_POLICY
      })
      expect(result).toBe('sheet')
    })

    it('dialog → sheet', () => {
      const result = resolveOverlayMode({
        kind: 'dialog',
        userMode: 'auto',
        viewport,
        policy: DEFAULT_DEVICE_POLICY
      })
      expect(result).toBe('sheet')
    })

    it('panel → sheet', () => {
      const result = resolveOverlayMode({
        kind: 'panel',
        userMode: 'auto',
        viewport,
        policy: DEFAULT_DEVICE_POLICY
      })
      expect(result).toBe('sheet')
    })
  })

  describe('Desktop (>1024px)', () => {
    const viewport = createViewport(1920, false)

    it('field → popover', () => {
      const result = resolveOverlayMode({
        kind: 'field',
        userMode: 'auto',
        viewport,
        policy: DEFAULT_DEVICE_POLICY
      })
      expect(result).toBe('popover')
    })

    it('dialog → dialog', () => {
      const result = resolveOverlayMode({
        kind: 'dialog',
        userMode: 'auto',
        viewport,
        policy: DEFAULT_DEVICE_POLICY
      })
      expect(result).toBe('dialog')
    })

    it('panel → docked-panel', () => {
      const result = resolveOverlayMode({
        kind: 'panel',
        userMode: 'auto',
        viewport,
        policy: DEFAULT_DEVICE_POLICY
      })
      expect(result).toBe('docked-panel')
    })
  })

  describe('Tablet (768-1024px, auto mode)', () => {
    it('touch device → sheet', () => {
      const viewport = createViewport(800, true)
      
      const result = resolveOverlayMode({
        kind: 'field',
        userMode: 'auto',
        viewport,
        policy: { ...DEFAULT_DEVICE_POLICY, tabletMode: 'auto' }
      })
      
      expect(result).toBe('sheet')
    })

    it('mouse device → popover', () => {
      const viewport = createViewport(800, false)
      
      const result = resolveOverlayMode({
        kind: 'field',
        userMode: 'auto',
        viewport,
        policy: { ...DEFAULT_DEVICE_POLICY, tabletMode: 'auto' }
      })
      
      expect(result).toBe('popover')
    })

    it('tabletMode=mobile → always sheet', () => {
      const viewport = createViewport(800, false) // mouse
      
      const result = resolveOverlayMode({
        kind: 'field',
        userMode: 'auto',
        viewport,
        policy: { ...DEFAULT_DEVICE_POLICY, tabletMode: 'mobile' }
      })
      
      expect(result).toBe('sheet')
    })

    it('tabletMode=desktop → always popover', () => {
      const viewport = createViewport(800, true) // touch
      
      const result = resolveOverlayMode({
        kind: 'field',
        userMode: 'auto',
        viewport,
        policy: { ...DEFAULT_DEVICE_POLICY, tabletMode: 'desktop' }
      })
      
      expect(result).toBe('popover')
    })
  })

  describe('User Override', () => {
    const desktopViewport = createViewport(1920, false)

    it('userMode=sheet forces sheet on desktop', () => {
      const result = resolveOverlayMode({
        kind: 'field',
        userMode: 'sheet',
        viewport: desktopViewport,
        policy: DEFAULT_DEVICE_POLICY
      })
      
      expect(result).toBe('sheet')
    })

    it('userMode=popover forces popover on mobile', () => {
      const mobileViewport = createViewport(375, true)
      
      const result = resolveOverlayMode({
        kind: 'field',
        userMode: 'popover',
        viewport: mobileViewport,
        policy: DEFAULT_DEVICE_POLICY
      })
      
      expect(result).toBe('popover')
    })

    it('userMode=dialog forces dialog', () => {
      const result = resolveOverlayMode({
        kind: 'field',
        userMode: 'dialog',
        viewport: desktopViewport,
        policy: DEFAULT_DEVICE_POLICY
      })
      
      expect(result).toBe('dialog')
    })
  })

  describe('Policy Configuration', () => {
    it('custom mobileBreakpoint', () => {
      const viewport = createViewport(850, false)
      const policy: DevicePolicy = {
        ...DEFAULT_DEVICE_POLICY,
        mobileBreakpoint: 900 // 850 < 900 = mobile
      }
      
      const result = resolveOverlayMode({
        kind: 'field',
        userMode: 'auto',
        viewport,
        policy
      })
      
      expect(result).toBe('sheet')
    })

    it('panelOnDesktop=floating uses sheet', () => {
      const desktopViewport = createViewport(1920, false)
      const policy: DevicePolicy = {
        ...DEFAULT_DEVICE_POLICY,
        panelOnDesktop: 'floating'
      }
      
      const result = resolveOverlayMode({
        kind: 'panel',
        userMode: 'auto',
        viewport: desktopViewport,
        policy
      })
      
      expect(result).toBe('sheet')
    })

    it('forceMobileDialogOnTablet', () => {
      const tabletViewport = createViewport(800, true)
      const policy: DevicePolicy = {
        ...DEFAULT_DEVICE_POLICY,
        forceMobileDialogOnTablet: true
      }
      
      const result = resolveOverlayMode({
        kind: 'dialog',
        userMode: 'auto',
        viewport: tabletViewport,
        policy
      })
      
      expect(result).toBe('sheet')
    })
  })

  describe('Edge Cases', () => {
    it('ultra-wide monitor (4K)', () => {
      const viewport = createViewport(3840, false)
      
      const result = resolveOverlayMode({
        kind: 'field',
        userMode: 'auto',
        viewport,
        policy: DEFAULT_DEVICE_POLICY
      })
      
      expect(result).toBe('popover')
    })

    it('tiny screen (iPhone SE)', () => {
      const viewport = createViewport(320, true)
      
      const result = resolveOverlayMode({
        kind: 'field',
        userMode: 'auto',
        viewport,
        policy: DEFAULT_DEVICE_POLICY
      })
      
      expect(result).toBe('sheet')
    })

    it('exactly at breakpoint (768px)', () => {
      const viewport = createViewport(768, false)
      
      const result = resolveOverlayMode({
        kind: 'field',
        userMode: 'auto',
        viewport,
        policy: DEFAULT_DEVICE_POLICY
      })
      
      // 768 is inclusive of mobile (≤768)
      expect(result).toBe('sheet')
    })
  })
})

describe('DEFAULT_DEVICE_POLICY', () => {
  it('has sensible defaults', () => {
    expect(DEFAULT_DEVICE_POLICY.mobileBreakpoint).toBe(768)
    expect(DEFAULT_DEVICE_POLICY.tabletBreakpoint).toBe(1024)
    expect(DEFAULT_DEVICE_POLICY.tabletMode).toBe('auto')
    expect(DEFAULT_DEVICE_POLICY.forceMobileDialogOnTablet).toBe(false)
    expect(DEFAULT_DEVICE_POLICY.panelOnDesktop).toBe('docked')
  })
})
