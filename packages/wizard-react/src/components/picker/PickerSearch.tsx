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

  return (
    <div 
      className="relative"
      onClick={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
    >
        {/* Search icon */}
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <svg
            style={{ width: '20px', height: '20px', color: 'var(--ds-color-text-muted)' }}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>

        {/* Input */}
        <input
          ref={inputRef}
          type="text"
          value={localValue}
          onChange={(e) => setLocalValue(e.target.value)}
          onClick={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
          placeholder={placeholder}
          style={{
            width: '100%',
            paddingLeft: '40px',
            paddingRight: '40px',
            paddingTop: '10px',
            paddingBottom: '10px',
            minHeight: '44px',
            fontSize: '14px',
            color: 'var(--ds-color-text-primary)',
            backgroundColor: 'var(--ds-color-surface-subtle)',
            border: '1px solid var(--ds-color-border-subtle)',
            borderRadius: '8px',
            outline: 'none',
          }}
          onFocus={(e) => {
            e.target.style.borderColor = 'var(--ds-color-border-focus)';
            e.target.style.boxShadow = `0 0 0 3px color-mix(in oklab, var(--ds-color-border-focus), transparent 85%)`;
          }}
          onBlur={(e) => {
            e.target.style.borderColor = 'var(--ds-color-border-subtle)';
            e.target.style.boxShadow = 'none';
          }}
          aria-label="Search"
        />

        {/* Clear button */}
        {localValue && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              handleClear()
            }}
            onMouseDown={(e) => e.stopPropagation()}
            style={{
              position: 'absolute',
              top: 0,
              bottom: 0,
              right: 0,
              display: 'flex',
              alignItems: 'center',
              paddingRight: '12px',
              color: 'var(--ds-color-text-muted)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
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
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
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
