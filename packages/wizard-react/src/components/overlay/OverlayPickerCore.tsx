/**
 * OverlayPickerCore
 * 
 * Core state management, focus trap, and keyboard handling for all overlay pickers.
 * This is the foundation that Select, MultiSelect, Date, Color, etc. build on.
 */

import React, { useEffect, useRef, useState, useCallback } from 'react'
import type { OverlayPickerCoreProps, OverlayCloseReason } from './types'

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
  const previousActiveElement = useRef<Element | null>(null)

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

  // Focus management
  useEffect(() => {
    if (isOpen) {
      // Store current active element
      previousActiveElement.current = document.activeElement

      // Focus trap
      if (trapFocus && contentRef.current) {
        const focusableElements = contentRef.current.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        )
        const firstFocusable = focusableElements[0] as HTMLElement
        firstFocusable?.focus()
      }

      // Lock body scroll (if not allowed)
      if (!allowOutsideScroll) {
        const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth
        document.body.style.overflow = 'hidden'
        document.body.style.paddingRight = `${scrollbarWidth}px`
      }
    } else {
      // Return focus
      if (returnFocus && previousActiveElement.current instanceof HTMLElement) {
        previousActiveElement.current.focus()
      }

      // Unlock body scroll
      document.body.style.overflow = ''
      document.body.style.paddingRight = ''
    }

    return () => {
      // Cleanup on unmount
      document.body.style.overflow = ''
      document.body.style.paddingRight = ''
    }
  }, [isOpen, trapFocus, returnFocus, allowOutsideScroll])

  // Keyboard handling
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!isOpen) return

    switch (e.key) {
      case 'Escape':
        e.preventDefault()
        close('escape')
        break

      case 'Tab':
        if (trapFocus && contentRef.current) {
          const focusableElements = Array.from(
            contentRef.current.querySelectorAll(
              'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
            )
          ) as HTMLElement[]

          if (focusableElements.length === 0) {
            e.preventDefault()
            return
          }

          const firstFocusable = focusableElements[0]
          const lastFocusable = focusableElements[focusableElements.length - 1]

          if (e.shiftKey && document.activeElement === firstFocusable) {
            e.preventDefault()
            lastFocusable.focus()
          } else if (!e.shiftKey && document.activeElement === lastFocusable) {
            e.preventDefault()
            firstFocusable.focus()
          }
        }
        break
    }
  }, [isOpen, trapFocus, close])

  // Outside click handling
  const handleOutsideClick = useCallback((e: MouseEvent) => {
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
      document.addEventListener('mousedown', handleOutsideClick)
      return () => document.removeEventListener('mousedown', handleOutsideClick)
    }
  }, [isOpen, handleOutsideClick])

  // Provide context to children
  const contextValue = {
    isOpen,
    open,
    close,
    triggerRef,
    contentRef,
    closeOnSelect,
    handleKeyDown,
  }

  return (
    <OverlayContext.Provider value={contextValue}>
      {typeof children === 'function' ? children(contextValue) : children}
    </OverlayContext.Provider>
  )
}

// Context for overlay state
interface OverlayContextValue {
  isOpen: boolean
  open: () => void
  close: (reason?: OverlayCloseReason) => void
  triggerRef: React.RefObject<HTMLElement>
  contentRef: React.RefObject<HTMLDivElement>
  closeOnSelect: boolean
  handleKeyDown: (e: React.KeyboardEvent) => void
}

const OverlayContext = React.createContext<OverlayContextValue | null>(null)

export const useOverlayContext = () => {
  const context = React.useContext(OverlayContext)
  if (!context) {
    throw new Error('useOverlayContext must be used within OverlayPickerCore')
  }
  return context
}
