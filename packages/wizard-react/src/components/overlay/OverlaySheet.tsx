/**
 * OverlaySheet
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
import type { OverlaySheetProps } from './types'
import { OVERLAY_TOKENS, getZIndex } from './tokens'
import { useOverlayContext } from './OverlayPickerCore'

export const OverlaySheet: React.FC<OverlaySheetProps> = ({
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
}) => {
  const sheetRef = useRef<HTMLDivElement>(null)
  const overlayContext = useOverlayContext()

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

  // Robust iOS scroll lock - prevents background bounce and touch scrolling
  useEffect(() => {
    if (!open || allowOutsideScroll) return

    const html = document.documentElement
    const scrollbarWidth = window.innerWidth - html.clientWidth
    
    // Save previous values
    const prev = {
      overflow: html.style.overflow,
      overscrollBehaviorY: html.style.overscrollBehaviorY,
      position: html.style.position,
      paddingRight: document.body.style.paddingRight,
    }

    // Lock scroll
    html.style.overflow = 'hidden'
    html.style.overscrollBehaviorY = 'contain'
    html.style.position = 'relative'
    document.body.style.paddingRight = `${scrollbarWidth}px`

    // Prevent touchmove except inside scrollable content
    const preventTouch = (e: TouchEvent) => {
      const target = e.target as HTMLElement
      const root = sheetRef.current
      // Allow scroll in the content area
      if (root?.contains(target) && target.closest('.overflow-y-auto')) return
      e.preventDefault()
    }
    document.addEventListener('touchmove', preventTouch, { passive: false })

    return () => {
      Object.assign(html.style, {
        overflow: prev.overflow,
        overscrollBehaviorY: prev.overscrollBehaviorY,
        position: prev.position,
      })
      document.body.style.paddingRight = prev.paddingRight
      document.removeEventListener('touchmove', preventTouch)
    }
  }, [open, allowOutsideScroll])

  if (!open) return null

  return (
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

      {/* Sheet */}
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
        className={`fixed bottom-0 left-0 right-0 flex flex-col ${
          prefersReducedMotion ? '' : 'transition-transform duration-300 ease-out'
        }`}
        style={{
          zIndex: getZIndex('sheet'),
          maxHeight: `min(${maxHeight}px, 90vh)`,
          transform: prefersReducedMotion ? 'none' : `translateY(${dragOffset}px)`,
          paddingBottom: 'env(safe-area-inset-bottom)',
          backgroundColor: 'var(--ds-color-surface-base)',
          borderRadius: '16px 16px 0 0',
          boxShadow: '0 -4px 24px rgba(0,0,0,0.15)',
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

        {/* Content (scrollable) */}
        <div className="flex-1 overflow-y-auto overscroll-contain min-h-0">
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
}
