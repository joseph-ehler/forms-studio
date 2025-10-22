/**
 * TopBar - Native iOS-Style Header
 * 
 * Features:
 * - Blur background (iOS-like)
 * - Title transitions on scroll
 * - Back button with gesture
 * - Action buttons
 * - Search integration
 * - Elevation on scroll
 * 
 * Usage:
 *   <TopBar title="Dashboard" />
 *   <TopBar 
 *     title="Settings"
 *     leftAction={<TopBar.BackButton />}
 *     rightAction={<TopBar.IconButton icon={<Settings />} />}
 *   />
 */

import React, { useState, useEffect } from 'react'

interface TopBarProps {
  title?: string
  subtitle?: string
  leftAction?: React.ReactNode
  rightAction?: React.ReactNode
  actions?: React.ReactNode[]
  transparent?: boolean
  sticky?: boolean
  showTitleOnScroll?: number // Show title after scrolling X pixels
  className?: string
  onBack?: () => void
}

export const TopBar: React.FC<TopBarProps> & {
  BackButton: typeof BackButton
  IconButton: typeof IconButton
  SearchButton: typeof SearchButton
} = ({
  title,
  subtitle,
  leftAction,
  rightAction,
  actions,
  transparent = false,
  sticky = true,
  showTitleOnScroll = 0,
  className = '',
  onBack,
}) => {
  const [scrollY, setScrollY] = useState(0)
  const [isScrolled, setIsScrolled] = useState(false)
  
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY
      setScrollY(currentScrollY)
      setIsScrolled(currentScrollY > 10)
    }
    
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])
  
  const showTitle = showTitleOnScroll === 0 || scrollY >= showTitleOnScroll
  const hasElevation = isScrolled && !transparent
  
  return (
    <header
      className={`ds-topbar ${className}`}
      style={{
        position: sticky ? 'sticky' : 'relative',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 'var(--ds-z-topbar)',
        height: 'var(--ds-topbar-height-mobile)',
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--ds-space-3)',
        padding: '0 var(--ds-space-4)',
        paddingTop: 'var(--ds-safe-top)',
        backgroundColor: transparent && !isScrolled 
          ? 'transparent' 
          : 'var(--ds-topbar-bg-blur)',
        backdropFilter: !transparent || isScrolled ? 'var(--ds-topbar-blur)' : 'none',
        WebkitBackdropFilter: !transparent || isScrolled ? 'var(--ds-topbar-blur)' : 'none',
        borderBottom: hasElevation ? 'var(--ds-topbar-border)' : 'none',
        transition: 'all 200ms cubic-bezier(0.4, 0, 0.2, 1)',
      }}
    >
      {/* Left action (back button, menu, etc.) */}
      {leftAction && (
        <div className="ds-topbar__left" style={{ display: 'flex', alignItems: 'center' }}>
          {leftAction}
        </div>
      )}
      
      {/* Title area */}
      <div 
        className="ds-topbar__title"
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          minWidth: 0, // Allow text truncation
          opacity: showTitle ? 1 : 0,
          transform: showTitle ? 'translateY(0)' : 'translateY(-8px)',
          transition: 'opacity 200ms, transform 200ms',
        }}
      >
        {title && (
          <h1 
            style={{
              margin: 0,
              fontSize: 'var(--ds-topbar-title-size)',
              fontWeight: 'var(--ds-topbar-title-weight)',
              color: 'var(--ds-color-text-primary)',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {title}
          </h1>
        )}
        {subtitle && (
          <p
            style={{
              margin: 0,
              fontSize: '0.75rem',
              color: 'var(--ds-color-text-secondary)',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {subtitle}
          </p>
        )}
      </div>
      
      {/* Right actions */}
      {(rightAction || actions) && (
        <div 
          className="ds-topbar__right"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--ds-space-2)',
          }}
        >
          {actions?.map((action, i) => (
            <div key={i}>{action}</div>
          ))}
          {rightAction}
        </div>
      )}
    </header>
  )
}

// BackButton Sub-component
const BackButton: React.FC<{ 
  onClick?: () => void
  label?: string
  className?: string 
}> = ({
  onClick,
  label = 'Back',
  className = '',
}) => {
  const handleClick = () => {
    if (onClick) {
      onClick()
    } else {
      window.history.back()
    }
  }
  
  return (
    <button
      onClick={handleClick}
      className={`ds-topbar__back ${className}`}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--ds-space-1)',
        padding: 'var(--ds-space-2)',
        margin: `calc(-1 * var(--ds-space-2))`,
        minHeight: 'var(--ds-touch-min)',
        border: 'none',
        background: 'none',
        color: 'var(--ds-color-primary-bg)',
        fontSize: '1rem',
        fontWeight: 'var(--ds-weight-regular)',
        cursor: 'pointer',
        transition: 'opacity 150ms',
      }}
      onMouseEnter={(e) => e.currentTarget.style.opacity = '0.7'}
      onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
    >
      {/* Chevron left icon */}
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path 
          d="M12.5 5L7.5 10L12.5 15" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        />
      </svg>
      <span>{label}</span>
    </button>
  )
}

// IconButton Sub-component
const IconButton: React.FC<{ 
  icon: React.ReactNode
  onClick?: () => void
  label?: string
  className?: string 
}> = ({
  icon,
  onClick,
  label,
  className = '',
}) => {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      className={`ds-topbar__icon-btn ${className}`}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 'var(--ds-touch-min)',
        minWidth: 'var(--ds-touch-min)',
        padding: 'var(--ds-space-2)',
        border: 'none',
        background: 'none',
        color: 'var(--ds-color-text-primary)',
        cursor: 'pointer',
        borderRadius: 'var(--ds-radius-md)',
        transition: 'background-color 150ms',
      }}
      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--ds-color-surface-subtle)'}
      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
    >
      {icon}
    </button>
  )
}

// SearchButton Sub-component
const SearchButton: React.FC<{ 
  onClick?: () => void
  placeholder?: string
  className?: string 
}> = ({
  onClick,
  placeholder = 'Search',
  className = '',
}) => {
  return (
    <button
      onClick={onClick}
      className={`ds-topbar__search ${className}`}
      style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--ds-space-2)',
        minHeight: 'var(--ds-touch-comfortable)',
        padding: '0 var(--ds-space-3)',
        border: 'none',
        borderRadius: 'var(--ds-radius-lg)',
        backgroundColor: 'var(--ds-color-surface-subtle)',
        color: 'var(--ds-color-text-muted)',
        fontSize: '1rem',
        cursor: 'pointer',
        transition: 'background-color 150ms',
      }}
      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--ds-color-surface-raised)'}
      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--ds-color-surface-subtle)'}
    >
      {/* Search icon */}
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <circle cx="8.5" cy="8.5" r="5.5" stroke="currentColor" strokeWidth="1.5" />
        <path d="M12.5 12.5L16 16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
      <span>{placeholder}</span>
    </button>
  )
}

TopBar.BackButton = BackButton
TopBar.IconButton = IconButton
TopBar.SearchButton = SearchButton
