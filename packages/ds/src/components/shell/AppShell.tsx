/**
 * AppShell - Root Application Layout
 * 
 * TRANSCENDENT mobile-first experience.
 * Handles safe areas, viewport, keyboard, and layout composition.
 * 
 * Features:
 * - Safe area handling (iOS notch, Android nav)
 * - Dynamic viewport (fixes 100vh mobile bugs)
 * - Keyboard avoidance
 * - Layout composition (header + content + nav)
 * - Scroll management
 * 
 * Usage:
 *   <AppShell>
 *     <AppShell.TopBar>Header</AppShell.TopBar>
 *     <AppShell.Content>Main content</AppShell.Content>
 *     <AppShell.BottomNav>Navigation</AppShell.BottomNav>
 *   </AppShell>
 */

import React, { createContext, useContext, useEffect, useState } from 'react'

interface AppShellContextValue {
  hasTopBar: boolean
  hasBottomNav: boolean
  topBarHeight: number
  bottomNavHeight: number
  safeAreaTop: number
  safeAreaBottom: number
  viewportHeight: number
  keyboardHeight: number
}

const AppShellContext = createContext<AppShellContextValue>({
  hasTopBar: false,
  hasBottomNav: false,
  topBarHeight: 0,
  bottomNavHeight: 0,
  safeAreaTop: 0,
  safeAreaBottom: 0,
  viewportHeight: 0,
  keyboardHeight: 0,
})

export const useAppShell = () => useContext(AppShellContext)

interface AppShellProps {
  children: React.ReactNode
  className?: string
}

export const AppShell: React.FC<AppShellProps> & {
  TopBar: typeof TopBar
  Content: typeof Content
  BottomNav: typeof BottomNav
  Sidebar: typeof Sidebar
} = ({ children, className = '' }) => {
  const [viewportHeight, setViewportHeight] = useState(0)
  const [keyboardHeight, setKeyboardHeight] = useState(0)
  const [safeAreas, setSafeAreas] = useState({
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  })
  
  // Detect safe areas from CSS env()
  useEffect(() => {
    const updateSafeAreas = () => {
      const computedStyle = getComputedStyle(document.documentElement)
      setSafeAreas({
        top: parseInt(computedStyle.getPropertyValue('--ds-safe-top') || '0'),
        bottom: parseInt(computedStyle.getPropertyValue('--ds-safe-bottom') || '0'),
        left: parseInt(computedStyle.getPropertyValue('--ds-safe-left') || '0'),
        right: parseInt(computedStyle.getPropertyValue('--ds-safe-right') || '0'),
      })
    }
    
    updateSafeAreas()
    window.addEventListener('resize', updateSafeAreas)
    return () => window.removeEventListener('resize', updateSafeAreas)
  }, [])
  
  // Track viewport height (handles mobile browser UI showing/hiding)
  useEffect(() => {
    const updateHeight = () => {
      if (window.visualViewport) {
        setViewportHeight(window.visualViewport.height)
      } else {
        setViewportHeight(window.innerHeight)
      }
    }
    
    updateHeight()
    
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', updateHeight)
      window.visualViewport.addEventListener('scroll', updateHeight)
      
      return () => {
        window.visualViewport?.removeEventListener('resize', updateHeight)
        window.visualViewport?.removeEventListener('scroll', updateHeight)
      }
    } else {
      window.addEventListener('resize', updateHeight)
      return () => window.removeEventListener('resize', updateHeight)
    }
  }, [])
  
  // Keyboard detection (iOS)
  useEffect(() => {
    const handleFocus = () => {
      if (window.visualViewport) {
        const viewport = window.visualViewport
        const defaultHeight = window.innerHeight
        const currentHeight = viewport.height
        const keyboardHeight = defaultHeight - currentHeight
        setKeyboardHeight(Math.max(0, keyboardHeight))
      }
    }
    
    const handleBlur = () => {
      setKeyboardHeight(0)
    }
    
    window.addEventListener('focusin', handleFocus)
    window.addEventListener('focusout', handleBlur)
    
    return () => {
      window.removeEventListener('focusin', handleFocus)
      window.removeEventListener('focusout', handleBlur)
    }
  }, [])
  
  // Detect which shell components are present
  const childrenArray = React.Children.toArray(children)
  const hasTopBar = childrenArray.some((child) => 
    React.isValidElement(child) && child.type === TopBar
  )
  const hasBottomNav = childrenArray.some((child) => 
    React.isValidElement(child) && child.type === BottomNav
  )
  
  const contextValue: AppShellContextValue = {
    hasTopBar,
    hasBottomNav,
    topBarHeight: 56, // Will be dynamic in future
    bottomNavHeight: 64,
    safeAreaTop: safeAreas.top,
    safeAreaBottom: safeAreas.bottom,
    viewportHeight,
    keyboardHeight,
  }
  
  return (
    <AppShellContext.Provider value={contextValue}>
      <div 
        className={`ds-app-shell ${className}`}
        style={{
          display: 'flex',
          flexDirection: 'column',
          height: 'var(--ds-viewport-height, 100dvh)',
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        {children}
      </div>
    </AppShellContext.Provider>
  )
}

// TopBar Sub-component
const TopBar: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = '',
}) => {
  const { safeAreaTop } = useAppShell()
  
  return (
    <div 
      className={`ds-app-shell__topbar ${className}`}
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 'var(--ds-z-topbar)',
        paddingTop: safeAreaTop,
        backgroundColor: 'var(--ds-topbar-bg-blur)',
        backdropFilter: 'var(--ds-topbar-blur)',
        WebkitBackdropFilter: 'var(--ds-topbar-blur)',
        borderBottom: 'var(--ds-topbar-border)',
      }}
    >
      {children}
    </div>
  )
}

