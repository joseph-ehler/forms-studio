/**
 * UI Shell Components - Native OS Experience
 * 
 * Mobile-first components that feel native on iOS and Android.
 * Desktop scales up naturally.
 * 
 * Phase 1: Foundation
 * - AppShell, TopBar, BottomNav
 * 
 * Phase 2: Gestures & Interactive
 * - Drawer, Sheet, PullToRefresh
 * 
 * Phase 3: Context & Intelligence
 * - AppProvider (tenant-aware B2C/B2B)
 */

// Context & Hooks
export { AppProvider, useApp, useIsB2B, useIsB2C, useTenantMaxWidth } from './AppContext'

// Shell Components
export { AppShell } from './AppShell'
export { TopBar } from './TopBar'
export { BottomNav } from './BottomNav'
export { Drawer } from './Drawer'
export { Sheet } from './Sheet'
export { PullToRefresh } from './PullToRefresh'

// White-label API
export {
  applyBrand,
  loadBrandPreferences,
  getCurrentBrand,
  getCurrentTheme,
  getCurrentTenant,
  prePaintScript,
  type BrandManifest,
  type BrandId,
  type ThemeMode,
  type TenantType,
} from './applyBrand'

// Utilities
export { useGesture, calculateSnapPoint, applyMomentum } from './useGesture'
