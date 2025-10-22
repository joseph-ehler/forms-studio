/**
 * FieldWrapper - Auto-Apply Spacing
 * 
 * Wraps fields with consistent spacing automatically.
 * This is the "pit of success" - fields get correct spacing by default.
 */

import React from 'react';

export interface FieldWrapperProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * FieldWrapper - Applies consistent field spacing
 * 
 * Use this to wrap field components for automatic spacing.
 * 
 * @example
 * <FieldWrapper>
 *   <TextField ... />
 * </FieldWrapper>
 */
export const FieldWrapper: React.FC<FieldWrapperProps> = ({ children, className = '' }) => {
  return (
    <div className={`ds-field ${className}`}>
      {children}
    </div>
  );
};
