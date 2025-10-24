/**
 * useScrollLock
 * 
 * Cross-platform scroll lock with iOS-specific strategy
 * Single source of truth for scroll management
 */

import { useEffect } from 'react'
import { isIOS } from '../utils/browser-compat'

export function useScrollLock(isLocked: boolean): void {
  useEffect(() => {
    if (!isLocked) return
    
    const html = document.documentElement
    const body = document.body
    
    // iOS-specific scroll lock (body fixed strategy)
    if (isIOS()) {
      const scrollY = window.scrollY
      const scrollbarWidth = window.innerWidth - html.clientWidth
      
      // Save previous values
      const prev = {
        position: body.style.position,
        top: body.style.top,
        width: body.style.width,
        paddingRight: body.style.paddingRight,
        overflow: html.style.overflow,
      }
      
      // Lock with body fixed (prevents inertial scroll bleed)
      body.style.position = 'fixed'
      body.style.top = `-${scrollY}px`
      body.style.width = '100%'
      body.style.paddingRight = `${scrollbarWidth}px`
      html.style.overflow = 'hidden'
      
      return () => {
        // Restore
        Object.assign(body.style, {
          position: prev.position,
          top: prev.top,
          width: prev.width,
          paddingRight: prev.paddingRight,
        })
        html.style.overflow = prev.overflow
        
        // Restore scroll position
        window.scrollTo(0, scrollY)
      }
    }
    
    // Standard scroll lock (other platforms)
    const scrollbarWidth = window.innerWidth - html.clientWidth
    const prev = {
      overflow: html.style.overflow,
      paddingRight: body.style.paddingRight,
    }
    
    html.style.overflow = 'hidden'
    body.style.paddingRight = `${scrollbarWidth}px`
    
    return () => {
      html.style.overflow = prev.overflow
      body.style.paddingRight = prev.paddingRight
    }
  }, [isLocked])
}
