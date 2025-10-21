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

import React, { useEffect, useRef, useState } from 'react'
import type { OverlaySheetProps } from './types'

export const OverlaySheet: React.FC<OverlaySheetProps> = ({
  open,
  onClose,
  maxHeight = 560,
  header,
  footer,
  children,
  allowOutsideScroll = false,
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledBy,
}) => {
  const sheetRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState(0)
  const [dragOffset, setDragOffset] = useState(0)

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

  // Lock body scroll
  useEffect(() => {
    if (open && !allowOutsideScroll) {
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth
      document.body.style.overflow = 'hidden'
      document.body.style.paddingRight = `${scrollbarWidth}px`

      return () => {
        document.body.style.overflow = ''
        document.body.style.paddingRight = ''
      }
    }
  }, [open, allowOutsideScroll])

  if (!open) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40 transition-opacity duration-300"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Sheet */}
      <div
        ref={sheetRef}
        role="dialog"
        aria-modal="true"
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledBy}
        className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-2xl shadow-2xl transition-transform duration-300 ease-out flex flex-col"
        style={{
          maxHeight: `min(${maxHeight}px, 90vh)`,
          transform: `translateY(${dragOffset}px)`,
          paddingBottom: 'env(safe-area-inset-bottom)',
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
          <div className="w-10 h-1 bg-gray-300 rounded-full" />
        </div>

        {/* Header (sticky) */}
        {header && (
          <div className="flex-shrink-0 bg-white border-b border-gray-200 px-4 py-3">
            {header}
          </div>
        )}

        {/* Content (scrollable) */}
        <div className="flex-1 overflow-y-auto overscroll-contain min-h-0">
          {children}
        </div>

        {/* Footer (always visible at bottom) */}
        {footer && (
          <div className="flex-shrink-0 bg-white border-t border-gray-200 px-4 py-3">
            {footer}
          </div>
        )}
      </div>
    </>
  )
}
