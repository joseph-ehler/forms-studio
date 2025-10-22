/**
 * FABSpeedDial - Expandable Speed Dial
 * 
 * Multiple FABs that expand vertically when triggered.
 * Material Design speed dial pattern.
 * 
 * @example
 * <FABSpeedDial
 *   expanded={isOpen}
 *   onToggle={setIsOpen}
 *   mainIcon={isOpen ? "×" : "+"}
 *   mainLabel="Actions"
 *   actions={[
 *     { icon: "⚙️", label: "Settings", onClick: onSettings },
 *     { icon: "❓", label: "Help", onClick: onHelp },
 *     { icon: "📧", label: "Contact", onClick: onContact },
 *   ]}
 * />
 */

import React from 'react'

type FABPosition = 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left'
type FABSize = 'sm' | 'md' | 'lg'

export interface FABSpeedDialAction {
  /** Action icon */
  icon: React.ReactNode
  
  /** Action label (shows on hover) */
  label: string
  
  /** Click handler */
  onClick: () => void
  
  /** Disabled state */
  disabled?: boolean
}

export interface FABSpeedDialProps {
  /** Expanded state */
  expanded: boolean
  
  /** Toggle handler */
  onToggle: () => void
  
  /** Main FAB icon */
  mainIcon: React.ReactNode
  
  /** Main FAB label (for accessibility) */
  mainLabel: string
  
  /** Speed dial actions */
  actions: FABSpeedDialAction[]
  
  /** Position */
  position?: FABPosition
  
  /** Size */
  size?: FABSize
  
  /** Custom className */
  className?: string
}

const SIZE_MAP: Record<FABSize, { main: string; action: string }> = {
  sm: { main: '40px', action: '36px' },
  md: { main: '56px', action: '48px' },
  lg: { main: '64px', action: '56px' },
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

export function FABSpeedDial({
  expanded,
  onToggle,
  mainIcon,
  mainLabel,
  actions,
  position = 'bottom-right',
  size = 'md',
  className = '',
}: FABSpeedDialProps) {
  
  const sizes = SIZE_MAP[size]
  const positionStyles = POSITION_STYLES[position]
  const isBottom = position.startsWith('bottom')
  
  return (
    <div
      className={`ds-fab-speed-dial ${className}`}
      style={{
        position: 'fixed',
        zIndex: 'var(--ds-fab-z-index)',
        display: 'flex',
        flexDirection: isBottom ? 'column-reverse' : 'column',
        alignItems: position.includes('right') ? 'flex-end' : 'flex-start',
        gap: 'var(--ds-fab-item-gap)',
        ...positionStyles,
      }}
    >
      {/* Action items */}
      {expanded && actions.map((action, index) => (
        <div
          key={index}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--ds-fab-label-offset)',
            flexDirection: position.includes('right') ? 'row-reverse' : 'row',
            animation: `ds-fab-slide-in 200ms ease ${index * 50}ms both`,
          }}
        >
          {/* Label tooltip */}
          <div
            style={{
              padding: '6px 12px',
              background: 'var(--ds-color-surface-raised)',
              color: 'var(--ds-color-text-primary)',
              borderRadius: 'var(--ds-radius-sm)',
              fontSize: '14px',
              fontWeight: 500,
              whiteSpace: 'nowrap',
              boxShadow: '0 2px 8px rgb(0 0 0 / 0.1)',
            }}
          >
            {action.label}
          </div>
          
          {/* Action button */}
          <button
            type="button"
            onClick={() => {
              action.onClick()
              onToggle() // Close on action
            }}
            disabled={action.disabled}
            aria-label={action.label}
            style={{
              width: sizes.action,
              height: sizes.action,
              minWidth: sizes.action,
              minHeight: sizes.action,
              borderRadius: '50%',
              padding: 0,
              background: action.disabled 
                ? 'var(--ds-color-surface-subtle)'
                : 'var(--ds-color-surface-raised)',
              color: action.disabled
                ? 'var(--ds-color-text-muted)'
                : 'var(--ds-color-text-primary)',
              border: 'none',
              boxShadow: 'var(--ds-fab-shadow)',
              cursor: action.disabled ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '20px',
              opacity: action.disabled ? 0.5 : 1,
              transition: 'all 150ms ease',
            }}
            onMouseEnter={(e) => {
              if (!action.disabled) {
                e.currentTarget.style.transform = 'scale(1.1)'
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)'
            }}
          >
            {action.icon}
          </button>
        </div>
      ))}
      
      {/* Main FAB */}
      <button
        type="button"
        onClick={onToggle}
        aria-label={mainLabel}
        aria-expanded={expanded}
        style={{
          width: sizes.main,
          height: sizes.main,
          minWidth: sizes.main,
          minHeight: sizes.main,
          borderRadius: '50%',
          padding: 0,
          background: 'var(--ds-color-primary-bg)',
          color: 'var(--ds-color-primary-text)',
          border: 'none',
          boxShadow: 'var(--ds-fab-shadow)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: size === 'sm' ? '20px' : size === 'lg' ? '28px' : '24px',
          transition: 'all 200ms ease',
          transform: expanded ? 'rotate(45deg)' : 'rotate(0deg)',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.boxShadow = 'var(--ds-fab-shadow-hover)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.boxShadow = 'var(--ds-fab-shadow)'
        }}
      >
        {mainIcon}
      </button>
      
      {/* Backdrop overlay */}
      {expanded && (
        <div
          onClick={onToggle}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: -1,
            background: 'transparent',
          }}
          aria-hidden="true"
        />
      )}
    </div>
  )
}

FABSpeedDial.displayName = 'FABSpeedDial'
