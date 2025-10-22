/**
 * useContrastGuard - Automatic Contrast Protection
 * 
 * Validates contrast on brand/theme changes.
 * Auto-fixes in production (opt-in), warns in dev.
 * 
 * Usage:
 *   useContrastGuard({ autoFix: true, showBadge: true })
 */

import { useEffect, useState } from 'react'
import { validateContrast, autoFixContrast } from './contrastValidator'

export interface ContrastGuardOptions {
  /** Auto-fix failing contrast (default: false in dev, true in prod) */
  autoFix?: boolean
  
  /** Show badge in UI (default: true in dev, false in prod) */
  showBadge?: boolean
  
  /** Callback when validation completes */
  onValidate?: (result: { passed: number; failed: number; total: number }) => void
  
  /** Callback when auto-fix runs */
  onAutoFix?: (result: { fixed: number }) => void
}

export interface ContrastGuardState {
  /** Is validation running */
  isValidating: boolean
  
  /** Number of pairs passed */
  passed: number
  
  /** Number of pairs failed */
  failed: number
  
  /** Total pairs checked */
  total: number
  
  /** Badge text for UI */
  badge: string
  
  /** Re-run validation */
  revalidate: () => void
}

const isDev = process.env.NODE_ENV === 'development'

export function useContrastGuard(options: ContrastGuardOptions = {}): ContrastGuardState {
  const {
    autoFix = !isDev, // Auto-fix in production, warn in dev
    showBadge = isDev, // Show badge in dev only
    onValidate,
    onAutoFix,
  } = options
  
  const [state, setState] = useState({
    isValidating: true,
    passed: 0,
    failed: 0,
    total: 0,
    badge: '⏳ Validating contrast...',
  })
  
  const validate = () => {
    setState(prev => ({ ...prev, isValidating: true }))
    
    // Run validation
    const result = validateContrast()
    
    // Update state
    setState({
      isValidating: false,
      passed: result.passed,
      failed: result.failed,
      total: result.total,
      badge: result.failed === 0
        ? `✅ Contrast: ${result.passed}/${result.total} pairs`
        : `⚠️  Contrast: ${result.passed}/${result.total} pairs (${result.failed} failed)`,
    })
    
    // Notify
    onValidate?.(result)
    
    // Auto-fix if enabled and there are failures
    if (autoFix && result.failed > 0) {
      const fixed = autoFixContrast()
      
      if (fixed.fixed > 0) {
        console.warn(
          `[ContrastGuard] Auto-fixed ${fixed.fixed} contrast issues:`,
          fixed.results
        )
        onAutoFix?.(fixed)
        
        // Re-validate after fix
        const afterFix = validateContrast()
        setState({
          isValidating: false,
          passed: afterFix.passed,
          failed: afterFix.failed,
          total: afterFix.total,
          badge: `✅ Contrast: ${afterFix.passed}/${afterFix.total} pairs (${fixed.fixed} auto-fixed)`,
        })
      }
    } else if (result.failed > 0) {
      // Dev mode - warn but don't fix
      console.warn(
        `[ContrastGuard] ${result.failed} contrast issues found:`,
        result.results.filter(r => !r.passed)
      )
    }
  }
  
  // Validate on mount and when brand/theme changes
  useEffect(() => {
    validate()
    
    // Watch for brand/theme attribute changes
    const observer = new MutationObserver((mutations) => {
      const relevantChange = mutations.some(
        m => m.type === 'attributes' && 
        (m.attributeName === 'data-brand' || 
         m.attributeName === 'data-theme' ||
         m.attributeName === 'data-a11y-mode')
      )
      
      if (relevantChange) {
        // Re-validate after a short delay (let CSS settle)
        setTimeout(validate, 100)
      }
    })
    
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-brand', 'data-theme', 'data-a11y-mode'],
    })
    
    return () => observer.disconnect()
  }, [autoFix])
  
  return {
    ...state,
    revalidate: validate,
  }
}
