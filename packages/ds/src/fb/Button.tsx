/**
 * Button - Production-grade, token-only implementation
 * 
 * God-tier patterns demonstrated:
 * - RGB triplets for alpha (focus rings)
 * - State tokens (hover/active/focus/disabled)
 * - Density tokens
 * - Icon slots with auto-padding
 * - Loading state with spinner
 * - Diagnostics via data-* attributes
 * - Co-located CSS using only DS tokens
 * - Type-safe props
 * - A11y: aria-busy, min touch targets
 */

import './Button.css';
import './Button.dev.css'; // Dev-only force state toggles

import { ButtonHTMLAttributes, CSSProperties, ReactNode, useEffect, useRef } from 'react';
import { twMerge } from 'tailwind-merge';

import { ButtonVariant as ButtonVariantType } from '../control/variants.config';
import { BUTTON_SKIN } from '../registry/skins/button.skin';
import { auditButton } from '../utils/auditButton';
import { applyButtonContracts } from '../utils/contracts/buttonContracts';

// Re-export for backward compatibility
export type { ButtonVariantType as ButtonVariant };

/**
 * SKIN imported from registry - single source of truth
 * Local component consumes; never defines
 */
const SKIN = BUTTON_SKIN;
export type ButtonSize = 'sm' | 'md' | 'lg';

export type ButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> & {
  /**
   * Semantic variant
   * @default 'primary'
   */
  variant?: ButtonVariantType;
  
  /**
   * Size (bound to density tokens)
   * @default 'md'
   */
  size?: ButtonSize;
  
  /**
   * Show loading state with spinner
   * @default false
   */
  loading?: boolean;
  
  /**
   * Text to show when loading
   * @default children
   */
  loadingText?: ReactNode;
  
  /**
   * Icon on the left (padding auto-adjusts)
   */
  iconLeft?: ReactNode;
  
  /**
   * Icon on the right (padding auto-adjusts)
   */
  iconRight?: ReactNode;
  
  /**
   * Button label/content
   */
  children?: ReactNode;
};

/**
 * Button - Automagic, production-unbreakable
 * 
 * Features:
 * - 7 variants (primary, secondary, ghost, success, warning, danger, info)
 * - 3 sizes (sm, md, lg) 
 * - Loading state with spinner
 * - Icon slots (left/right)
 * - All states: hover, active, focus, disabled
 * - A11y: aria-busy, min 44px touch target
 * - Diagnostics: data-component, data-variant, data-size
 * - AUTOMAGIC: Skin variables ensure all states use correct colors
 * 
 * How it works:
 * 1. Component sets --btn-* CSS variables based on variant
 * 2. CSS reads only those local variables (never touches roles directly)
 * 3. Result: Change a role → all buttons update automatically
 * 
 * @example
 * ```tsx
 * <Button variant="primary" onClick={save}>
 *   Save
 * </Button>
 * 
 * <Button 
 *   variant="success"
 *   loading
 *   loadingText="Saving..."
 *   iconLeft={<SaveIcon />}
 * >
 *   Save
 * </Button>
 * ```
 */
export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  loadingText,
  iconLeft,
  iconRight,
  className,
  disabled,
  children,
  style,
  ...rest
}: ButtonProps) {
  // Apply dev-mode contracts (validates variant, skin vars)
  applyButtonContracts({ variant, style: { ...SKIN[variant], ...style } });
  
  // Get skin variables for this variant (never undefined → contract ensures valid variant)
  const skin = SKIN[variant];
  
  // Ref for runtime audit
  const buttonRef = useRef<HTMLButtonElement>(null);
  
  // Run audit on mount and when variant changes (dev-mode only)
  useEffect(() => {
    if (buttonRef.current) {
      auditButton(buttonRef.current);
    }
  }, [variant]);
  
  return (
    <button
      ref={buttonRef}
      data-interactive
      data-component="button"
      data-variant={variant}
      data-size={size}
      data-state={loading ? 'loading' : 'idle'}
      aria-busy={loading || undefined}
      disabled={disabled || loading}
      className={twMerge(className)}
      style={{ ...skin, ...style }} // Skin vars + user overrides
      {...rest}
    >
      {/* Left icon */}
      {iconLeft && !loading && (
        <span className="button-icon" aria-hidden="true">
          {iconLeft}
        </span>
      )}
      
      {/* Loading spinner */}
      {loading && (
        <span className="button-spinner" aria-hidden="true" />
      )}
      
      {/* Content */}
      <span className="button-content">
        {loading && loadingText ? loadingText : children}
      </span>
      
      {/* Right icon */}
      {iconRight && !loading && (
        <span className="button-icon" aria-hidden="true">
          {iconRight}
        </span>
      )}
    </button>
  );
}

// Component-specific types exported above as ButtonVariant and ButtonSize
