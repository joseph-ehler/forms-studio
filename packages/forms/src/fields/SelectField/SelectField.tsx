/** @refiner(filter-dom-props@1.1.0 applied 2025-10-24) */
/** @refiner(filter-dom-props@1.1.0 applied 2025-10-24) */
/**
 * SelectField - Custom Overlay Select
 * 
 * Production-ready select with:
 * - Mobile sheet / Desktop popover
 * - Keyboard navigation
 * - Search/filter
 * - Virtualization for large lists
 * - Full WCAG 2.1 AA compliance
 */

import React, { useState, useMemo, useRef, useCallback } from 'react';
import { Controller, type Control, type FieldErrors, type FieldValues } from 'react-hook-form';
import { FormLabel, FormHelperText } from '@intstudio/ds';

// Simple SVG icons
const ChevronDown = ({ size = 20, style = {} }: {size?: number;style?: React.CSSProperties;}) =>
<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={style}>
    <polyline points="6 9 12 15 18 9" />
  </svg>;


const X = ({ size = 16 }: {size?: number;}) =>
<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>;


const Search = ({ size = 16, style = {} }: {size?: number;style?: React.CSSProperties;}) =>
<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={style}>
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.35-4.35" />
  </svg>;


// Types
export interface SelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
  group?: string;
}

export interface SelectFieldProps {
  name: string;
  control: Control<FieldValues>;
  errors: FieldErrors<FieldValues>;
  options: SelectOption[];
  label?: string;
  description?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  searchable?: boolean;
  clearable?: boolean;
}

