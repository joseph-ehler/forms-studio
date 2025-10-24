/**
 * Option Component
 * 
 * Leaf atom for selectable items in overlays.
 * Renders a semantically correct <button role="option"> with proper ARIA.
 * ALL styling handled by .ds-option-button CSS (no inline appearance styles).
 * 
 * Usage:
 *   <Option value="us" label="United States" selected onSelect={...} />
 */

import React from 'react';

export interface OptionProps {
  /** Unique value for this option */
  value: string;
  
  /** Display label (defaults to value if not provided) */
  label?: string;
  
  /** Whether this option is currently selected */
  selected?: boolean;
  
  /** Whether this option is disabled */
  disabled?: boolean;
  
  /** Whether this option is currently highlighted (keyboard navigation) */
  highlighted?: boolean;
  
  /** Icon to display before the label */
  icon?: React.ReactNode;
  
  /** Secondary text below the label */
  description?: string;
  
  /** Callback when option is selected */
  onSelect?: (value: string) => void;
  
  /** Callback when mouse enters (for keyboard nav sync) */
  onMouseEnter?: () => void;
  
  /** Optional className for custom styling */
  className?: string;
  
  /** Optional data attributes for testing/debugging */
  'data-testid'?: string;
}

export const Option: React.FC<OptionProps> = ({
  value,
  label,
  selected = false,
  disabled = false,
  highlighted = false,
  icon,
  description,
  onSelect,
  onMouseEnter,
  className = '',
  'data-testid': dataTestId
}) => {
  const displayLabel = label || value;
  
  return (
    <button
      type="button"
      role="option"
      aria-selected={selected}
      aria-disabled={disabled}
      disabled={disabled}
      onClick={() => !disabled && onSelect?.(value)}
      onMouseEnter={onMouseEnter}
      className={`ds-option-button ${className}`.trim()}
      data-testid={dataTestId}
      data-value={value}
    >
      {/* Hover scrim - CSS handles opacity */}
      {highlighted && !disabled && (
        <div className="ds-hover-scrim" />
      )}
      
      {/* Content wrapper for z-index layering */}
      <span 
        style={{ 
          position: 'relative', 
          zIndex: 1,
          display: 'flex',
          alignItems: description ? 'flex-start' : 'center',
          gap: icon ? 'var(--ds-space-2, 8px)' : undefined,
          width: '100%'
        }}
      >
        {/* Icon */}
        {icon && (
          <span 
            style={{ 
              display: 'inline-flex',
              flexShrink: 0,
              marginTop: description ? '2px' : undefined // Align with first line
            }}
          >
            {icon}
          </span>
        )}
        
        {/* Label + Description */}
        <span style={{ flex: 1, textAlign: 'left' }}>
          <span style={{ display: 'block' }}>
            {displayLabel}
          </span>
          
          {description && (
            <span 
              style={{ 
                display: 'block',
                fontSize: '13px',
                color: 'var(--ds-color-text-muted)',
                marginTop: '2px'
              }}
            >
              {description}
            </span>
          )}
        </span>
      </span>
    </button>
  );
};

/* ===== OptionGroup ===== */

export interface OptionGroupProps {
  label: string;
  children: React.ReactNode;
  collapsible?: boolean;
  defaultExpanded?: boolean;
}

export const OptionGroup: React.FC<OptionGroupProps> = ({
  label,
  children,
  collapsible = false,
  defaultExpanded = true
}) => {
  const [expanded, setExpanded] = React.useState(defaultExpanded);
  
  return (
    <div role="group" aria-labelledby={`group-${label}`}>
      {/* Group header */}
      <div
        id={`group-${label}`}
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 5,
          background: 'var(--ds-color-surface-raised)',
          padding: 'var(--ds-space-2, 8px) var(--ds-space-3, 12px)',
          fontSize: '12px',
          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          color: 'var(--ds-color-text-muted)',
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--ds-space-2, 8px)',
          cursor: collapsible ? 'pointer' : 'default'
        }}
        onClick={() => collapsible && setExpanded(!expanded)}
      >
        {collapsible && (
          <span style={{ 
            transform: expanded ? 'rotate(90deg)' : 'none',
            transition: 'transform 150ms ease'
          }}>
            ▶
          </span>
        )}
        {label}
      </div>
      
      {/* Group options */}
      {expanded && children}
    </div>
  );
};
