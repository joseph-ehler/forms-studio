/**
 * PickerSearch
 * 
 * Sticky search bar with:
 * - Debounced input
 * - Clear button
 * - Auto-focus option
 * - Mobile-friendly sizing
 */

import React, { useEffect, useState, useRef } from 'react'
import type { PickerSearchProps } from '../overlay/types'

export const PickerSearch: React.FC<PickerSearchProps> = ({
  value,
  onChange,
  placeholder = 'Search...',
  debounce = 300,
  autoFocus = false,
}) => {
  const [localValue, setLocalValue] = useState(value)
  const inputRef = useRef<HTMLInputElement>(null)
  const timeoutRef = useRef<NodeJS.Timeout>()

  // Auto-focus
  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus()
    }
  }, [autoFocus])

  // Debounced update
  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    timeoutRef.current = setTimeout(() => {
      onChange(localValue)
    }, debounce)

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [localValue, debounce, onChange])

  // Clear handler
  const handleClear = () => {
    setLocalValue('')
    inputRef.current?.focus()
  }

  // ACCEPTANCE CRITERIA C: Search input with proper adornment structure
  return (
    <div 
      className="ds-input-wrap"
      onClick={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
    >
      {/* Search icon - left adornment */}
      <span className="ds-input-adorn-left" aria-hidden="true">
        <svg
          style={{ width: '20px', height: '20px', color: 'var(--ds-color-text-muted)' }}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </span>

      {/* Input with proper padding classes */}
      <input
        ref={inputRef}
        type="search"
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
        onClick={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
        placeholder={placeholder}
        className="ds-input ds-input--sm ds-input--pad-left ds-input--pad-right"
        aria-label="Search"
        autoFocus={autoFocus}
      />

      {/* Clear button - right adornment (clickable) */}
      {localValue && (
        <button
          type="button"
          className="ds-input-adorn-right ds-input-adorn-clickable"
          onClick={(e) => {
            e.stopPropagation()
            handleClear()
          }}
          onMouseDown={(e) => e.stopPropagation()}
          style={{
            color: 'var(--ds-color-text-muted)',
            transition: 'color 150ms',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = 'var(--ds-color-text-secondary)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = 'var(--ds-color-text-muted)';
          }}
          aria-label="Clear search"
        >
          <svg
            style={{ width: '20px', height: '20px' }}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      )}
    </div>
  )
}