// Content Sub-component
const Content: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = '',
}) => {
  const { keyboardHeight } = useAppShell()
  
  return (
    <div 
      className={`ds-app-shell__content ${className}`}
      style={{
        flex: 1,
        overflow: 'auto',
        WebkitOverflowScrolling: 'touch',
        overscrollBehavior: 'contain',
        paddingBottom: keyboardHeight > 0 ? `${keyboardHeight}px` : undefined,
      }}
    >
      {children}
    </div>
  )
}

// BottomNav Sub-component
const BottomNav: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = '',
}) => {
  const { safeAreaBottom, keyboardHeight } = useAppShell()
  
  // Hide when keyboard is visible
  if (keyboardHeight > 0) return null
  
  return (
    <div 
      className={`ds-app-shell__bottomnav ${className}`}
      style={{
        position: 'sticky',
        bottom: 0,
        zIndex: 'var(--ds-z-bottomnav)',
        paddingBottom: safeAreaBottom,
        backgroundColor: 'var(--ds-bottomnav-bg-blur)',
        backdropFilter: 'var(--ds-bottomnav-blur)',
        WebkitBackdropFilter: 'var(--ds-bottomnav-blur)',
        borderTop: 'var(--ds-bottomnav-border)',
      }}
    >
      {children}
    </div>
  )
}

// Sidebar Sub-component (Desktop)
const Sidebar: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = '',
}) => {
  return (
    <div 
      className={`ds-app-shell__sidebar ${className}`}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        bottom: 0,
        width: 'var(--ds-drawer-width)',
        backgroundColor: 'var(--ds-drawer-bg)',
        borderRight: '1px solid var(--ds-color-border-subtle)',
        overflowY: 'auto',
        display: 'none', // Hidden on mobile by default
      }}
    >
      {children}
    </div>
  )
}

AppShell.TopBar = TopBar
AppShell.Content = Content
AppShell.BottomNav = BottomNav
AppShell.Sidebar = Sidebar
