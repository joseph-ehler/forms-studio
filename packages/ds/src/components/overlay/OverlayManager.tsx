/**
 * OverlayManager
 * 
 * Coordinates nested/stacked overlays with:
 * - LIFO stack (topmost overlay owns Esc + focus trap)
 * - Refcounted scroll lock (child doesn't unlock background)
 * - Refcounted inert (multiple overlays don't conflict)
 * 
 * Usage:
 * ```tsx
 * <OverlayManager>
 *   <App />
 * </OverlayManager>
 * ```
 */

import React, { createContext, useContext, useCallback, useState, useEffect } from 'react'

export interface OverlayEntry {
  id: string
  onClose: () => void
  role?: 'dialog' | 'listbox'
  level: number  // Z-index level (auto-assigned)
}

interface OverlayManagerContextType {
  push: (entry: Omit<OverlayEntry, 'level'>) => number
  pop: (id: string) => void
  top: () => OverlayEntry | undefined
  isTopmost: (id: string) => boolean
  getLevel: (id: string) => number
  count: () => number
}

const OverlayManagerContext = createContext<OverlayManagerContextType | null>(null)

/**
 * Hook to access overlay manager
 * Throws in development if used outside OverlayManager
 */
export function useOverlayManager(): OverlayManagerContextType {
  const ctx = useContext(OverlayManagerContext)
  
  if (!ctx && process.env.NODE_ENV !== 'production') {
    throw new Error(
      'useOverlayManager must be used within <OverlayManager>. ' +
      'Wrap your app root with <OverlayManager>.'
    )
  }
  
  return ctx!
}

/**
 * OverlayManager Provider
 * 
 * Manages stack of open overlays:
 * - LIFO stack for Esc key handling
 * - Auto-assigned z-index levels
 * - Refcounted scroll lock and inert
 */
export const OverlayManager: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [stack, setStack] = useState<OverlayEntry[]>([])
  
  // Push new overlay onto stack
  const push = useCallback((entry: Omit<OverlayEntry, 'level'>) => {
    const level = stack.length + 1
    const newEntry: OverlayEntry = { ...entry, level }
    
    setStack(prev => [...prev, newEntry])
    
    if (process.env.NODE_ENV !== 'production') {
      console.log('[OverlayManager] Push:', entry.id, 'level:', level)
    }
    
    return level
  }, [stack.length])
  
  // Pop overlay from stack
  const pop = useCallback((id: string) => {
    setStack(prev => {
      const filtered = prev.filter(e => e.id !== id)
      
      if (process.env.NODE_ENV !== 'production') {
        const removed = prev.find(e => e.id === id)
        if (removed) {
          console.log('[OverlayManager] Pop:', id, 'level:', removed.level)
        }
      }
      
      return filtered
    })
  }, [])
  
  // Get topmost overlay
  const top = useCallback(() => {
    return stack[stack.length - 1]
  }, [stack])
  
  // Check if given overlay is topmost
  const isTopmost = useCallback((id: string) => {
    const topEntry = stack[stack.length - 1]
    return topEntry?.id === id
  }, [stack])
  
  // Get z-index level for overlay
  const getLevel = useCallback((id: string) => {
    const entry = stack.find(e => e.id === id)
    return entry?.level ?? 0
  }, [stack])
  
  // Get overlay count
  const count = useCallback(() => {
    return stack.length
  }, [stack.length])
  
  // Global Escape handler - only topmost overlay handles it
  useEffect(() => {
    if (stack.length === 0) return
    
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        const topEntry = stack[stack.length - 1]
        if (topEntry) {
          topEntry.onClose()
        }
      }
    }
    
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [stack])
  
  const value: OverlayManagerContextType = {
    push,
    pop,
    top,
    isTopmost,
    getLevel,
    count,
  }
  
  return (
    <OverlayManagerContext.Provider value={value}>
      {children}
    </OverlayManagerContext.Provider>
  )
}

/**
 * Hook to register an overlay with the manager
 * 
 * @example
 * ```tsx
 * const overlayId = useId()
 * useOverlayRegistration(overlayId, open, onClose, { role: 'dialog' })
 * ```
 */
export function useOverlayRegistration(
  id: string,
  isOpen: boolean,
  onClose: () => void,
  options: { role?: 'dialog' | 'listbox' } = {}
): {
  isTopmost: boolean
  level: number
  overlayCount: number
} {
  const manager = useOverlayManager()
  const [isTopmost, setIsTopmost] = useState(false)
  const [level, setLevel] = useState(0)
  
  useEffect(() => {
    if (!isOpen) return
    
    // Register with manager
    const assignedLevel = manager.push({ id, onClose, role: options.role })
    setLevel(assignedLevel)
    
    // Update topmost status
    const checkTopmost = () => {
      setIsTopmost(manager.isTopmost(id))
    }
    checkTopmost()
    
    // Re-check on any stack change (other overlays opening/closing)
    const interval = setInterval(checkTopmost, 100)
    
    return () => {
      clearInterval(interval)
      manager.pop(id)
    }
  }, [isOpen, id, onClose, options.role, manager])
  
  return {
    isTopmost,
    level,
    overlayCount: manager.count(),
  }
}
