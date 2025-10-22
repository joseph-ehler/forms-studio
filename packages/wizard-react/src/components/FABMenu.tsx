/**
 * FABMenu & FABItem - Menu System for FAB
 * 
 * Provides expandable menu for FAB with individual action items.
 * 
 * @example
 * <FABMenu>
 *   <FABItem onClick={onSettings} icon="⚙️">
 *     Settings
 *   </FABItem>
 *   <FABItem onClick={onHelp} icon="❓">
 *     Help
 *   </FABItem>
 * </FABMenu>
 */

import React from 'react'
import { Stack } from './Stack'
import { Card } from './Card'

export interface FABMenuProps {
  /** Menu items */
  children: React.ReactNode
  
  /** Custom className */
  className?: string
}

export interface FABItemProps {
  /** Item content (label) */
  children: React.ReactNode
  
  /** Icon (emoji or component) */
  icon?: React.ReactNode
  
  /** Click handler */
  onClick: () => void
  
  /** Disabled state */
  disabled?: boolean
  
  /** Custom className */
  className?: string
}

/**
 * FABMenu - Container for FAB menu items
 */
export function FABMenu({ children, className = '' }: FABMenuProps) {
  return (
    <Card
      padding="sm"
      className={`ds-fab-menu ${className}`}
      style={{
        minWidth: '200px',
        boxShadow: '0 8px 24px rgb(0 0 0 / 0.15)',
      }}
    >
      <Stack spacing="tight">
        {children}
      </Stack>
    </Card>
  )
}

FABMenu.displayName = 'FABMenu'

/**
 * FABItem - Individual menu item
 */
export function FABItem({
  children,
  icon,
  onClick,
  disabled = false,
  className = '',
}: FABItemProps) {
  
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`ds-fab-item ${className}`}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--ds-space-3)',
        width: '100%',
        height: 'var(--ds-fab-item-height)',
        padding: '0 var(--ds-space-4)',
        background: disabled 
          ? 'var(--ds-color-surface-subtle)'
          : 'transparent',
        color: disabled
          ? 'var(--ds-color-text-muted)'
          : 'var(--ds-color-text-primary)',
        border: 'none',
        borderRadius: 'var(--ds-radius-md)',
        fontSize: '14px',
        fontWeight: 500,
        textAlign: 'left',
        cursor: disabled ? 'not-allowed' : 'pointer',
        transition: 'background 150ms ease',
        opacity: disabled ? 0.5 : 1,
      }}
      onMouseEnter={(e) => {
        if (!disabled) {
          e.currentTarget.style.background = 'var(--ds-color-surface-subtle)'
        }
      }}
      onMouseLeave={(e) => {
        if (!disabled) {
          e.currentTarget.style.background = 'transparent'
        }
      }}
    >
      {icon && (
        <span style={{ fontSize: '20px', lineHeight: 1 }}>
          {icon}
        </span>
      )}
      <span>{children}</span>
    </button>
  )
}

FABItem.displayName = 'FABItem'
