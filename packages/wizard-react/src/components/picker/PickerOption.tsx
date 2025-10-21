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

  return (
    <div
      role="option"
      aria-selected={selected}
      aria-disabled={disabled}
      data-value={value}
      onClick={handleClick}
      onMouseEnter={onMouseEnter}
      className={`
        flex items-center justify-between
        px-3 py-2.5 min-h-[44px]
        text-sm text-gray-900
        cursor-pointer
        transition-colors duration-150
        ${active ? 'bg-blue-50' : ''}
        ${selected ? 'bg-blue-50' : ''}
        ${!selected && !active ? 'hover:bg-gray-50' : ''}
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
      `.trim()}
    >
      {/* Content */}
      <span className="flex-1">{children}</span>

      {/* Selected checkmark */}
      {selected && (
        <svg
          className="h-5 w-5 text-blue-600 flex-shrink-0 ml-2"
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
