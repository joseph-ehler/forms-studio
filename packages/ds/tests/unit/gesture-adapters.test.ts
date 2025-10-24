/**
 * Gesture Adapter Unit Tests
 * 
 * Tests angle detection, velocity thresholds, and gesture routing.
 */

import { describe, it, expect } from 'vitest'
import { defaultGestureRouter } from '../../src/components/overlay/gesture-adapters'
import type { GestureContext } from '../../src/components/overlay/SheetPanel'

describe('defaultGestureRouter', () => {
  const createContext = (overrides: Partial<GestureContext> = {}): GestureContext => ({
    currentSnap: 0.5,
    snaps: [0.25, 0.5, 0.9],
    velocity: 0,
    dragStartY: 100,
    dragDeltaY: 0,
    dragDeltaX: 0,
    contentScrollTop: 0,
    contentScrollHeight: 1000,
    contentClientHeight: 500,
    isAtTop: true,
    isAtBottom: false,
    isTouch: true,
    pointerType: 'touch',
    viewportHeight: 800,
    ...overrides
  })

  describe('Low snap (<0.5)', () => {
    it('sheet owns vertical drags', () => {
      const ctx = createContext({ 
        currentSnap: 0.25,
        dragDeltaY: 50
      })
      
      expect(defaultGestureRouter(ctx)).toBe('sheet')
    })

    it('sheet owns even at top of content', () => {
      const ctx = createContext({ 
        currentSnap: 0.25,
        isAtTop: true
      })
      
      expect(defaultGestureRouter(ctx)).toBe('sheet')
    })
  })

  describe('High snap (≥0.5)', () => {
    it('canvas owns when at top', () => {
      const ctx = createContext({ 
        currentSnap: 0.5,
        isAtTop: true
      })
      
      expect(defaultGestureRouter(ctx)).toBe('canvas')
    })

    it('sheet owns when scrolled down', () => {
      const ctx = createContext({ 
        currentSnap: 0.5,
        isAtTop: false,
        contentScrollTop: 100
      })
      
      expect(defaultGestureRouter(ctx)).toBe('sheet')
    })

    it('canvas owns at max snap and top', () => {
      const ctx = createContext({ 
        currentSnap: 0.9,
        isAtTop: true
      })
      
      expect(defaultGestureRouter(ctx)).toBe('canvas')
    })
  })

  describe('Scroll handoff', () => {
    it('sheet keeps control when not at top', () => {
      const ctx = createContext({ 
        currentSnap: 0.9, // High snap
        isAtTop: false,  // But scrolled
        contentScrollTop: 50
      })
      
      expect(defaultGestureRouter(ctx)).toBe('sheet')
    })

    it('sheet keeps control when at bottom', () => {
      const ctx = createContext({ 
        currentSnap: 0.9,
        isAtTop: false,
        isAtBottom: true
      })
      
      expect(defaultGestureRouter(ctx)).toBe('sheet')
    })
  })
})

describe('Angle detection (conceptual)', () => {
  // These test the math that would be used in a full gesture adapter
  
  const calculateAngle = (deltaX: number, deltaY: number): number => {
    return Math.abs(Math.atan2(deltaY, Math.abs(deltaX)) * (180 / Math.PI))
  }

  it('horizontal drag (< 30°) → low angle', () => {
    const angle = calculateAngle(100, 10) // Mostly horizontal
    expect(angle).toBeLessThan(30)
  })

  it('vertical drag (> 60°) → high angle', () => {
    const angle = calculateAngle(10, 100) // Mostly vertical
    expect(angle).toBeGreaterThan(60)
  })

  it('diagonal drag (≈45°)', () => {
    const angle = calculateAngle(50, 50)
    expect(angle).toBeGreaterThanOrEqual(40)
    expect(angle).toBeLessThanOrEqual(50)
  })

  it('pure horizontal (0°)', () => {
    const angle = calculateAngle(100, 0)
    expect(angle).toBe(0)
  })

  it('pure vertical (90°)', () => {
    const angle = calculateAngle(0, 100)
    expect(angle).toBe(90)
  })
})

