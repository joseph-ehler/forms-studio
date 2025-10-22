/**
 * FormLabel Component (Compatibility Wrapper)
 * 
 * DEPRECATED: This is a compatibility wrapper.
 * New code should import from: import { FormLabel } from './typography'
 * 
 * This wrapper maintains backward compatibility while using
 * the new typography primitive under the hood.
 * 
 * Features:
 * - Required asterisk
 * - Optional badge
 * - Tooltip support (deprecated - use separate Tooltip component)
 * - Consistent styling via typography primitive
 */

import React from 'react'
import { FormLabel as FormLabelPrimitive } from './typography'

interface FormLabelProps {
  htmlFor?: string
  required?: boolean
  optional?: boolean
  children: React.ReactNode
  /** @deprecated Use separate Tooltip component */
  tooltip?: React.ReactNode
  className?: string
}

/**
 * @deprecated Import from './typography' instead:
 * import { FormLabel } from './typography'
 */
export const Label: React.FC<FormLabelProps> = ({
  htmlFor,
  required,
  optional,
  children,
  tooltip,
  className = '',
}) => {
  // Use new typography primitive with md size (field labels should be prominent)
  return (
    <FormLabelPrimitive
      htmlFor={htmlFor}
      required={required}
      optional={optional}
      size="md"
      className={className}
    >
      {tooltip ? (
        <span className="flex items-center gap-2">
          {children}
          <span className="ml-1">{tooltip}</span>
        </span>
      ) : (
        children
      )}
    </FormLabelPrimitive>
  )
}
