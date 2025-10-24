/**
 * SimpleListRecipe
 * 
 * Single-select from a list of options with optional search.
 * 
 * Use Cases:
 * - Small to medium datasets (5-100 options)
 * - Simple single selection
 * - Optional search filtering
 * - Desktop: popover | Mobile: bottom sheet
 * 
 * Spec Example:
 *   type: select
 *   ui:
 *     searchable: true
 *     focusSearchOnOpen: true
 *     inlineThreshold: 4
 */

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { ChevronDown, Search } from 'lucide-react';
import type { Recipe } from './types';
import {
  OverlayHeader,
  OverlayContent,
  OverlayList,
  Option
} from '@intstudio/ds/primitives/overlay';
import { useOverlayKeys, useFocusReturn } from './hooks';

export const SimpleListRecipe: Recipe = (ctx) => {
  const { spec, env } = ctx;
  const {
    label,
    placeholder = 'Select...',
    options = [],
    ui = {}
  } = spec;
  
  const {
    searchable = false,
    focusSearchOnOpen = true,
    inlineThreshold = 4
  } = ui;
  
  // Render inline list if below threshold
  const shouldRenderInline = options.length <= inlineThreshold;
  
  // Shared state
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  
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
  
  // Helper to get selected label
  const getSelectedLabel = (value: string | undefined) => {
    if (!value) return placeholder;
    const selected = options.find(opt => opt.value === value);
    return selected?.label || value;
  };
  
  /* ===== Trigger Component ===== */
  
  const Trigger: React.FC<any> = ({ field, hasError, disabled }) => {
    // Keyboard navigation hook
    const handleKeyDown = useOverlayKeys({
      count: filteredOptions.length,
      activeIndex: highlightedIndex,
      setActiveIndex: setHighlightedIndex,
      onSelect: (index) => {
        const option = filteredOptions[index];
        if (!option.disabled) {
          field.onChange(option.value);
          setIsOpen(false);
          setSearchQuery('');
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
          data-placeholder={!field.value || undefined}
          onClick={() => setIsOpen(!isOpen)}
          onKeyDown={handleKeyDown}
          className="ds-select-trigger"
        >
          <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {getSelectedLabel(field.value)}
          </span>
        </button>
        
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
    // Keyboard navigation hook (same as Trigger)
    const handleKeyDown = useOverlayKeys({
      count: filteredOptions.length,
      activeIndex: highlightedIndex,
      setActiveIndex: setHighlightedIndex,
      onSelect: (index) => {
        const option = filteredOptions[index];
        if (!option.disabled) {
          field.onChange(option.value);
          setIsOpen(false);
          setSearchQuery('');
        }
      },
      onClose: () => {
        setIsOpen(false);
        setSearchQuery('');
      },
      isOpen: open
    });
    
    if (!open) return null;
    
    // TODO: Use OverlayPrimitive/SheetPrimitive based on env.isMobile
    // For now, simple absolute positioning (will upgrade to primitives)
    
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
          style={{
            position: 'absolute',
            top: 'calc(100% + 4px)',
            left: 0,
            right: 0,
            zIndex: 1000,
            background: 'var(--ds-color-surface-base)',
            border: '1px solid var(--ds-color-border-subtle)',
            borderRadius: '8px',
            maxHeight: '320px',
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
                  onKeyDown={handleKeyDown}
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
                {filteredOptions.map((option, index) => (
                  <Option
                    key={option.value}
                    value={option.value}
                    label={option.label}
                    description={option.description}
                    selected={field.value === option.value}
                    disabled={option.disabled}
                    highlighted={index === highlightedIndex}
                    onSelect={(value) => {
                      field.onChange(value);
                      setIsOpen(false);
                      setSearchQuery('');
                      triggerRef.current?.focus();
                    }}
                    onMouseEnter={() => setHighlightedIndex(index)}
                  />
                ))}
              </OverlayList>
            )}
          </OverlayContent>
        </div>
      </>
    );
  };
  
  return { Trigger, Overlay };
};
