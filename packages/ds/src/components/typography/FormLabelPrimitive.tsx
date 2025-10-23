/**
 * FormLabel Primitive - Typography Root Primitive
 * 
 * Single source of truth for all form labels.
 * Auto-wires size from TypographyProvider.
 * Fields NEVER render raw <label> - always use this.
 */

import React from 'react';
import { useTypography } from './TypographyProvider';
import type { LabelSize } from '../../tokens/typography';
import '../../styles/components/ds-typography.css';

export interface FormLabelProps {
  /** Label text content */
  children: React.ReactNode;
  /** HTML for attribute (links to input id) */
  htmlFor?: string;
  /** Show required indicator (*) */
  required?: boolean;
  /** Show optional indicator (optional) */
  optional?: boolean;
  /** Override default size from context */
  size?: LabelSize;
  /** Screen reader only (visually hidden) */
  srOnly?: boolean;
  /** Additional CSS classes */
  className?: string;
}

/**
 * FormLabel - Design System Label Primitive
 * 
 * The ONLY way to render form labels.
 * Auto-wires size from TypographyProvider context.
 * 
 * @example
 * // Basic usage
 * <FormLabel htmlFor="email">Email Address</FormLabel>
 * 
 * @example
 * // With required indicator
 * <FormLabel htmlFor="email" required>Email Address</FormLabel>
 * 
 * @example
 * // With optional indicator
 * <FormLabel htmlFor="phone" optional>Phone Number</FormLabel>
 * 
 * @example
 * // Override size
 * <FormLabel htmlFor="email" size="sm">Email</FormLabel>
 */
export const FormLabel: React.FC<FormLabelProps> = ({
  children,
  htmlFor,
  required = false,
  optional = false,
  size: propSize,
  srOnly = false,
  className = '',
}) => {
  const { size: defaultSize } = useTypography();
  const size = propSize ?? defaultSize;

  const classNames = [
    srOnly ? 'ds-sr-only' : 'ds-label',
    !srOnly && `ds-label--${size}`,
    className,
  ].filter(Boolean).join(' ');

  return (
    <label
      htmlFor={htmlFor}
      data-ds="label"
      className={classNames}
    >
      <span>{children}</span>
      {required && (
        <span aria-hidden="true" className="ds-label__req">
          *
        </span>
      )}
      {optional && !required && (
        <span className="ds-label__opt">
          (optional)
        </span>
      )}
    </label>
  );
};
