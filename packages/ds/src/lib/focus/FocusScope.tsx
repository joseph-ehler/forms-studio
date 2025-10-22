/**
 * FocusScope Component
 * 
 * Defines focus boundaries without trapping (lighter than FocusTrap).
 * Useful for nested overlays, panels, or focus regions.
 * 
 * Features:
 * - Named scopes for debugging
 * - Nested scope support
 * - Restore focus when leaving scope
 * 
 * Usage:
 *   <FocusScope id="sidebar" restoreFocus>
 *     <nav>...</nav>
 *   </FocusScope>
 */

import React, { useEffect, useRef, createContext, useContext } from 'react'
import { generateScopeId, createFocusStore, getFirstFocusable } from './focusUtils'

export interface FocusScopeProps {
  /** Unique ID for this scope (auto-generated if not provided) */
  id?: string
  
  /** Restore focus when leaving scope */
  restoreFocus?: boolean
  
  /** Auto-focus first element in scope */
  autoFocus?: boolean
  
  /** Children in this focus scope */
  children: React.ReactNode
  
  /** Optional container props */
  containerProps?: React.HTMLAttributes<HTMLDivElement>
}

interface FocusScopeContextValue {
  id: string
  containerRef: React.RefObject<HTMLDivElement>
  parentScope: FocusScopeContextValue | null
}

const FocusScopeContext = createContext<FocusScopeContextValue | null>(null)

/**
 * Hook to access current focus scope
 */
export function useFocusScope() {
  return useContext(FocusScopeContext)
}

/**
 * Hook to get all parent scopes (for debugging)
 */
export function useFocusScopeChain(): string[] {
  const scope = useFocusScope()
  const chain: string[] = []
  
  let current = scope
  while (current) {
    chain.push(current.id)
    current = current.parentScope
  }
  
  return chain
}

export const FocusScope: React.FC<FocusScopeProps> = ({
  id,
  restoreFocus = false,
  autoFocus = false,
  children,
  containerProps,
}) => {
  const parentScope = useFocusScope()
  const containerRef = useRef<HTMLDivElement>(null)
  const scopeId = useRef(id || generateScopeId())
  const focusStore = useRef(createFocusStore())
  
  // Store focus on mount
  useEffect(() => {
    if (restoreFocus) {
      focusStore.current.store()
    }
    
    // Auto-focus first element
    if (autoFocus && containerRef.current) {
      const firstFocusable = getFirstFocusable(containerRef.current)
      firstFocusable?.focus()
    }
    
    // Restore focus on unmount
    return () => {
      if (restoreFocus) {
        focusStore.current.restore()
      }
    }
  }, [restoreFocus, autoFocus])
  
  const contextValue: FocusScopeContextValue = {
    id: scopeId.current,
    containerRef,
    parentScope,
  }
  
  return (
    <FocusScopeContext.Provider value={contextValue}>
      <div
        ref={containerRef}
        data-focus-scope={scopeId.current}
        {...containerProps}
      >
        {children}
      </div>
    </FocusScopeContext.Provider>
  )
}
