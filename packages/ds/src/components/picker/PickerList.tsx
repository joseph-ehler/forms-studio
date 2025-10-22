/**
 * PickerList
 * 
 * Container for picker options with:
 * - Proper listbox ARIA semantics
 * - Keyboard navigation support
 * - Optional virtualization for large lists
 */

import React from 'react'
import type { PickerListProps } from '../overlay/types'

export const PickerList: React.FC<PickerListProps> = ({
  role = 'listbox',
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledBy,
  'aria-multiselectable': ariaMultiselectable,
  children,
  virtualizeAfter,
  onKeyDown,
}) => {
  // TODO: Add virtualization when list length > virtualizeAfter
  // For now, render all items

  return (
    <div
      role={role}
      aria-label={ariaLabel}
      aria-labelledby={ariaLabelledBy}
      aria-multiselectable={ariaMultiselectable}
      onKeyDown={onKeyDown}
      className="py-1"
    >
      {children}
    </div>
  )
}
