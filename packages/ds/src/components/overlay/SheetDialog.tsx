/**
 * SheetDialog
 * 
 * Mobile-first bottom sheet with:
 * - Drag handle & swipe to dismiss
 * - Snap points (40/70/100vh)
 * - Safe area insets
 * - Sticky header/footer
 * - Smooth animations
 */

import React, { useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import type { SheetDialogProps } from './types'
import { OVERLAY_TOKENS, getZIndex } from './tokens'
import { useOverlayContext } from './OverlayPickerCore'
import { getTranslateStyle } from './utils/browser-compat'
import { useKeyboardAvoidance } from './hooks/useKeyboardAvoidance'
import { useInertBackground } from './hooks/useInertBackground'

// SSR-safe portal root
const getPortalRoot = () => {
  if (typeof document === 'undefined') return null
  return document.body
}

export const SheetDialog: React.FC<SheetDialogProps> = ({
  open,
  onClose,
  maxHeight = OVERLAY_TOKENS.maxHeight.default,
  header,
  footer,
  children,
  allowOutsideScroll = false,
  contentRef,
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledBy,
  ...restProps
}) => {
  const sheetRef = useRef<HTMLDivElement>(null)
  const overlayContext = useOverlayContext()
  
  // ⚠️ RUNTIME CONTRACTS (dev-only validation)
  // This component will be renamed to SheetDialog in Day 6
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production') {
      // 1. Require accessibility label (CRITICAL)
      if (!ariaLabel && !ariaLabelledBy) {
        throw new Error(
          '[SheetDialog/SheetDialog] Missing accessibility label.\n' +
          'Modal dialogs must be named for screen readers.\n' +
          'Fix: Add aria-label="Select color" or aria-labelledby="dialog-title"\n' +
          'See: docs/ds/SHEET_POLICY.md#sheetdialog-contracts'
        )
      }
      
      // 2. Warn about allowDragToDismiss (UX concern)
      if ('allowDragToDismiss' in restProps && restProps.allowDragToDismiss) {
        console.warn(
          '[SheetDialog/SheetDialog] Drag-to-dismiss is disabled for modal dialogs.\n' +
          'Modal dialogs require explicit Done/Cancel buttons for clarity.\n' +
          'Consider: Two-snap collapse pattern if needed.\n' +
          'See: docs/ds/SHEET_INTERACTION_PATTERNS.md#sheetdialog'
        )
      }
      
      // 3. Verify modal behavior cannot be disabled
      if ('trapFocus' in restProps && restProps.trapFocus === false) {
        throw new Error(
          '[SheetDialog/SheetDialog] Cannot disable trapFocus.\n' +
          'Modal dialogs must trap focus for accessibility.\n' +
          'Use <SheetPanel> for non-modal UI.\n' +
          'See: docs/ds/SHEET_POLICY.md#sheetdialog-contracts'
        )
      }
      
      if ('scrollLock' in restProps && restProps.scrollLock === false) {
        throw new Error(
          '[SheetDialog/SheetDialog] Cannot disable scrollLock.\n' +
          'Modal dialogs must lock background scroll.\n' +
          'Use <SheetPanel> for non-modal UI.\n' +
          'See: docs/ds/SHEET_POLICY.md#sheetdialog-contracts'
        )
      }
    }
  }, [ariaLabel, ariaLabelledBy, restProps])

  // Auto-wire contentRef: explicit prop > Context > internal ref
  // This prevents manual wiring bugs while maintaining backwards compatibility
  const effectiveRef = contentRef || overlayContext?.contentRef || sheetRef
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState(0)
  const [dragOffset, setDragOffset] = useState(0)

  // Detect reduced motion preference - skip animated transforms if preferred
  const prefersReducedMotion = useMemo(() => {
    if (typeof window === 'undefined') return false
    return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false
  }, [])

  // Keyboard avoidance: lift sheet when keyboard appears (iOS/Android)
  const keyboardOffset = useKeyboardAvoidance(open, {
    enabled: true,
    onOffsetChange: (offset) => {
      // Optional: trigger re-snap if needed
    },
  })

  // Make background inert when acting as dialog
  useInertBackground(open, {
    enabled: true,
    role: 'dialog',
  })

  // Drag handlers
  const handleDragStart = (clientY: number) => {
    setIsDragging(true)
    setDragStart(clientY)
    setDragOffset(0)
  }

  const handleDragMove = (clientY: number) => {
    if (!isDragging) return
    const offset = Math.max(0, clientY - dragStart)
    setDragOffset(offset)
  }

  const handleDragEnd = () => {
    if (!isDragging) return
    setIsDragging(false)

    // Close if dragged down > 100px
    if (dragOffset > 100) {
      onClose()
    }

    setDragOffset(0)
  }

  // Touch events
  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0]
    handleDragStart(touch.clientY)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    const touch = e.touches[0]
    handleDragMove(touch.clientY)
  }

  const handleTouchEnd = () => {
    handleDragEnd()
  }

  // Mouse events (for desktop testing)
  const handleMouseDown = (e: React.MouseEvent) => {
    handleDragStart(e.clientY)
  }

  useEffect(() => {
    if (!isDragging) return

    const handleMouseMove = (e: MouseEvent) => handleDragMove(e.clientY)
    const handleMouseUp = () => handleDragEnd()

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isDragging, dragStart])

  // Prevent touchmove except inside scrollable content (scroll lock handled by OverlayPickerCore)
  // Mark as non-passive only when needed to call preventDefault
  useEffect(() => {
    if (!open || allowOutsideScroll) return

    const preventTouch = (e: TouchEvent) => {
      const target = e.target as HTMLElement
      const root = sheetRef.current
      // Allow scroll in the content area
      if (root?.contains(target) && target.closest('.overflow-y-auto')) return
      e.preventDefault()
    }
    document.addEventListener('touchmove', preventTouch, { passive: false })

    return () => {
      document.removeEventListener('touchmove', preventTouch)
    }
  }, [open, allowOutsideScroll])

  // Calculate combined offset (drag + keyboard)
  const totalOffset = dragOffset + keyboardOffset

  // Get translate style with browser fallback
  const translateStyle = getTranslateStyle(0, totalOffset)

  if (!open) return null

  const portalRoot = getPortalRoot()
  if (!portalRoot) return null

  const content = (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 ${prefersReducedMotion ? '' : 'transition-opacity duration-300'}`}
        style={{ 
          position: 'fixed',
          zIndex: getZIndex('backdrop'),
          pointerEvents: 'auto',
          backgroundColor: 'var(--ds-color-surface-overlay)',
        }}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Sheet - CRITICAL: Cross-platform positioning with keyboard avoidance */}
      <div
        ref={effectiveRef}
        role="dialog"
        aria-modal="true"
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledBy}
        onClick={(e) => e.stopPropagation()}
        onPointerDown={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
        onMouseUp={(e) => e.stopPropagation()}
        onTouchEnd={(e) => e.stopPropagation()}
        className={`flex flex-col ${
          prefersReducedMotion ? '' : 'transition-[translate,transform] duration-300 ease-out'
        }`}
        style={{
          // Positioning - use logical properties
          position: 'fixed',
          insetInline: 0,
          insetBlockEnd: 0,  // anchors to bottom
          zIndex: getZIndex('sheet'),
          maxHeight: `min(${maxHeight}px, 90vh)`,
          // Use translate with transform fallback (Safari <14.1, Chrome <104)
          ...(prefersReducedMotion ? {} : translateStyle),
          // Prevent rubber-band (iOS)
          overscrollBehavior: 'contain',
          // Safe areas + theming
          paddingBlockEnd: `max(var(--ds-space-3, 12px), env(safe-area-inset-bottom, 0px))`,
          backgroundColor: 'var(--ds-color-surface-base)',
          borderRadius: 'var(--ds-radius-xl, 16px) var(--ds-radius-xl, 16px) 0 0',
          boxShadow: 'var(--ds-shadow-overlay-lg, 0 -4px 24px rgba(0,0,0,0.15))',
        }}
      >
        {/* Drag handle */}
        <div
          className="flex justify-center py-3 cursor-grab active:cursor-grabbing flex-shrink-0"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onMouseDown={handleMouseDown}
        >
          <div style={{
            width: '40px',
            height: '4px',
            backgroundColor: 'var(--ds-color-border-strong)',
            borderRadius: '2px',
          }} />
        </div>

        {/* Header (sticky) */}
        {header && (
          <div style={{
            flexShrink: 0,
            backgroundColor: 'var(--ds-color-surface-base)',
            borderBottom: '1px solid var(--ds-color-border-subtle)',
            padding: '12px 16px',
          }}>
            {header}
          </div>
        )}

        {/* Content (scrollable) - prevent rubber-band */}
        <div 
          className="flex-1 overflow-y-auto min-h-0"
          style={{ overscrollBehavior: 'contain' }}
        >
          {children}
        </div>

        {/* Footer (always visible at bottom) */}
        {footer && (
          <div style={{
            flexShrink: 0,
            backgroundColor: 'var(--ds-color-surface-base)',
            borderTop: '1px solid var(--ds-color-border-subtle)',
            padding: '12px 16px',
          }}>
            {footer}
          </div>
        )}
      </div>
    </>
  )

  return createPortal(content, portalRoot)
}
