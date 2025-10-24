/**
 * useRefcountedInert
 * 
 * Background inertness with reference counting for nested overlays
 * Only removes inert when ALL dialogs are closed
 */

import { useEffect } from 'react'
import { supportsInert } from '../utils/browser-compat'

// Global refcount state
let inertRefCount = 0
let appRoot: HTMLElement | null = null

/**
 * Make background inert with refcounting
 * Multiple dialogs can call this - only removes inert when all close
 */
export function useRefcountedInert(
  isActive: boolean,
  options: { role?: 'dialog' | 'listbox'; rootSelector?: string } = {}
): void {
  useEffect(() => {
    // Only apply for dialogs
    if (!isActive || options.role !== 'dialog') return
    
    // Find app root (cache it)
    if (!appRoot) {
      const selector = options.rootSelector || '#app, #root, [data-app-root], main'
      appRoot = document.querySelector<HTMLElement>(selector)
      
      if (!appRoot && process.env.NODE_ENV !== 'production') {
        console.warn('[useRefcountedInert] App root not found:', selector)
        return
      }
    }
    
    if (!appRoot) return
    
    // Increment refcount
    inertRefCount++
    
    // Only apply inert on first dialog
    if (inertRefCount === 1) {
      if (supportsInert()) {
        (appRoot as any).inert = true
      } else {
        appRoot.setAttribute('aria-hidden', 'true')
      }
      
      if (process.env.NODE_ENV !== 'production') {
        console.log('[Inert] Applied (refcount: 1)')
      }
    } else {
      if (process.env.NODE_ENV !== 'production') {
        console.log(`[Inert] Already applied (refcount: ${inertRefCount})`)
      }
    }
    
    return () => {
      if (!appRoot) return
      
      // Decrement refcount
      inertRefCount--
      
      // Only remove inert when all dialogs are closed
      if (inertRefCount === 0) {
        if (supportsInert()) {
          (appRoot as any).inert = false
        } else {
          appRoot.removeAttribute('aria-hidden')
        }
        
        if (process.env.NODE_ENV !== 'production') {
          console.log('[Inert] Removed (refcount: 0)')
        }
      } else {
        if (process.env.NODE_ENV !== 'production') {
          console.log(`[Inert] Still applied (refcount: ${inertRefCount})`)
        }
      }
    }
  }, [isActive, options.role, options.rootSelector])
}
