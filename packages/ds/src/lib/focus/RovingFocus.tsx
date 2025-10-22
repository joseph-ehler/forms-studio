/**
 * RovingFocus Component
 * 
 * Arrow key navigation for lists, menus, toolbars (roving tabindex pattern).
 * 
 * Features:
 * - Arrow Up/Down or Left/Right navigation
 * - Home/End support
 * - Loop option (wrap around)
 * - Horizontal or vertical orientation
 * 
 * Usage:
 *   <RovingFocus orientation="vertical" loop>
 *     <button>Item 1</button>
 *     <button>Item 2</button>
 *     <button>Item 3</button>
 *   </RovingFocus>
 */

import React, { useEffect, useRef, useState, useCallback, createContext, useContext } from 'react'
import {
  getFocusableElements,
  getNextFocusable,
  getPreviousFocusable,
  getFirstFocusable,
  getLastFocusable,
} from './focusUtils'

export interface RovingFocusProps {
  /** Orientation for arrow keys */
  orientation?: 'horizontal' | 'vertical' | 'both'
  
  /** Loop back to start/end when reaching boundaries */
  loop?: boolean
  
  /** Children to manage focus for */
  children: React.ReactNode
  
  /** Optional container props */
  containerProps?: React.HTMLAttributes<HTMLDivElement>
  
  /** Called when focus changes */
  onFocusChange?: (index: number, element: HTMLElement) => void
}

interface RovingFocusContextValue {
  containerRef: React.RefObject<HTMLDivElement>
  focusedIndex: number
  setFocusedIndex: (index: number) => void
}

const RovingFocusContext = createContext<RovingFocusContextValue | null>(null)

/**
 * Hook to access roving focus state
 */
export function useRovingFocus() {
  return useContext(RovingFocusContext)
}

export const RovingFocus: React.FC<RovingFocusProps> = ({
  orientation = 'vertical',
  loop = false,
  children,
  containerProps,
  onFocusChange,
}) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const [focusedIndex, setFocusedIndex] = useState(0)
  
  // Navigate to next item
  const navigateNext = useCallback(() => {
    if (!containerRef.current) return
    
    const current = document.activeElement as HTMLElement
    const next = getNextFocusable(containerRef.current, current, loop)
    
    if (next) {
      next.focus()
      const elements = getFocusableElements(containerRef.current)
      const index = elements.indexOf(next)
      setFocusedIndex(index)
      onFocusChange?.(index, next)
    }
  }, [loop, onFocusChange])
  
  // Navigate to previous item
  const navigatePrev = useCallback(() => {
    if (!containerRef.current) return
    
    const current = document.activeElement as HTMLElement
    const prev = getPreviousFocusable(containerRef.current, current, loop)
    
    if (prev) {
      prev.focus()
      const elements = getFocusableElements(containerRef.current)
      const index = elements.indexOf(prev)
      setFocusedIndex(index)
      onFocusChange?.(index, prev)
    }
  }, [loop, onFocusChange])
  
  // Navigate to first item
  const navigateFirst = useCallback(() => {
    if (!containerRef.current) return
    
    const first = getFirstFocusable(containerRef.current)
    if (first) {
      first.focus()
      setFocusedIndex(0)
      onFocusChange?.(0, first)
    }
  }, [onFocusChange])
  
  // Navigate to last item
  const navigateLast = useCallback(() => {
    if (!containerRef.current) return
    
    const last = getLastFocusable(containerRef.current)
    if (last) {
      last.focus()
      const elements = getFocusableElements(containerRef.current)
      const index = elements.length - 1
      setFocusedIndex(index)
      onFocusChange?.(index, last)
    }
  }, [onFocusChange])
  
  // Keyboard handler
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!containerRef.current?.contains(document.activeElement)) return
    
    const isVertical = orientation === 'vertical' || orientation === 'both'
    const isHorizontal = orientation === 'horizontal' || orientation === 'both'
    
    switch (e.key) {
      case 'ArrowDown':
        if (isVertical) {
          e.preventDefault()
          navigateNext()
        }
        break
        
      case 'ArrowUp':
        if (isVertical) {
          e.preventDefault()
          navigatePrev()
        }
        break
        
      case 'ArrowRight':
        if (isHorizontal) {
          e.preventDefault()
          navigateNext()
        }
        break
        
      case 'ArrowLeft':
        if (isHorizontal) {
          e.preventDefault()
          navigatePrev()
        }
        break
        
      case 'Home':
        e.preventDefault()
        navigateFirst()
        break
        
      case 'End':
        e.preventDefault()
        navigateLast()
        break
    }
  }, [orientation, navigateNext, navigatePrev, navigateFirst, navigateLast])
  
  // Attach keyboard listener
  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])
  
  const contextValue: RovingFocusContextValue = {
    containerRef,
    focusedIndex,
    setFocusedIndex,
  }
  
  return (
    <RovingFocusContext.Provider value={contextValue}>
      <div
        ref={containerRef}
        data-roving-focus={orientation}
        data-roving-loop={loop}
        role="menu"
        {...containerProps}
      >
        {children}
      </div>
    </RovingFocusContext.Provider>
  )
}
