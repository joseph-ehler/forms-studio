/**
 * useGesture - Native Gesture Handling
 * 
 * Handles touch and mouse gestures with velocity tracking.
 * Used for swipe, drag, snap behaviors.
 * 
 * Features:
 * - Velocity tracking
 * - Direction detection
 * - Momentum calculation
 * - Snap point logic
 * - Touch and mouse support
 */

import { useRef, useEffect } from 'react'

interface GestureOptions {
  onDragStart?: (e: PointerEvent) => void
  onDrag?: (delta: { x: number; y: number }, velocity: { x: number; y: number }) => void
  onDragEnd?: (velocity: { x: number; y: number }) => void
  direction?: 'horizontal' | 'vertical' | 'both'
  threshold?: number // Minimum movement to register
  enabled?: boolean
}

interface GestureState {
  isDragging: boolean
  startX: number
  startY: number
  currentX: number
  currentY: number
  lastX: number
  lastY: number
  lastTime: number
  velocityX: number
  velocityY: number
}

export function useGesture(
  elementRef: React.RefObject<HTMLElement>,
  options: GestureOptions = {}
) {
  const {
    onDragStart,
    onDrag,
    onDragEnd,
    direction = 'both',
    threshold = 5,
    enabled = true,
  } = options
  
  const stateRef = useRef<GestureState>({
    isDragging: false,
    startX: 0,
    startY: 0,
    currentX: 0,
    currentY: 0,
    lastX: 0,
    lastY: 0,
    lastTime: 0,
    velocityX: 0,
    velocityY: 0,
  })
  
  useEffect(() => {
    if (!enabled || !elementRef.current) return
    
    const element = elementRef.current
    const state = stateRef.current
    
    const handlePointerDown = (e: PointerEvent) => {
      state.isDragging = false // Not yet, wait for threshold
      state.startX = e.clientX
      state.startY = e.clientY
      state.currentX = e.clientX
      state.currentY = e.clientY
      state.lastX = e.clientX
      state.lastY = e.clientY
      state.lastTime = Date.now()
      state.velocityX = 0
      state.velocityY = 0
      
      onDragStart?.(e)
      
      // Capture pointer for smooth dragging
      element.setPointerCapture(e.pointerId)
    }
    
    const handlePointerMove = (e: PointerEvent) => {
      const deltaX = e.clientX - state.startX
      const deltaY = e.clientY - state.startY
      
      // Check if we've moved past threshold
      const movedEnough = 
        Math.abs(deltaX) > threshold || Math.abs(deltaY) > threshold
      
      if (!movedEnough && !state.isDragging) return
      
      if (!state.isDragging) {
        state.isDragging = true
      }
      
      // Calculate velocity
      const now = Date.now()
      const dt = Math.max(1, now - state.lastTime) // Avoid division by zero
      
      state.velocityX = ((e.clientX - state.lastX) / dt) * 1000 // px/s
      state.velocityY = ((e.clientY - state.lastY) / dt) * 1000 // px/s
      
      state.currentX = e.clientX
      state.currentY = e.clientY
      state.lastX = e.clientX
      state.lastY = e.clientY
      state.lastTime = now
      
      // Apply direction constraints
      let dx = deltaX
      let dy = deltaY
      let vx = state.velocityX
      let vy = state.velocityY
      
      if (direction === 'horizontal') {
        dy = 0
        vy = 0
      } else if (direction === 'vertical') {
        dx = 0
        vx = 0
      }
      
      onDrag?.({ x: dx, y: dy }, { x: vx, y: vy })
      
      // Prevent default to avoid scrolling while dragging
      e.preventDefault()
    }
    
    const handlePointerUp = (e: PointerEvent) => {
      if (state.isDragging) {
        let vx = state.velocityX
        let vy = state.velocityY
        
        if (direction === 'horizontal') vy = 0
        if (direction === 'vertical') vx = 0
        
        onDragEnd?.({ x: vx, y: vy })
      }
      
      state.isDragging = false
      element.releasePointerCapture(e.pointerId)
    }
    
    element.addEventListener('pointerdown', handlePointerDown)
    element.addEventListener('pointermove', handlePointerMove)
    element.addEventListener('pointerup', handlePointerUp)
    element.addEventListener('pointercancel', handlePointerUp)
    
    return () => {
      element.removeEventListener('pointerdown', handlePointerDown)
      element.removeEventListener('pointermove', handlePointerMove)
      element.removeEventListener('pointerup', handlePointerUp)
      element.removeEventListener('pointercancel', handlePointerUp)
    }
  }, [enabled, direction, threshold, onDragStart, onDrag, onDragEnd])
  
  return {
    isDragging: stateRef.current.isDragging,
  }
}

/**
 * Calculate snap point from velocity and current position
 */
export function calculateSnapPoint(
  current: number,
  velocity: number,
  snapPoints: number[],
  velocityThreshold: number = 500
): number {
  // If velocity is high enough, snap to next point in direction of movement
  if (Math.abs(velocity) > velocityThreshold) {
    const direction = velocity > 0 ? 1 : -1
    const sorted = [...snapPoints].sort((a, b) => a - b)
    
    for (let i = 0; i < sorted.length; i++) {
      if (direction > 0 && sorted[i] > current) {
        return sorted[i]
      }
      if (direction < 0 && sorted[i] < current) {
        return sorted[i]
      }
    }
  }
  
  // Otherwise, snap to nearest point
  return snapPoints.reduce((nearest, point) => {
    return Math.abs(point - current) < Math.abs(nearest - current)
      ? point
      : nearest
  })
}

/**
 * Apply momentum to a value (for smooth animations after gesture)
 */
export function applyMomentum(
  current: number,
  velocity: number,
  damping: number = 0.95,
  threshold: number = 0.5
): number {
  if (Math.abs(velocity) < threshold) return current
  
  return current + velocity * (1 - damping)
}
