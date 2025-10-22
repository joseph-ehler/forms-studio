/**
 * Sheet - Bottom Sheet with Snap Points
 * 
 * iOS-style bottom sheet that snaps to positions.
 * Swipe down to dismiss.
 * 
 * Features:
 * - Pull handle (iOS-like)
 * - Snap points (collapsed, half, full)
 * - Swipe down to dismiss
 * - Velocity-based snapping
 * - Backdrop with blur
 * - Keyboard pushes content
 * 
 * Usage:
 *   <Sheet 
 *     open={isOpen}
 *     snapPoints={['120px', '50%', '90%']}
 *     defaultSnap="50%"
 *   >
 *     <Sheet.Content>Content</Sheet.Content>
 *   </Sheet>
 */

import React, { useRef, useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useGesture, calculateSnapPoint } from './useGesture'

type SnapPoint = string | number // '50%', '200px', or pixel number

interface SheetProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  snapPoints?: SnapPoint[]
  defaultSnap?: SnapPoint
  dismissible?: boolean
  overlay?: boolean
  handle?: boolean
  children: React.ReactNode
  className?: string
  onSnapChange?: (snap: SnapPoint) => void
}

export const Sheet: React.FC<SheetProps> & {
  Content: typeof SheetContent
  Handle: typeof SheetHandle
} = ({
  open: controlledOpen,
  onOpenChange,
  snapPoints = ['120px', '50%', '90%'],
  defaultSnap,
  dismissible = true,
  overlay = true,
  handle = true,
  children,
  className = '',
  onSnapChange,
}) => {
  const [internalOpen, setInternalOpen] = useState(false)
  const [currentSnap, setCurrentSnap] = useState<SnapPoint>(defaultSnap || snapPoints[snapPoints.length - 1])
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState(0)
  
  const sheetRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  
  const isOpen = controlledOpen ?? internalOpen
  const setOpen = onOpenChange ?? setInternalOpen
  
  // Convert snap point to pixels
  const snapToPixels = (snap: SnapPoint): number => {
    if (typeof snap === 'number') return snap
    
    const viewportHeight = window.innerHeight
    
    if (snap.endsWith('%')) {
      const percent = parseFloat(snap) / 100
      return viewportHeight * percent
    }
    if (snap.endsWith('px')) {
      return parseFloat(snap)
    }
    if (snap.endsWith('vh')) {
      const vh = parseFloat(snap)
      return (viewportHeight * vh) / 100
    }
    
    return parseFloat(snap)
  }
  
  // Get current height in pixels
  const currentHeight = snapToPixels(currentSnap)
  const maxHeight = Math.max(...snapPoints.map(snapToPixels))
  
  // Handle gestures on the handle or top of sheet
  useGesture(sheetRef, {
    direction: 'vertical',
    threshold: 10,
    enabled: isOpen,
    onDragStart: () => {
      setIsDragging(true)
    },
    onDrag: (delta, velocity) => {
      // Dragging down = positive delta.y
      // Reduce height when dragging down
      const newOffset = Math.max(-maxHeight, Math.min(0, delta.y))
      setDragOffset(newOffset)
    },
    onDragEnd: (velocity) => {
      setIsDragging(false)
      
      const snapPixels = snapPoints.map(snapToPixels)
      const currentWithOffset = currentHeight - dragOffset
      
      // If swiping down fast, dismiss or snap to lower point
      if (velocity.y > 500 && dismissible) {
        setOpen(false)
        setDragOffset(0)
        return
      }
      
      // Find nearest snap point
      const targetHeight = calculateSnapPoint(
        currentWithOffset,
        -velocity.y, // Negative because down = close
        snapPixels,
        300
      )
      
      const targetSnap = snapPoints[snapPixels.indexOf(targetHeight)]
      setCurrentSnap(targetSnap)
      setDragOffset(0)
      onSnapChange?.(targetSnap)
      
      // If snapped to smallest and swiping down, close
      if (targetHeight === Math.min(...snapPixels) && velocity.y > 200 && dismissible) {
        setOpen(false)
      }
    },
  })
  
  // Handle escape key
  useEffect(() => {
    if (!isOpen) return
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && dismissible) {
        setOpen(false)
      }
    }
    
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, dismissible, setOpen])
  
  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
      return () => {
        document.body.style.overflow = ''
      }
    }
  }, [isOpen])
  
  if (!isOpen) return null
  
  const actualHeight = currentHeight - dragOffset
  const opacity = Math.min(1, actualHeight / (maxHeight * 0.5))
  
  return createPortal(
    <>
      {/* Overlay */}
      {overlay && (
        <div
          onClick={() => dismissible && setOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 'var(--ds-z-sheet)',
            backgroundColor: 'var(--ds-sheet-overlay)',
            opacity,
            transition: isDragging ? 'none' : 'opacity var(--ds-transition-sheet)',
          }}
        />
      )}
      
      {/* Sheet */}
      <div
        ref={sheetRef}
        className={`ds-sheet ${className}`}
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 'var(--ds-z-sheet)',
          height: actualHeight,
          maxHeight: 'var(--ds-viewport-height-safe)',
          backgroundColor: 'var(--ds-sheet-bg)',
          borderRadius: 'var(--ds-sheet-border-radius)',
          boxShadow: 'var(--ds-elevation-sheet)',
          transition: isDragging ? 'none' : 'height var(--ds-transition-sheet)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          paddingBottom: 'var(--ds-safe-bottom)',
        }}
        role="dialog"
        aria-modal="true"
      >
        {handle && <SheetHandle />}
        <div
          ref={contentRef}
          style={{
            flex: 1,
            overflowY: 'auto',
            WebkitOverflowScrolling: 'touch',
          }}
        >
          {children}
        </div>
      </div>
    </>,
    document.body
  )
}

const SheetHandle: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div
      className={`ds-sheet__handle-container ${className}`}
      style={{
        display: 'flex',
        justifyContent: 'center',
        padding: 'var(--ds-space-3) 0',
        cursor: 'grab',
        touchAction: 'none', // Prevent pull-to-refresh on handle
      }}
    >
      <div
        style={{
          width: 'var(--ds-sheet-handle-width)',
          height: 'var(--ds-sheet-handle-height)',
          backgroundColor: 'var(--ds-sheet-handle-color)',
          borderRadius: 'var(--ds-radius-full)',
        }}
      />
    </div>
  )
}

const SheetContent: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = '',
}) => {
  return (
    <div className={`ds-sheet__content ${className}`} style={{ padding: 'var(--ds-space-4)' }}>
      {children}
    </div>
  )
}

Sheet.Content = SheetContent
Sheet.Handle = SheetHandle
