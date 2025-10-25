/**
 * Input Template - Skin Variables Pattern
 * 
 * This is a TEMPLATE showing how to apply the automagic skin variable
 * pattern to Input (and other interactive components).
 * 
 * Copy this pattern when building Input, Select, Checkbox, etc.
 */

import { CSSProperties,InputHTMLAttributes } from 'react';

export type InputVariant = 'default' | 'success' | 'warning' | 'danger' | 'info';

/**
 * SKIN MAPPING: Single source of truth for input colors
 * Same pattern as Button - maps variant → CSS variables
 */
const SKIN: Record<InputVariant, CSSProperties> = {
  default: {
    ['--input-fg' as any]: 'var(--ds-role-text)',
    ['--input-bg' as any]: 'var(--ds-role-surface)',
    ['--input-border' as any]: 'var(--ds-role-border)',
    ['--input-hover-border' as any]: 'var(--ds-neutral-8)',
    ['--input-focus-ring' as any]: 'var(--ds-state-focus-ring)',
    ['--input-placeholder' as any]: 'var(--ds-neutral-8)',
  },
  success: {
    ['--input-fg' as any]: 'var(--ds-role-text)',
    ['--input-bg' as any]: 'var(--ds-role-surface)',
    ['--input-border' as any]: 'var(--ds-success-8)',
    ['--input-hover-border' as any]: 'var(--ds-success-9)',
    ['--input-focus-ring' as any]: 'color-mix(in oklab, var(--ds-role-success-bg) 40%, transparent)',
    ['--input-placeholder' as any]: 'var(--ds-neutral-8)',
  },
  warning: {
    ['--input-fg' as any]: 'var(--ds-role-text)',
    ['--input-bg' as any]: 'var(--ds-role-surface)',
    ['--input-border' as any]: 'var(--ds-warning-8)',
    ['--input-hover-border' as any]: 'var(--ds-warning-9)',
    ['--input-focus-ring' as any]: 'color-mix(in oklab, var(--ds-role-warning-bg) 40%, transparent)',
    ['--input-placeholder' as any]: 'var(--ds-neutral-8)',
  },
  danger: {
    ['--input-fg' as any]: 'var(--ds-role-text)',
    ['--input-bg' as any]: 'var(--ds-role-surface)',
    ['--input-border' as any]: 'var(--ds-danger-8)',
    ['--input-hover-border' as any]: 'var(--ds-danger-9)',
    ['--input-focus-ring' as any]: 'color-mix(in oklab, var(--ds-role-danger-bg) 40%, transparent)',
    ['--input-placeholder' as any]: 'var(--ds-neutral-8)',
  },
  info: {
    ['--input-fg' as any]: 'var(--ds-role-text)',
    ['--input-bg' as any]: 'var(--ds-role-surface)',
    ['--input-border' as any]: 'var(--ds-info-8)',
    ['--input-hover-border' as any]: 'var(--ds-info-9)',
    ['--input-focus-ring' as any]: 'color-mix(in oklab, var(--ds-role-info-bg) 40%, transparent)',
    ['--input-placeholder' as any]: 'var(--ds-neutral-8)',
  },
};

export type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  variant?: InputVariant;
};

/**
 * Input component (template)
 * 
 * Follow the same pattern:
 * 1. SKIN map sets --input-* vars
 * 2. CSS reads only those vars
 * 3. Contracts validate completeness
 * 4. Matrix tests verify all states
 */
export function Input({
  variant = 'default',
  className,
  style,
  ...rest
}: InputProps) {
  // Apply contracts (same as Button)
  // applyInputContracts({ variant, style: { ...SKIN[variant], ...style } });
  
  const skin = SKIN[variant];
  
  return (
    <input
      data-component="input"
      data-variant={variant}
      className={className}
      style={{ ...skin, ...style }}
      {...rest}
    />
  );
}

/* ============================================
   Input.css (companion stylesheet)
   ============================================

@layer ds-interactions {
  :where([data-component="input"]) {
    color: var(--input-fg);
    background: var(--input-bg);
    border: 1px solid var(--input-border);
    border-radius: var(--ds-radius-control);
    padding-inline: var(--ds-space-3);
    padding-block: var(--ds-space-2);
    font-family: var(--ds-font-sans);
    font-size: var(--ds-text-sm);
    transition: 
      border-color var(--ds-transition-fast),
      box-shadow var(--ds-transition-fast);
  }

  :where([data-component="input"]:hover) {
    border-color: var(--input-hover-border, var(--input-border));
  }

  :where([data-component="input"]:focus-visible) {
    outline: none;
    box-shadow:
      0 0 0 var(--ds-focus-offset) var(--ds-role-bg),
      0 0 0 calc(var(--ds-focus-offset) + var(--ds-focus-ring)) var(--input-focus-ring);
  }

  :where([data-component="input"]::placeholder) {
    color: var(--input-placeholder);
    opacity: 0.6;
  }

  :where([data-component="input"][aria-invalid="true"]) {
    border-color: var(--ds-role-danger-hover);
  }

  :where([data-component="input"]:disabled) {
    opacity: var(--ds-disabled-opacity, 0.5);
    cursor: not-allowed;
    pointer-events: none;
  }
}

============================================ */
