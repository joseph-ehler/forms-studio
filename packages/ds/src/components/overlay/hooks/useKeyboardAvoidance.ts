/**
 * useKeyboardAvoidance
 * 
 * Lifts sheet when mobile keyboard appears using visualViewport API
 * Handles both "resize" and "pan" keyboard modes on Android/iOS
 */

import { useEffect, useState } from 'react'
import { supportsVisualViewport } from '../utils/browser-compat'

export interface KeyboardAvoidanceOptions {
  enabled: boolean
  onOffsetChange?: (offset: number) => void
}

export function useKeyboardAvoidance(
  isOpen: boolean,
  options: KeyboardAvoidanceOptions
): number {
  const [keyboardOffset, setKeyboardOffset] = useState(0)
  
  useEffect(() => {
    if (!isOpen || !options.enabled || !supportsVisualViewport()) return
    
    const vv = window.visualViewport
    if (!vv) return
    
    const handleViewportChange = () => {
      // Calculate keyboard height
      const viewportHeight = vv.height
      const windowHeight = window.innerHeight
      const keyboardHeight = Math.max(0, windowHeight - viewportHeight)
      
      setKeyboardOffset(keyboardHeight)
      options.onOffsetChange?.(keyboardHeight)
    }
    
    // Listen to both resize (keyboard show/hide) and scroll (pan mode)
    vv.addEventListener('resize', handleViewportChange)
    vv.addEventListener('scroll', handleViewportChange)
    
    return () => {
      vv.removeEventListener('resize', handleViewportChange)
      vv.removeEventListener('scroll', handleViewportChange)
      setKeyboardOffset(0)
    }
  }, [isOpen, options.enabled, options.onOffsetChange])
  
  return keyboardOffset
}
