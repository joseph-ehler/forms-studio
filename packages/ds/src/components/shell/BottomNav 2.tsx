/**
 * BottomNav - Native iOS-Style Tab Bar
 * 
 * Features:
 * - Fixed bottom navigation
 * - Safe area padding (iOS notch)
 * - Active state transitions
 * - Badge support
 * - Haptic feedback (when available)
 * - Icon + label layout
 * 
 * Usage:
 *   <BottomNav value="home" onChange={setTab}>
 *     <BottomNav.Item value="home" icon={<Home />} label="Home" />
 *     <BottomNav.Item value="search" icon={<Search />} label="Search" />
 *   </BottomNav>
 */

import React, { createContext, useContext, useState } from 'react'

interface BottomNavContextValue {
  value: string
  onChange: (value: string) => void
}

const BottomNavContext = createContext<BottomNavContextValue>({
  value: '',
  onChange: () => {},
})

interface BottomNavProps {
  value?: string
  onChange?: (value: string) => void
  className?: string
  children: React.ReactNode
}

export const BottomNav: React.FC<BottomNavProps> & {
  Item: typeof BottomNavItem
} = ({
  value: controlledValue,
  onChange,
  className = '',
  children,
}) => {
  const [internalValue, setInternalValue] = useState('')
  
  const value = controlledValue ?? internalValue
  const handleChange = onChange ?? setInternalValue
  
  return (
    <BottomNavContext.Provider value={{ value, onChange: handleChange }}>
      <nav
        className={`ds-bottomnav ${className}`}
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 'var(--ds-z-bottomnav)',
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-around',
          height: 'var(--ds-bottomnav-height)',
          paddingBottom: 'var(--ds-safe-bottom)',
          backgroundColor: 'var(--ds-bottomnav-bg-blur)',
          backdropFilter: 'var(--ds-bottomnav-blur)',
          WebkitBackdropFilter: 'var(--ds-bottomnav-blur)',
          borderTop: 'var(--ds-bottomnav-border)',
        }}
        role="tablist"
      >
        {children}
      </nav>
    </BottomNavContext.Provider>
  )
}

interface BottomNavItemProps {
  value: string
  icon: React.ReactNode
  label: string
  badge?: number | string
  disabled?: boolean
  className?: string
  onClick?: () => void
}

const BottomNavItem: React.FC<BottomNavItemProps> = ({
  value: itemValue,
  icon,
  label,
  badge,
  disabled = false,
  className = '',
  onClick,
}) => {
  const { value, onChange } = useContext(BottomNavContext)
  const isActive = value === itemValue
  
  const handleClick = () => {
    if (disabled) return
    
    // Haptic feedback (if available)
    if ('vibrate' in navigator) {
      navigator.vibrate(10)
    }
    
    onChange(itemValue)
    onClick?.()
  }
  
  return (
    <button
      role="tab"
      aria-selected={isActive}
      aria-label={label}
      disabled={disabled}
      onClick={handleClick}
      className={`ds-bottomnav__item ${className}`}
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 'var(--ds-space-1)',
        minHeight: 'var(--ds-touch-min)',
        padding: 'var(--ds-space-2) var(--ds-space-1)',
        border: 'none',
        background: 'none',
        color: isActive 
          ? 'var(--ds-color-primary-bg)' 
          : 'var(--ds-color-text-muted)',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        transition: 'all 200ms cubic-bezier(0.4, 0, 0.2, 1)',
        position: 'relative',
      }}
    >
      {/* Icon container */}
      <div 
        style={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 'var(--ds-bottomnav-icon-size)',
          height: 'var(--ds-bottomnav-icon-size)',
          transform: isActive ? 'scale(1.1)' : 'scale(1)',
          transition: 'transform 200ms cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        {icon}
        
        {/* Badge */}
        {badge !== undefined && (
          <span
            style={{
              position: 'absolute',
              top: -4,
              right: -6,
              minWidth: 16,
              height: 16,
              padding: '0 4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.625rem',
              fontWeight: 'var(--ds-weight-bold)',
              color: 'var(--ds-color-text-inverted)',
              backgroundColor: 'var(--ds-color-state-danger)',
              borderRadius: 'var(--ds-radius-full)',
              border: '2px solid var(--ds-bottomnav-bg)',
            }}
          >
            {typeof badge === 'number' && badge > 99 ? '99+' : badge}
          </span>
        )}
      </div>
      
      {/* Label */}
      <span
        style={{
          fontSize: 'var(--ds-bottomnav-label-size)',
          fontWeight: isActive ? 'var(--ds-weight-semibold)' : 'var(--ds-weight-regular)',
          lineHeight: 1,
          transition: 'font-weight 200ms',
        }}
      >
        {label}
      </span>
    </button>
  )
}

BottomNav.Item = BottomNavItem
