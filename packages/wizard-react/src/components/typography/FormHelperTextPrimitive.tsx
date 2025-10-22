/**
 * FormHelperText Primitive - Typography Root Primitive
 * 
 * Single source of truth for all helper/hint/error text.
 * Auto-wires size from TypographyProvider.
 * Fields NEVER manually style helper text - always use this.
 */

import React from 'react';
import { useTypography } from './TypographyProvider';
import type { LabelSize } from '../../tokens/typography';
import '../ds-typography.css';

export type HelperVariant = 'hint' | 'error' | 'success' | 'warning';

export interface FormHelperTextProps {
  /** Helper text content */
  children: React.ReactNode;
  /** Visual variant */
  variant?: HelperVariant;
  /** Override default size from context */
  size?: LabelSize;
  /** Additional CSS classes */
  className?: string;
  /** ARIA live region politeness */
  'aria-live'?: 'polite' | 'assertive' | 'off';
}

/**
 * FormHelperText - Design System Helper Text Primitive
 * 
 * The ONLY way to render form helper/hint/error text.
 * Auto-wires size from TypographyProvider context.
 * 
 * @example
 * // Hint text
 * <FormHelperText variant="hint">
 *   Enter your email address
 * </FormHelperText>
 * 
 * @example
 * // Error message
 * <FormHelperText variant="error">
 *   Email is required
 * </FormHelperText>
 * 
 * @example
 * // Success message
 * <FormHelperText variant="success">
 *   Email verified
 * </FormHelperText>
 */
export const FormHelperText: React.FC<FormHelperTextProps> = ({
  children,
  variant = 'hint',
  size: propSize,
  className = '',
  'aria-live': ariaLive,
}) => {
  const { size: defaultSize } = useTypography();
  const size = propSize ?? defaultSize;

  const classNames = [
    'ds-helper',
    `ds-helper--${size}`,
    `ds-helper--${variant}`,
    className,
  ].filter(Boolean).join(' ');

  // Auto-set aria-live for errors
  const liveRegion = ariaLive ?? (variant === 'error' ? 'polite' : undefined);

  return (
    <div
      data-ds="helper"
      className={classNames}
      aria-live={liveRegion}
      role={variant === 'error' ? 'alert' : undefined}
    >
      {children}
    </div>
  );
};
