/**
 * MultiSelectRecipe
 * 
 * Multi-select with checkboxes and batch actions.
 * 
 * Use Cases:
 * - Multiple selections with checkboxes
 * - Sticky footer with Clear/Apply actions
 * - Selected count indicator
 * - Batch selection (Ctrl+click, Shift+click)
 * 
 * Spec Example:
 *   type: select
 *   ui:
 *     multiple: true
 *     searchable: true
 *     showSelectedCount: true
 */

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { ChevronDown, Search, X } from 'lucide-react';
import type { Recipe } from './types';
import {
  OverlayHeader,
  OverlayContent,
  OverlayFooter,
  OverlayList,
  Option
} from '@intstudio/ds/primitives/overlay';
import { useOverlayKeys, useFocusReturn } from './hooks';

export const MultiSelectRecipe: Recipe = (ctx) => {
  const { spec, env } = ctx;
  const {
    label,
    placeholder = 'Select options...',
    options = [],
    ui = {}
  } = spec;
  
  const {
    searchable = false,
    focusSearchOnOpen = true,
    showSelectedCount = true
  } = ui;
  
  // State
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const [selectedValues, setSelectedValues] = useState<string[]>([]);
  const [lastSelectedIndex, setLastSelectedIndex] = useState<number | null>(null);
  
  const triggerRef = useRef<HTMLButtonElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  
  // Filter options by search query
  const filteredOptions = useMemo(() => {
    if (!searchQuery) return options;
    const query = searchQuery.toLowerCase();
    return options.filter(opt =>
      opt.label.toLowerCase().includes(query) ||
      opt.value.toLowerCase().includes(query)
    );
  }, [options, searchQuery]);
  
  // Reset highlight when filtered list changes
  useEffect(() => {
    setHighlightedIndex(0);
  }, [filteredOptions]);
  
  // Focus search input when overlay opens
  useEffect(() => {
    if (isOpen && searchable && focusSearchOnOpen) {
      searchRef.current?.focus();
    }
  }, [isOpen, searchable, focusSearchOnOpen]);
  
  // Auto-return focus to trigger when overlay closes
  useFocusReturn(triggerRef, isOpen);
  
  // Toggle selection
  const toggleSelection = (value: string, event?: React.MouseEvent) => {
    const index = filteredOptions.findIndex(opt => opt.value === value);
    
    // Shift+click: range selection
    if (event?.shiftKey && lastSelectedIndex !== null) {
      const start = Math.min(lastSelectedIndex, index);
      const end = Math.max(lastSelectedIndex, index);
      const rangeValues = filteredOptions.slice(start, end + 1).map(opt => opt.value);
      
      setSelectedValues(prev => {
        const newSet = new Set(prev);
        rangeValues.forEach(v => newSet.add(v));
        return Array.from(newSet);
      });
    }
    // Ctrl+click or regular click: toggle individual
    else {
      setSelectedValues(prev =>
        prev.includes(value)
          ? prev.filter(v => v !== value)
          : [...prev, value]
      );
    }
    
    setLastSelectedIndex(index);
  };
  
  // Clear all selections
  const handleClear = () => {
    setSelectedValues([]);
    setLastSelectedIndex(null);
  };
  
  // Apply selections and close
  const handleApply = (field: any) => {
    field.onChange(selectedValues);
    setIsOpen(false);
    setSearchQuery('');
  };
  
  // Get trigger label
  const getTriggerLabel = (values: string[] | undefined) => {
    if (!values || values.length === 0) return placeholder;
    if (values.length === 1) {
      const selected = options.find(opt => opt.value === values[0]);
      return selected?.label || values[0];
    }
    return `${values.length} selected`;
  };
  
  /* ===== Trigger Component ===== */
  
  const Trigger: React.FC<any> = ({ field, hasError, disabled }) => {
    // Sync internal state with field value on mount
    useEffect(() => {
      if (field.value && Array.isArray(field.value)) {
        setSelectedValues(field.value);
      }
    }, [field.value]);
    
    // Keyboard navigation hook (for multi-select, Enter toggles)
    const handleKeyDown = useOverlayKeys({
      count: filteredOptions.length,
      activeIndex: highlightedIndex,
      setActiveIndex: setHighlightedIndex,
      onSelect: (index) => {
        const option = filteredOptions[index];
        if (!option.disabled) {
          toggleSelection(option.value);
        }
      },
      onClose: () => {
        setIsOpen(false);
        setSearchQuery('');
      },
      isOpen
    });
    
    return (
      <div className="ds-input-wrap">
        <button
          ref={triggerRef}
          type="button"
          id={spec.name}
          disabled={disabled}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          aria-invalid={hasError || undefined}
          data-placeholder={!field.value || field.value.length === 0 || undefined}
          onClick={() => setIsOpen(!isOpen)}
          onKeyDown={handleKeyDown}
          className="ds-select-trigger"
        >
          <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {getTriggerLabel(field.value)}
          </span>
        </button>
        
        {/* Clear button (when has selections) */}
        {field.value && field.value.length > 0 && !disabled && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              field.onChange([]);
              setSelectedValues([]);
            }}
            aria-label="Clear selections"
            className="ds-input-adorn-right ds-input-adorn-clickable"
            style={{
              right: '36px', // Offset for chevron
              padding: '4px',
              background: 'transparent',
              border: 'none'
            }}
          >
            <X size={16} />
          </button>
        )}
        
        {/* Chevron adornment */}
        <span className="ds-input-adorn-right" aria-hidden="true">
          <ChevronDown
            size={20}
            style={{
              transform: `rotate(${isOpen ? '180deg' : '0deg'})`,
              transition: 'transform 200ms ease'
            }}
          />
        </span>
      </div>
    );
  };
  
  /* ===== Overlay Component ===== */
  
  const Overlay: React.FC<any> = ({ open, onClose, field }) => {
    if (!open) return null;
    
    // TODO: Use OverlayPrimitive/SheetPrimitive based on env.isMobile
    // For now, simple absolute positioning
    
    return (
      <>
        {/* Backdrop */}
        <div
          onClick={onClose}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 999
          }}
        />
        
        {/* Overlay content */}
        <div
          role="listbox"
          aria-label={`${label || spec.name} options`}
          aria-multiselectable="true"
          style={{
            position: 'absolute',
            top: 'calc(100% + 4px)',
            left: 0,
            right: 0,
            zIndex: 1000,
            background: 'var(--ds-color-surface-base)',
            border: '1px solid var(--ds-color-border-subtle)',
            borderRadius: '8px',
            maxHeight: '400px',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
          }}
        >
          {/* Search header */}
          {searchable && (
            <OverlayHeader>
              <div className="ds-input-wrap">
                <input
                  ref={searchRef}
                  type="search"
                  className="ds-input ds-input--sm ds-input--pad-left"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => handleKeyDown(e, field)}
                />
                <span className="ds-input-adorn-left" aria-hidden="true">
                  <Search size={16} />
                </span>
              </div>
            </OverlayHeader>
          )}
          
          {/* Options list */}
          <OverlayContent>
            {filteredOptions.length === 0 ? (
              <div style={{ padding: '16px', textAlign: 'center', color: 'var(--ds-color-text-muted)' }}>
                No results for "{searchQuery}"
              </div>
            ) : (
              <OverlayList>
                {filteredOptions.map((option, index) => {
                  const isSelected = selectedValues.includes(option.value);
                  
                  return (
                    <div
                      key={option.value}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '8px 12px',
                        cursor: option.disabled ? 'not-allowed' : 'pointer',
                        opacity: option.disabled ? 0.5 : 1,
                        background: index === highlightedIndex ? 'var(--ds-color-primary-bg-subtle)' : 'transparent',
                        borderRadius: '6px'
                      }}
                      onClick={(e) => !option.disabled && toggleSelection(option.value, e)}
                      onMouseEnter={() => setHighlightedIndex(index)}
                    >
                      {/* Checkbox */}
                      <input
                        type="checkbox"
                        checked={isSelected}
                        disabled={option.disabled}
                        onChange={() => {}} // Handled by parent click
                        style={{ margin: 0 }}
                        aria-label={`Select ${option.label}`}
                      />
                      
                      {/* Label */}
                      <span style={{ flex: 1 }}>
                        {option.label}
                        {option.description && (
                          <span style={{ display: 'block', fontSize: '13px', color: 'var(--ds-color-text-muted)' }}>
                            {option.description}
                          </span>
                        )}
                      </span>
                    </div>
                  );
                })}
              </OverlayList>
            )}
            
            {/* Live region for screen readers */}
            <div
              role="status"
              aria-live="polite"
              aria-atomic="true"
              style={{
                position: 'absolute',
                left: '-10000px',
                width: '1px',
                height: '1px',
                overflow: 'hidden'
              }}
            >
              {selectedValues.length} items selected. {filteredOptions.length} results available.
            </div>
          </OverlayContent>
          
          {/* Footer with actions */}
          <OverlayFooter>
            {/* Selected count */}
            {showSelectedCount && (
              <span style={{ fontSize: '13px', color: 'var(--ds-color-text-muted)' }}>
                {selectedValues.length} selected
              </span>
            )}
            
            {/* Spacer */}
            <div style={{ flex: 1 }} />
            
            {/* Clear button */}
            <button
              type="button"
              onClick={handleClear}
              disabled={selectedValues.length === 0}
              style={{
                padding: '6px 12px',
                background: 'transparent',
                border: '1px solid var(--ds-color-border-subtle)',
                borderRadius: '4px',
                cursor: selectedValues.length === 0 ? 'not-allowed' : 'pointer',
                opacity: selectedValues.length === 0 ? 0.5 : 1
              }}
            >
              Clear
            </button>
            
            {/* Apply button */}
            <button
              type="button"
              onClick={() => handleApply(field)}
              style={{
                padding: '6px 12px',
                background: 'var(--ds-color-primary-bg)',
                color: 'var(--ds-color-primary-text)',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Apply
            </button>
          </OverlayFooter>
        </div>
      </>
    );
  };
  
  return { Trigger, Overlay };
};
