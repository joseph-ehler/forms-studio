/**
 * OverlayPickerCore
 * 
 * Core state management, focus trap, and keyboard handling for all overlay pickers.
 * This is the foundation that Select, MultiSelect, Date, Color, etc. build on.
 */

import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react'
import type { OverlayPickerCoreProps, OverlayCloseReason } from './types'
import { FocusTrap } from '../../lib/focus'
import { useScrollLock } from './hooks/useScrollLock'

// Context for automatic contentRef wiring - prevents manual wiring bugs
interface OverlayContextType {
  contentRef: React.RefObject<HTMLDivElement>
}

const OverlayContext = createContext<OverlayContextType | null>(null)

// Export hook for SheetDialog/OverlayPicker to auto-consume contentRef
export const useOverlayContext = () => useContext(OverlayContext)

export interface OverlayPickerCoreComponentProps extends Omit<OverlayPickerCoreProps, 'children'> {
  id?: string
  children: React.ReactNode | ((context: OverlayContextValue) => React.ReactNode)
}

export const OverlayPickerCore: React.FC<OverlayPickerCoreComponentProps> = ({
  open: controlledOpen,
  defaultOpen = false,
  onOpenChange,
  closeOnSelect = false,
  trapFocus = true,
  returnFocus = true,
  allowOutsideScroll = false,
  children,
  ...props
}) => {
  // State: controlled or uncontrolled
  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen)
  const isControlled = controlledOpen !== undefined
  const isOpen = isControlled ? controlledOpen : uncontrolledOpen

  // Refs
  const triggerRef = useRef<HTMLElement | null>(null)
  const contentRef = useRef<HTMLDivElement | null>(null)

  // Update open state
  const setOpen = useCallback((newOpen: boolean, reason?: OverlayCloseReason) => {
    if (!isControlled) {
      setUncontrolledOpen(newOpen)
    }
    onOpenChange?.(newOpen, reason)
  }, [isControlled, onOpenChange])

  // Open/close handlers
  const open = useCallback(() => setOpen(true, 'programmatic'), [setOpen])
  const close = useCallback((reason: OverlayCloseReason = 'programmatic') => {
    setOpen(false, reason)
  }, [setOpen])

  // Cross-platform scroll lock with iOS-specific strategy
  useScrollLock(isOpen && !allowOutsideScroll)

  // Outside click handling
  const handleOutsideClick = useCallback((e: PointerEvent) => {
    if (!isOpen) return
    
    const target = e.target as Node
    
    // ONLY close if clicking OUTSIDE both content and trigger
    // This allows ALL buttons inside the overlay to control their own behavior
    const isClickInside = contentRef.current?.contains(target) || 
                         triggerRef.current?.contains(target)
    
    if (!isClickInside) {
      close('outside')
    }
  }, [isOpen, close])

  useEffect(() => {
    if (isOpen) {
      // Use pointerdown for touch/pen support (consistent with OverlayPicker)
      document.addEventListener('pointerdown', handleOutsideClick)
      return () => document.removeEventListener('pointerdown', handleOutsideClick)
    }
  }, [isOpen, handleOutsideClick])

  // Provide context to children - contentRef flows automatically via Context
  const renderPropsContext = {
    isOpen,
    open,
    close,
    triggerRef,
    contentRef, // Still available in render props for backwards compatibility
    closeOnSelect,
  }

  // Separate Context for auto-wiring (SheetDialog/OverlayPicker consume this)
  const autoWireContext = {
    contentRef,
  }

  return (
    <OverlayContext.Provider value={autoWireContext}>
      <FocusTrap
        active={isOpen && trapFocus}
        returnFocus={returnFocus}
        autoFocus={true}
        onEscape={() => close('escape')}
      >
        {typeof children === 'function' ? children(renderPropsContext) : children}
      </FocusTrap>
    </OverlayContext.Provider>
  )
}

// Context for overlay state (render props interface)
interface OverlayContextValue {
  isOpen: boolean
  open: () => void
  close: (reason?: OverlayCloseReason) => void
  triggerRef: React.RefObject<HTMLElement>
  contentRef: React.RefObject<HTMLDivElement>
  closeOnSelect: boolean
}
