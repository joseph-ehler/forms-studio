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

  // ACCEPTANCE CRITERIA D: List item with hover scrim for proper theme layering
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
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 'var(--ds-space-3, 12px) var(--ds-space-4, 16px)',
        minBlockSize: '48px',  // WCAG AAA - logical property
        fontSize: '14px',
        lineHeight: '1.5',
        borderRadius: 'var(--ds-radius-md, 6px)',
        textAlign: 'start',
        color: selected ? 'var(--ds-color-primary-text, white)' : 'var(--ds-color-text-primary)',
        cursor: disabled ? 'not-allowed' : 'pointer',
        backgroundColor: selected 
          ? 'var(--ds-color-primary-bg)' 
          : 'transparent',
        opacity: disabled ? 0.5 : 1,
        transition: 'background-color 150ms ease',
      }}
    >
      {/* Hover scrim - overlays on top for proper theme layering */}
      <span
        className="ds-hover-scrim"
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          opacity: isHovered && !disabled ? 1 : 0,
          transition: 'opacity 150ms',
          background: selected 
            ? 'rgba(0, 0, 0, 0.10)'  // Darken selected items on hover
            : 'var(--ds-color-primary-bg-subtle, rgba(0, 0, 0, 0.05))',  // Subtle highlight
          borderRadius: 'inherit',
        }}
        aria-hidden="true"
      />

      {/* Content */}
      <span style={{ position: 'relative', flex: 1 }}>{children}</span>

      {/* Selected checkmark */}
      {selected && (
        <svg
          style={{
            position: 'relative',
            width: '20px',
            height: '20px',
            color: 'currentColor',
            flexShrink: 0,
            marginInlineStart: 'var(--ds-space-2, 8px)',
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