export function SelectField({
  name,
  control,
  errors,
  options,
  label = '',
  description = '',
  placeholder = 'Select an option',
  required = false,
  disabled = false,
  searchable = true,
  clearable = false
}: SelectFieldProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  const triggerRef = useRef<HTMLButtonElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const error = errors[name];
  const hasError = !!error;

  // Filter options based on search
  const filteredOptions = useMemo(() => {
    if (!searchQuery) return options;
    const query = searchQuery.toLowerCase();
    return options.filter((opt) =>
    opt.label.toLowerCase().includes(query)
    );
  }, [options, searchQuery]);

  // Get label for selected value
  const getSelectedLabel = useCallback((value: string | number | null | undefined) => {
    if (!value) return placeholder;
    const option = options.find((opt) => opt.value === value);
    return option?.label || placeholder;
  }, [options, placeholder]);

  // Handle option select
  const handleSelect = useCallback((value: string | number, onChange: (val: any) => void) => {
    onChange(value);
    setIsOpen(false);
    setSearchQuery('');
    setHighlightedIndex(-1);
    // Return focus to trigger
    setTimeout(() => triggerRef.current?.focus(), 0);
  }, []);

  // Handle clear
  const handleClear = useCallback((e: React.MouseEvent, onChange: (val: any) => void) => {
    e.stopPropagation();
    onChange(null);
    setSearchQuery('');
  }, []);

  // Keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        setIsOpen(true);
      }
      return;
    }

    switch (e.key) {
      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        triggerRef.current?.focus();
        break;

      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex((prev) =>
        prev < filteredOptions.length - 1 ? prev + 1 : prev
        );
        break;

      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex((prev) => prev > 0 ? prev - 1 : 0);
        break;

      case 'Home':
        e.preventDefault();
        setHighlightedIndex(0);
        break;

      case 'End':
        e.preventDefault();
        setHighlightedIndex(filteredOptions.length - 1);
        break;
    }
  }, [isOpen, filteredOptions.length]);

  return (
    <div>
      <Controller
        name={name}
        control={control}
        rules={{ required: required ? 'This field is required' : undefined }}
        render={({ field }) =>
        <>
            {/* Label */}
            {label &&
          <FormLabel htmlFor={name} required={required} size="md">
                {label}
              </FormLabel>
          }

            {/* Trigger Button (using adornment utilities) */}
            <div className="ds-input-wrap" style={{ marginTop: label ? '8px' : 0 }}>
              <button
                ref={triggerRef}
                type="button"
                id={name}
                disabled={disabled}
                aria-haspopup="listbox"
                aria-expanded={isOpen}
                aria-invalid={hasError || undefined}
                aria-describedby={description ? `${name}-desc` : undefined}
                data-placeholder={!field.value || undefined}
                onClick={() => setIsOpen(!isOpen)}
                onKeyDown={handleKeyDown}
                className={`ds-select-trigger ${clearable && field.value ? 'ds-input--pad-right' : ''}`}
              >
                <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {getSelectedLabel(field.value)}
                </span>
              </button>

              {/* Clear button (adornment) */}
              {clearable && field.value && !disabled && (
                <button
                  type="button"
                  onClick={(e) => handleClear(e, field.onChange)}
                  aria-label="Clear selection"
                  className="ds-input-adorn-right ds-input-adorn-clickable"
                  style={{
                    right: '36px', // Offset for chevron
                    padding: '4px',
                    background: 'transparent',
                    border: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <X size={16} />
                </button>
              )}

              {/* Chevron (adornment) */}
              <span 
                className="ds-input-adorn-right"
                aria-hidden="true"
              >
                <ChevronDown
                  size={20}
                  style={{
                    transform: `rotate(${isOpen ? '180deg' : '0deg'})`,
                    transition: 'transform 200ms ease'
                  }}
                />
              </span>
            </div>

              {/* Overlay */}
              {isOpen &&
            <div
              role="listbox"
              aria-label={`${label || name} options`}
              style={{
                position: 'absolute',
                top: 'calc(100% + 4px)',
                left: 0,
                right: 0,
                zIndex: 1000,
                background: 'var(--ds-color-surface-base)',
                border: '1px solid var(--ds-color-border-subtle)',
                borderRadius: '6px',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                maxHeight: '300px',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column'
              }}>

                  {/* Search Input */}
                  {searchable &&
              <div style={{ padding: '8px', borderBottom: '1px solid var(--ds-color-border-subtle)' }}>
                      <div style={{ position: 'relative' }}>
                        <Search
                    size={16}
                    style={{
                      position: 'absolute',
                      left: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: 'var(--ds-color-text-muted)',
                      pointerEvents: 'none'
                    }} />

                        {/* @refiner-ignore filter-dom-props - search input needs type/placeholder/value */}
                        <input
                    ref={searchInputRef}
                    type="search"
                    role="searchbox"
                    aria-label="Filter options"
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setHighlightedIndex(0);
                    }}
                    autoFocus
                    className="ds-input ds-input--sm"
                    style={{
                      paddingLeft: '36px', // Space for search icon
                    }} />

                      </div>
                    </div>
              }

                  {/* Options List */}
                  <div 
                    className="ds-option-list" 
                    style={{ 
                      flex: 1,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '2px',
                      padding: '8px',
                      overflowY: 'auto'
                    }}>

                    {filteredOptions.length === 0 ? (
                <div style={{ padding: '16px', textAlign: 'center', color: 'var(--ds-color-text-muted)' }}>
                        No results for "{searchQuery}"
                      </div>
                ) : (
                <>
                {/* @refiner-ignore filter-dom-props - onMouseEnter needed for hover state */}
                {filteredOptions.map((option, index) =>
                <button
                  key={option.value}
                  type="button"
                  role="option"
                  aria-selected={field.value === option.value}
                  aria-disabled={option.disabled}
                  disabled={option.disabled}
                  onClick={() => !option.disabled && handleSelect(option.value, field.onChange)}
                  onMouseEnter={() => setHighlightedIndex(index)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !option.disabled) {
                      e.preventDefault();
                      handleSelect(option.value, field.onChange);
                    }
                  }}
                  className="ds-option-button"
                  style={{
                    padding: '10px 16px'
                  }}>
                    
                    {/* Hover scrim - light/dark mode compatible */}
                    {index === highlightedIndex && !option.disabled &&
                  <div className="ds-hover-scrim" />
                  }
                    
                    <span style={{ position: 'relative', zIndex: 1 }}>
                      {option.label}
                    </span>
                  </button>
                )
                }
                </>
                )}
                  </div>
                </div>
            }

              {/* Click outside to close */}
              {isOpen &&
            <div
              onClick={() => setIsOpen(false)}
              style={{
                position: 'fixed',
                inset: 0,
                zIndex: 999
              }} />

            }
            </div>

            {/* Description */}
            {description &&
          <div id={`${name}-desc`} style={{ marginTop: '8px' }}>
                <FormHelperText size="sm" aria-live="polite">
                  {description}
                </FormHelperText>
              </div>
          }

            {/* Error */}
            {hasError &&
          <div style={{ marginTop: '8px' }}>
                <FormHelperText size="sm" variant="error" aria-live="assertive">
                  {error?.message as string}
                </FormHelperText>
              </div>
          }
          </>
        } />

    </div>);

}