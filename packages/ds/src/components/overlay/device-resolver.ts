/**
 * Device-Aware Overlay Resolver
 * 
 * Automatically determines the correct overlay mode (popover/sheet/dialog/docked-panel)
 * based on device characteristics and policy configuration.
 * 
 * Philosophy: SheetDialog for micro (fields), SheetPanel for macro (app-shell),
 * with automatic desktop fallbacks (Popover/DockedPanel).
 */

export type OverlayKind = 'field' | 'dialog' | 'panel'
export type UserMode = 'auto' | 'popover' | 'sheet' | 'dialog'
export type ResolvedMode = 'popover' | 'sheet' | 'dialog' | 'docked-panel'

export interface DevicePolicy {
  /** Mobile breakpoint (inclusive) */
  mobileBreakpoint: number  // Default: 768
  
  /** Tablet breakpoint (inclusive) */
  tabletBreakpoint: number  // Default: 1024
  
  /** How tablets should behave */
  tabletMode: 'desktop' | 'mobile' | 'auto'
  // - 'desktop': Use popovers/dialogs
  // - 'mobile': Use sheets
  // - 'auto': Touch device → mobile, else → desktop
  
  /** Force mobile dialog behavior on tablet */
  forceMobileDialogOnTablet: boolean  // Default: false
  
  /** What to use for panels on desktop */
  panelOnDesktop: 'docked' | 'floating' | 'none'
  // - 'docked': Sidebar/DockedPanel
  // - 'floating': Keep SheetPanel (rare)
  // - 'none': Hide panel on desktop
}

export interface ViewportInfo {
  width: number
  height: number
  isTouch: boolean
}

export interface ResolveInput {
  kind: OverlayKind
  userMode?: UserMode
  viewport: ViewportInfo
  policy: DevicePolicy
}

/**
 * Default device policy
 */
export const DEFAULT_DEVICE_POLICY: DevicePolicy = {
  mobileBreakpoint: 768,
  tabletBreakpoint: 1024,
  tabletMode: 'auto',
  forceMobileDialogOnTablet: false,
  panelOnDesktop: 'docked',
}

/**
 * Resolve overlay mode based on device and policy
 * 
 * @example
 * ```typescript
 * const mode = resolveOverlayMode({
 *   kind: 'field',
 *   userMode: 'auto',
 *   viewport: { width: 375, height: 667, isTouch: true },
 *   policy: DEFAULT_DEVICE_POLICY
 * })
 * // → 'sheet' (mobile device)
 * ```
 */
export function resolveOverlayMode({
  kind,
  userMode = 'auto',
  viewport,
  policy,
}: ResolveInput): ResolvedMode {
  // User override takes precedence
  if (userMode !== 'auto') {
    return userMode as ResolvedMode
  }
  
  // Detect device category
  const isMobile = viewport.width <= policy.mobileBreakpoint || viewport.isTouch
  const isTablet = !isMobile && viewport.width <= policy.tabletBreakpoint
  
  // Resolve by kind
  switch (kind) {
    case 'dialog':
      return resolveDialog(isMobile, isTablet, policy)
    
    case 'field':
      return resolveField(isMobile, isTablet, viewport, policy)
    
    case 'panel':
      return resolvePanel(isMobile, policy)
    
    default:
      // Fallback: use sheet on mobile, popover on desktop
      return isMobile ? 'sheet' : 'popover'
  }
}

/**
 * Resolve dialog mode
 */
function resolveDialog(
  isMobile: boolean,
  isTablet: boolean,
  policy: DevicePolicy
): ResolvedMode {
  // Always use sheet on mobile
  if (isMobile) return 'sheet'
  
  // Tablet: follow policy
  if (isTablet && policy.forceMobileDialogOnTablet) {
    return 'sheet'
  }
  
  // Desktop: use dialog
  return 'dialog'
}

/**
 * Resolve field picker mode
 */
function resolveField(
  isMobile: boolean,
  isTablet: boolean,
  viewport: ViewportInfo,
  policy: DevicePolicy
): ResolvedMode {
  // Always use sheet on mobile
  if (isMobile) return 'sheet'
  
  // Tablet: follow tabletMode policy
  if (isTablet) {
    if (policy.tabletMode === 'mobile') {
      return 'sheet'
    }
    if (policy.tabletMode === 'desktop') {
      return 'popover'
    }
    // 'auto': check if touch device
    return viewport.isTouch ? 'sheet' : 'popover'
  }
  
  // Desktop: always popover for fields
  return 'popover'
}

/**
 * Resolve panel mode
 */
function resolvePanel(
  isMobile: boolean,
  policy: DevicePolicy
): ResolvedMode {
  // Always use sheet on mobile
  if (isMobile) return 'sheet'
  
  // Desktop: follow panelOnDesktop policy
  switch (policy.panelOnDesktop) {
    case 'docked':
      return 'docked-panel'
    case 'floating':
      return 'sheet'
    case 'none':
      return 'sheet'  // Or don't render at all
    default:
      return 'docked-panel'
  }
}

/**
 * Get current viewport info
 */
export function getViewportInfo(): ViewportInfo {
  return {
    width: window.innerWidth,
    height: window.innerHeight,
    isTouch: 'ontouchstart' in window || navigator.maxTouchPoints > 0,
  }
}

/**
 * Hook to resolve overlay mode with live viewport updates
 */
export function useOverlayMode(
  kind: OverlayKind,
  userMode: UserMode = 'auto',
  policy: DevicePolicy = DEFAULT_DEVICE_POLICY
): ResolvedMode {
  const [viewport, setViewport] = React.useState(getViewportInfo)
  
  React.useEffect(() => {
    const handleResize = () => setViewport(getViewportInfo())
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])
  
  return resolveOverlayMode({ kind, userMode, viewport, policy })
}

// For TypeScript
import React from 'react'
