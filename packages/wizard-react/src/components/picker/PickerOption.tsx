/**
 * PickerOption
 * 
 * Individual selectable item with:
 * - Selection state (checkmark)
 * - Active/hover state
 * - Disabled state
 * - Proper ARIA
 */

import React from 'react'
import type { PickerOptionProps } from '../overlay/types'

export const PickerOption: React.FC<PickerOptionProps> = ({
  value,
  selected = false,
  disabled = false,
  active = false,
  children,
  onClick,
  onMouseEnter,
}) => {
  const handleClick = () => {
    if (!disabled && onClick) {
      onClick()
    }
  }

  const [isHovered, setIsHovered] = React.useState(false);

  return (
    <div
      role="option"
      aria-selected={selected}
      aria-disabled={disabled}
      data-value={value}
      onClick={handleClick}
      onMouseEnter={(e) => {
        setIsHovered(true);
        onMouseEnter?.();
      }}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '10px 12px',
        minHeight: '44px',
        fontSize: '14px',
        color: 'var(--ds-color-text-primary)',
        cursor: disabled ? 'not-allowed' : 'pointer',
        transition: 'all 150ms ease',
        backgroundColor:
          selected || active
            ? 'color-mix(in oklab, var(--ds-color-primary-bg), transparent 90%)'
            : isHovered && !disabled
            ? 'var(--ds-color-surface-subtle)'
            : 'transparent',
        opacity: disabled ? 0.5 : 1,
      }}
    >
      {/* Content */}
      <span className="flex-1">{children}</span>

      {/* Selected checkmark */}
      {selected && (
        <svg
          style={{
            width: '20px',
            height: '20px',
            color: 'var(--ds-color-primary-bg)',
            flexShrink: 0,
            marginLeft: '8px',
          }}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 13l4 4L19 7"
          />
        </svg>
      )}
    </div>
  )
}