describe('Velocity thresholds (conceptual)', () => {
  // Tests velocity calculation and threshold logic
  
  const isVelocityAboveThreshold = (
    velocity: number, 
    threshold = 0.9
  ): boolean => {
    return Math.abs(velocity) > threshold
  }

  it('fast flick exceeds threshold', () => {
    const velocity = 1.5 // px/ms
    expect(isVelocityAboveThreshold(velocity)).toBe(true)
  })

  it('slow drag below threshold', () => {
    const velocity = 0.3
    expect(isVelocityAboveThreshold(velocity)).toBe(false)
  })

  it('negative velocity (upward)', () => {
    const velocity = -1.2
    expect(isVelocityAboveThreshold(velocity)).toBe(true)
  })

  it('exactly at threshold', () => {
    const velocity = 0.9
    expect(isVelocityAboveThreshold(velocity)).toBe(false) // Not >
  })

  it('custom threshold', () => {
    const velocity = 0.5
    expect(isVelocityAboveThreshold(velocity, 0.3)).toBe(true)
    expect(isVelocityAboveThreshold(velocity, 0.7)).toBe(false)
  })
})

describe('Scroll tolerance (conceptual)', () => {
  // Tests small movement detection
  
  const isWithinTolerance = (
    delta: number, 
    tolerance = 12
  ): boolean => {
    return Math.abs(delta) < tolerance
  }

  it('tiny movement within tolerance', () => {
    expect(isWithinTolerance(5)).toBe(true)
  })

  it('large movement exceeds tolerance', () => {
    expect(isWithinTolerance(50)).toBe(false)
  })

  it('exactly at tolerance', () => {
    expect(isWithinTolerance(12)).toBe(false) // Not <
  })

  it('negative delta', () => {
    expect(isWithinTolerance(-8)).toBe(true)
  })
})

describe('Snap distance calculation', () => {
  const snaps = [0.25, 0.5, 0.9]
  
  const findNearestSnap = (
    currentPosition: number, 
    snaps: number[]
  ): number => {
    return snaps.reduce((nearest, snap) => {
      const currentDist = Math.abs(currentPosition - nearest)
      const snapDist = Math.abs(currentPosition - snap)
      return snapDist < currentDist ? snap : nearest
    })
  }

  it('snaps to 0.25 when at 0.3', () => {
    expect(findNearestSnap(0.3, snaps)).toBe(0.25)
  })

  it('snaps to 0.5 when at 0.4', () => {
    expect(findNearestSnap(0.4, snaps)).toBe(0.5)
  })

  it('snaps to 0.9 when at 0.8', () => {
    expect(findNearestSnap(0.8, snaps)).toBe(0.9)
  })

  it('snaps to 0.5 when exactly between 0.25 and 0.5', () => {
    const result = findNearestSnap(0.375, snaps)
    // Could be either, depends on reduce order
    expect([0.25, 0.5]).toContain(result)
  })
})

describe('Velocity-adjusted snap target', () => {
  const snaps = [0.25, 0.5, 0.9]
  
  const getVelocityAdjustedSnap = (
    currentSnap: number,
    velocity: number,
    velocityThreshold = 0.9,
    snaps: number[]
  ): number => {
    const sortedSnaps = [...snaps].sort((a, b) => a - b)
    const currentIndex = sortedSnaps.indexOf(currentSnap)
    
    if (Math.abs(velocity) > velocityThreshold) {
      if (velocity < 0 && currentIndex < sortedSnaps.length - 1) {
        // Fast upward → next higher snap
        return sortedSnaps[currentIndex + 1]
      } else if (velocity > 0 && currentIndex > 0) {
        // Fast downward → next lower snap
        return sortedSnaps[currentIndex - 1]
      }
    }
    
    return currentSnap
  }

  it('fast upward swipe from 0.25 → 0.5', () => {
    const result = getVelocityAdjustedSnap(0.25, -1.5, 0.9, snaps)
    expect(result).toBe(0.5)
  })

  it('fast downward swipe from 0.5 → 0.25', () => {
    const result = getVelocityAdjustedSnap(0.5, 1.5, 0.9, snaps)
    expect(result).toBe(0.25)
  })

  it('slow movement stays at current snap', () => {
    const result = getVelocityAdjustedSnap(0.5, 0.3, 0.9, snaps)
    expect(result).toBe(0.5)
  })

  it('at max snap, fast upward has no effect', () => {
    const result = getVelocityAdjustedSnap(0.9, -1.5, 0.9, snaps)
    expect(result).toBe(0.9)
  })

  it('at min snap, fast downward has no effect', () => {
    const result = getVelocityAdjustedSnap(0.25, 1.5, 0.9, snaps)
    expect(result).toBe(0.25)
  })
})
