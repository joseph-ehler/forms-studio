/**
 * DSProvider - Design System Context Provider
 * 
 * Single source of truth for:
 * - Device policy (mobile/tablet/desktop breakpoints)
 * - Overlay mode resolution (sheet/popover/dialog/docked-panel)
 * - Viewport information (width, height, touch detection)
 * 
 * Philosophy: Components ask "what mode should I use?" and DSProvider decides.
 * No duplicate viewport checks. No device conditionals in recipes.
 * 
 * @example
 * ```tsx
 * <DSProvider devicePolicy={{ tabletMode: 'auto', panelOnDesktop: 'docked' }}>
 *   <App />
 * </DSProvider>
 * ```
 */

import React, { createContext, useContext, useMemo, useState, useEffect } from 'react'
import { 
  resolveOverlayMode, 
  getViewportInfo, 
  DEFAULT_DEVICE_POLICY 
} from './components/overlay/device-resolver'
import type { 
  DevicePolicy, 
  OverlayKind, 
  UserMode, 
  ResolvedMode, 
  ViewportInfo 
} from './components/overlay/device-resolver'

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Context Definition
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

interface DSContextValue {
  /** Resolve overlay mode based on kind and user preference */
  resolveMode: (kind: OverlayKind, userMode?: UserMode) => ResolvedMode
  
  /** Current device policy configuration */
  devicePolicy: DevicePolicy
  
  /** Current viewport information (reactive) */
  viewport: ViewportInfo
}

const DSContext = createContext<DSContextValue | null>(null)

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Hook
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Access DS context (device policy, viewport, mode resolution)
 * 
 * @throws Error if used outside DSProvider
 * 
 * @example
 * ```tsx
 * const { resolveMode, viewport } = useDS()
 * const mode = resolveMode('field') // 'sheet' on mobile, 'popover' on desktop
 * ```
 */
export function useDS(): DSContextValue {
  const ctx = useContext(DSContext)
  
  if (!ctx) {
    throw new Error(
      'useDS must be used within <DSProvider>.\n' +
      'Wrap your app with <DSProvider> at the root.\n' +
      'See: docs/ds/SHEET_POLICY.md#dsprovider'
    )
  }
  
  return ctx
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Provider Component
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export interface DSProviderProps {
  /** Device policy configuration (merged with defaults) */
  devicePolicy?: Partial<DevicePolicy>
  
  /** Children components */
  children: React.ReactNode
}

export const DSProvider: React.FC<DSProviderProps> = ({ 
  devicePolicy: userPolicy, 
  children 
}) => {
  // Viewport state (reactive to window resizes)
  const [viewport, setViewport] = useState<ViewportInfo>(getViewportInfo)
  
  // Merge user policy with defaults
  const policy = useMemo<DevicePolicy>(
    () => ({ ...DEFAULT_DEVICE_POLICY, ...userPolicy }),
    [userPolicy]
  )
  
  // Update viewport on resize (debounced)
  useEffect(() => {
    let timeoutId: NodeJS.Timeout | undefined
    
    const handleResize = () => {
      // Debounce to avoid excessive re-renders during resize
      if (timeoutId) clearTimeout(timeoutId)
      
      timeoutId = setTimeout(() => {
        setViewport(getViewportInfo())
      }, 150)
    }
    
    // Listen for resize events
    window.addEventListener('resize', handleResize)
    
    // Cleanup
    return () => {
      if (timeoutId) clearTimeout(timeoutId)
      window.removeEventListener('resize', handleResize)
    }
  }, [])
  
  // Memoized resolver function
  const resolveMode = React.useCallback(
    (kind: OverlayKind, userMode: UserMode = 'auto'): ResolvedMode => {
      return resolveOverlayMode({ 
        kind, 
        userMode, 
        viewport, 
        policy 
      })
    },
    [viewport, policy]
  )
  
  // Memoized context value
  const value = useMemo<DSContextValue>(
    () => ({ 
      resolveMode, 
      devicePolicy: policy, 
      viewport 
    }),
    [resolveMode, policy, viewport]
  )
  
  return (
    <DSContext.Provider value={value}>
      {children}
    </DSContext.Provider>
  )
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Convenience Hooks
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Get current viewport information
 * 
 * @example
 * ```tsx
 * const viewport = useViewport()
 * if (viewport.width < 768) {
 *   // Mobile-specific behavior
 * }
 * ```
 */
export function useViewport(): ViewportInfo {
  const { viewport } = useDS()
  return viewport
}

/**
 * Get device policy configuration
 * 
 * @example
 * ```tsx
 * const policy = useDevicePolicy()
 * console.log(policy.mobileBreakpoint) // 768
 * ```
 */
export function useDevicePolicy(): DevicePolicy {
  const { devicePolicy } = useDS()
  return devicePolicy
}

/**
 * Resolve overlay mode for a specific kind
 * 
 * @example
 * ```tsx
 * const mode = useResolvedMode('field')
 * // 'sheet' on mobile, 'popover' on desktop
 * ```
 */
export function useResolvedMode(
  kind: OverlayKind, 
  userMode: UserMode = 'auto'
): ResolvedMode {
  const { resolveMode } = useDS()
  return resolveMode(kind, userMode)
}
