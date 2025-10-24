/**
 * useRefcountedScrollLock
 * 
 * Scroll lock with reference counting for nested overlays
 * Only unlocks when ALL overlays are closed
 */

import { useEffect } from 'react'
import { isIOS } from '../utils/browser-compat'

// Global refcount state (shared across all hook instances)
let scrollLockRefCount = 0
let savedScrollY = 0
let previousState = {
  bodyPosition: '',
  bodyTop: '',
  bodyWidth: '',
  bodyPaddingRight: '',
  htmlOverflow: '',
}

/**
 * Lock scroll with refcounting
 * Multiple overlays can call this - only unlocks when all release
 */
export function useRefcountedScrollLock(isLocked: boolean): void {
  useEffect(() => {
    if (!isLocked) return
    
    const html = document.documentElement
    const body = document.body
    
    // Increment refcount
    scrollLockRefCount++
    
    // Only apply lock on first overlay
    if (scrollLockRefCount === 1) {
      const scrollbarWidth = window.innerWidth - html.clientWidth
      savedScrollY = window.scrollY
      
      // Save previous state
      previousState = {
        bodyPosition: body.style.position,
        bodyTop: body.style.top,
        bodyWidth: body.style.width,
        bodyPaddingRight: body.style.paddingRight,
        htmlOverflow: html.style.overflow,
      }
      
      // iOS-specific scroll lock
      if (isIOS()) {
        body.style.position = 'fixed'
        body.style.top = `-${savedScrollY}px`
        body.style.width = '100%'
        body.style.paddingRight = `${scrollbarWidth}px`
        html.style.overflow = 'hidden'
      } else {
        // Standard scroll lock
        html.style.overflow = 'hidden'
        body.style.paddingRight = `${scrollbarWidth}px`
      }
      
      if (process.env.NODE_ENV !== 'production') {
        console.log('[ScrollLock] Locked (refcount: 1)')
      }
    } else {
      if (process.env.NODE_ENV !== 'production') {
        console.log(`[ScrollLock] Already locked (refcount: ${scrollLockRefCount})`)
      }
    }
    
    return () => {
      // Decrement refcount
      scrollLockRefCount--
      
      // Only unlock when all overlays are closed
      if (scrollLockRefCount === 0) {
        // Restore previous state
        Object.assign(body.style, {
          position: previousState.bodyPosition,
          top: previousState.bodyTop,
          width: previousState.bodyWidth,
          paddingRight: previousState.bodyPaddingRight,
        })
        html.style.overflow = previousState.htmlOverflow
        
        // Restore scroll position (guard against mid-animation unlock)
        if (typeof savedScrollY === 'number') {
          window.scrollTo(0, savedScrollY)
        }
        
        if (process.env.NODE_ENV !== 'production') {
          console.log('[ScrollLock] Unlocked (refcount: 0)')
        }
      } else {
        if (process.env.NODE_ENV !== 'production') {
          console.log(`[ScrollLock] Still locked (refcount: ${scrollLockRefCount})`)
        }
      }
    }
  }, [isLocked])
}
