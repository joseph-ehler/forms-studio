/**
 * PickerFooter
 * 
 * Reusable footer for all picker components (Date, Select, etc.)
 * Provides consistent Clear/Done button layout and behavior
 */

import React from 'react'

export interface PickerFooterProps {
  /** Called when Clear button is clicked - should clear the field value */
  onClear: () => void
  /** Called when Done button is clicked - should close the overlay */
  onDone: () => void
  /** Label for Clear button (default: "Clear") */
  clearLabel?: string
  /** Label for Done button (default: "Done") */
  doneLabel?: string
  /** Size variant - affects button height and text size */
  size?: 'default' | 'small'
}

export const PickerFooter: React.FC<PickerFooterProps> = ({
  onClear,
  onDone,
  clearLabel = 'Clear',
  doneLabel = 'Done',
  size = 'default',
}) => {
  const buttonBaseClass = size === 'small'
    ? 'px-4 py-2 text-sm'
    : 'flex-1 min-h-[48px] px-4 text-base'

  const clearButtonClass = `${buttonBaseClass} transition-colors`
  const doneButtonClass = `ds-button ${buttonBaseClass} font-medium`

  const containerClass = size === 'small'
    ? 'flex justify-end gap-2'
    : 'flex gap-3'

  return (
    <div className={containerClass}>
        <button
          type="button"
          onClick={onClear}
          className={clearButtonClass}
          style={{
            borderRadius: size === 'small' ? 'var(--ds-radius-md, 6px)' : 'var(--ds-radius-md, 8px)',
            color: 'var(--ds-color-text-primary)',
            backgroundColor: 'transparent'
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--ds-color-surface-subtle)'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
        >
          {clearLabel}
        </button>
        <button
          type="button"
          onClick={onDone}
          className={doneButtonClass}
        >
          {doneLabel}
        </button>
    </div>
  )
}
