/**
 * FAB - Floating Action Button
 * 
 * Fixed-position button for primary actions.
 * Integrates with Button primitive + Overlay for menus.
 * 
 * @example
 * // Simple FAB
 * <FAB onClick={() => alert('Clicked!')}>
 *   +
 * </FAB>
 * 
 * @example
 * // With menu
 * <FAB 
 *   expanded={isOpen}
 *   onToggle={setIsOpen}
 *   menu={
 *     <FABMenu>
 *       <FABItem onClick={...}>Settings</FABItem>
 *       <FABItem onClick={...}>Help</FABItem>
 *     </FABMenu>
 *   }
 * >
 *   ⚙️
 * </FAB>
 */

import React from 'react'
import { Button } from './Button'

type FABSize = 'sm' | 'md' | 'lg'
type FABPosition = 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left'

export interface FABProps {
  /** Button content (icon or text) */
  children: React.ReactNode
  
  /** Size preset */
  size?: FABSize
  
  /** Position on screen */
  position?: FABPosition
  
  /** Click handler (for simple actions) */
  onClick?: () => void
  
  /** Expanded state (for menu/speed dial) */
  expanded?: boolean
  
  /** Toggle expanded state */
  onToggle?: () => void
  
  /** Menu content (rendered when expanded) */
  menu?: React.ReactNode
  
  /** ARIA label (required for accessibility) */
  ariaLabel: string
  
  /** Custom className */
  className?: string
  
  /** Custom styles */
  style?: React.CSSProperties
}

const SIZE_MAP: Record<FABSize, string> = {
  sm: 'var(--ds-fab-size-sm)',
  md: 'var(--ds-fab-size-md)',
  lg: 'var(--ds-fab-size-lg)',
}

const POSITION_STYLES: Record<FABPosition, React.CSSProperties> = {
  'bottom-right': {
    bottom: 'var(--ds-fab-safe-bottom)',
    right: 'var(--ds-fab-safe-right)',
  },
  'bottom-left': {
    bottom: 'var(--ds-fab-safe-bottom)',
    left: 'var(--ds-fab-safe-left)',
  },
  'top-right': {
    top: 'var(--ds-fab-offset-y)',
    right: 'var(--ds-fab-safe-right)',
  },
  'top-left': {
    top: 'var(--ds-fab-offset-y)',
    left: 'var(--ds-fab-safe-left)',
  },
}

export function FAB({
  children,
  size = 'md',
  position = 'bottom-right',
  onClick,
  expanded = false,
  onToggle,
  menu,
  ariaLabel,
  className = '',
  style,
}: FABProps) {
  
  const handleClick = () => {
    if (onToggle) {
      onToggle()
    } else if (onClick) {
      onClick()
    }
  }
  
  const fabSize = SIZE_MAP[size]
  const positionStyles = POSITION_STYLES[position]
  
  const containerStyles: React.CSSProperties = {
    position: 'fixed',
    zIndex: 'var(--ds-fab-z-index)',
    ...positionStyles,
    ...style,
  }
  
  const buttonStyles: React.CSSProperties = {
    width: fabSize,
    height: fabSize,
    minWidth: fabSize,
    minHeight: fabSize,
    borderRadius: '50%',
    padding: 0,
    boxShadow: 'var(--ds-fab-shadow)',
    transition: 'var(--ds-fab-transition)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: size === 'sm' ? '20px' : size === 'lg' ? '28px' : '24px',
  }
  
  return (
    <>
      <div 
        className={`ds-fab ds-fab--${position} ${className}`}
        style={containerStyles}
      >
        <button
          type="button"
          onClick={handleClick}
          aria-label={ariaLabel}
          aria-expanded={expanded}
          aria-haspopup={menu ? 'menu' : undefined}
          style={{
            ...buttonStyles,
            background: 'var(--ds-color-primary-bg)',
            color: 'var(--ds-color-primary-text)',
            border: 'none',
            cursor: 'pointer',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.boxShadow = 'var(--ds-fab-shadow-hover)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.boxShadow = 'var(--ds-fab-shadow)'
          }}
          onMouseDown={(e) => {
            e.currentTarget.style.transform = 'scale(var(--ds-fab-scale-active))'
          }}
          onMouseUp={(e) => {
            e.currentTarget.style.transform = 'scale(1)'
          }}
        >
          {children}
        </button>
      </div>
      
      {/* Menu overlay */}
      {menu && expanded && (
        <div
          style={{
            position: 'fixed',
            zIndex: 'var(--ds-fab-menu-z-index)',
            ...getMenuPosition(position),
          }}
        >
          {menu}
        </div>
      )}
    </>
  )
}

FAB.displayName = 'FAB'

/**
 * Calculate menu position relative to FAB
 */
function getMenuPosition(fabPosition: FABPosition): React.CSSProperties {
  switch (fabPosition) {
    case 'bottom-right':
      return {
        bottom: 'calc(var(--ds-fab-safe-bottom) + var(--ds-fab-size-md) + var(--ds-fab-item-gap))',
        right: 'var(--ds-fab-safe-right)',
      }
    case 'bottom-left':
      return {
        bottom: 'calc(var(--ds-fab-safe-bottom) + var(--ds-fab-size-md) + var(--ds-fab-item-gap))',
        left: 'var(--ds-fab-safe-left)',
      }
    case 'top-right':
      return {
        top: 'calc(var(--ds-fab-offset-y) + var(--ds-fab-size-md) + var(--ds-fab-item-gap))',
        right: 'var(--ds-fab-safe-right)',
      }
    case 'top-left':
      return {
        top: 'calc(var(--ds-fab-offset-y) + var(--ds-fab-size-md) + var(--ds-fab-item-gap))',
        left: 'var(--ds-fab-safe-left)',
      }
  }
}
