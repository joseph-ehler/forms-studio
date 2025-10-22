/**
 * FocusTrap Component
 * 
 * Locks focus within children (modal/dialog pattern).
 * 
 * Features:
 * - Tab cycling (first ↔ last)
 * - Return focus on unmount
 * - Escape key support
 * - Auto-focus first element
 * 
 * Usage:
 *   <FocusTrap active={isOpen} returnFocus onEscape={close}>
 *     <Dialog>...</Dialog>
 *   </FocusTrap>
 */

import React, { useEffect, useRef, useCallback, createContext, useContext } from 'react'
import {
  getFocusableElements,
  getFirstFocusable,
  createFocusStore,
} from './focusUtils'

export interface FocusTrapProps {
  /** Whether trap is active (for conditional mounting) */
  active?: boolean
  
  /** Return focus to trigger on deactivation */
  returnFocus?: boolean
  
  /** Auto-focus first element on activation */
  autoFocus?: boolean
  
  /** Called when Escape is pressed */
  onEscape?: () => void
  
  /** Children to trap focus within */
  children: React.ReactNode
  
  /** Optional container props */
  containerProps?: React.HTMLAttributes<HTMLDivElement>
}

interface FocusTrapContextValue {
  containerRef: React.RefObject<HTMLDivElement>
  active: boolean
}

const FocusTrapContext = createContext<FocusTrapContextValue | null>(null)

/**
 * Hook to access focus trap from nested components
 */
export function useFocusTrap() {
  return useContext(FocusTrapContext)
}

export const FocusTrap: React.FC<FocusTrapProps> = ({
  active = true,
  returnFocus = true,
  autoFocus = true,
  onEscape,
  children,
  containerProps,
}) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const focusStore = useRef(createFocusStore())
  
  // Store focus on activation
  useEffect(() => {
    if (active) {
      focusStore.current.store()
      
      // Auto-focus first element
      if (autoFocus && containerRef.current) {
        const firstFocusable = getFirstFocusable(containerRef.current)
        firstFocusable?.focus()
      }
    }
    
    // Return focus on deactivation
    return () => {
      if (active && returnFocus) {
        focusStore.current.restore()
      }
    }
  }, [active, autoFocus, returnFocus])
  
  // Tab trap handler
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!active || !containerRef.current) return
    
    // Escape key
    if (e.key === 'Escape' && onEscape) {
      e.preventDefault()
      onEscape()
      return
    }
    
    // Tab key (trap focus)
    if (e.key === 'Tab') {
      const focusableElements = getFocusableElements(containerRef.current)
      
      if (focusableElements.length === 0) {
        e.preventDefault()
        return
      }
      
      const firstFocusable = focusableElements[0]
      const lastFocusable = focusableElements[focusableElements.length - 1]
      
      // Shift+Tab on first element → focus last
      if (e.shiftKey && document.activeElement === firstFocusable) {
        e.preventDefault()
        lastFocusable.focus()
      }
      // Tab on last element → focus first
      else if (!e.shiftKey && document.activeElement === lastFocusable) {
        e.preventDefault()
        firstFocusable.focus()
      }
    }
  }, [active, onEscape])
  
  // Attach keyboard listener
  useEffect(() => {
    if (active) {
      document.addEventListener('keydown', handleKeyDown)
      return () => document.removeEventListener('keydown', handleKeyDown)
    }
  }, [active, handleKeyDown])
  
  const contextValue: FocusTrapContextValue = {
    containerRef,
    active,
  }
  
  return (
    <FocusTrapContext.Provider value={contextValue}>
      <div
        ref={containerRef}
        data-focus-trap={active ? 'active' : 'inactive'}
        {...containerProps}
      >
        {children}
      </div>
    </FocusTrapContext.Provider>
  )
}
