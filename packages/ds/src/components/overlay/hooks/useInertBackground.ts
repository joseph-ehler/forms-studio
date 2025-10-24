/**
 * useInertBackground
 * 
 * Makes app background inert when dialog is open
 * Uses native inert attribute with aria-hidden fallback
 */

import { useEffect } from 'react'
import { supportsInert } from '../utils/browser-compat'

export interface InertBackgroundOptions {
  enabled: boolean
  role?: 'dialog' | 'listbox'
  rootSelector?: string
}

export function useInertBackground(
  isOpen: boolean,
  options: InertBackgroundOptions
): void {
  useEffect(() => {
    // Only make background inert for dialogs
    if (!isOpen || !options.enabled || options.role !== 'dialog') return
    
    // Find app root
    const selector = options.rootSelector || '#app, #root, [data-app-root], main'
    const appRoot = document.querySelector<HTMLElement>(selector)
    
    if (!appRoot) {
      console.warn('[useInertBackground] App root not found. Searched for:', selector)
      return
    }
    
    // Save previous state
    const wasInert = supportsInert() ? (appRoot as any).inert : false
    const hadAriaHidden = appRoot.getAttribute('aria-hidden')
    
    // Apply inert
    if (supportsInert()) {
      (appRoot as any).inert = true
    } else {
      // Fallback for browsers without inert support
      appRoot.setAttribute('aria-hidden', 'true')
    }
    
    return () => {
      // Restore previous state
      if (supportsInert()) {
        (appRoot as any).inert = wasInert
      } else {
        if (hadAriaHidden !== null) {
          appRoot.setAttribute('aria-hidden', hadAriaHidden)
        } else {
          appRoot.removeAttribute('aria-hidden')
        }
      }
    }
  }, [isOpen, options.enabled, options.role, options.rootSelector])
}
