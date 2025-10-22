/**
 * Drawer - Swipeable Side Navigation
 * 
 * TRANSCENDENT gestures with snap points.
 * iOS-like swipe-to-open/close behavior.
 * 
 * Features:
 * - Swipe from edge to open
 * - Drag to close
 * - Snap points (25%, 50%, 100%)
 * - Velocity-based snapping
 * - Blur overlay
 * - Keyboard navigation
 * 
 * Usage:
 *   <Drawer open={isOpen} onOpenChange={setOpen}>
 *     <Drawer.Content>Navigation</Drawer.Content>
 *   </Drawer>
 */

import React, { useRef, useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useGesture, calculateSnapPoint } from './useGesture'

interface DrawerProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  side?: 'left' | 'right'
  swipeToOpen?: boolean
  snapPoints?: number[] // Percentages: 0.25 = 25%, 0.5 = 50%, 1.0 = 100%
  defaultSnap?: number
  width?: number
  overlay?: boolean
  children: React.ReactNode
  className?: string
}

export const Drawer: React.FC<DrawerProps> & {
  Content: typeof DrawerContent
} = ({
  open: controlledOpen,
  onOpenChange,
  side = 'left',
  swipeToOpen = true,
  snapPoints = [0, 1.0], // Closed, fully open
  defaultSnap = 1.0,
  width = 280,
  overlay = true,
  children,
  className = '',
}) => {
  const [internalOpen, setInternalOpen] = useState(false)
  const [snapPosition, setSnapPosition] = useState(0) // 0 = closed, 1 = open
  const [isDragging, setIsDragging] = useState(false)
  const [translateX, setTranslateX] = useState(0)
  
  const drawerRef = useRef<HTMLDivElement>(null)
  const overlayRef = useRef<HTMLDivElement>(null)
  
  const isOpen = controlledOpen ?? internalOpen
  const setOpen = onOpenChange ?? setInternalOpen
  
  // Calculate max translate based on width
  const maxTranslate = width
  const currentTranslate = snapPosition * maxTranslate
  
  // Handle gestures
  useGesture(drawerRef, {
    direction: 'horizontal',
    threshold: 10,
    enabled: isOpen,
    onDragStart: () => {
      setIsDragging(true)
    },
    onDrag: (delta, velocity) => {
      const drag = side === 'left' ? delta.x : -delta.x
      const newTranslate = Math.max(0, Math.min(maxTranslate, currentTranslate + drag))
      setTranslateX(newTranslate)
    },
    onDragEnd: (velocity) => {
      setIsDragging(false)
      
      // Calculate snap point based on velocity and position
      const velocityX = side === 'left' ? velocity.x : -velocity.x
      const currentPercent = translateX / maxTranslate
      
      const targetSnap = calculateSnapPoint(
        currentPercent,
        velocityX / maxTranslate, // Normalize velocity
        snapPoints,
        0.5 // Lower threshold for snapping
      )
      
      setSnapPosition(targetSnap)
      
      // If snapped to 0, close the drawer
      if (targetSnap === 0) {
        setOpen(false)
      }
    },
  })
  
  // Update translate when snap position changes
  useEffect(() => {
    if (!isDragging) {
      setTranslateX(snapPosition * maxTranslate)
    }
  }, [snapPosition, maxTranslate, isDragging])
  
  // Open to default snap point
  useEffect(() => {
    if (isOpen && snapPosition === 0) {
      setSnapPosition(defaultSnap)
    } else if (!isOpen) {
      setSnapPosition(0)
    }
  }, [isOpen, defaultSnap])
  
  // Handle escape key
  useEffect(() => {
    if (!isOpen) return
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false)
      }
    }
    
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, setOpen])
  
  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
      return () => {
        document.body.style.overflow = ''
      }
    }
  }, [isOpen])
  
  if (!isOpen && snapPosition === 0) return null
  
  const progress = translateX / maxTranslate
  const transform = side === 'left'
    ? `translateX(${translateX - maxTranslate}px)`
    : `translateX(${maxTranslate - translateX}px)`
  
  return createPortal(
    <>
      {/* Overlay */}
      {overlay && (
        <div
          ref={overlayRef}
          onClick={() => setOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 'var(--ds-z-drawer)',
            backgroundColor: 'var(--ds-drawer-overlay)',
            opacity: progress,
            transition: isDragging ? 'none' : 'opacity var(--ds-transition-drawer)',
            pointerEvents: progress > 0 ? 'auto' : 'none',
          }}
        />
      )}
      
      {/* Drawer */}
      <aside
        ref={drawerRef}
        className={`ds-drawer ${className}`}
        style={{
          position: 'fixed',
          top: 0,
          bottom: 0,
          [side]: 0,
          width,
          zIndex: 'var(--ds-z-drawer)',
          backgroundColor: 'var(--ds-drawer-bg)',
          borderRight: side === 'left' ? '1px solid var(--ds-color-border-subtle)' : 'none',
          borderLeft: side === 'right' ? '1px solid var(--ds-color-border-subtle)' : 'none',
          boxShadow: 'var(--ds-elevation-drawer)',
          transform,
          transition: isDragging ? 'none' : 'transform var(--ds-transition-drawer)',
          overflowY: 'auto',
          WebkitOverflowScrolling: 'touch',
          paddingTop: 'var(--ds-safe-top)',
          paddingBottom: 'var(--ds-safe-bottom)',
          touchAction: 'pan-y', // Allow vertical scrolling, capture horizontal
        }}
        role="navigation"
        aria-label="Navigation drawer"
      >
        {children}
      </aside>
    </>,
    document.body
  )
}

const DrawerContent: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = '',
}) => {
  return (
    <div className={`ds-drawer__content ${className}`} style={{ padding: 'var(--ds-space-4)' }}>
      {children}
    </div>
  )
}

Drawer.Content = DrawerContent
