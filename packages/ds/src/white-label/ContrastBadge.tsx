/**
 * ContrastBadge - Visual Indicator of Contrast Compliance
 * 
 * Displays WCAG contrast validation status.
 * Auto-updates when brand/theme changes.
 * Only shows in dev by default.
 * 
 * @example
 * <ContrastBadge position="bottom-right" />
 */

import React from 'react'
import { useContrastGuard } from './useContrastGuard'

export interface ContrastBadgeProps {
  /** Position on screen */
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
  
  /** Auto-fix contrast issues */
  autoFix?: boolean
  
  /** Custom className */
  className?: string
  
  /** Hide badge when all tests pass */
  hideWhenPassing?: boolean
}

const POSITION_STYLES: Record<string, React.CSSProperties> = {
  'top-left': { top: '16px', left: '16px' },
  'top-right': { top: '16px', right: '16px' },
  'bottom-left': { bottom: '16px', left: '16px' },
  'bottom-right': { bottom: '16px', right: '16px' },
}

export function ContrastBadge({
  position = 'bottom-left',
  autoFix,
  className = '',
  hideWhenPassing = false,
}: ContrastBadgeProps) {
  
  const guard = useContrastGuard({ autoFix, showBadge: true })
  
  // Hide in production
  if (process.env.NODE_ENV === 'production') {
    return null
  }
  
  // Hide when passing if requested
  if (hideWhenPassing && guard.failed === 0) {
    return null
  }
  
  const positionStyle = POSITION_STYLES[position] || POSITION_STYLES['bottom-left']
  
  return (
    <div
      className={`contrast-badge ${className}`}
      style={{
        position: 'fixed',
        zIndex: 10000,
        padding: '8px 12px',
        background: guard.failed > 0 
          ? 'rgba(239, 68, 68, 0.95)' 
          : 'rgba(34, 197, 94, 0.95)',
        color: '#ffffff',
        borderRadius: '6px',
        fontSize: '13px',
        fontWeight: 600,
        fontFamily: 'system-ui, -apple-system, sans-serif',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
        cursor: 'pointer',
        userSelect: 'none',
        transition: 'all 200ms ease',
        ...positionStyle,
      }}
      onClick={() => {
        guard.revalidate()
        console.log('🎨 Contrast validation re-run')
      }}
      title="Click to re-validate contrast"
    >
      {guard.isValidating ? (
        <span>⏳ Validating...</span>
      ) : (
        <span>{guard.badge}</span>
      )}
    </div>
  )
}

ContrastBadge.displayName = 'ContrastBadge'
